import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate, useNavigate, Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ReCAPTCHA from 'react-google-recaptcha';

const Auth = () => {
  const { user, isLoading } = useAuth();
  
  // Redirect if already authenticated
  if (user && !isLoading) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <AuthTabs />
      </div>
      <Footer />
    </div>
  );
};

const AuthTabs = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Handle reCAPTCHA token change
  const handleRecaptchaChange = (token: string | null) => {
    console.log('reCAPTCHA token:', token);
    setSignUpData({ ...signUpData, recaptcha: token || '' });
  };

  // Form state for sign in
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Form state for sign up
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'pet_owner' as 'pet_owner' | 'vet',
    agreeToTerms: false,
    recaptcha: '',
  });

  // Set initial tab based on URL search params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup' || tab === 'signin') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await signIn(signInData.email, signInData.password);
      navigate('/');
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to sign in');
      } else {
        setError('Failed to sign in');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    if (!signUpData.agreeToTerms) {
      setError('You must agree to the terms and conditions to create an account');
      setIsSubmitting(false);
      return;
    }

    if (!signUpData.recaptcha) {
      setError('Please complete the reCAPTCHA verification');
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log('Starting signup process for:', signUpData.email);
      
      await signUp(
        signUpData.email, 
        signUpData.password, 
        signUpData.fullName, 
        signUpData.userType
      );
      
      // Switch to sign in tab after successful signup
      setActiveTab('signin');
      setSignInData({
        email: signUpData.email,
        password: signUpData.password
      });
      
      // Clear the signup form
      setSignUpData({
        email: '',
        password: '',
        fullName: '',
        userType: 'pet_owner',
        agreeToTerms: false,
        recaptcha: '',
      });
      
      // Reset reCAPTCHA
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      
    } catch (error: unknown) {
      console.error('Signup form error:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to create account';
      
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else {
        const errorString = String(error);
        if (errorString.includes('Load failed')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else if (errorString.includes('NetworkError')) {
          errorMessage = 'Network error occurred. Please check your internet connection and try again.';
        } else if (errorString.includes('TypeError: Failed to fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-primary/10">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-3xl font-bold text-accent-600">Welcome to Furrchum</CardTitle>
        <CardDescription className="text-accent/80">
          Login to access your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com"
                  value={signInData.email}
                  onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={signInData.password}
                  onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                  required
                />
              </div>

              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 font-normal text-sm text-primary hover:text-primary/80"
                  onClick={() => navigate('/reset-password')}
                >
                  Forgot your password?
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="John Doe"
                  value={signUpData.fullName}
                  onChange={(e) => setSignUpData({...signUpData, fullName: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input 
                  id="email-signup" 
                  type="email" 
                  placeholder="your@email.com"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input 
                  id="password-signup" 
                  type="password" 
                  placeholder="••••••••"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">I am a:</Label>
                <Select 
                  value={signUpData.userType}
                  onValueChange={(value) => setSignUpData({...signUpData, userType: value as 'pet_owner' | 'vet'})}
                >
                  <SelectTrigger id="userType" className="w-full">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pet_owner">Pet Owner</SelectItem>
                    <SelectItem value="vet">Veterinarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={signUpData.agreeToTerms}
                  onCheckedChange={(checked) => setSignUpData({...signUpData, agreeToTerms: checked as boolean})}
                  required
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the{' '}
                  <Link 
                    to="/terms-conditions"
                    className="text-primary hover:underline"
                  >
                    terms and conditions
                  </Link>
                </Label>
              </div>

              {/* reCAPTCHA */}
              <div className="space-y-2">
                <Label>Security Verification</Label>
                <div className="flex justify-center mt-2">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeBH1krAAAAAArOi7RYu8FcZZn1zNxBBaT_ATK9'}
                    onChange={handleRecaptchaChange}
                    onExpired={() => {
                      setSignUpData({...signUpData, recaptcha: ''});
                      console.log('reCAPTCHA expired');
                    }}
                    onError={(err) => {
                      console.error('reCAPTCHA error:', err);
                      setSignUpData({...signUpData, recaptcha: ''});
                    }}
                  />
                </div>
                {error && error.includes('reCAPTCHA') && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting || !signUpData.agreeToTerms}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Auth;
