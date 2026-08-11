const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { adminSchemas } = require('../validation/schemas');

// All admin routes require authentication and admin role
router.use(authenticate, authorizeAdmin);

// Get all staff
router.get('/staff', adminController.getAllStaff);

// Get single staff
router.get('/staff/:id', validate(adminSchemas.id), adminController.getStaffById);

// Create staff
router.post('/staff', validate(adminSchemas.createStaff), adminController.createStaff);

// Update staff
router.put('/staff/:id', validate(adminSchemas.updateStaff), adminController.updateStaff);

// Delete staff
router.delete('/staff/:id', validate(adminSchemas.id), adminController.deleteStaff);


// router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;