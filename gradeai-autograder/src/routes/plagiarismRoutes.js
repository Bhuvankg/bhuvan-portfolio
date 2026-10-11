const express = require('express');
const router = express.Router();
const plagiarismController = require('../controllers/plagiarismController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);
router.use(requireRoles('teacher', 'admin'));

// Trigger cross-submission scan for an assignment
router.post('/scan/:assignmentId', plagiarismController.scanAssignment);

// Get list of plagiarism reports
router.get('/reports', plagiarismController.getReports);

// Get side-by-side comparison report details
router.get('/reports/:id', plagiarismController.getReportDetail);

// Update review status ('cleared', 'flagged')
router.put('/reports/:id/status', plagiarismController.updateReportStatus);

module.exports = router;
