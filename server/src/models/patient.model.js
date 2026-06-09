const { supabase } = require('../config/supabase');

// Get all patients
const getAllPatients = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get single patient with full records
const getPatientById = async (id) => {
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      diagnosis_records(
        *,
        chief_complaint:services(id, name)
      ),
      patient_images(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Create patient
const createPatient = async (patientData, createdBy) => {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      ...patientData,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update patient
const updatePatient = async (id, patientData) => {
  const { data, error } = await supabase
    .from('patients')
    .update({
      ...patientData,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete patient
const deletePatient = async (id) => {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { message: 'Patient deleted successfully' };
};

// Add diagnosis record
const addDiagnosisRecord = async (patientId, diagnosisData, createdBy) => {
  const { data, error } = await supabase
    .from('diagnosis_records')
    .insert({
      ...diagnosisData,
      patient_id: patientId,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update diagnosis record
const updateDiagnosisRecord = async (id, diagnosisData) => {
  const { data, error } = await supabase
    .from('diagnosis_records')
    .update({
      ...diagnosisData,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete diagnosis record
const deleteDiagnosisRecord = async (id) => {
  const { error } = await supabase
    .from('diagnosis_records')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { message: 'Diagnosis record deleted successfully' };
};

// Add patient image
const addPatientImage = async (patientId, fileUrl, fileName, uploadedBy) => {
  const { data, error } = await supabase
    .from('patient_images')
    .insert({
      patient_id: patientId,
      file_url: fileUrl,
      file_name: fileName,
      uploaded_by: uploadedBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete patient image
const deletePatientImage = async (id) => {
  const { error } = await supabase
    .from('patient_images')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { message: 'Image deleted successfully' };
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