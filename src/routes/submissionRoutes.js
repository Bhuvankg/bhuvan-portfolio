const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticateToken);

// Student submits an assignment (answers + optional document)
router.post('/submit', requireRoles('student'), upload.single('submission_file'), submissionController.submitAssignment);

// Student views own past submissions
router.get('/my', requireRoles('student'), submissionController.getMySubmissions);

// Teacher/Admin views submissions for an assignment
router.get('/assignment/:assignmentId', requireRoles('teacher', 'admin'), submissionController.getSubmissions);

// View full detailed submission breakdown
router.get('/:id', submissionController.getSubmissionDetail);

module.exports = router;
