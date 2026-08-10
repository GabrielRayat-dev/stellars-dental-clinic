const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const appointmentController = require('../controllers/appointment.controller');
const { authenticate, authorizeStaff } = require('../middlewares/auth');

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
router.post('/status', statusLimiter, appointmentController.checkAppointmentStatus);
router.post('/', bookingLimiter, appointmentController.createAppointment);
router.get('/public/availability', appointmentController.getPublicAvailability);

// Protected routes — staff only
router.get('/', authenticate, authorizeStaff, appointmentController.getAllAppointments);
router.get('/:id', authenticate, authorizeStaff, appointmentController.getAppointmentById);
router.patch('/:id/approve', authenticate, authorizeStaff, appointmentController.approveAppointment);
router.patch('/:id/reject', authenticate, authorizeStaff, appointmentController.rejectAppointment);
router.get('/rejected/list', authenticate, authorizeStaff, appointmentController.getRejectedAppointments);
router.delete('/rejected/:id', authenticate, authorizeStaff, appointmentController.clearRejectedAppointment);

module.exports = router;