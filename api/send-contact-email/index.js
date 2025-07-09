const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.VITE_RESEND_API_KEY);

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Function to verify reCAPTCHA token
async function verifyRecaptcha(token) {
  const secretKey = process.env.VITE_RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.error('reCAPTCHA secret key is missing from environment variables');
    return false;
  }
  
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    
    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
    }
    
    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'OK' });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    console.log('=== Contact Form Debug ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Environment variables check:', {
      hasResendKey: !!process.env.VITE_RESEND_API_KEY,
      hasRecaptchaSecret: !!process.env.VITE_RECAPTCHA_SECRET_KEY,
      hasEmailFrom: !!process.env.VITE_EMAIL_FROM
    });

    // Extract form data from request body
    const { name, email, subject, message, recaptchaToken, timestamp } = req.body;

    console.log('Form data check:', {
      hasName: !!name,
      hasEmail: !!email, 
      hasSubject: !!subject,
      hasMessage: !!message,
      hasRecaptchaToken: !!recaptchaToken
    });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.log('❌ Missing required fields validation failed');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, subject, and message are required.'
      });
    }

    // Validate reCAPTCHA token
    if (!recaptchaToken) {
      console.log('❌ Missing reCAPTCHA token');
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA verification is required.'
      });
    }

    // Verify reCAPTCHA token
    console.log('🔄 Starting reCAPTCHA verification...');
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    console.log('reCAPTCHA result:', isRecaptchaValid);
    
    if (!isRecaptchaValid) {
      console.log('❌ reCAPTCHA verification failed');
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    console.log('✅ All validations passed, proceeding to send email...');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format.'
      });
    }

    // Sanitize inputs to prevent XSS
    const sanitize = (str) => str.replace(/<[^>]*>?/gm, '').trim();
    const sanitizedData = {
      name: sanitize(name),
      email: sanitize(email),
      subject: sanitize(subject),
      message: sanitize(message)
    };

    // Create formatted email content
    const formattedMessage = `
New Contact Form Submission from Furrchum Website

From: ${sanitizedData.name}
Email: ${sanitizedData.email}
Subject: ${sanitizedData.subject}
Submitted: ${timestamp || new Date().toISOString()}

Message:
${sanitizedData.message}

---
This message was sent via the Furrchum contact form.
Please respond to the customer at: ${sanitizedData.email}
`;

    // HTML version for better formatting
    const htmlMessage = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
      New Contact Form Submission
    </h2>
    
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">Contact Information</h3>
      <p><strong>Name:</strong> ${sanitizedData.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a></p>
      <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
      <p><strong>Submitted:</strong> ${new Date(timestamp || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #1e40af;">Message</h3>
      <p style="white-space: pre-wrap;">${sanitizedData.message}</p>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px;">
      <p style="margin: 0;"><strong>Note:</strong> Please respond to the customer at: 
        <a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: process.env.VITE_EMAIL_FROM || 'contact@furrchum.pittura.tech',
      to: ['info@furrchum.com', 'a.giron3121@gmail.com'], // Updated recipients
      subject: `Contact Form: ${sanitizedData.subject}`,
      text: formattedMessage,
      html: htmlMessage,
      reply_to: sanitizedData.email, // Allow direct reply to customer
      tags: [
        { name: 'source', value: 'contact_form' },
        { name: 'type', value: 'customer_inquiry' }
      ]
    });

    console.log('Admin email sent:', emailResponse);

    // Send auto-reply to the user
    const autoReplyText = `
Dear ${sanitizedData.name},

Thank you for contacting Furrchum! We have received your message and will get back to you within 24 hours during business days.

Here's a copy of your message:
Subject: ${sanitizedData.subject}
Message: ${sanitizedData.message}

If you have urgent questions, you can also reach us at:
Phone: +91 8700608887
Email: info@furrchum.com

Best regards,
The Furrchum Team

---
This is an automated response. Please do not reply to this email.
`;

    const autoReplyHtml = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2563eb;">Thank you for contacting Furrchum!</h2>
    
    <p>Dear ${sanitizedData.name},</p>
    
    <p>We have received your message and will get back to you within <strong>24 hours</strong> during business days.</p>
    
    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Your Message Summary:</h3>
      <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap; font-style: italic;">${sanitizedData.message}</p>
    </div>
    
    <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Need immediate assistance?</h3>
      <p><strong>Phone:</strong> <a href="tel:+918700608887">+91 8700608887</a></p>
      <p><strong>Email:</strong> <a href="mailto:info@furrchum.com">info@furrchum.com</a></p>
      <p><strong>Business Hours:</strong> Monday-Friday 9 AM - 6 PM IST</p>
    </div>
    
    <p>Best regards,<br>The Furrchum Team</p>
    
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
    <p style="font-size: 12px; color: #6b7280;">This is an automated response. Please do not reply to this email.</p>
  </div>
</body>
</html>`;

    const userEmailResult = await resend.emails.send({
      from: process.env.VITE_EMAIL_FROM || 'contact@furrchum.com',
      to: sanitizedData.email,
      subject: 'Thank you for contacting Furrchum - We received your message',
      text: autoReplyText,
      html: autoReplyHtml,
    });

    console.log('Auto-reply sent successfully to:', sanitizedData.email);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!'
    });

  } catch (error) {
    console.error('Error sending contact email:', error);
    
    // Return appropriate error response
    const errorMessage = error.message || 'Failed to send contact email';
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again or contact us directly.',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}; 