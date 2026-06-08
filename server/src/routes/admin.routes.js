const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');

// All admin routes require authentication and admin role
router.use(authenticate, authorizeAdmin);

// Get all staff
router.get('/staff', adminController.getAllStaff);

// Get single staff
router.get('/staff/:id', adminController.getStaffById);

// Create staff
router.post('/staff', adminController.createStaff);

// Update staff
router.put('/staff/:id', adminController.updateStaff);

// Delete staff
router.delete('/staff/:id', adminController.deleteStaff);

module.exports = router;