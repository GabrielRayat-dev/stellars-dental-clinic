const { supabaseAdmin } = require('../config/supabase');

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];

const getMonthlyAvailability = async (year, month) => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('preferred_date')
    .eq('status', 'approved')
    .gte('preferred_date', startDate)
    .lte('preferred_date', endDate);

  if (error) throw error;

  const countMap = new Map();
  for (const row of data) {
    countMap.set(row.preferred_date, (countMap.get(row.preferred_date) || 0) + 1);
  }

  const results = [];
  for (let day = 1; day <= lastDay; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const takenSlots = countMap.get(dateStr) || 0;
    const availableSlots = 8 - takenSlots;
    let color;
    if (availableSlots >= 5) color = 'green';
    else if (availableSlots >= 1) color = 'yellow';
    else color = 'red';

    results.push({
      date: dateStr,
      available_slots: availableSlots,
      taken_slots: takenSlots,
      color,
    });
  }

  return results;
};

const getDailyAvailability = async (date) => {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('preferred_time')
    .eq('status', 'approved')
    .eq('preferred_date', date);

  if (error) throw error;

  const takenTimes = new Set(data.map(row => row.preferred_time));

  return TIME_SLOTS.map(time => {
    const available = !takenTimes.has(time);
    return {
      time,
      available,
      color: available ? 'green' : 'red',
    };
  });
};

module.exports = { getMonthlyAvailability, getDailyAvailability };
