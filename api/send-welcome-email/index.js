// Vercel serverless function for sending welcome emails

const { Resend } = require('resend');

// Helper function to generate welcome email HTML
function generateWelcomeEmailHTML(fullName, userType) {
  const userTypeDisplay = userType === 'pet_owner' ? 'Pet Owner' : 'Veterinarian';
  const dashboardUrl = userType === 'vet' 
    ? 'https://furrchum-care-connect.vercel.app/vet-dashboard' 
    : 'https://furrchum-care-connect.vercel.app/dashboard';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to FurrChum Care Connect</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3b82f6; margin: 0;">🐾 FurrChum Care Connect</h1>
      </div>
      
      <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="color: #1e40af; margin-top: 0;">Welcome, ${fullName}!</h2>
        
        <p style="margin-bottom: 20px;">
          Thank you for joining FurrChum Care Connect as a <strong>${userTypeDisplay}</strong>. 
          We're excited to help you connect with the best pet healthcare services.
        </p>
        
        ${userType === 'pet_owner' ? `
          <h3 style="color: #3b82f6;">What you can do next:</h3>
          <ul style="margin-bottom: 20px;">
            <li>📱 Complete your pet's profile</li>
            <li>🏥 Browse qualified veterinarians</li>
            <li>📅 Schedule your first appointment</li>
            <li>💬 Access video consultations</li>
            <li>📋 Track your pet's health records</li>
          </ul>
        ` : `
          <h3 style="color: #3b82f6;">Getting started as a Veterinarian:</h3>
          <ul style="margin-bottom: 20px;">
            <li>👨‍⚕️ Complete your professional profile</li>
            <li>⏰ Set your availability</li>
            <li>💰 Configure consultation fees</li>
            <li>📞 Start accepting video consultations</li>
            <li>👥 Manage your patient appointments</li>
          </ul>
        `}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Need help? Contact our support team at 
          <a href="mailto:info@furrchum.com" style="color: #3b82f6;">info@furrchum.com</a>
        </p>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} FurrChum Care Connect. All rights reserved.</p>
        <p>
          <a href="https://furrchum-care-connect.vercel.app/privacy-policy" style="color: #6b7280;">Privacy Policy</a> | 
          <a href="https://furrchum-care-connect.vercel.app/terms-conditions" style="color: #6b7280;">Terms of Service</a>
        </p>
      </div>
      
    </body>
    </html>
  `;
}

// Main serverless function handler (CommonJS syntax for Vercel)
module.exports = async (req, res) => {
  try {
    console.log('Email API endpoint hit:', req.method);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({ error: 'Method not allowed, use POST' });
    }

    // Validate request body
    const { email, fullName, userType } = req.body;
    
    console.log('Request body:', { email, fullName, userType });
    
    if (!email || !fullName || !userType) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['email', 'fullName', 'userType'] 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate userType
    if (!['pet_owner', 'vet'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Get API key (try both with and without VITE_ prefix like the working API)
    const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
    const EMAIL_FROM = process.env.EMAIL_FROM || process.env.VITE_EMAIL_FROM || 'no-reply@furrchum.pittura.tech';
    
    console.log('Environment check:', {
      'API Key available': !!RESEND_API_KEY,
      'Email from': EMAIL_FROM,
      'All env vars': Object.keys(process.env).length
    });

    // Check if Resend API key is configured
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Initialize Resend with API key
    const resend = new Resend(RESEND_API_KEY);

    // Generate email content
    const htmlContent = generateWelcomeEmailHTML(fullName, userType);
    
    console.log('Sending email to:', email);
    
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Welcome to FurrChum Care Connect!',
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({ 
        error: 'Failed to send email', 
        details: error 
      });
    }

    console.log('Welcome email sent successfully:', { email, messageId: data?.id });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Welcome email sent successfully',
      messageId: data?.id 
    });

  } catch (error) {
    console.error('Server error sending welcome email:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message || 'Unknown error' 
    });
  }
}; 