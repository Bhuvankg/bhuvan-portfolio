const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Authentication Middleware
 * Validates JWT token and attaches user object to request
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Please sign in.'
      });
    }

    const secret = process.env.JWT_SECRET || 'gradeai_super_secret_jwt_key_2026_education_platform';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired session token. Please sign in again.'
      });
    }

    // Lookup user in database
    const user = await db.get(
      `SELECT u.id, u.name, u.email, u.department, u.status, u.role_id, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact an administrator.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
}

module.exports = { authenticateToken };
