/**
 * Environment variable loader utility
 * 
 * This utility helps load environment variables consistently across
 * development and production environments (including Vercel deployments).
 */

// Type for environment variables
type EnvVariables = {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  WHEREBY_API_KEY?: string;
  WHEREBY_API_URL?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  FRONTEND_URL?: string;
};

/**
 * Get an environment variable from various possible sources
 * @param key The environment variable key
 * @param defaultValue Optional default value
 * @returns The environment variable value or default value
 */
export function getEnvVariable(key: string, defaultValue: string = ''): string {
  // Try to get from import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = `VITE_${key}`;
    if (import.meta.env[viteKey]) {
      return import.meta.env[viteKey];
    }
  }

  // Try to get from process.env (Node.js)
  if (typeof process !== 'undefined' && process.env) {
    // Try both with and without VITE_ prefix
    if (process.env[key]) {
      return process.env[key] as string;
    }
    
    const viteKey = `VITE_${key}`;
    if (process.env[viteKey]) {
      return process.env[viteKey] as string;
    }
  }

  // Try to get from window.__env__ (runtime environment variables)
  if (typeof window !== 'undefined' && window.__env__) {
    if (window.__env__[key]) {
      return window.__env__[key] as string;
    }
    
    const viteKey = `VITE_${key}`;
    if (window.__env__[viteKey]) {
      return window.__env__[viteKey] as string;
    }
  }

  return defaultValue;
}

// Add type for window.__env__
declare global {
  interface Window {
    __env__?: Record<string, string>;
  }
}

// Export environment variables
export const env: EnvVariables = {
  RESEND_API_KEY: getEnvVariable('RESEND_API_KEY'),
  EMAIL_FROM: getEnvVariable('EMAIL_FROM', 'no-reply@furrchum.com'),
  WHEREBY_API_KEY: getEnvVariable('WHEREBY_API_KEY'),
  WHEREBY_API_URL: getEnvVariable('WHEREBY_API_URL', 'https://api.whereby.dev/v1'),
  RAZORPAY_KEY_ID: getEnvVariable('RAZORPAY_KEY_ID'),
  RAZORPAY_KEY_SECRET: getEnvVariable('RAZORPAY_KEY_SECRET'),
  RAZORPAY_WEBHOOK_SECRET: getEnvVariable('RAZORPAY_WEBHOOK_SECRET'),
  SUPABASE_URL: getEnvVariable('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVariable('SUPABASE_ANON_KEY'),
  FRONTEND_URL: getEnvVariable('FRONTEND_URL', 'http://localhost:3000'),
};

// Log missing critical environment variables in development
if (import.meta.env.DEV) {
  const criticalVars = ['RESEND_API_KEY', 'WHEREBY_API_KEY', 'RAZORPAY_KEY_ID', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  
  for (const varName of criticalVars) {
    if (!env[varName as keyof EnvVariables]) {
      console.warn(`Missing critical environment variable: ${varName}`);
    }
  }
}

export default env;
