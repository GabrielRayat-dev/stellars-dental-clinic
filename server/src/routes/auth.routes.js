const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { login, changePassword, logout, getProfile, updateProfile, forgotPassword, resetPassword } = require('../controllers/auth.controller');

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/change-password', authenticate, changePassword);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;