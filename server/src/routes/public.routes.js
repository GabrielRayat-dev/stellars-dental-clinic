const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');
const { authenticate, authorizeAdmin, authorizeAdminOrDentist } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { publicSchemas } = require('../validation/schemas');

// ─── Public routes ───────────────────────────────────
router.get('/faqs', publicController.getActiveFaqs);
router.get('/clinic', publicController.getClinicInformation);
router.get('/dentists', publicController.getPublicDentists);


// ─── Admin or Dentist only routes ────────────────────
router.get('/faqs/all', authenticate, authorizeAdminOrDentist, publicController.getAllFaqs);
router.post('/faqs', authenticate, authorizeAdminOrDentist, validate(publicSchemas.createFaq), publicController.createFaq);
router.put('/faqs/:id', authenticate, authorizeAdminOrDentist, validate(publicSchemas.updateFaq), publicController.updateFaq);
router.delete('/faqs/:id', authenticate, authorizeAdminOrDentist, validate(publicSchemas.id), publicController.deleteFaq);
router.put('/clinic', authenticate, authorizeAdmin, validate(publicSchemas.updateClinic), publicController.updateClinicInformation);

module.exports = router;