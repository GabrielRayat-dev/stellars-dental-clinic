const { supabaseAdmin } = require('../config/supabase');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createOTP = async (email) => {
  // Invalidate any existing unused OTPs for this email
  await supabaseAdmin
    .from('otp_requests')
    .update({ used: true })
    .eq('email', email)
    .eq('used', false);

  const otp = generateOTP();
  const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const { error } = await supabaseAdmin
    .from('otp_requests')
    .insert({ email, otp, expires_at });

  if (error) throw error;
  return otp;
};

const verifyOTP = async (email, otp) => {
  const { data, error } = await supabaseAdmin
    .from('otp_requests')
    .select('*')
    .eq('email', email)
    .eq('otp', otp)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return false;

  // Mark as used
  await supabaseAdmin
    .from('otp_requests')
    .update({ used: true })
    .eq('id', data.id);

  return true;
};

module.exports = { createOTP, verifyOTP };