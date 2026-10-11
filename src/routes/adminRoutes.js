const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);
router.use(requireRoles('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.get('/courses', adminController.getCourses);
router.post('/courses', adminController.createCourse);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
