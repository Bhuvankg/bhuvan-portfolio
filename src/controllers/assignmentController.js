const db = require('../config/db');

/**
 * Get Assignments (Role Aware)
 */
async function getAssignments(req, res) {
  try {
    const { role_name, id: userId } = req.user;
    const { courseId, status, search } = req.query;

    let assignments = [];

    if (role_name === 'teacher') {
      let querySql = `
        SELECT a.*, c.title as course_title, c.code as course_code,
               COUNT(DISTINCT s.id) as total_submissions,
               COUNT(DISTINCT CASE WHEN s.status IN ('submitted', 'ai_graded') THEN s.id END) as pending_submissions,
               AVG(s.percentage) as avg_score
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        LEFT JOIN submissions s ON a.id = s.assignment_id
        WHERE c.teacher_id = ?
      `;
      const params = [userId];

      if (courseId) {
        querySql += ' AND a.course_id = ?';
        params.push(courseId);
      }
      if (status) {
        querySql += ' AND a.status = ?';
        params.push(status);
      }
      if (search) {
        querySql += ' AND (a.title LIKE ? OR c.code LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      querySql += ' GROUP BY a.id ORDER BY a.created_at DESC';
      assignments = await db.query(querySql, params);

    } else if (role_name === 'student') {
      let querySql = `
        SELECT a.id, a.course_id, a.title, a.description, a.instructions, a.total_marks,
               a.due_date, a.status, a.allowed_file_types, a.created_at,
               c.title as course_title, c.code as course_code, u.name as teacher_name,
               s.id as submission_id, s.status as submission_status, s.total_score,
               s.percentage as student_percentage, s.grade_letter, s.submitted_at
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN enrollments e ON c.id = e.course_id AND e.student_id = ?
        JOIN users u ON c.teacher_id = u.id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
        WHERE a.status = 'published'
      `;
      const params = [userId, userId];

      if (courseId) {
        querySql += ' AND a.course_id = ?';
        params.push(courseId);
      }
      if (search) {
        querySql += ' AND (a.title LIKE ? OR c.code LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      querySql += ' ORDER BY a.due_date ASC';
      assignments = await db.query(querySql, params);

    } else {
      // Admin
      let querySql = `
        SELECT a.*, c.title as course_title, c.code as course_code, u.name as teacher_name,
               COUNT(DISTINCT s.id) as total_submissions
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN users u ON a.created_by = u.id
        LEFT JOIN submissions s ON a.id = s.assignment_id
        GROUP BY a.id ORDER BY a.created_at DESC
      `;
      assignments = await db.query(querySql);
    }

    res.json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    console.error('[Assignment Controller] getAssignments error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve assignments.' });
  }
}

/**
 * Get Assignment Detail by ID
 */
async function getAssignmentById(req, res) {
  try {
    const { id } = req.params;
    const { role_name, id: userId } = req.user;

    const assignment = await db.get(
      `SELECT a.*, c.title as course_title, c.code as course_code, u.name as teacher_name
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       JOIN users u ON a.created_by = u.id
       WHERE a.id = ?`,
      [id]
    );

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // Fetch questions
    const questions = await db.query(
      `SELECT * FROM questions WHERE assignment_id = ? ORDER BY question_order ASC`,
      [id]
    );

    // Fetch answer options and rubrics
    for (const q of questions) {
      if (q.question_type === 'mcq') {
        const options = await db.query(
          `SELECT id, question_id, option_letter, option_text ${role_name === 'student' ? '' : ', is_correct'} 
           FROM answer_options WHERE question_id = ? ORDER BY option_letter ASC`,
          [q.id]
        );
        q.options = options;
        if (role_name === 'student') {
          // Hide correct answers and explanations for active student taking test
          delete q.reference_answer;
          delete q.explanation;
        }
      } else {
        const rubrics = await db.query(
          `SELECT * FROM rubric_criteria WHERE question_id = ?`,
          [q.id]
        );
        q.rubrics = rubrics;
        if (role_name === 'student') {
          delete q.reference_answer;
        }
      }
    }

    assignment.questions = questions;

    // If student, check if student already submitted
    if (role_name === 'student') {
      const submission = await db.get(
        `SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?`,
        [id, userId]
      );
      assignment.existingSubmission = submission;
    }

    res.json({ success: true, assignment });
  } catch (error) {
    console.error('[Assignment Controller] getAssignmentById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve assignment details.' });
  }
}

/**
 * Create Assignment with Questions, Options & Rubrics
 */
async function createAssignment(req, res) {
  try {
    const {
      course_id,
      title,
      description,
      instructions,
      total_marks,
      due_date,
      status,
      allowed_file_types,
      questions
    } = req.body;

    if (!course_id || !title || !due_date) {
      return res.status(400).json({ success: false, message: 'Course, title, and due date are required.' });
    }

    // Verify course belongs to teacher (unless admin)
    if (req.user.role_name === 'teacher') {
      const course = await db.get('SELECT id FROM courses WHERE id = ? AND teacher_id = ?', [course_id, req.user.id]);
      if (!course) {
        return res.status(403).json({ success: false, message: 'You are not assigned to instruct this course.' });
      }
    }

    const calculatedTotalMarks = (questions && Array.isArray(questions) && questions.length > 0)
      ? questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0)
      : (Number(total_marks) || 100);

    const assignResult = await db.run(
      `INSERT INTO assignments 
       (course_id, created_by, title, description, instructions, total_marks, due_date, status, allowed_file_types)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_id,
        req.user.id,
        title.trim(),
        description || '',
        instructions || '',
        calculatedTotalMarks,
        due_date,
        status || 'published',
        allowed_file_types || 'pdf,txt,docx'
      ]
    );

    const assignmentId = assignResult.insertId;

    // Insert Questions
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const qResult = await db.run(
          `INSERT INTO questions 
           (assignment_id, question_order, question_type, prompt, marks, reference_answer, keywords, explanation)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            assignmentId,
            i + 1,
            q.question_type || 'mcq',
            q.prompt || `Question ${i + 1}`,
            Number(q.marks) || 10,
            q.reference_answer || '',
            q.keywords || '',
            q.explanation || ''
          ]
        );

        const questionId = qResult.insertId;

        // MCQ options
        if (q.question_type === 'mcq' && q.options && Array.isArray(q.options)) {
          for (const opt of q.options) {
            await db.run(
              `INSERT INTO answer_options (question_id, option_letter, option_text, is_correct)
               VALUES (?, ?, ?, ?)`,
              [questionId, opt.option_letter || 'A', opt.option_text || '', opt.is_correct ? 1 : 0]
            );
          }
        }

        // Rubrics
        if (q.rubrics && Array.isArray(q.rubrics)) {
          for (const r of q.rubrics) {
            await db.run(
              `INSERT INTO rubric_criteria (question_id, criterion_name, description, weight_percentage, max_points)
               VALUES (?, ?, ?, ?, ?)`,
              [questionId, r.criterion_name || 'Criterion', r.description || '', Number(r.weight_percentage) || 100, Number(r.max_points) || Number(q.marks) || 10]
            );
          }
        }
      }
    }

    // Audit log
    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'ASSIGNMENT_CREATED', 'assignment', ?, ?, ?)`,
      [req.user.id, assignmentId, `Created assignment: ${title} with ${questions ? questions.length : 0} questions`, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Assignment successfully created.',
      assignmentId
    });
  } catch (error) {
    console.error('[Assignment Controller] createAssignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create assignment.' });
  }
}

/**
 * Update Assignment
 */
async function updateAssignment(req, res) {
  try {
    const { id } = req.params;
    const { title, description, instructions, due_date, status, allowed_file_types } = req.body;

    const assignment = await db.get('SELECT * FROM assignments WHERE id = ?', [id]);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    await db.run(
      `UPDATE assignments
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           instructions = COALESCE(?, instructions),
           due_date = COALESCE(?, due_date),
           status = COALESCE(?, status),
           allowed_file_types = COALESCE(?, allowed_file_types),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description, instructions, due_date, status, allowed_file_types, id]
    );

    res.json({ success: true, message: 'Assignment updated successfully.' });
  } catch (error) {
    console.error('[Assignment Controller] updateAssignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update assignment.' });
  }
}

/**
 * Delete Assignment
 */
async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;
    const assignment = await db.get('SELECT title FROM assignments WHERE id = ?', [id]);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    await db.run('DELETE FROM assignments WHERE id = ?', [id]);

    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'ASSIGNMENT_DELETED', 'assignment', ?, ?, ?)`,
      [req.user.id, id, `Deleted assignment: ${assignment.title}`, req.ip]
    );

    res.json({ success: true, message: 'Assignment deleted successfully.' });
  } catch (error) {
    console.error('[Assignment Controller] deleteAssignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete assignment.' });
  }
}

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment
};
