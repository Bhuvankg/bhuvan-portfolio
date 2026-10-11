const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'gradeai_super_secret_jwt_key_2026_education_platform';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role_name
    },
    secret,
    { expiresIn }
  );
}

/**
 * Register User
 */
async function register(req, res) {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Resolve role (default to student if invalid or omitted)
    const targetRoleName = (role && ['teacher', 'admin', 'student'].includes(role.toLowerCase()))
      ? role.toLowerCase()
      : 'student';

    const roleRecord = await db.get('SELECT id, name FROM roles WHERE name = ?', [targetRoleName]);
    const roleId = roleRecord ? roleRecord.id : 3;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.run(
      `INSERT INTO users (role_id, name, email, password_hash, department, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [roleId, name.trim(), email.toLowerCase().trim(), passwordHash, department || 'General Studies']
    );

    const newUser = await db.get(
      `SELECT u.id, u.name, u.email, u.department, u.status, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [result.insertId]
    );

    // Audit log
    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'USER_REGISTERED', 'user', ?, ?, ?)`,
      [newUser.id, newUser.id, `User ${newUser.name} registered as ${newUser.role_name}`, req.ip]
    );

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('[Auth Controller] Register error:', error);
    res.status(500).json({ success: false, message: 'Failed to register account.' });
  }
}

/**
 * Login User
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await db.get(
      `SELECT u.id, u.name, u.email, u.password_hash, u.department, u.status, u.role_id, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE LOWER(u.email) = ?`,
      [email.toLowerCase().trim()]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    // Audit log
    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'USER_LOGIN', 'user', ?, ?, ?)`,
      [user.id, user.id, `User logged in from ${req.ip}`, req.ip]
    );

    // Clean user object (strip password hash)
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user
    });
  } catch (error) {
    console.error('[Auth Controller] Login error:', error);
    res.status(500).json({ success: false, message: 'Authentication process failed.' });
  }
}

/**
 * Get Current User Profile
 */
async function getMe(req, res) {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
}

/**
 * Quick 1-Click Demo Login
 * Seamlessly authenticates as Teacher, Student, or Admin for testing
 */
async function demoLogin(req, res) {
  try {
    const roleType = (req.params.role || 'teacher').toLowerCase();
    let email = 'teacher@gradeai.edu';

    if (roleType === 'admin') email = 'admin@gradeai.edu';
    else if (roleType === 'student' || roleType === 'student1') email = 'student1@gradeai.edu';
    else if (roleType === 'student2') email = 'student2@gradeai.edu';

    const user = await db.get(
      `SELECT u.id, u.name, u.email, u.department, u.status, u.role_id, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE LOWER(u.email) = ?`,
      [email]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: `Demo user for role ${roleType} not found.` });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: `Signed in as Demo ${user.role_name.toUpperCase()}: ${user.name}`,
      token,
      user
    });
  } catch (error) {
    console.error('[Auth Controller] Demo login error:', error);
    res.status(500).json({ success: false, message: 'Demo login failed.' });
  }
}

/**
 * Forgot Password (Self-service workflow)
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await db.get('SELECT id, name FROM users WHERE LOWER(email) = ?', [email.toLowerCase().trim()]);
    if (!user) {
      // Return success anyway to avoid user enumeration
      return res.json({
        success: true,
        message: 'If this email exists in our system, password reset instructions have been generated.'
      });
    }

    // Temporary reset simulation token
    const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();

    res.json({
      success: true,
      message: `Password reset verification initiated for ${user.name}.`,
      demoResetCode: resetToken,
      instructions: 'In production, an automated reset link is sent to the verified inbox.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password reset request failed.' });
  }
}

/**
 * Reset Password
 */
async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid email and new password (min 6 chars) required.' });
    }

    const user = await db.get('SELECT id FROM users WHERE LOWER(email) = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user.id]);

    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, 'PASSWORD_RESET', 'user', ?, 'User updated password', ?)`,
      [user.id, user.id, req.ip]
    );

    res.json({ success: true, message: 'Password has been updated successfully. Please log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  demoLogin,
  forgotPassword,
  resetPassword
};
