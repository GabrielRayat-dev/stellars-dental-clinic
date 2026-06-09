const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authenticate, authorizeStaff } = require('../middlewares/auth');

// Public routes
router.post('/status', appointmentController.checkAppointmentStatus);

// Protected routes — staff only
router.get('/', authenticate, authorizeStaff, appointmentController.getAllAppointments);
router.get('/:id', authenticate, authorizeStaff, appointmentController.getAppointmentById);
router.post('/', authenticate, authorizeStaff, appointmentController.createAppointment);
router.patch('/:id/approve', authenticate, authorizeStaff, appointmentController.approveAppointment);
router.patch('/:id/reject', authenticate, authorizeStaff, appointmentController.rejectAppointment);
router.get('/rejected/list', authenticate, authorizeStaff, appointmentController.getRejectedAppointments);
router.delete('/rejected/:id', authenticate, authorizeStaff, appointmentController.clearRejectedAppointment);

module.exports = router;
