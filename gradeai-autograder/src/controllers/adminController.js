const db = require('../config/db');

/**
 * Get Platform-Wide System Statistics
 */
async function getStats(req, res) {
  try {
    const totalUsersRow = await db.get('SELECT COUNT(*) as count FROM users');
    const teachersRow = await db.get('SELECT COUNT(*) as count FROM users WHERE role_id = 2');
    const studentsRow = await db.get('SELECT COUNT(*) as count FROM users WHERE role_id = 3');
    const coursesRow = await db.get('SELECT COUNT(*) as count FROM courses');
    const assignmentsRow = await db.get('SELECT COUNT(*) as count FROM assignments');
    const submissionsRow = await db.get('SELECT COUNT(*) as count FROM submissions');
    const aiGradedRow = await db.get("SELECT COUNT(*) as count FROM grading_results WHERE evaluator_type = 'ai'");
    const plagiarismReportsRow = await db.get('SELECT COUNT(*) as count FROM plagiarism_reports');

    res.json({
      success: true,
      stats: {
        totalUsers: (totalUsersRow && (totalUsersRow.count || totalUsersRow['COUNT(*)'])) || 0,
        totalTeachers: (teachersRow && (teachersRow.count || teachersRow['COUNT(*)'])) || 0,
        totalStudents: (studentsRow && (studentsRow.count || studentsRow['COUNT(*)'])) || 0,
        totalCourses: (coursesRow && (coursesRow.count || coursesRow['COUNT(*)'])) || 0,
        totalAssignments: (assignmentsRow && (assignmentsRow.count || assignmentsRow['COUNT(*)'])) || 0,
        totalSubmissions: (submissionsRow && (submissionsRow.count || submissionsRow['COUNT(*)'])) || 0,
        aiEvaluationsCount: (aiGradedRow && (aiGradedRow.count || aiGradedRow['COUNT(*)'])) || 0,
        plagiarismReportsCount: (plagiarismReportsRow && (plagiarismReportsRow.count || plagiarismReportsRow['COUNT(*)'])) || 0,
        dbEngine: db.getDbType()
      }
    });
  } catch (error) {
    console.error('[Admin Controller] getStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin stats.' });
  }
}

/**
 * Get All Users
 */
async function getUsers(req, res) {
  try {
    const { role, status, search } = req.query;

    let sql = `
      SELECT u.id, u.name, u.email, u.department, u.status, u.created_at,
             r.name as role_name, r.description as role_desc
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      sql += ' AND r.name = ?';
      params.push(role);
    }
    if (status) {
      sql += ' AND u.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.department LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY u.created_at DESC';

    const users = await db.query(sql, params);
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('[Admin Controller] getUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
}

/**
 * Update User Role or Status
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { status, role_name, department } = req.body;

    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let roleId = user.role_id;
    if (role_name) {
      const roleRow = await db.get('SELECT id FROM roles WHERE name = ?', [role_name]);
      if (roleRow) roleId = roleRow.id;
    }

    await db.run(
      `UPDATE users
       SET status = COALESCE(?, status),
           role_id = ?,
           department = COALESCE(?, department),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status || null, roleId, department || null, id]
    );

    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'USER_UPDATED', 'user', ?, ?, ?)`,
      [req.user.id, id, `Admin updated user #${id} (status: ${status || 'unchanged'}, role: ${role_name || 'unchanged'})`, req.ip]
    );

    res.json({ success: true, message: 'User updated successfully.' });
  } catch (error) {
    console.error('[Admin Controller] updateUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
}

/**
 * Get All Courses
 */
async function getCourses(req, res) {
  try {
    const courses = await db.query(
      `SELECT c.*, u.name as teacher_name, u.email as teacher_email,
              COUNT(DISTINCT e.student_id) as enrolled_count,
              COUNT(DISTINCT a.id) as assignment_count
       FROM courses c
       JOIN users u ON c.teacher_id = u.id
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN assignments a ON c.id = a.course_id
       GROUP BY c.id
       ORDER BY c.code ASC`
    );

    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    console.error('[Admin Controller] getCourses error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve courses.' });
  }
}

/**
 * Create Course
 */
async function createCourse(req, res) {
  try {
    const { code, title, description, semester, teacher_id } = req.body;

    if (!code || !title || !teacher_id) {
      return res.status(400).json({ success: false, message: 'Code, title, and instructor are required.' });
    }

    const existing = await db.get('SELECT id FROM courses WHERE code = ?', [code.trim().toUpperCase()]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Course with this code already exists.' });
    }

    const result = await db.run(
      `INSERT INTO courses (code, title, description, semester, teacher_id)
       VALUES (?, ?, ?, ?, ?)`,
      [code.trim().toUpperCase(), title.trim(), description || '', semester || 'Fall 2026', teacher_id]
    );

    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'COURSE_CREATED', 'course', ?, ?, ?)`,
      [req.user.id, result.insertId, `Created course ${code}: ${title}`, req.ip]
    );

    res.status(201).json({ success: true, message: 'Course created successfully.', courseId: result.insertId });
  } catch (error) {
    console.error('[Admin Controller] createCourse error:', error);
    res.status(500).json({ success: false, message: 'Failed to create course.' });
  }
}

/**
 * Get Security Audit Logs
 */
async function getAuditLogs(req, res) {
  try {
    const { limit = 50 } = req.query;
    const logs = await db.query(
      `SELECT al.*, u.name as user_name, u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [Number(limit)]
    );

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error('[Admin Controller] getAuditLogs error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
}

module.exports = {
  getStats,
  getUsers,
  updateUser,
  getCourses,
  createCourse,
  getAuditLogs
};
