const { supabaseAdmin } = require('../config/supabase');

// Efficient exact-count helper (no row data fetched)
const countRows = async (table, filterBuilder) => {
  let query = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
  if (filterBuilder) query = filterBuilder(query);
  const { count, error } = await query;
  if (error) throw error;
  return count;
};

// Aggregate dashboard stats across appointments, records, and staff
const getStats = async () => {
  // Cutoff for "last 7 days" (created_at >= now() - interval '7 days')
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    pendingTotal,
    approvedTotal,
    rejectedTotal,
    recordCount,
    imagesCount,
    adminCount,
    dentistCount,
    assistantCount,
  ] = await Promise.all([
    countRows('appointments', (q) => q.eq('status', 'pending')),
    countRows('appointments', (q) => q.eq('status', 'approved')),
    countRows('appointments', (q) => q.eq('status', 'rejected')),
    countRows('diagnosis_records'),
    countRows('patient_images'),
    countRows('profiles', (q) => q.eq('role', 'admin')),
    countRows('profiles', (q) => q.eq('role', 'dentist')),
    countRows('profiles', (q) => q.eq('role', 'assistant')),
  ]);

  // Pending appointments grouped by calendar day, last 7 days only
  const { data: pendingRows, error: pendingDaysError } = await supabaseAdmin
    .from('appointments')
    .select('created_at')
    .eq('status', 'pending')
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: true });

  if (pendingDaysError) throw pendingDaysError;

  const perDayMap = new Map();
  for (const row of pendingRows) {
    const date = row.created_at.slice(0, 10); // YYYY-MM-DD from ISO timestamp
    perDayMap.set(date, (perDayMap.get(date) || 0) + 1);
  }

  const pendingPerDay = [...perDayMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    appointments: {
      pending_total: pendingTotal,
      pending_per_day: pendingPerDay,
      approved_total: approvedTotal,
      rejected_total: rejectedTotal,
    },
    records: {
      record_count: recordCount,
      images_count: imagesCount,
    },
    staff: {
      admin_count: adminCount,
      dentist_count: dentistCount,
      assistant_count: assistantCount,
    },
  };
};

module.exports = { getStats };
