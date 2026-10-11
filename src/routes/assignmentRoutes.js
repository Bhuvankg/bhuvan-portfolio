const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', assignmentController.getAssignments);
router.get('/:id', assignmentController.getAssignmentById);

// Teacher and Admin write operations
router.post('/', requireRoles('teacher', 'admin'), assignmentController.createAssignment);
router.put('/:id', requireRoles('teacher', 'admin'), assignmentController.updateAssignment);
router.delete('/:id', requireRoles('teacher', 'admin'), assignmentController.deleteAssignment);

module.exports = router;
