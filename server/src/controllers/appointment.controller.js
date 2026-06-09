const appointmentModel = require('../models/appointment.model');

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const data = await appointmentModel.getAllAppointments();
    res.status(200).json({
      message: 'Appointments retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single appointment
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await appointmentModel.getAppointmentById(id);

    if (!data) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({
      message: 'Appointment retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create appointment
const createAppointment = async (req, res) => {
  try {
    const { patient_name, phone_number, service_id, preferred_date, preferred_time } = req.body;

    if (!patient_name || !phone_number || !service_id || !preferred_date || !preferred_time) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const data = await appointmentModel.createAppointment({
      patient_name,
      phone_number,
      service_id,
      preferred_date,
      preferred_time,
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      data,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Approve appointment
const approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const handledBy = req.profile.id;

    const data = await appointmentModel.updateAppointmentStatus(
      id,
      'approved',
      handledBy
    );

    res.status(200).json({
      message: 'Appointment approved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject appointment
const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejected_reason } = req.body;
    const handledBy = req.profile.id;

    if (!rejected_reason) {
      return res.status(400).json({ message: 'Rejected reason is required' });
    }

    const data = await appointmentModel.updateAppointmentStatus(
      id,
      'rejected',
      handledBy,
      rejected_reason
    );

    res.status(200).json({
      message: 'Appointment rejected successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get rejected appointments
const getRejectedAppointments = async (req, res) => {
  try {
    const data = await appointmentModel.getRejectedAppointments();
    res.status(200).json({
      message: 'Rejected appointments retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear rejected appointment — Dentist only
const clearRejectedAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.profile.role !== 'dentist') {
      return res.status(403).json({ message: 'Forbidden: Dentist access only' });
    }

    const data = await appointmentModel.clearRejectedAppointment(id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check appointment status — public
const checkAppointmentStatus = async (req, res) => {
  try {
    const { patient_name, phone_number } = req.body;

    if (!patient_name || !phone_number) {
      return res.status(400).json({ message: 'Name and phone number are required' });
    }

    const data = await appointmentModel.checkAppointmentStatus(patient_name, phone_number);

    if (!data) {
      return res.status(404).json({ message: 'No appointment found for this name and phone number' });
    }

    res.status(200).json({
      message: 'Appointment status retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(404).json({ message: 'No appointment found for this name and phone number' });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  approveAppointment,
  rejectAppointment,
  getRejectedAppointments,
  clearRejectedAppointment,
  checkAppointmentStatus,
};