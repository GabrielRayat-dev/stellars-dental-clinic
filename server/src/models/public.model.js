const { supabase } = require('../config/supabase');

// ─── FAQs ───────────────────────────────────────────

// Get all active FAQs (public)
const getActiveFaqs = async () => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

// Get all FAQs (admin)
const getAllFaqs = async () => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

// Create FAQ
const createFaq = async (question, answer) => {
  const { data, error } = await supabase
    .from('faqs')
    .insert({ question, answer })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update FAQ
const updateFaq = async (id, faqData) => {
  const { data, error } = await supabase
    .from('faqs')
    .update({ ...faqData, updated_at: new Date() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete FAQ
const deleteFaq = async (id) => {
  const { error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { message: 'FAQ deleted successfully' };
};

// ─── Clinic Information ──────────────────────────────

// Get clinic information (public)
const getClinicInformation = async () => {
  const { data, error } = await supabase
    .from('clinic_information')
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

// Update clinic information (admin)
const updateClinicInformation = async (clinicData) => {
  const { data: existing } = await supabase
    .from('clinic_information')
    .select('id')
    .single();

  const { data, error } = await supabase
    .from('clinic_information')
    .update({ ...clinicData, updated_at: new Date() })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  getActiveFaqs,
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getClinicInformation,
  updateClinicInformation,
};