import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CreditCard, WalletCards, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Add the Razorpay script
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type BookingData = {
  vetId: string;
  vetName: string;
  petId: string;
  petName?: string;
  consultationType: 'schedule' | 'immediate';
  consultationMode: 'video' | 'in_person';
  fee: number;
  date: string;
  timeSlot: string;
  userId?: string;
  bookingId?: string;
  notes?: string;
  meetingDetails?: {
    meetingId: string;
    roomUrl: string;
    hostRoomUrl: string | null;
    startDate: string;
    endDate: string;
  } | null;
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

    // Load Razorpay script
    loadRazorpayScript().then((loaded) => {
      if (!loaded) {
        console.warn('Razorpay script failed to load, using fallback payment mode');
        setIsFallbackMode(true);
      }
    });
  }, [navigate]);

  const handleRazorpayCheckout = async () => {
    if (!bookingData) {
      toast.error("No booking information found");
      return;
    }
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    if (!user?.id) {
      toast.error("You must be logged in to make a payment");
      return;
    }

    setIsProcessing(true);

    try {
      // If we're in fallback mode, simulate payment processing
      if (isFallbackMode) {
        await handleFallbackPayment();
        return;
      }

      // We already have a pending booking from the BookingPage
      const bookingId = bookingData.bookingId;
      
      if (!bookingId) {
        toast.error("No booking ID found. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Create a Razorpay order via our API endpoint
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingData: {
            ...bookingData,
            userId: user.id,
            bookingId
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to create checkout session');
      }

      const orderData = await response.json();
      
      if (!orderData || !orderData.id) {
        throw new Error('Invalid order response');
      }
      
      // Initialize Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "FurrChum Care Connect",
        description: `Consultation with ${bookingData.vetName}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // Payment successful
          // This callback is invoked when payment is successful
          try {
            // Validate payment with server
            const validationResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: bookingId
              }),
            });
            
            if (validationResponse.ok) {
              // Navigate to success page
              navigate(`/payment-success?booking_id=${bookingId}&payment_id=${response.razorpay_payment_id}`);
            } else {
              // Handle server validation error
              const errorData = await validationResponse.json();
              toast.error(errorData.error || 'Payment verification failed');
              setIsProcessing(false);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          contact: user.user_metadata?.phone || ''
        },
        notes: {
          booking_id: bookingId,
          user_id: user.id,
          consultation_mode: bookingData.consultationMode
        },
        theme: {
          color: '#4f46e5' // Indigo color matching your button
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };
      
      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(typeof error === 'string' ? error : "Payment processing failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // Fallback payment for development without Stripe
  const handleFallbackPayment = async () => {
    if (!bookingData || !user) {
      toast.error("Missing booking data or user not logged in");
      setIsProcessing(false);
      return;
    }
    
    try {
      // Show a processing message
      toast.info('Simulating payment processing...', {
        duration: 2000
      });
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the existing booking ID
      const bookingId = bookingData.bookingId;
      
      if (!bookingId) {
        throw new Error('No booking ID found');
      }
      
      // Update the booking status to confirmed
      await updateBookingStatus(bookingId);
      
      // Show success message
      toast.success('Payment processed successfully!');
      
      // Store success in sessionStorage for PaymentSuccessPage
      sessionStorage.setItem('paymentSuccess', JSON.stringify({
        bookingId,
        bookingData
      }));
      
      // Redirect to success page
      navigate(`/payment-success?session_id=dev_${bookingId}`);
    } catch (error) {
      console.error('Error in fallback payment:', error);
      toast.error('Payment simulation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Update booking status to confirmed
  const updateBookingStatus = async (bookingId: string): Promise<boolean> => {
    if (!user) {
      throw new Error('User not logged in');
    }

    // Update booking status
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) {
      throw new Error(`Failed to update booking: ${error.message}`);
    }

    return true;
  };

  if (!bookingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No Booking Data</CardTitle>
            <CardDescription>No booking information was found.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/vets')}>
              Find Vets
            </Button>
          </CardFooter>
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
                  onClick={handleRazorpayCheckout}
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
