import { Resend } from 'resend';
import { env } from '@/utils/envLoader';

// Initialize Resend with the API key from our environment loader
const resendApiKey = env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error('Resend API key is not defined in environment variables');
}

// Create the Resend client with the API key or an empty string as fallback
// When using an empty string, Resend will throw a proper error when trying to send emails
export const resend = new Resend(resendApiKey || '');
