const db = require('../config/db');
const { scanAssignmentPlagiarism } = require('../services/plagiarismService');

/**
 * Scan Assignment for Plagiarism
 */
async function scanAssignment(req, res) {
  try {
    const { assignmentId } = req.params;
    const threshold = Number(req.query.threshold) || Number(process.env.PLAGIARISM_SIMILARITY_THRESHOLD) || 25.0;

    const result = await scanAssignmentPlagiarism(db, assignmentId, threshold);

    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'PLAGIARISM_SCAN', 'assignment', ?, ?, ?)`,
      [req.user.id, assignmentId, `Ran plagiarism scan. Result: ${result.message}`, req.ip]
    );

    res.json({
      success: true,
      message: result.message,
      scannedCount: result.scannedCount,
      reportsGenerated: result.reportsGenerated,
      reports: result.reports
    });
  } catch (error) {
    console.error('[Plagiarism Controller] scanAssignment error:', error);
    res.status(500).json({ success: false, message: 'Plagiarism scan failed.' });
  }
}

/**
 * Get Plagiarism Reports
 */
async function getReports(req, res) {
  try {
    const { assignmentId, status } = req.query;

    let sql = `
      SELECT pr.*, 
             a.id as assignment_id, a.title as assignment_title,
             c.code as course_code, c.title as course_title,
             u1.name as student_name_a, u1.email as student_email_a,
             u2.name as student_name_b, u2.email as student_email_b
      FROM plagiarism_reports pr
      JOIN submissions s1 ON pr.submission_id = s1.id
      JOIN assignments a ON s1.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      JOIN users u1 ON s1.student_id = u1.id
      LEFT JOIN submissions s2 ON pr.matched_submission_id = s2.id
      LEFT JOIN users u2 ON s2.student_id = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (assignmentId) {
      sql += ' AND a.id = ?';
      params.push(assignmentId);
    }
    if (status) {
      sql += ' AND pr.review_status = ?';
      params.push(status);
    }

    sql += ' ORDER BY pr.similarity_score DESC, pr.created_at DESC';

    const rawReports = await db.query(sql, params);

    // Safely parse JSON excerpts
    const reports = rawReports.map(r => {
      let excerpts = [];
      if (r.matching_excerpts) {
        try {
          excerpts = typeof r.matching_excerpts === 'string'
            ? JSON.parse(r.matching_excerpts)
            : r.matching_excerpts;
        } catch (e) {
          excerpts = [];
        }
      }
      return { ...r, matching_excerpts: excerpts };
    });

    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    console.error('[Plagiarism Controller] getReports error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve plagiarism reports.' });
  }
}

/**
 * Get Detailed Side-by-Side Comparison for a Report
 */
async function getReportDetail(req, res) {
  try {
    const { id } = req.params;

    const report = await db.get(
      `SELECT pr.*, 
              a.id as assignment_id, a.title as assignment_title,
              u1.name as student_name_a, u1.email as student_email_a,
              u2.name as student_name_b, u2.email as student_email_b
       FROM plagiarism_reports pr
       JOIN submissions s1 ON pr.submission_id = s1.id
       JOIN assignments a ON s1.assignment_id = a.id
       JOIN users u1 ON s1.student_id = u1.id
       LEFT JOIN submissions s2 ON pr.matched_submission_id = s2.id
       LEFT JOIN users u2 ON s2.student_id = u2.id
       WHERE pr.id = ?`,
      [id]
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Plagiarism report not found.' });
    }

    let excerpts = [];
    if (report.matching_excerpts) {
      try {
        excerpts = typeof report.matching_excerpts === 'string'
          ? JSON.parse(report.matching_excerpts)
          : report.matching_excerpts;
      } catch (e) {
        excerpts = [];
      }
    }
    report.matching_excerpts = excerpts;

    res.json({ success: true, report });
  } catch (error) {
    console.error('[Plagiarism Controller] getReportDetail error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve comparison report.' });
  }
}

/**
 * Teacher Updates Plagiarism Report Status
 */
async function updateReportStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, teacher_notes } = req.body;

    if (!['pending', 'cleared', 'flagged'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be pending, cleared, or flagged.' });
    }

    const report = await db.get('SELECT * FROM plagiarism_reports WHERE id = ?', [id]);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    await db.run(
      `UPDATE plagiarism_reports
       SET review_status = ?, teacher_notes = ?
       WHERE id = ?`,
      [status, teacher_notes || '', id]
    );

    // If marked cleared, revert flagged submission status to reviewed if graded
    if (status === 'cleared') {
      await db.run(
        `UPDATE submissions 
         SET status = CASE WHEN reviewed_by IS NOT NULL THEN 'reviewed' ELSE 'ai_graded' END 
         WHERE id IN (?, ?) AND status = 'flagged'`,
        [report.submission_id, report.matched_submission_id]
      );
    }

    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'PLAGIARISM_RESOLVED', 'plagiarism_report', ?, ?, ?)`,
      [req.user.id, id, `Teacher resolved report #${id} as ${status}: ${teacher_notes || 'No note'}`, req.ip]
    );

    res.json({ success: true, message: `Report marked as ${status}.` });
  } catch (error) {
    console.error('[Plagiarism Controller] updateReportStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update report status.' });
  }
}

module.exports = {
  scanAssignment,
  getReports,
  getReportDetail,
  updateReportStatus
};
