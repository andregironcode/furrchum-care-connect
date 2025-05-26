// This script generates the env-config.js file with actual environment variables
// It's meant to be run during the build process on Vercel

const fs = require('fs');
const path = require('path');

// Read the template file
const templatePath = path.join(__dirname, '../public/env-config.js');
const outputPath = path.join(__dirname, '../public/env-config.js');

try {
  console.log('Generating env-config.js with environment variables...');
  
  // Read the template
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // List of environment variables to replace
  const envVars = [
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'WHEREBY_API_KEY',
    'WHEREBY_API_URL',
    'RAZORPAY_KEY_ID',
    'FRONTEND_URL'
  ];
  
  // Replace each placeholder with the actual environment variable
  envVars.forEach(varName => {
    const value = process.env[varName] || process.env[`VITE_${varName}`] || '';
    template = template.replace(`%${varName}%`, value);
    
    // Log whether we found the variable (without showing the actual value for security)
    if (value) {
      console.log(`✅ Found ${varName}`);
    } else {
      console.warn(`⚠️ Missing ${varName}`);
    }
  });
  
  // Write the result back to the file
  fs.writeFileSync(outputPath, template);
  console.log('✅ Successfully generated env-config.js');
} catch (error) {
  console.error('❌ Error generating env-config.js:', error);
  process.exit(1);
}
