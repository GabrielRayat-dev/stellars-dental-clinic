const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate, authorizeStaff } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Patient CRUD
router.get('/', authenticate, authorizeStaff, patientController.getAllPatients);
router.get('/:id', authenticate, authorizeStaff, patientController.getPatientById);
router.post('/', authenticate, authorizeStaff, patientController.createPatient);
router.put('/:id', authenticate, authorizeStaff, patientController.updatePatient);
router.delete('/:id', authenticate, authorizeStaff, patientController.deletePatient);

// Diagnosis records
router.post('/:id/diagnosis', authenticate, authorizeStaff, patientController.addDiagnosisRecord);
router.put('/:id/diagnosis/:recordId', authenticate, authorizeStaff, patientController.updateDiagnosisRecord);
router.delete('/:id/diagnosis/:recordId', authenticate, authorizeStaff, patientController.deleteDiagnosisRecord);

// Patient images — multer runs first then auth
router.post('/:id/images', upload.single('image'), authenticate, authorizeStaff, patientController.addPatientImage);
router.delete('/:id/images/:imageId', authenticate, authorizeStaff, patientController.deletePatientImage);

module.exports = router;