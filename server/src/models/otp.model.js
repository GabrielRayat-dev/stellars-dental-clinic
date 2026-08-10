const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');

const MAX_ATTEMPTS = 5;

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
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
    .insert({ email, otp: hashOTP(otp), expires_at });

  if (error) throw error;
  return otp;
};

const verifyOTP = async (email, otp) => {
  const hashed = hashOTP(otp);

  const { data, error } = await supabaseAdmin
    .from('otp_requests')
    .select('*')
    .eq('email', email)
    .eq('otp', hashed)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // Record a failed attempt against the most recent unused OTP for this email
    const { data: latest } = await supabaseAdmin
      .from('otp_requests')
      .select('id, attempts')
      .eq('email', email)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest) {
      const newAttempts = (latest.attempts || 0) + 1;
      await supabaseAdmin
        .from('otp_requests')
        .update({ attempts: newAttempts, used: newAttempts >= MAX_ATTEMPTS })
        .eq('id', latest.id);
    }

    return false;
  }

  // Mark as used
  await supabaseAdmin
    .from('otp_requests')
    .update({ used: true })
    .eq('id', data.id);

  return true;
};

module.exports = { createOTP, verifyOTP };
