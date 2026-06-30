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

// Get audit logs — admin sees all, others see only their own
const getAllLogs = async (currentProfile) => {
  let query = supabaseAdmin
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (currentProfile.role !== 'admin') {
    query = query.eq('actor_id', currentProfile.id);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};


module.exports = { logAction, getAllLogs };