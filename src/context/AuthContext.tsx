import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { sendAccountCreationEmail } from '@/integrations/resend/emailService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, userType: 'pet_owner' | 'vet') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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
        // Provide more specific error messages
        if (error.message.includes('Database error saving new user')) {
          throw new Error('There was an issue creating your profile. Please try again or contact support if the problem persists.');
        } else if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try signing in instead.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        }
        throw error;
      }
      
      // Only send email if user was successfully created
      if (data.user) {
        try {
          // Send branded welcome email via Resend
          await sendAccountCreationEmail({
            email,
            fullName
          });
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
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

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut }}>
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
