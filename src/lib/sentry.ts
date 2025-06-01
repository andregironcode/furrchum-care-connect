import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for error tracking
 * This should be called as early as possible in your application
 */
export function initSentry() {
  // Only initialize Sentry in production
  if (import.meta.env.PROD) {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    
    if (!dsn) {
      console.warn('Sentry DSN not found. Error tracking will be disabled.');
      return;
    }
    
    Sentry.init({
      dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
      // We recommend adjusting this value in production
      tracesSampleRate: 0.2,
      
      // Configure environment
      environment: import.meta.env.MODE,
      
      // Allow URLs that match the development server and production URLs
      allowUrls: [
        // Local development
        /localhost/,
        // Production domain
        new RegExp(import.meta.env.VITE_APP_URL?.replace(/^https?:\/\//, '') || ''),
      ],
      
      // This sets the sample rate to be 10%. You may want this to be 100% while
      // in development and sample at a lower rate in production
      replaysSessionSampleRate: 0.1,
      
      // If the entire session is not sampled, use the below sample rate to sample
      // sessions when an error occurs.
      replaysOnErrorSampleRate: 1.0,
    });
  }
}

/**
 * Capture an exception with Sentry
 * @param error The error to capture
 * @param context Additional context to add to the error
 */
export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error captured:', error, context);
  }
}

/**
 * Set user information for Sentry
 * Call this after user authentication
 * @param id User ID
 * @param email User email
 * @param username Username or display name
 * @param role User role (e.g., 'pet_owner', 'vet', 'admin')
 */
export function setUser(id: string, email?: string, username?: string, role?: string) {
  if (import.meta.env.PROD) {
    Sentry.setUser({
      id,
      email,
      username,
      role,
    });
  }
}

/**
 * Clear user information from Sentry
 * Call this after user logout
 */
export function clearUser() {
  if (import.meta.env.PROD) {
    Sentry.setUser(null);
  }
}
