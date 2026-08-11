const { supabase, supabaseAdmin } = require('../config/supabase');

const getAllStaff = async () => {
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .in('role', ['dentist', 'assistant', 'admin'])
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Fetch emails from auth.users
  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) throw usersError;

  // Merge email into each profile
  return profiles.map(profile => ({
    ...profile,
    email: users.find(u => u.id === profile.user_id)?.email || null,
  }));
};

const getStaffById = async (id) => {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  // Fetch email from auth.users
  const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(
    profile.user_id
  );
  if (userError) throw userError;

  return { ...profile, email: user.email };
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

  // Strip out status from profileData — new accounts always start as logged_out
  const { status, ...safeProfileData } = profileData;

  // Upsert the profile: some databases auto-create a profile row via trigger
  // (update), others don't (insert). Upserting handles both cases.
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        user_id: authData.user.id,
        ...safeProfileData,
        status: 'logged_out',
        must_change_password: true,
        updated_at: new Date(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateStaff = async (id, profileData) => {
  const { status, ...safeProfileData } = profileData;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      ...safeProfileData,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select();

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