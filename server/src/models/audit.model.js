const { supabaseAdmin } = require('../config/supabase');

// Write an audit log entry
const logAction = async ({ actorId, actorName, actorRole, action, resourceType = null, resourceId = null }) => {
  const { error } = await supabaseAdmin
    .from('audit_logs')
    .insert({
      actor_id: actorId,
      actor_name: actorName,
      actor_role: actorRole,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
    });

  // Log errors to console but never throw — logging should never break the main request
  if (error) {
    console.error('Audit log failed:', error.message);
  }
};

// Get audit logs — admin sees all, dentist sees dentist+assistant, assistant sees assistant only
const getAllLogs = async (currentProfile) => {
  let query = supabaseAdmin
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (currentProfile.role === 'dentist') {
    query = query.in('actor_role', ['dentist', 'assistant']);
  } else if (currentProfile.role === 'assistant') {
    query = query.eq('actor_role', 'assistant');
  }
  // admin: no filter — sees everything

  const { data, error } = await query;

  if (error) throw error;
  return data;
};


module.exports = { logAction, getAllLogs };