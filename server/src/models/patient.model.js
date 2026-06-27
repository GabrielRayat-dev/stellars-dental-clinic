const { supabaseAdmin } = require('../config/supabase');

// Get all patients
const getAllPatients = async () => {
  const { data, error } = await supabaseAdmin
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get single patient with full records
const getPatientById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('patients')
    .select(`
      *,
      diagnosis_records(
        *,
        chief_complaint:services(id, name),
        patient_images(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Create patient
const createPatient = async (patientData, createdBy) => {
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin
    .from('patients')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { message: 'Patient deleted successfully' };
};

// Add diagnosis record
const addDiagnosisRecord = async (patientId, diagnosisData, createdBy) => {
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin
    .from('diagnosis_records')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { message: 'Diagnosis record deleted successfully' };
};

// Verify a diagnosis record belongs to the patient before attaching images
const verifyDiagnosisRecordBelongsToPatient = async (patientId, diagnosisRecordId) => {
  const { data, error } = await supabaseAdmin
    .from('diagnosis_records')
    .select('id, patient_id')
    .eq('id', diagnosisRecordId)
    .eq('patient_id', patientId)
    .maybeSingle(); // returns null instead of throwing when no row matches

  if (error) throw error;

  if (!data) {
    const notFoundError = new Error('Diagnosis record does not belong to this patient');
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  return data;
};

const addPatientImage = async (patientId, diagnosisRecordId, fileUrl, fileName, uploadedBy) => {
  await verifyDiagnosisRecordBelongsToPatient(patientId, diagnosisRecordId);

  const { data, error } = await supabaseAdmin
    .from('patient_images')
    .insert({
      patient_id: patientId,
      diagnosis_record_id: diagnosisRecordId,
      file_url: fileUrl,
      file_name: fileName,
      uploaded_by: uploadedBy,
      uploaded_at: new Date(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete patient image
const deletePatientImage = async (id) => {
  const { data: imgData, error: imgError } = await supabaseAdmin
    .from('patient_images')
    .select('*')
    .eq('id', id)
    .single();

  if (imgError) throw imgError;

  const { error } = await supabaseAdmin
    .from('patient_images')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { message: 'Image deleted successfully', image: imgData };
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
  verifyDiagnosisRecordBelongsToPatient,
  addPatientImage,
  deletePatientImage,
};

