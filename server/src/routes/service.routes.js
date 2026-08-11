const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { authenticate, authorizeDentist } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { serviceSchemas } = require('../validation/schemas');

// Public route — active services only
router.get('/public', serviceController.getActiveServices);

// Dentist only routes
router.get('/', authenticate, authorizeDentist, serviceController.getAllServices);
// router.get('/', authenticate, authorizeStaff, serviceController.getAllServices);
router.post('/', authenticate, authorizeDentist, validate(serviceSchemas.create), serviceController.createService);
router.put('/:id', authenticate, authorizeDentist, validate(serviceSchemas.update), serviceController.updateService);
router.patch('/:id/toggle', authenticate, authorizeDentist, validate(serviceSchemas.toggle), serviceController.toggleServiceStatus);
router.delete('/:id', authenticate, authorizeDentist, validate(serviceSchemas.id), serviceController.deleteService);

module.exports = router;