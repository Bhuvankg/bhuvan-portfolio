const db = require('../config/db');
const { gradeQuestion } = require('../services/aiGradingService');

/**
 * Helper to calculate letter grade from percentage
 */
function getLetterGrade(pct) {
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

/**
 * Student Submits Assignment
 */
async function submitAssignment(req, res) {
  try {
    const studentId = req.user.id;
    const { assignment_id } = req.body;
    let answers = req.body.answers;

    if (!assignment_id) {
      return res.status(400).json({ success: false, message: 'Assignment ID is required.' });
    }

    if (typeof answers === 'string') {
      try {
        answers = JSON.parse(answers);
      } catch (e) {
        answers = [];
      }
    }

    const assignment = await db.get('SELECT * FROM assignments WHERE id = ?', [assignment_id]);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (assignment.status !== 'published') {
      return res.status(400).json({ success: false, message: 'This assignment is not currently open for submissions.' });
    }

    // Check duplicate submission
    const existingSubmission = await db.get(
      'SELECT id, status FROM submissions WHERE assignment_id = ? AND student_id = ?',
      [assignment_id, studentId]
    );

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment. Duplicate submissions are not permitted.'
      });
    }

    // File upload info if present
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const fileName = req.file ? req.file.originalname : null;

    // Create Submission Record
    const subResult = await db.run(
      `INSERT INTO submissions 
       (assignment_id, student_id, status, file_url, file_name, max_score, submitted_at)
       VALUES (?, ?, 'submitted', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [assignment_id, studentId, fileUrl, fileName, assignment.total_marks]
    );

    const submissionId = subResult.insertId;

    // Fetch assignment questions, options, and rubrics
    const questions = await db.query(
      'SELECT * FROM questions WHERE assignment_id = ? ORDER BY question_order ASC',
      [assignment_id]
    );

    const allOptions = await db.query(
      `SELECT o.* FROM answer_options o
       JOIN questions q ON o.question_id = q.id
       WHERE q.assignment_id = ?`,
      [assignment_id]
    );

    let totalAwarded = 0;
    let totalMax = 0;

    // Insert student answers and perform instant auto-grading
    for (const q of questions) {
      const studentAnsData = (answers || []).find(a => Number(a.question_id) === Number(q.id)) || {};
      const selectedOptionId = studentAnsData.selected_option_id ? Number(studentAnsData.selected_option_id) : null;
      const answerText = studentAnsData.answer_text ? String(studentAnsData.answer_text).trim() : null;

      // Save Student Answer
      await db.run(
        `INSERT INTO student_answers (submission_id, question_id, selected_option_id, answer_text)
         VALUES (?, ?, ?, ?)`,
        [submissionId, q.id, selectedOptionId, answerText]
      );

      // Fetch Rubrics for question
      const rubrics = await db.query('SELECT * FROM rubric_criteria WHERE question_id = ?', [q.id]);

      // Grade Question using AI Auto-Grading Engine
      const evalResult = await gradeQuestion(
        q,
        { selected_option_id: selectedOptionId, answer_text: answerText },
        allOptions,
        rubrics
      );

      totalAwarded += evalResult.scoreAwarded;
      totalMax += evalResult.maxScore;

      // Save Grading Result
      await db.run(
        `INSERT INTO grading_results 
         (submission_id, question_id, score_awarded, max_score, evaluator_type, ai_suggested_score, confidence_level, matched_concepts, missing_concepts, reasoning, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          submissionId,
          q.id,
          evalResult.scoreAwarded,
          evalResult.maxScore,
          evalResult.evaluatorType,
          evalResult.aiSuggestedScore,
          evalResult.confidenceLevel,
          evalResult.matchedConcepts,
          evalResult.missingConcepts,
          evalResult.reasoning,
          evalResult.evaluatorType === 'auto_mcq' ? 1 : 0
        ]
      );
    }

    const percentage = totalMax > 0 ? Math.round((totalAwarded / totalMax) * 1000) / 10 : 0;
    const gradeLetter = getLetterGrade(percentage);

    // Update Submission Status & Preliminary Score
    await db.run(
      `UPDATE submissions
       SET total_score = ?, percentage = ?, grade_letter = ?, status = 'ai_graded', graded_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [totalAwarded, percentage, gradeLetter, submissionId]
    );

    // Create Initial Feedback Record
    await db.run(
      `INSERT INTO feedback (submission_id, overall_feedback, strengths, improvements, is_published)
       VALUES (?, ?, ?, ?, 0)`,
      [
        submissionId,
        `Submission automatically evaluated. Overall score: ${percentage}%. Pending teacher review and publication.`,
        'Demonstrated active engagement across all assignment questions.',
        'Review teacher comments upon final grade release.'
      ]
    );

    // Notify Course Instructor
    const course = await db.get('SELECT teacher_id, title FROM courses WHERE id = ?', [assignment.course_id]);
    if (course) {
      await db.run(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'New Submission Ready for Review', ?, 'info')`,
        [
          course.teacher_id,
          `Student ${req.user.name} submitted assignment "${assignment.title}". AI Auto-Grade: ${percentage}%.`
        ]
      );
    }

    // Audit Log
    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'SUBMISSION_CREATED', 'submission', ?, ?, ?)`,
      [studentId, submissionId, `Submitted assignment ${assignment.title}. AI Score: ${percentage}%`, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully. Initial evaluation completed.',
      submissionId,
      preliminaryPercentage: percentage,
      preliminaryGrade: gradeLetter
    });
  } catch (error) {
    console.error('[Submission Controller] submitAssignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit assignment.' });
  }
}

/**
 * Get Submissions for an Assignment (Teacher / Admin)
 */
async function getSubmissions(req, res) {
  try {
    const { assignmentId } = req.params;
    const { status, search } = req.query;

    let sql = `
      SELECT s.*, u.name as student_name, u.email as student_email, u.department,
             pr.similarity_score as plagiarism_similarity, pr.review_status as plagiarism_status
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      LEFT JOIN plagiarism_reports pr ON (s.id = pr.submission_id OR s.id = pr.matched_submission_id)
      WHERE s.assignment_id = ?
    `;
    const params = [assignmentId];

    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY s.submitted_at DESC';

    const submissions = await db.query(sql, params);
    res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    console.error('[Submission Controller] getSubmissions error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve submissions.' });
  }
}

/**
 * Get Comprehensive Submission Details
 */
async function getSubmissionDetail(req, res) {
  try {
    const { id } = req.params;
    const { role_name, id: userId } = req.user;

    const submission = await db.get(
      `SELECT s.*, a.title as assignment_title, a.description as assignment_desc,
              a.instructions, a.total_marks as assignment_total_marks,
              c.title as course_title, c.code as course_code,
              u.name as student_name, u.email as student_email, u.department as student_department,
              t.name as reviewer_name
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       JOIN users u ON s.student_id = u.id
       LEFT JOIN users t ON s.reviewed_by = t.id
       WHERE s.id = ?`,
      [id]
    );

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    // Role check: Students can only view their own submission
    if (role_name === 'student' && submission.student_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied. You may only view your own submission.' });
    }

    // Fetch Question Breakdown with Student Answers and Grading Results
    const questions = await db.query(
      `SELECT q.*, 
              sa.id as answer_id, sa.selected_option_id, sa.answer_text,
              gr.id as grading_id, gr.score_awarded, gr.evaluator_type, gr.ai_suggested_score,
              gr.confidence_level, gr.matched_concepts, gr.missing_concepts, gr.reasoning, gr.is_approved
       FROM questions q
       LEFT JOIN student_answers sa ON q.id = sa.question_id AND sa.submission_id = ?
       LEFT JOIN grading_results gr ON q.id = gr.question_id AND gr.submission_id = ?
       WHERE q.assignment_id = ?
       ORDER BY q.question_order ASC`,
      [id, id, submission.assignment_id]
    );

    // Attach Options and Rubrics for each question
    for (const q of questions) {
      if (q.question_type === 'mcq') {
        q.options = await db.query(
          'SELECT * FROM answer_options WHERE question_id = ? ORDER BY option_letter ASC',
          [q.id]
        );
      } else {
        q.rubrics = await db.query(
          'SELECT * FROM rubric_criteria WHERE question_id = ?',
          [q.id]
        );
      }
    }

    // Fetch Feedback
    const feedback = await db.get(
      'SELECT * FROM feedback WHERE submission_id = ?',
      [id]
    );

    // Fetch Plagiarism Reports if any
    const plagiarismReports = await db.query(
      `SELECT pr.*, u.name as matched_student_name
       FROM plagiarism_reports pr
       LEFT JOIN submissions ms ON pr.matched_submission_id = ms.id
       LEFT JOIN users u ON ms.student_id = u.id
       WHERE pr.submission_id = ? OR pr.matched_submission_id = ?`,
      [id, id]
    );

    res.json({
      success: true,
      submission,
      questions,
      feedback: feedback || null,
      plagiarismReports
    });
  } catch (error) {
    console.error('[Submission Controller] getSubmissionDetail error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve submission details.' });
  }
}

/**
 * Get Student's Submissions History
 */
async function getMySubmissions(req, res) {
  try {
    const studentId = req.user.id;

    const submissions = await db.query(
      `SELECT s.*, a.title as assignment_title, a.due_date,
              c.title as course_title, c.code as course_code,
              f.overall_feedback, f.is_published as feedback_published
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       LEFT JOIN feedback f ON s.id = f.submission_id
       WHERE s.student_id = ?
       ORDER BY s.submitted_at DESC`,
      [studentId]
    );

    res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    console.error('[Submission Controller] getMySubmissions error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve student submissions.' });
  }
}

module.exports = {
  submitAssignment,
  getSubmissions,
  getSubmissionDetail,
  getMySubmissions
};
