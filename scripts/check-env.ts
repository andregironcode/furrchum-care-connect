import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Required environment variables
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_WHEREBY_API_KEY',
  'VITE_APP_URL',
];

// Check if all required variables are set
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('\nPlease add them to your .env file or environment variables.');
  process.exit(1);
}

// Validate Supabase URL format
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('❌ Invalid VITE_SUPABASE_URL format. It should look like: https://xxxxxxxxxxxxxx.supabase.co');
  process.exit(1);
}

// Validate Whereby API key format
const wherebyKey = process.env.VITE_WHEREBY_API_KEY || '';
if (!wherebyKey.startsWith('eyJ')) {
  console.error('❌ Invalid VITE_WHEREBY_API_KEY format. It should be a valid JWT token.');
  process.exit(1);
}

console.log('✅ All environment variables are properly configured!');
process.exit(0);
