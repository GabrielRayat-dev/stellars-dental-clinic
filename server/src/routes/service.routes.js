const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { authenticate, authorizeDentist } = require('../middlewares/auth');

// Public route — active services only
router.get('/public', serviceController.getActiveServices);

// Dentist only routes
router.get('/', authenticate, authorizeDentist, serviceController.getAllServices);
router.post('/', authenticate, authorizeDentist, serviceController.createService);
router.put('/:id', authenticate, authorizeDentist, serviceController.updateService);
router.patch('/:id/toggle', authenticate, authorizeDentist, serviceController.toggleServiceStatus);

module.exports = router;