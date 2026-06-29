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

// Get all audit logs (for admin/dentist to view)
const getAllLogs = async () => {
  const { data, error } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const getAuditLogs = async (req, res) => {
  try {
    const data = await auditModel.getAllLogs();
    res.status(200).json({
      message: 'Audit logs retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { logAction, getAllLogs };