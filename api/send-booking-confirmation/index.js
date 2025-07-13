const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.VITE_RESEND_API_KEY);

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
    console.log('=== Booking Confirmation Email Debug ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Environment variables check:', {
      hasResendKey: !!process.env.VITE_RESEND_API_KEY,
      hasEmailFrom: !!process.env.VITE_EMAIL_FROM
    });

    // Extract booking data from request body
    const { 
      clientEmail, 
      clientName, 
      vetEmail, 
      vetName, 
      bookingId, 
      bookingDate, 
      startTime, 
      endTime, 
      consultationType, 
      petName, 
      ownerName, 
      notes 
    } = req.body;

    console.log('Booking data check:', {
      hasClientEmail: !!clientEmail,
      hasClientName: !!clientName,
      hasVetEmail: !!vetEmail,
      hasVetName: !!vetName,
      hasBookingId: !!bookingId,
      hasBookingDate: !!bookingDate,
      hasStartTime: !!startTime,
      hasEndTime: !!endTime,
      hasConsultationType: !!consultationType,
      hasPetName: !!petName
    });

    // Validate required fields
    if (!clientEmail || !clientName || !vetName || !bookingId || !bookingDate || !startTime || !endTime || !consultationType || !petName) {
      console.log('❌ Missing required fields validation failed');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: clientEmail, clientName, vetName, bookingId, bookingDate, startTime, endTime, consultationType, and petName are required.'
      });
    }

    console.log('✅ All validations passed, proceeding to send emails...');

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid client email format.'
      });
    }

    if (vetEmail && !emailRegex.test(vetEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vet email format.'
      });
    }

    // Sanitize inputs to prevent XSS
    const sanitize = (str) => str.replace(/<[^>]*>?/gm, '').trim();
    const sanitizedData = {
      clientEmail: sanitize(clientEmail),
      clientName: sanitize(clientName),
      vetEmail: vetEmail ? sanitize(vetEmail) : null,
      vetName: sanitize(vetName),
      bookingId: sanitize(bookingId),
      bookingDate: sanitize(bookingDate),
      startTime: sanitize(startTime),
      endTime: sanitize(endTime),
      consultationType: sanitize(consultationType),
      petName: sanitize(petName),
      ownerName: ownerName ? sanitize(ownerName) : sanitize(clientName),
      notes: notes ? sanitize(notes) : ''
    };

    // Generate client confirmation email
    const clientHtmlContent = generateClientConfirmationEmail(sanitizedData);
    const clientTextContent = generateClientConfirmationText(sanitizedData);

    // Send confirmation email to client
    const clientEmailResult = await resend.emails.send({
      from: process.env.VITE_EMAIL_FROM || 'no-reply@furrchum.com',
      to: sanitizedData.clientEmail,
      subject: 'Your FurrChum Appointment Confirmation',
      text: clientTextContent,
      html: clientHtmlContent,
      tags: [
        { name: 'source', value: 'booking_confirmation' },
        { name: 'type', value: 'client_confirmation' }
      ]
    });

    console.log('Client confirmation email sent:', clientEmailResult);

    let vetEmailResult = null;
    // Send confirmation email to vet if email is available
    if (sanitizedData.vetEmail) {
      const vetHtmlContent = generateVetConfirmationEmail(sanitizedData);
      const vetTextContent = generateVetConfirmationText(sanitizedData);

      vetEmailResult = await resend.emails.send({
        from: process.env.VITE_EMAIL_FROM || 'no-reply@furrchum.com',
        to: sanitizedData.vetEmail,
        subject: 'New Appointment Booking - FurrChum',
        text: vetTextContent,
        html: vetHtmlContent,
        tags: [
          { name: 'source', value: 'booking_confirmation' },
          { name: 'type', value: 'vet_confirmation' }
        ]
      });

      console.log('Vet confirmation email sent:', vetEmailResult);
    } else {
      console.log('Vet email not provided, skipping vet confirmation email');
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Booking confirmation emails sent successfully!',
      clientEmailSent: !!clientEmailResult,
      vetEmailSent: !!vetEmailResult
    });

  } catch (error) {
    console.error('Error sending booking confirmation emails:', error);
    
    // Return appropriate error response
    const errorMessage = error.message || 'Failed to send booking confirmation emails';
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again or contact support.',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// Generate client confirmation email HTML content
function generateClientConfirmationEmail(data) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; color: #333333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3b82f6; margin-bottom: 10px;">FurrChum Care Connect</h1>
      </div>
      
      <div style="padding: 0 20px;">
        <h1 style="font-size: 24px; color: #3b82f6; margin-bottom: 20px;">Appointment Confirmed!</h1>
        <p style="margin-bottom: 15px;">Hi ${data.clientName},</p>
        <p style="margin-bottom: 20px;">
          Your appointment with FurrChum Care Connect has been confirmed. Here are the details:
        </p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <div style="margin-bottom: 10px;">
            <strong>Date:</strong> ${data.bookingDate}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Time:</strong> ${data.startTime} - ${data.endTime}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Type:</strong> ${data.consultationType}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Pet:</strong> ${data.petName}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Veterinarian:</strong> ${data.vetName}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Booking ID:</strong> ${data.bookingId}
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <a href="https://furrchum.com/appointments" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Appointment</a>
        </div>
        
        <p style="margin-bottom: 15px;">
          You will receive a reminder 30 minutes before your appointment starts.
        </p>
        <p style="margin-bottom: 15px;">
          Need to reschedule? You can manage your appointments from your dashboard or contact our support team.
        </p>
      </div>
      
      <div style="margin-top: 40px; padding: 20px 0; border-top: 1px solid #eeeeee; text-align: center; font-size: 14px; color: #888888;">
        <p>
          &copy; ${new Date().getFullYear()} Furrchum Technologies Pvt. Ltd. All rights reserved.
        </p>
        <p>
          Questions? Contact our support team at info@furrchum.com
        </p>
      </div>
    </div>
  `;
}

// Generate client confirmation email text content
function generateClientConfirmationText(data) {
  return `
Appointment Confirmed!

Hi ${data.clientName},

Your appointment with FurrChum Care Connect has been confirmed. Here are the details:

Date: ${data.bookingDate}
Time: ${data.startTime} - ${data.endTime}
Type: ${data.consultationType}
Pet: ${data.petName}
Veterinarian: ${data.vetName}
Booking ID: ${data.bookingId}

You will receive a reminder 30 minutes before your appointment starts.

Need to reschedule? You can manage your appointments from your dashboard or contact our support team.

Visit your appointments: https://furrchum.com/appointments

---
© ${new Date().getFullYear()} Furrchum Technologies Pvt. Ltd. All rights reserved.
Questions? Contact our support team at info@furrchum.com
  `;
}

// Generate vet confirmation email HTML content
function generateVetConfirmationEmail(data) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; color: #333333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3b82f6; margin-bottom: 10px;">FurrChum Care Connect</h1>
      </div>
      
      <div style="padding: 0 20px;">
        <h1 style="font-size: 24px; color: #3b82f6; margin-bottom: 20px;">New Appointment Booking</h1>
        <p style="margin-bottom: 15px;">Hi Dr. ${data.vetName},</p>
        <p style="margin-bottom: 20px;">
          You have a new appointment booking through FurrChum Care Connect. Here are the details:
        </p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <div style="margin-bottom: 10px;">
            <strong>Date:</strong> ${data.bookingDate}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Time:</strong> ${data.startTime} - ${data.endTime}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Type:</strong> ${data.consultationType}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Pet:</strong> ${data.petName}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Pet Owner:</strong> ${data.ownerName}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Owner Email:</strong> ${data.clientEmail}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Booking ID:</strong> ${data.bookingId}
          </div>
          ${data.notes ? `
          <div style="margin-bottom: 10px;">
            <strong>Notes:</strong> ${data.notes}
          </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <a href="https://furrchum.com/vet-appointments" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Appointment</a>
        </div>
        
        <p style="margin-bottom: 15px;">
          The appointment has been confirmed and payment has been processed. You can view all your appointments in your veterinarian dashboard.
        </p>
        <p style="margin-bottom: 15px;">
          If you need to make any changes or have questions, please contact our support team at info@furrchum.com.
        </p>
      </div>
      
      <div style="margin-top: 40px; padding: 20px 0; border-top: 1px solid #eeeeee; text-align: center; font-size: 14px; color: #888888;">
        <p>
          &copy; ${new Date().getFullYear()} Furrchum Technologies Pvt. Ltd. All rights reserved.
        </p>
        <p>
          Questions? Contact our support team at info@furrchum.com
        </p>
      </div>
    </div>
  `;
}

// Generate vet confirmation email text content
function generateVetConfirmationText(data) {
  return `
New Appointment Booking

Hi Dr. ${data.vetName},

You have a new appointment booking through FurrChum Care Connect. Here are the details:

Date: ${data.bookingDate}
Time: ${data.startTime} - ${data.endTime}
Type: ${data.consultationType}
Pet: ${data.petName}
Pet Owner: ${data.ownerName}
Owner Email: ${data.clientEmail}
Booking ID: ${data.bookingId}
${data.notes ? `Notes: ${data.notes}` : ''}

The appointment has been confirmed and payment has been processed. You can view all your appointments in your veterinarian dashboard.

Visit your appointments: https://furrchum.com/vet-appointments

If you need to make any changes or have questions, please contact our support team at info@furrchum.com.

---
© ${new Date().getFullYear()} Furrchum Technologies Pvt. Ltd. All rights reserved.
Questions? Contact our support team at info@furrchum.com
  `;
} 