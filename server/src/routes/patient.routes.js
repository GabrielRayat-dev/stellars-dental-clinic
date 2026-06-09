const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate, authorizeStaff } = require('../middlewares/auth');

// All patient routes require authentication and staff access
router.use(authenticate, authorizeStaff);

// Patient CRUD
router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatientById);
router.post('/', patientController.createPatient);
router.put('/:id', patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

// Diagnosis records
router.post('/:id/diagnosis', patientController.addDiagnosisRecord);
router.put('/:id/diagnosis/:recordId', patientController.updateDiagnosisRecord);
router.delete('/:id/diagnosis/:recordId', patientController.deleteDiagnosisRecord);

// Patient images
router.post('/:id/images', patientController.addPatientImage);
router.delete('/:id/images/:imageId', patientController.deletePatientImage);

module.exports = router;