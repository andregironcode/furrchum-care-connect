import { resend } from './client';

// Common type for user information
interface User {
  email: string;
  fullName?: string;
  firstName?: string;
}

import { env } from '@/utils/envLoader';

// Email service configuration
const emailConfig = {
  from: env.EMAIL_FROM || 'no-reply@furrchum.com',
  replyTo: 'support@furrchum.com',
  logoUrl: 'https://furrchum.com/logo.png', // Update with your actual logo URL
};

/**
 * Send account creation confirmation email
 */
export async function sendAccountCreationEmail(user: User) {
  try {
    const fullName = user.fullName || user.firstName || 'there';
    const htmlContent = generateAccountCreationEmail(fullName);
    
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: user.email,
      subject: 'Welcome to FurrChum Care Connect!',
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending account creation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception sending account creation email:', error);
    return { success: false, error };
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(params: {
  user: User;
  booking: {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    consultationType: string;
    petName: string;
    vetName: string;
  };
}) {
  const { user, booking } = params;
  
  try {
    const fullName = user.fullName || user.firstName || 'there';
    const htmlContent = generateBookingConfirmationEmail(fullName, booking);
    
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: user.email,
      subject: 'Your FurrChum Appointment Confirmation',
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending booking confirmation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception sending booking confirmation email:', error);
    return { success: false, error };
  }
}

/**
 * Send appointment reminder email (15 minutes before)
 */
export async function sendAppointmentReminderEmail(params: {
  user: User;
  booking: {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    consultationType: string;
    petName: string;
    vetName: string;
    meetingUrl?: string;
  };
}) {
  const { user, booking } = params;
  
  try {
    const fullName = user.fullName || user.firstName || 'there';
    const htmlContent = generateAppointmentReminderEmail(fullName, booking);
    
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: user.email,
      subject: 'Your FurrChum Appointment Starts Soon!',
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending appointment reminder email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception sending appointment reminder email:', error);
    return { success: false, error };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(user: User) {
  try {
    const fullName = user.fullName || user.firstName || 'there';
    const htmlContent = generatePasswordResetEmail(fullName);
    
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: user.email,
      subject: 'Reset Your FurrChum Password',
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception sending password reset email:', error);
    return { success: false, error };
  }
}

// Email Template Generators - Using string templates instead of React components

/**
 * Generate account creation email HTML content
 */
function generateAccountCreationEmail(fullName: string): string {
  return `
    ${generateEmailHeader()}
    <h1 style="font-size: 24px; color: #3b82f6; margin-bottom: 20px;">Welcome to FurrChum Care Connect, ${fullName}!</h1>
    <p style="margin-bottom: 15px;">
      Thank you for creating your account with FurrChum Care Connect - your one-stop platform for pet healthcare.
    </p>
    <p style="margin-bottom: 10px;">
      With your new account, you can:
    </p>
    <ul style="padding-left: 20px; margin-bottom: 20px;">
      <li style="margin-bottom: 8px;">Schedule appointments with qualified veterinarians</li>
      <li style="margin-bottom: 8px;">Access virtual consultations for your pets</li>
      <li style="margin-bottom: 8px;">Receive prescriptions and treatment plans</li>
      <li style="margin-bottom: 8px;">Maintain your pet's health records in one place</li>
    </ul>
    <p style="margin-bottom: 25px;">
      Get started by completing your pet's profile and booking your first appointment.
    </p>
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="https://furrchum.com/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Dashboard</a>
    </div>
    <p style="margin-bottom: 15px;">
      If you have any questions, please contact our support team at info@furrchum.com.
    </p>
    ${generateEmailFooter()}
  `;
}

/**
 * Generate booking confirmation email HTML content
 */
function generateBookingConfirmationEmail(
  fullName: string,
  booking: {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    consultationType: string;
    petName: string;
    vetName: string;
  }
): string {
  return `
    ${generateEmailHeader()}
    <h1 style="font-size: 24px; color: #3b82f6; margin-bottom: 20px;">Appointment Confirmed!</h1>
    <p style="margin-bottom: 15px;">Hi ${fullName},</p>
    <p style="margin-bottom: 20px;">
      Your appointment with FurrChum Care Connect has been confirmed. Here are the details:
    </p>
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="margin-bottom: 10px;">
        <strong>Date:</strong> ${booking.bookingDate}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Type:</strong> ${booking.consultationType}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Pet:</strong> ${booking.petName}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Veterinarian:</strong> ${booking.vetName}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Booking ID:</strong> ${booking.id}
      </div>
    </div>
    <div style="text-align: center; margin-bottom: 25px;">
      <a href="https://furrchum.com/appointments/${booking.id}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Appointment</a>
    </div>
    <p style="margin-bottom: 15px;">
      You will receive a reminder 15 minutes before your appointment starts.
    </p>
    <p style="margin-bottom: 15px;">
      Need to reschedule? You can manage your appointments from your dashboard or contact our support team.
    </p>
    ${generateEmailFooter()}
  `;
}

/**
 * Generate appointment reminder email HTML content
 */
function generateAppointmentReminderEmail(
  fullName: string,
  booking: {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    consultationType: string;
    petName: string;
    vetName: string;
    meetingUrl?: string;
  }
): string {
  const videoSection = booking.consultationType.toLowerCase().includes('video') && booking.meetingUrl ? `
    <div style="margin-top: 25px; margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f0f9ff;">
      <p style="margin-bottom: 15px;"><strong>For your video consultation:</strong></p>
      <p style="margin-bottom: 20px;">
        Click the button below to join your video consultation at the scheduled time. 
        Make sure you have a stable internet connection and your pet is ready for the appointment.
      </p>
      <div style="text-align: center;">
        <a href="${booking.meetingUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Join Video Call</a>
      </div>
    </div>
  ` : '';

  return `
    ${generateEmailHeader()}
    <h1 style="font-size: 24px; color: #f59e0b; margin-bottom: 20px;">Your Appointment Starts Soon!</h1>
    <p style="margin-bottom: 15px;">Hi ${fullName},</p>
    <p style="margin-bottom: 20px;">
      This is a reminder that your appointment with ${booking.vetName} for ${booking.petName} 
      starts in 15 minutes. Here are the details:
    </p>
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <div style="margin-bottom: 10px;">
        <strong>Date:</strong> ${booking.bookingDate}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Type:</strong> ${booking.consultationType}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Pet:</strong> ${booking.petName}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Veterinarian:</strong> ${booking.vetName}
      </div>
    </div>
    ${videoSection}
    <p style="margin-bottom: 15px;">
      If you need to cancel or reschedule, please do so as soon as possible from your dashboard.
    </p>
    ${generateEmailFooter()}
  `;
}

/**
 * Generate common email header with logo
 */
function generateEmailHeader(): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; color: #333333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${emailConfig.logoUrl}" alt="FurrChum Care Connect Logo" style="max-height: 60px; width: auto;" />
      </div>
      <div style="padding: 0 20px;">
  `;
}

/**
 * Generate common email footer
 */
function generateEmailFooter(): string {
  return `
      </div>
      <div style="margin-top: 40px; padding: 20px 0; border-top: 1px solid #eeeeee; text-align: center; font-size: 14px; color: #888888;">
        <p>
          &copy; ${new Date().getFullYear()} Furrchum Technologies Pvt. Ltd. All rights reserved.
        </p>
        <p>
          Questions? Contact our support team at info@furrchum.com
        </p>
        <div style="margin: 10px 0;">
          <a href="https://furrchum.com/terms" style="color: #888888; margin-right: 10px;">Terms of Service</a>
          <a href="https://furrchum.com/privacy" style="color: #888888; margin-right: 10px;">Privacy Policy</a>
          <a href="https://furrchum.com/unsubscribe" style="color: #888888;">Unsubscribe</a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate password reset email HTML content
 */
function generatePasswordResetEmail(fullName: string): string {
  return `
    ${generateEmailHeader()}
    <h1 style="font-size: 24px; color: #3b82f6; margin-bottom: 20px;">Reset Your Password</h1>
    <p style="margin-bottom: 15px;">Hi ${fullName},</p>
    <p style="margin-bottom: 20px;">
      You recently requested to reset your password for your FurrChum Care Connect account. 
      Click the button below to reset it.
    </p>
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="{{.ConfirmationURL}}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Your Password</a>
    </div>
    <p style="margin-bottom: 15px;">
      <strong>If you did not request a password reset, please ignore this email or contact support if you have questions.</strong>
    </p>
    <p style="margin-bottom: 15px;">
      This password reset link will expire in 1 hour for your security.
    </p>
    <p style="margin-bottom: 15px;">
      If you're having trouble with the button above, copy and paste the URL below into your web browser:
    </p>
    <p style="margin-bottom: 25px; word-break: break-all; color: #6b7280; font-size: 14px;">
      {{.ConfirmationURL}}
    </p>
    ${generateEmailFooter()}
  `;
}
