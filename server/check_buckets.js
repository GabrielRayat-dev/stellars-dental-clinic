const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkAndCreateBucket() {
  const bucketName = 'patient-image';
  
  // List all buckets
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }
  
  console.log('Existing buckets:', buckets.map(b => b.name));
  
  const bucketExists = buckets.find(b => b.name === bucketName);
  
  if (bucketExists) {
    console.log(`Bucket '${bucketName}' already exists. Updating it to be public.`);
    const { data, error } = await supabaseAdmin.storage.updateBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/*']
    });
    if (error) {
      console.error('Error updating bucket:', error);
    } else {
      console.log('Bucket updated successfully.');
    }
  } else {
    console.log(`Bucket '${bucketName}' does not exist. Creating it as public.`);
    const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/*']
    });
    if (error) {
      console.error('Error creating bucket:', error);
    } else {
      console.log('Bucket created successfully.');
    }
  }
}

checkAndCreateBucket();
