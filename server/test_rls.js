const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testQuery() {
  console.log('--- Querying with Anon Key ---');
  const { data: data1, error: error1 } = await supabase.from('patients').select('*');
  console.log('Anon data:', data1);
  console.log('Anon error:', error1);

  console.log('\n--- Querying with Service Key ---');
  const { data: data2, error: error2 } = await supabaseAdmin.from('patients').select('*');
  console.log('Admin data:', data2);
  console.log('Admin error:', error2);
}

testQuery();
