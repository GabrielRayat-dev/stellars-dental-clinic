const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');
const { authenticate, authorizeAdmin, authorizeAdminOrDentist } = require('../middlewares/auth');

// ─── Public routes ───────────────────────────────────
router.get('/faqs', publicController.getActiveFaqs);
router.get('/clinic', publicController.getClinicInformation);
router.get('/dentists', publicController.getPublicDentists);


// ─── Admin or Dentist only routes ────────────────────
router.get('/faqs/all', authenticate, authorizeAdminOrDentist, publicController.getAllFaqs);
router.post('/faqs', authenticate, authorizeAdminOrDentist, publicController.createFaq);
router.put('/faqs/:id', authenticate, authorizeAdminOrDentist, publicController.updateFaq);
router.delete('/faqs/:id', authenticate, authorizeAdminOrDentist, publicController.deleteFaq);
router.put('/clinic', authenticate, authorizeAdmin, publicController.updateClinicInformation);

module.exports = router;