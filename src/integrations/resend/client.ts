import { Resend } from 'resend';

// Add type declaration for import.meta.env
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

// Initialize Resend with the API key
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY as string;

if (!resendApiKey) {
  console.error('VITE_RESEND_API_KEY is not defined in environment variables');
}

export const resend = new Resend(resendApiKey);
