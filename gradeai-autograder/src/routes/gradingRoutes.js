const express = require('express');
const router = express.Router();
const gradingController = require('../controllers/gradingController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);
router.use(requireRoles('teacher', 'admin'));

// Trigger AI Auto-Grading on a submission
router.post('/ai-evaluate/:submissionId', gradingController.triggerAiGrading);

// Teacher reviews, modifies scores, provides feedback, and approves grades
router.post('/review/:submissionId', gradingController.saveTeacherReview);

module.exports = router;
