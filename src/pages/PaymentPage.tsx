import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, WalletCards, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

type BookingData = {
  vetId: string;
  vetName: string;
  petId: string;
  petName?: string;
  consultationType: 'schedule' | 'immediate';
  consultationMode: 'video' | 'chat';
  fee: number;
  date: string | null;
  timeSlot: string;
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  useEffect(() => {
    // Retrieve booking data from sessionStorage
    const storedBookingData = sessionStorage.getItem('bookingData');
    if (storedBookingData) {
      setBookingData(JSON.parse(storedBookingData));
    } else {
      // If no booking data, redirect back to vets
      toast.error("No booking information found");
      navigate('/vets');
    }

    // Check if we're in development without Stripe keys
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      console.warn('Stripe publishable key not found, using fallback payment mode');
      setIsFallbackMode(true);
    }
  }, [navigate]);

  const handleStripeCheckout = async () => {
    if (!bookingData) return;
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsProcessing(true);

    try {
      // If we're in fallback mode, simulate payment processing
      if (isFallbackMode) {
        await handleFallbackPayment();
        return;
      }

      // Create a checkout session via our API endpoint
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingData: {
            ...bookingData,
            // Include user ID as client reference for later association
            userId: user?.id,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Store booking data in database as 'pending'
      await createPendingBooking();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Payment processing failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // Fallback payment for development without Stripe
  const handleFallbackPayment = async () => {
    try {
      // Create the booking directly
      await createBooking('confirmed');
      
      // Create a mock transaction record
      await supabase.from('transactions').insert({
        booking_id: user?.id + '-' + Date.now(), // Dummy booking ID
        payment_intent_id: 'dev_' + Date.now(),
        amount: bookingData?.fee ? bookingData.fee * 1.05 : 0,
        currency: 'inr',
        status: 'completed',
        payment_method: 'card',
        customer_email: user?.email,
      });

      // Wait a moment to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsProcessing(false);
      toast.success("Payment successful! Your appointment has been confirmed.");
      
      // Clear booking data from session storage
      sessionStorage.removeItem('bookingData');
      
      // Redirect to dashboard
      navigate('/appointments');
    } catch (error) {
      console.error('Fallback payment error:', error);
      toast.error("Payment processing failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // Create a pending booking while waiting for Stripe confirmation
  const createPendingBooking = async () => {
    if (!bookingData || !user) return;

    try {
      await createBooking('pending');
    } catch (error) {
      console.error('Error creating pending booking:', error);
      // Don't block the checkout process for this error
    }
  };

  // Helper to create booking with a specific status
  const createBooking = async (status: 'pending' | 'confirmed') => {
    if (!bookingData || !user) return;

    const { error } = await supabase.from('bookings').insert({
      vet_id: bookingData.vetId,
      pet_id: bookingData.petId,
      pet_owner_id: user.id,
      booking_date: bookingData.date || new Date().toISOString().split('T')[0],
      start_time: bookingData.timeSlot?.split('-')[0].trim(),
      end_time: bookingData.timeSlot?.split('-')[1].trim(),
      consultation_type: bookingData.consultationType,
      status: status,
      notes: `${bookingData.consultationMode} consultation`,
    });

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Retrieving booking information</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/booking/${bookingData.vetId}`)}
          className="mb-6"
          disabled={isProcessing}
        >
          ← Back to Booking
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-slate-500">Veterinarian</h3>
                <p className="font-semibold">{bookingData.vetName}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-slate-500">Pet</h3>
                <p className="font-semibold">{bookingData.petName}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-slate-500">Consultation Type</h3>
                <p className="font-semibold">
                  {bookingData.consultationType === 'immediate' ? 'Immediate' : 'Scheduled'} consultation
                </p>
              </div>

              {bookingData.consultationType === 'schedule' && (
                <div>
                  <h3 className="font-medium text-sm text-slate-500">Date & Time</h3>
                  <p className="font-semibold">
                    {bookingData.date} at {bookingData.timeSlot}
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-sm text-slate-500">Consultation Mode</h3>
                <p className="font-semibold">
                  {bookingData.consultationMode === 'video' ? 'Video Call' : 'Chat Only'}
                </p>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="font-medium">Consultation Fee</span>
                  <span className="font-semibold">₹{bookingData.fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-500">Platform Fee</span>
                  <span>₹{(bookingData.fee * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold mt-4 text-lg">
                  <span>Total</span>
                  <span>₹{(bookingData.fee * 1.05).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Form */}
          <div className="md:col-span-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup 
                  defaultValue="card"
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as 'card' | 'wallet')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit/Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <RadioGroupItem value="wallet" id="wallet" disabled />
                    <Label htmlFor="wallet" className="flex items-center text-gray-500">
                      <WalletCards className="h-4 w-4 mr-2" />
                      Digital Wallet (Coming Soon)
                    </Label>
                  </div>
                </RadioGroup>
                
                {/* Card Payment Info */}
                {paymentMethod === 'card' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start">
                    <CreditCard className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Secure Payment</p>
                      <p className="text-sm text-blue-700 mt-1">
                        You'll be redirected to our secure payment processor to complete your payment.
                        All payment details are encrypted and processed securely.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Wallet */}
                {paymentMethod === 'wallet' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Wallet functionality is coming soon</p>
                      <p className="text-sm text-yellow-700 mt-1">Please use card payment for now.</p>
                    </div>
                  </div>
                )}
                
                {/* Terms and Conditions */}
                <div className="space-y-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="terms" 
                      checked={termsAccepted}
                      onCheckedChange={() => setTermsAccepted(!termsAccepted)}
                      className="mt-1" 
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm leading-tight"
                    >
                      I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleStripeCheckout}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={isProcessing || paymentMethod === 'wallet' || !termsAccepted}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Pay ₹${(bookingData.fee * 1.05).toFixed(2)}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
