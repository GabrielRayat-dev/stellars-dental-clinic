const appointmentModel = require('../models/appointment.model');
const auditModel = require('../models/audit.model');

// Clinic time slots — must match the client's available slots
const VALID_TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isPastDate = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return date < today;
};

// Get public availability — approved dates/times only, no patient data
const getPublicAvailability = async (req, res) => {
  try {
    const data = await appointmentModel.getPublicAvailability();
    res.status(200).json({
      message: 'Availability retrieved successfully',
      data,
    });
  } catch (error) {
    console.error('[GetPublicAvailability]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const data = await appointmentModel.getAllAppointments();
    res.status(200).json({
      message: 'Appointments retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
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
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create appointment
const createAppointment = async (req, res) => {
  try {
    const { patient_name, phone_number, service_id, preferred_date, preferred_time } = req.body;

    if (!patient_name || !phone_number || !service_id || !preferred_date || !preferred_time) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const name = String(patient_name).trim();
    if (name.length < 1 || name.length > 100) {
      return res.status(400).json({ message: 'Patient name must be between 1 and 100 characters' });
    }

    const phoneDigits = String(phone_number).replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return res.status(400).json({ message: 'Please provide a valid phone number' });
    }

    if (!DATE_REGEX.test(preferred_date) || isPastDate(preferred_date)) {
      return res.status(400).json({ message: 'Please select a valid future date' });
    }

    if (!VALID_TIME_SLOTS.includes(preferred_time)) {
      return res.status(400).json({ message: 'Please select a valid time slot' });
    }

    const data = await appointmentModel.createAppointment({
      patient_name: name,
      phone_number: phoneDigits,
      service_id,
      preferred_date,
      preferred_time,
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      data,
    });
  } catch (error) {
    console.error('[CreateAppointment]', error);
    if (error && error.message && error.message.includes('idx_appointments_approved_slot')) {
      return res.status(400).json({ message: 'This time slot is no longer available' });
    }
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
    res.status(500).json({ message: 'Internal server error' });
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

    await auditModel.logAction({
      actorId: req.profile.id,
      actorName: req.profile.name,
      actorRole: req.profile.role,
      action: 'reject',
      resourceType: 'appointment',
      resourceId: id,
    });

    res.status(200).json({
      message: 'Appointment rejected successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
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
    res.status(500).json({ message: 'Internal server error' });
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

    await auditModel.logAction({
      actorId: req.profile.id,
      actorName: req.profile.name,
      actorRole: req.profile.role,
      action: 'delete',
      resourceType: 'appointment',
      resourceId: id,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
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
    console.error('[CheckAppointmentStatus]', error);
    res.status(404).json({ message: 'No appointment found for this name and phone number' });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  getPublicAvailability,
  createAppointment,
  approveAppointment,
  rejectAppointment,
  getRejectedAppointments,
  clearRejectedAppointment,
  checkAppointmentStatus,
};