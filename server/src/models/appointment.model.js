const { supabase, supabaseAdmin } = require('../config/supabase');

// Get all appointments
const getAllAppointments = async () => {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      *,
      service:services(id, name)
    `)
    .order('preferred_date', { ascending: true });

  if (error) throw error;
  return data;
};

// Get single appointment
const getAppointmentById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      *,
      service:services(id, name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Public availability — approved dates/times only, no patient data
const getPublicAvailability = async () => {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('preferred_date, preferred_time, status')
    .eq('status', 'approved');

  if (error) throw error;
  return data;
};

// Create appointment (by assistant or public)
const createAppointment = async (appointmentData) => {
  // Duplicate guard — check if phone number has active request
  const { data: existing, error: checkError } = await supabase
    .from('appointments')
    .select('id, status')
    .eq('phone_number', appointmentData.phone_number)
    .in('status', ['pending', 'approved'])
    .maybeSingle();

  if (existing) {
    throw new Error('This phone number already has an active appointment request');
  }

  // Slot guard — reject if this time slot already has an approved appointment
  const { data: slotTaken, error: slotError } = await supabase
    .from('appointments')
    .select('id')
    .eq('preferred_date', appointmentData.preferred_date)
    .eq('preferred_time', appointmentData.preferred_time)
    .eq('status', 'approved')
    .maybeSingle();

  if (slotError) throw slotError;
  if (slotTaken) {
    throw new Error('This time slot is no longer available');
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update appointment status (approve or reject)
const updateAppointmentStatus = async (id, status, handledBy, rejectedReason = null) => {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .update({
      status,
      handled_by: handledBy,
      rejected_reason: rejectedReason,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get rejected appointments list
const getRejectedAppointments = async () => {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      *,
      service:services(id, name)
    `)
    .eq('status', 'rejected')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Clear rejected appointment
const clearRejectedAppointment = async (id) => {
  const { error } = await supabaseAdmin
    .from('appointments')
    .delete()
    .eq('id', id)
    .eq('status', 'rejected');

  if (error) throw error;
  return { message: 'Rejected appointment cleared successfully' };
};

// Check appointment status (public — status verification)
const checkAppointmentStatus = async (patientName, phoneNumber) => {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      status,
      rejected_reason,
      preferred_date,
      preferred_time,
      service:services(name)
    `)
    .eq('phone_number', phoneNumber)
    .eq('patient_name', patientName)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  getPublicAvailability,
  createAppointment,
  updateAppointmentStatus,
  getRejectedAppointments,
  clearRejectedAppointment,
  checkAppointmentStatus,
};