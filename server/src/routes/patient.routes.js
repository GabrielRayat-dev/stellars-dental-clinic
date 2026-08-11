const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate, authorizeStaff } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const verifyImageContent = require('../middlewares/verifyImage');
const validate = require('../middlewares/validate');
const { patientSchemas } = require('../validation/schemas');

// Patient CRUD
router.get('/', authenticate, authorizeStaff, patientController.getAllPatients);
router.get('/:id', authenticate, authorizeStaff, validate(patientSchemas.id), patientController.getPatientById);
router.post('/', authenticate, authorizeStaff, validate(patientSchemas.create), patientController.createPatient);
router.put('/:id', authenticate, authorizeStaff, validate(patientSchemas.update), patientController.updatePatient);
router.delete('/:id', authenticate, authorizeStaff, validate(patientSchemas.id), patientController.deletePatient);

// Diagnosis records
router.post('/:id/diagnosis', authenticate, authorizeStaff, validate(patientSchemas.addDiagnosis), patientController.addDiagnosisRecord);
router.put('/:id/diagnosis/:recordId', authenticate, authorizeStaff, validate(patientSchemas.updateDiagnosis), patientController.updateDiagnosisRecord);
router.delete('/:id/diagnosis/:recordId', authenticate, authorizeStaff, validate(patientSchemas.idRecord), patientController.deleteDiagnosisRecord);

// Patient images are tied to a specific diagnosis record
router.post('/:id/diagnosis/:recordId/images', authenticate, authorizeStaff, validate(patientSchemas.idRecord), upload.single('image'), verifyImageContent, patientController.addPatientImage);
router.delete('/:id/images/:imageId', authenticate, authorizeStaff, validate(patientSchemas.idImage), patientController.deletePatientImage);

module.exports = router;

