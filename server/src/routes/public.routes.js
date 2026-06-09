const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');

// ─── Public routes ───────────────────────────────────
router.get('/faqs', publicController.getActiveFaqs);
router.get('/clinic', publicController.getClinicInformation);

// ─── Admin only routes ───────────────────────────────
router.get('/faqs/all', authenticate, authorizeAdmin, publicController.getAllFaqs);
router.post('/faqs', authenticate, authorizeAdmin, publicController.createFaq);
router.put('/faqs/:id', authenticate, authorizeAdmin, publicController.updateFaq);
router.delete('/faqs/:id', authenticate, authorizeAdmin, publicController.deleteFaq);
router.put('/clinic', authenticate, authorizeAdmin, publicController.updateClinicInformation);

module.exports = router;