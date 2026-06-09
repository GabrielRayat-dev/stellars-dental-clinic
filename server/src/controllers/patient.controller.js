const patientModel = require('../models/patient.model');
const { supabaseAdmin } = require('../config/supabase');

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    const data = await patientModel.getAllPatients();
    res.status(200).json({
      message: 'Patients retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single patient
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await patientModel.getPatientById(id);

    if (!data) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({
      message: 'Patient retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create patient
const createPatient = async (req, res) => {
  try {
    const {
      name, age, birthday, sex, civil_status, address,
      phone_number, emergency_contact, blood_type,
      ...optionalFields
    } = req.body;

    if (!name || !age || !birthday || !sex || !civil_status ||
        !address || !phone_number || !emergency_contact || !blood_type) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const data = await patientModel.createPatient(req.body, req.profile.id);
    res.status(201).json({
      message: 'Patient created successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }

    const data = await patientModel.updatePatient(id, req.body);
    res.status(200).json({
      message: 'Patient updated successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete patient
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await patientModel.deletePatient(id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add diagnosis record
const addDiagnosisRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, diagnosis, treatment, amount_paid, balance, chief_complaint } = req.body;

    if (!date || !time || !diagnosis || !treatment) {
      return res.status(400).json({ message: 'Date, time, diagnosis and treatment are required' });
    }

    const data = await patientModel.addDiagnosisRecord(id, req.body, req.profile.id);
    res.status(201).json({
      message: 'Diagnosis record added successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update diagnosis record
const updateDiagnosisRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }

    const data = await patientModel.updateDiagnosisRecord(recordId, req.body);
    res.status(200).json({
      message: 'Diagnosis record updated successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete diagnosis record
const deleteDiagnosisRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const data = await patientModel.deleteDiagnosisRecord(recordId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add patient image
const addPatientImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { file_url, file_name } = req.body;

    if (!file_url || !file_name) {
      return res.status(400).json({ message: 'File URL and file name are required' });
    }

    const data = await patientModel.addPatientImage(id, file_url, file_name, req.profile.id);
    res.status(201).json({
      message: 'Image added successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete patient image
const deletePatientImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const data = await patientModel.deletePatientImage(imageId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  addDiagnosisRecord,
  updateDiagnosisRecord,
  deleteDiagnosisRecord,
  addPatientImage,
  deletePatientImage,
};