const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// Teacher analytics overview
router.get('/teacher', requireRoles('teacher', 'admin'), analyticsController.getTeacherAnalytics);

// Export Gradebook CSV
router.get('/export/csv/:assignmentId', requireRoles('teacher', 'admin'), analyticsController.exportGradebookCsv);

module.exports = router;
