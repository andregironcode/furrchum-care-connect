import { Resend } from 'resend';

// Add type declaration for import.meta.env
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

// Get the Resend API key from environment variables
// Try multiple sources to ensure it works in all environments
let resendApiKey = '';

// For Vite development environment
if (typeof import.meta !== 'undefined' && import.meta.env) {
  resendApiKey = import.meta.env.VITE_RESEND_API_KEY || '';
}

// For server-side or Vercel environment
if (!resendApiKey && typeof process !== 'undefined' && process.env) {
  resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';
}

// For runtime environment variables from window.__env__
if (!resendApiKey && typeof window !== 'undefined' && window.__env__) {
  resendApiKey = window.__env__.RESEND_API_KEY || '';
}

// Hard-coded fallback for Vercel deployment (remove in production)
// This is just for testing - REMOVE THIS IN REAL PRODUCTION CODE
if (!resendApiKey) {
  resendApiKey = 're_8qQCc4Eg_N4KgVUycPCAXPTL1ZCVLrW5P';
}

if (!resendApiKey) {
  console.error('Resend API key is not defined in environment variables');
}

// Add type for window.__env__
declare global {
  interface Window {
    __env__?: Record<string, string>;
  }
}

// Create the Resend client with the API key
export const resend = new Resend(resendApiKey);
