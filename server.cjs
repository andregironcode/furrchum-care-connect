const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

// Add process error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('Starting server...');
console.log('Node version:', process.version);

// Set fallback environment variables for testing
if (!process.env.RAZORPAY_KEY_ID && !process.env.VITE_RAZORPAY_KEY_ID) {
  process.env.VITE_RAZORPAY_KEY_ID = 'rzp_test_N2UcpugA4t44wo';
  process.env.VITE_RAZORPAY_KEY_SECRET = 'o3e4uXTFnar3ILSqrTV8Rp70';
  process.env.VITE_RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret_123';
  console.log('Using hardcoded Razorpay test keys');
}

if (!process.env.WHEREBY_API_KEY && !process.env.VITE_WHEREBY_API_KEY) {
  process.env.VITE_WHEREBY_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmFwcGVhci5pbiIsImF1ZCI6Imh0dHBzOi8vYXBpLmFwcGVhci5pbi92MSIsImV4cCI6OTAwNzE5OTI1NDc0MDk5MSwiaWF0IjoxNzQ4MTEwMDA4LCJvcmdhbml6YXRpb25JZCI6MzE2MjE1LCJqdGkiOiIxODMyZTQ0OC01MDUzLTQ3ZTUtOTFlZC0wZDBmNmVjMDk0YWYifQ.gIewodxwfMmU9a9ol3kgB1StTRoPX4vk95FeO38V4HM';
  process.env.VITE_WHEREBY_API_URL = 'https://api.whereby.dev/v1';
  console.log('Using hardcoded Whereby API key');
}

console.log('Environment variables check:');
console.log('- RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
console.log('- VITE_RAZORPAY_KEY_ID:', process.env.VITE_RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
console.log('- WHEREBY_API_KEY:', process.env.WHEREBY_API_KEY ? 'SET' : 'NOT SET');
console.log('- VITE_WHEREBY_API_KEY:', process.env.VITE_WHEREBY_API_KEY ? 'SET' : 'NOT SET');

// Import Resend for email functionality
let resend;
try {
  const { Resend } = require('resend');
  resend = new Resend(process.env.VITE_RESEND_API_KEY);
  console.log('Resend initialized successfully');
} catch (error) {
  console.warn('Resend initialization failed:', error.message);
  console.log('Email functionality will be disabled');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:8080'],
  credentials: true
}));
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Whereby API proxy endpoint
app.post('/api/whereby/meetings', async (req, res) => {
  try {
    const body = req.body;
    const WHEREBY_API_KEY = process.env.VITE_WHEREBY_API_KEY;
    const WHEREBY_API_URL = process.env.VITE_WHEREBY_API_URL || 'https://api.whereby.dev/v1';

    if (!WHEREBY_API_KEY) {
      console.error('Missing Whereby API key in environment variables');
      return res.status(500).json({ 
        error: 'Server misconfiguration: Missing Whereby API key' 
      });
    }

    console.log('Creating Whereby meeting with request body:', JSON.stringify(body, null, 2));

    const response = await fetch(`${WHEREBY_API_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHEREBY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Whereby API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data
      });
      
      return res.status(response.status).json({ 
        error: data.error || data.message || 'Failed to create meeting' 
      });
    }

    // Validate expected fields in response
    if (!data.meetingId || !data.roomUrl) {
      console.error('Invalid response from Whereby API:', data);
      return res.status(502).json({
        error: 'Invalid response from Whereby API: Missing required fields'
      });
    }

    console.log('Meeting created successfully:', JSON.stringify(data, null, 2));
    return res.json(data);
  } catch (error) {
    console.error('Error in create meeting API:', error);
    return res.status(500).json({ error: 'Internal server error: ' + (error.message || 'Unknown error') });
  }
});

// Email API endpoint
app.post('/api/send-welcome-email', async (req, res) => {
  try {
    if (!resend) {
      return res.status(503).json({ 
        error: 'Email service not available',
        details: 'Resend API not configured'
      });
    }

    // Validate request body
    const { email, fullName, userType } = req.body;
    
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
      message: error.message || 'Unknown error' 
    });
  }
});

// Helper function to generate welcome email HTML
function generateWelcomeEmailHTML(fullName, userType) {
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
          <a href="mailto:info@furrchum.com" style="color: #3b82f6;">info@furrchum.com</a>
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

// Razorpay API endpoints
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    console.log('🐛 DEBUG: Create checkout session called');
    console.log('🐛 DEBUG: Request body:', JSON.stringify(req.body, null, 2));
    
    const { bookingData } = req.body;
    
    if (!bookingData) {
      console.error('🐛 DEBUG: Missing bookingData in request');
      return res.status(400).json({ error: 'Booking data is required' });
    }
    
    console.log('🐛 DEBUG: Booking data received:', JSON.stringify(bookingData, null, 2));
    
    // Get Razorpay configuration
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;
    
    // Debug logging (safely)
    console.log('🐛 DEBUG: Razorpay Key ID:', keyId ? `${keyId.substring(0, 8)}...` : 'NOT SET');
    console.log('🐛 DEBUG: Razorpay Key Secret:', keySecret ? `${keySecret.substring(0, 8)}...` : 'NOT SET');
    
    if (!keyId || !keySecret) {
      console.error('🐛 DEBUG: Razorpay credentials not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }
    
    // Initialize Razorpay
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    
    // Calculate amounts (in paise for Razorpay)
    const consultationFee = bookingData.fee || 500;
    const serviceFee = Math.round(consultationFee * 0.05); // 5% service fee
    const totalAmount = consultationFee + serviceFee;
    const amountInPaise = totalAmount * 100; // Convert to paise
    
    console.log('🐛 DEBUG: Fee calculation:', {
      consultationFee,
      serviceFee,
      totalAmount,
      amountInPaise
    });
    
    // Create Razorpay order
    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `bk_${bookingData.bookingId.split('-')[0]}_${Date.now().toString().slice(-6)}`,
      notes: {
        booking_id: bookingData.bookingId,
        vet_id: bookingData.vetId,
        pet_id: bookingData.petId,
        consultation_type: bookingData.consultationType,
        user_id: bookingData.userId,
      },
    };
    
    console.log('🐛 DEBUG: Creating Razorpay order with options:', JSON.stringify(orderOptions, null, 2));
    
    const order = await razorpay.orders.create(orderOptions);
    
    console.log('🐛 DEBUG: Razorpay order created successfully:', JSON.stringify(order, null, 2));
    
    // Return the order details
    const responseData = {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId, // Send key ID to frontend
      receipt: order.receipt,
      status: order.status,
      notes: order.notes,
    };
    
    console.log('🐛 DEBUG: Sending response:', JSON.stringify(responseData, null, 2));
    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error('🐛 DEBUG: Error in create-checkout-session:', error);
    console.error('🐛 DEBUG: Error stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message || 'Unknown error occurred'
    });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    console.log('🐛 DEBUG: Payment verification called');
    console.log('🐛 DEBUG: Request body:', JSON.stringify(req.body, null, 2));
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
      console.error('🐛 DEBUG: Missing required payment verification data');
      return res.status(400).json({ error: 'Missing required payment verification data' });
    }
    
    // Get Razorpay configuration
    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;
    
    if (!keySecret) {
      console.error('🐛 DEBUG: Razorpay key secret not configured');
      return res.status(500).json({ error: 'Payment verification not configured' });
    }
    
    // Verify signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      console.error('🐛 DEBUG: Payment signature verification failed');
      console.error('🐛 DEBUG: Expected:', expectedSignature);
      console.error('🐛 DEBUG: Received:', razorpay_signature);
      return res.status(400).json({ error: 'Payment verification failed' });
    }
    
    console.log('🐛 DEBUG: Payment signature verified successfully');
    
    // Check if booking_id is a temporary ID (starts with "temp_")
    if (booking_id.startsWith('temp_')) {
      console.log('🐛 DEBUG: Temporary booking ID detected, payment verified for frontend handling');
      // For temporary booking IDs, just return success
      // The frontend will handle creating the actual booking
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        booking_id: booking_id,
        isTemporaryBooking: true
      });
    }
    
    // If it's a real booking ID, update the existing booking
    // (This would be for any legacy flow or admin operations)
    console.log('🐛 DEBUG: Real booking ID detected, would update existing booking');
    
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      booking_id: booking_id,
      isTemporaryBooking: false
    });
    
  } catch (error) {
    console.error('🐛 DEBUG: Error verifying payment:', error);
    console.error('🐛 DEBUG: Error stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Failed to verify payment',
      details: error.message || 'Unknown error occurred'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const WHEREBY_API_KEY = process.env.VITE_WHEREBY_API_KEY;
    const WHEREBY_API_URL = process.env.VITE_WHEREBY_API_URL || 'https://api.whereby.dev/v1';
    
    if (!WHEREBY_API_KEY) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Whereby API key is missing',
        configured: false
      });
    }
    
    return res.json({ 
      status: 'ok',
      serverTime: new Date().toISOString(),
      configured: true,
      api: {
        name: 'Whereby',
        url: WHEREBY_API_URL
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
});

// For development, proxy requests to Vite dev server
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // For all other requests, proxy to the Vite dev server
  // Use a dynamic port based on environment variable or default to 8081
  const VITE_PORT = process.env.VITE_PORT || 8081;
  res.redirect(`http://localhost:${VITE_PORT}${req.path}`);
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Whereby API proxy available at http://localhost:${PORT}/api/whereby/meetings`);
  console.log(`Razorpay API available at http://localhost:${PORT}/api/create-checkout-session`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
  console.log('Server is ready to accept connections');
});

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is working',
    timestamp: new Date().toISOString(),
    environment: {
      razorpay_configured: !!(process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID),
      whereby_configured: !!(process.env.WHEREBY_API_KEY || process.env.VITE_WHEREBY_API_KEY)
    }
  });
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});
