const { supabase, supabaseAdmin } = require('../config/supabase');

const getAllStaff = async () => {
  const { data, error } = await supabaseAdmin  // use supabaseAdmin to bypass RLS
    .from('staff_with_email')
    .select('*')
    .in('role', ['dentist', 'assistant', 'admin'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const getStaffById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('staff_with_email')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

const createStaff = async (email, password, profileData) => {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: profileData.role,
      name: profileData.name,
    },
  });

  if (authError) throw authError;

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      must_change_password: true,
      updated_at: new Date(),
    })
    .eq('user_id', authData.user.id)
    .select()

  if (error) throw error;
  return data;
};

const updateStaff = async (id, profileData) => {
  const { data, error } = await supabaseAdmin  // ✅ use supabaseAdmin to bypass RLS
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()

  if (error) throw error;
  return data;
};

const deleteStaff = async (id) => {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('user_id')
    .eq('id', id)
    .single();

  if (profileError) throw profileError;

  // ✅ Deleting from auth.users will cascade to profiles automatically
  // as long as your profiles table has ON DELETE CASCADE on user_id FK
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
    profile.user_id
  );

  if (authError) throw authError;
  return { message: 'Staff deleted successfully' };
};



module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
};