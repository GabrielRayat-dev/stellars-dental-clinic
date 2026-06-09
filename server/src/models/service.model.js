const { supabase } = require('../config/supabase');

// Get all services
const getAllServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

// Get active services only (for public and dropdowns)
const getActiveServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

// Get single service
const getServiceById = async (id) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Create service
const createService = async (serviceData) => {
  const { data, error } = await supabase
    .from('services')
    .insert(serviceData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update service
const updateService = async (id, serviceData) => {
  const { data, error } = await supabase
    .from('services')
    .update({
      ...serviceData,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Toggle service active status
const toggleServiceStatus = async (id, isActive) => {
  const { data, error } = await supabase
    .from('services')
    .update({
      is_active: isActive,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  getAllServices,
  getActiveServices,
  getServiceById,
  createService,
  updateService,
  toggleServiceStatus,
};