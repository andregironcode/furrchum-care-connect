import type { Request, Response } from 'express';
import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.VITE_RESEND_API_KEY);

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  userType: 'pet_owner' | 'vet';
}

export const sendWelcomeEmail = async (req: Request, res: Response) => {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate request body
    const { email, fullName, userType }: WelcomeEmailRequest = req.body;
    
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

    // Generate email content
    const htmlContent = generateWelcomeEmailHTML(fullName, userType);
    
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.VITE_EMAIL_FROM || 'no-reply@furrchum.pittura.tech',
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
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

function generateWelcomeEmailHTML(fullName: string, userType: 'pet_owner' | 'vet'): string {
  const userTypeDisplay = userType === 'pet_owner' ? 'Pet Owner' : 'Veterinarian';
  const dashboardUrl = userType === 'vet' ? 'https://furrchum.pittura.tech/vet-dashboard' : 'https://furrchum.pittura.tech/dashboard';
  
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
          <a href="mailto:support@furrchum.pittura.tech" style="color: #3b82f6;">support@furrchum.pittura.tech</a>
        </p>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} FurrChum Care Connect. All rights reserved.</p>
        <p>
          <a href="https://furrchum.pittura.tech/privacy-policy" style="color: #6b7280;">Privacy Policy</a> | 
          <a href="https://furrchum.pittura.tech/terms-conditions" style="color: #6b7280;">Terms of Service</a>
        </p>
      </div>
      
    </body>
    </html>
  `;
} 