import ReactGA from 'react-ga4';

// Google Analytics Configuration
const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || '';

export const initGA = () => {
  if (GA_TRACKING_ID) {
    ReactGA.initialize(GA_TRACKING_ID, {
      testMode: import.meta.env.DEV, // Enable test mode in development
    });
    console.log('🔍 Google Analytics initialized with ID:', GA_TRACKING_ID);
  } else {
    console.warn('⚠️ Google Analytics tracking ID not found in environment variables');
  }
};

export const trackPageView = (path: string, title?: string) => {
  if (GA_TRACKING_ID) {
    ReactGA.send({ 
      hitType: 'pageview', 
      page: path,
      title: title || document.title
    });
    console.log('📊 GA Page View:', path);
  }
};

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (GA_TRACKING_ID) {
    ReactGA.event({
      action,
      category,
      label,
      value
    });
    console.log('📊 GA Event:', { action, category, label, value });
  }
};

// Specific tracking functions for your app
export const trackUserActions = {
  // Authentication events
  userSignUp: (userType: string) => {
    trackEvent('sign_up', 'authentication', userType);
  },
  
  userSignIn: (userType: string) => {
    trackEvent('login', 'authentication', userType);
  },
  
  userSignOut: () => {
    trackEvent('logout', 'authentication');
  },

  // Booking events
  appointmentBooked: (vetId: string, consultationType: string) => {
    trackEvent('book_appointment', 'booking', consultationType);
  },
  
  appointmentCancelled: (reason?: string) => {
    trackEvent('cancel_appointment', 'booking', reason);
  },

  // Payment events
  paymentInitiated: (amount: number, method: string) => {
    trackEvent('begin_checkout', 'payment', method, amount);
  },
  
  paymentCompleted: (amount: number, method: string) => {
    trackEvent('purchase', 'payment', method, amount);
  },
  
  paymentFailed: (reason?: string) => {
    trackEvent('payment_failed', 'payment', reason);
  },

  // Vet directory events
  vetProfileViewed: (vetId: string) => {
    trackEvent('view_vet_profile', 'vet_directory', vetId);
  },
  
  vetSearchPerformed: (searchTerm: string) => {
    trackEvent('search', 'vet_directory', searchTerm);
  },

  // Pet management events
  petAdded: (petType: string) => {
    trackEvent('add_pet', 'pet_management', petType);
  },
  
  petUpdated: (petType: string) => {
    trackEvent('update_pet', 'pet_management', petType);
  },

  // Content engagement
  blogPostViewed: (postTitle: string) => {
    trackEvent('view_content', 'blog', postTitle);
  },
  
  faqViewed: () => {
    trackEvent('view_faq', 'content');
  },

  // Admin events (for SuperAdmin)
  adminLogin: () => {
    trackEvent('admin_login', 'admin');
  },
  
  adminActionPerformed: (action: string, target: string) => {
    trackEvent('admin_action', 'admin', `${action}_${target}`);
  },

  // Video call events
  videoCallStarted: (consultationType: string) => {
    trackEvent('video_call_start', 'consultation', consultationType);
  },
  
  videoCallEnded: (duration?: number) => {
    trackEvent('video_call_end', 'consultation', 'call_ended', duration);
  },

  // Error tracking
  errorOccurred: (errorType: string, errorMessage: string) => {
    trackEvent('error', 'system', `${errorType}: ${errorMessage}`);
  }
};

// Custom hook for page tracking
export const usePageTracking = () => {
  const trackPage = (path: string, title?: string) => {
    trackPageView(path, title);
  };

  return { trackPage };
}; 