/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts routes to specified roles (e.g. 'teacher', 'admin', 'student')
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role_name) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
}

module.exports = { requireRoles };
