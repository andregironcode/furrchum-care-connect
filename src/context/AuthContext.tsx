import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { trackUserActions } from '@/utils/analytics';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, userType: 'pet_owner' | 'vet') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string, redirectTo?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only show toast for actual sign in/out events, not on page navigation
        // TOKEN_REFRESHED events can trigger SIGNED_IN status but shouldn't show toast
        if (event === 'SIGNED_IN' && !localStorage.getItem('userAlreadySignedIn')) {
          toast.success('Signed in successfully');
          // Set a flag in localStorage to prevent showing the toast again
          localStorage.setItem('userAlreadySignedIn', 'true');
        } else if (event === 'SIGNED_OUT') {
          toast.success('Signed out successfully');
          // Clear the flag when signing out
          localStorage.removeItem('userAlreadySignedIn');
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userType: 'pet_owner' | 'vet') => {
    setIsLoading(true);
    
    try {
      // Validate inputs
      if (!email || !password || !fullName) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      console.log('Attempting signup for:', { email, userType, fullName });
      
      // Using metadata to pass user information
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType
          },
        }
      });

      if (error) {
        console.error('Supabase auth error:', error);
        
        // Provide more specific error messages based on error types
        if (error.message.includes('Database error saving new user')) {
          throw new Error('There was an issue creating your profile. Please check your internet connection and try again.');
        } else if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try signing in instead.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long.');
        } else if (error.message.includes('Load failed') || error.message.includes('Network error')) {
          throw new Error('Network connection failed. Please check your internet connection and try again.');
        } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          throw new Error('Too many signup attempts. Please wait a few minutes and try again.');
        } else {
          // Log the full error for debugging
          console.error('Signup error details:', {
            message: error.message,
            status: error.status,
            code: (error as any).code
          });
          throw new Error(error.message || 'Failed to create account. Please try again.');
        }
      }
      
      if (!data.user) {
        throw new Error('Signup failed. Please try again.');
      }
      
      console.log('Signup successful:', data.user.id);
      
      // Track successful signup
      trackUserActions.userSignUp(userType);
      
      // Wait a moment for the database trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the profile was created
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, user_type')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.warn('Profile verification failed:', profileError);
          // Don't throw error here, as the user was created successfully
        } else {
          console.log('Profile created successfully:', profileData);
        }
      } catch (verificationError) {
        console.warn('Profile verification error:', verificationError);
        // Don't throw error here, as the user was created successfully
      }
      
      // Send welcome email via our server-side API
      if (data.user) {
        try {
          const response = await fetch('/api/send-welcome-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              fullName,
              userType
            }),
          });
          
          if (!response.ok) {
            console.warn('Failed to send welcome email:', await response.text());
          } else {
            console.log('Welcome email sent successfully');
          }
        } catch (emailError) {
          // Don't fail the signup if email fails, just log it
          console.warn('Failed to send welcome email:', emailError);
        }
      }
      
      toast.success('Account created! Check your email for confirmation.');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Improve error message display
      let errorMessage = 'Error creating account';
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Track successful signin
      if (data.user) {
        const userType = data.user.user_metadata?.user_type || 'unknown';
        trackUserActions.userSignIn(userType);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      // Check if there's a current session first
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        // If session exists, try normal signOut
        const { error } = await supabase.auth.signOut();
        if (error) {
          // If signOut fails but we have a session, log the error but continue with cleanup
          console.warn('SignOut error:', error);
        }
      } else {
        // If no session exists, just clean up local state
        console.log('No active session found, cleaning up local state');
      }
      
      // Always clear local state regardless of signOut success/failure
      setSession(null);
      setUser(null);
      localStorage.removeItem('userAlreadySignedIn');
      
      // Track signout
      trackUserActions.userSignOut();
      
      // Show success message
      toast.success('Signed out successfully');
      
    } catch (error: any) {
      console.warn('SignOut process encountered an error:', error);
      
      // Even if there's an error, clear local state to ensure user is logged out
      setSession(null);
      setUser(null);
      localStorage.removeItem('userAlreadySignedIn');
      
      // Don't throw the error or show error toast - just log it and continue
      // The user should still be logged out from the app's perspective
      toast.success('Signed out successfully');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordForEmail = async (email: string, redirectTo?: string) => {
    setIsLoading(true);
    
    try {
      // Validate email
      if (!email) {
        throw new Error('Email is required');
      }
      
      // Determine the correct redirect URL based on environment
      let defaultRedirectTo = redirectTo;
      
      if (!defaultRedirectTo) {
        // Try to get the frontend URL from environment variables
        const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 
                           import.meta.env.VITE_APP_URL ||
                           window.location.origin;
        
        // Explicit fallback for production domain
        let baseUrl = frontendUrl;
        if (window.location.hostname.includes('vercel.app') && frontendUrl.includes('localhost')) {
          baseUrl = 'https://furrchum.com';
        }
        
        // Clean the URL to remove any trailing slashes
        const cleanUrl = baseUrl.replace(/\/$/, '');
        defaultRedirectTo = `${cleanUrl}/reset-password`;
        
        // Log for debugging (remove in production)
        console.log('Reset password redirect URL:', defaultRedirectTo);
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: defaultRedirectTo,
      });

      if (error) throw error;
      
      toast.success('Password reset link sent! Check your email for instructions.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send password reset email');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut, resetPasswordForEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
