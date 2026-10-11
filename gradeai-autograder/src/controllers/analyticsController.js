const db = require('../config/db');

/**
 * Get Teacher Dashboard Analytics
 */
async function getTeacherAnalytics(req, res) {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.query;

    // Filter condition for courses
    const courseFilter = courseId ? 'AND c.id = ?' : '';
    const courseParams = courseId ? [teacherId, courseId] : [teacherId];

    // 1. Metric Counts
    const studentCountRow = await db.get(
      `SELECT COUNT(DISTINCT e.student_id) as total_students
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE c.teacher_id = ? ${courseFilter}`,
      courseParams
    );

    const assignmentCountRow = await db.get(
      `SELECT COUNT(a.id) as total_assignments
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE c.teacher_id = ? ${courseFilter}`,
      courseParams
    );

    const pendingRow = await db.get(
      `SELECT COUNT(s.id) as pending_evaluations
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       WHERE c.teacher_id = ? AND s.status IN ('submitted', 'ai_graded') ${courseFilter}`,
      courseParams
    );

    const avgScoreRow = await db.get(
      `SELECT AVG(s.percentage) as avg_score
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       WHERE c.teacher_id = ? AND s.percentage IS NOT NULL ${courseFilter}`,
      courseParams
    );

    const plagiarismAlertsRow = await db.get(
      `SELECT COUNT(pr.id) as plagiarism_alerts
       FROM plagiarism_reports pr
       JOIN submissions s ON pr.submission_id = s.id
       JOIN assignments a ON s.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       WHERE c.teacher_id = ? AND pr.review_status = 'pending' ${courseFilter}`,
      courseParams
    );

    // 2. Assignment Performance for Charts
    const assignmentStats = await db.query(
      `SELECT a.id, a.title, c.code as course_code, a.total_marks,
              COUNT(s.id) as submissions_count,
              ROUND(AVG(s.percentage), 1) as avg_percentage
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       LEFT JOIN submissions s ON a.id = s.assignment_id AND s.percentage IS NOT NULL
       WHERE c.teacher_id = ? ${courseFilter}
       GROUP BY a.id
       ORDER BY a.created_at ASC`,
      courseParams
    );

    // 3. Score Distribution Histogram (5 buckets)
    const scoreBuckets = await db.query(
      `SELECT 
         SUM(CASE WHEN s.percentage < 60 THEN 1 ELSE 0 END) as range_f,
         SUM(CASE WHEN s.percentage >= 60 AND s.percentage < 70 THEN 1 ELSE 0 END) as range_d,
         SUM(CASE WHEN s.percentage >= 70 AND s.percentage < 80 THEN 1 ELSE 0 END) as range_c,
         SUM(CASE WHEN s.percentage >= 80 AND s.percentage < 90 THEN 1 ELSE 0 END) as range_b,
         SUM(CASE WHEN s.percentage >= 90 THEN 1 ELSE 0 END) as range_a
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       WHERE c.teacher_id = ? AND s.percentage IS NOT NULL ${courseFilter}`,
      courseParams
    );

    const distribution = {
      f: (scoreBuckets[0] && scoreBuckets[0].range_f) || 0,
      d: (scoreBuckets[0] && scoreBuckets[0].range_d) || 0,
      c: (scoreBuckets[0] && scoreBuckets[0].range_c) || 0,
      b: (scoreBuckets[0] && scoreBuckets[0].range_b) || 0,
      a: (scoreBuckets[0] && scoreBuckets[0].range_a) || 0
    };

    // 4. Question Difficulty Analysis (Average score % per question)
    const questionDifficulty = await db.query(
      `SELECT q.id, q.prompt, q.marks, q.question_type, a.title as assignment_title,
              ROUND(AVG(gr.score_awarded), 1) as avg_awarded,
              ROUND((AVG(gr.score_awarded) / q.marks) * 100, 1) as success_rate
       FROM questions q
       JOIN assignments a ON q.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       LEFT JOIN grading_results gr ON q.id = gr.question_id
       WHERE c.teacher_id = ? ${courseFilter}
       GROUP BY q.id
       ORDER BY success_rate ASC
       LIMIT 5`,
      courseParams
    );

    // 5. Recent Submissions
    const recentSubmissions = await db.query(
      `SELECT s.id, s.status, s.total_score, s.max_score, s.percentage, s.grade_letter, s.submitted_at,
              a.title as assignment_title, c.code as course_code, u.name as student_name
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       JOIN users u ON s.student_id = u.id
       WHERE c.teacher_id = ? ${courseFilter}
       ORDER BY s.submitted_at DESC
       LIMIT 6`,
      courseParams
    );

    res.json({
      success: true,
      summary: {
        totalStudents: (studentCountRow && studentCountRow.total_students) || 0,
        totalAssignments: (assignmentCountRow && assignmentCountRow.total_assignments) || 0,
        pendingEvaluations: (pendingRow && pendingRow.pending_evaluations) || 0,
        averageClassScore: avgScoreRow && avgScoreRow.avg_score ? Math.round(avgScoreRow.avg_score * 10) / 10 : 0,
        plagiarismAlerts: (plagiarismAlertsRow && plagiarismAlertsRow.plagiarism_alerts) || 0
      },
      assignmentStats,
      scoreDistribution: distribution,
      questionDifficulty,
      recentSubmissions
    });
  } catch (error) {
    console.error('[Analytics Controller] getTeacherAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve analytics.' });
  }
}

/**
 * Export Gradebook CSV
 */
async function exportGradebookCsv(req, res) {
  try {
    const { assignmentId } = req.params;

    let sql = `
      SELECT u.name as student_name, u.email as student_email, u.department,
             c.code as course_code, a.title as assignment_title,
             s.total_score, s.max_score, s.percentage, s.grade_letter, s.status,
             s.submitted_at, s.reviewed_at
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (assignmentId && assignmentId !== 'all') {
      sql += ' AND a.id = ?';
      params.push(assignmentId);
    }
    sql += ' ORDER BY u.name ASC';

    const records = await db.query(sql, params);

    // Generate CSV string
    const headers = [
      'Student Name',
      'Student Email',
      'Department',
      'Course Code',
      'Assignment Title',
      'Score Awarded',
      'Max Score',
      'Percentage (%)',
      'Grade Letter',
      'Status',
      'Submitted At',
      'Reviewed At'
    ];

    const rows = records.map(r => [
      `"${(r.student_name || '').replace(/"/g, '""')}"`,
      `"${(r.student_email || '').replace(/"/g, '""')}"`,
      `"${(r.department || '').replace(/"/g, '""')}"`,
      `"${(r.course_code || '').replace(/"/g, '""')}"`,
      `"${(r.assignment_title || '').replace(/"/g, '""')}"`,
      r.total_score !== null ? r.total_score : 'N/A',
      r.max_score || 100,
      r.percentage !== null ? r.percentage : 'N/A',
      r.grade_letter || 'N/A',
      r.status,
      r.submitted_at || '',
      r.reviewed_at || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="gradeai_gradebook_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('[Analytics Controller] exportGradebookCsv error:', error);
    res.status(500).json({ success: false, message: 'Failed to export CSV.' });
  }
}

module.exports = {
  getTeacherAnalytics,
  exportGradebookCsv
};
