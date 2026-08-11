const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const appointmentController = require('../controllers/appointment.controller');
const { authenticate, authorizeStaff } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { appointmentSchemas } = require('../validation/schemas');

// Rate limit public booking (skipped for authenticated staff) and status checks
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: (req) => !!req.headers.authorization,
  message: { message: 'Too many booking attempts. Try again later.' },
});

const statusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many status checks. Try again later.' },
});

// Public routes
router.post('/status', statusLimiter, validate(appointmentSchemas.statusCheck), appointmentController.checkAppointmentStatus);
router.post('/', bookingLimiter, validate(appointmentSchemas.create), appointmentController.createAppointment);
router.get('/public/availability', appointmentController.getPublicAvailability);

// Protected routes — staff only
router.get('/', authenticate, authorizeStaff, appointmentController.getAllAppointments);
router.get('/:id', authenticate, authorizeStaff, validate(appointmentSchemas.id), appointmentController.getAppointmentById);
router.patch('/:id/approve', authenticate, authorizeStaff, validate(appointmentSchemas.id), appointmentController.approveAppointment);
router.patch('/:id/reject', authenticate, authorizeStaff, validate(appointmentSchemas.reject), appointmentController.rejectAppointment);
router.get('/rejected/list', authenticate, authorizeStaff, appointmentController.getRejectedAppointments);
router.delete('/rejected/:id', authenticate, authorizeStaff, validate(appointmentSchemas.id), appointmentController.clearRejectedAppointment);

module.exports = router;