const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { authSchemas } = require('../validation/schemas');
const { login, changePassword, logout, getProfile, updateProfile, forgotPassword, resetPassword } = require('../controllers/auth.controller');

// Specific rate limiters for sensitive auth routes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Try again later.' },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: 'Too many reset requests. Try again later.' },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many reset attempts. Try again later.' },
});

// Public routes
router.post('/login', loginLimiter, validate(authSchemas.login), login);
router.post('/forgot-password', forgotPasswordLimiter, validate(authSchemas.forgotPassword), forgotPassword);
router.post('/reset-password', resetPasswordLimiter, validate(authSchemas.resetPassword), resetPassword);

// Protected routes
router.post('/change-password', authenticate, validate(authSchemas.changePassword), changePassword);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(authSchemas.updateProfile), updateProfile);

module.exports = router;