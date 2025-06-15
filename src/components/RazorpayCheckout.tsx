import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface BookingData {
  bookingId: string;
  vetId: string;
  vetName: string;
  petId: string;
  petName: string;
  userId: string;
  userEmail: string;
  userName: string;
  userContact: string;
  consultationMode: string;
  consultationType: string;
  date: string;
  timeSlot: string;
  fee: number;
  meetingDetails?: {
    meetingId: string;
    roomUrl: string;
    hostRoomUrl: string | null;
  };
}

interface RazorpayCheckoutProps {
  bookingData: BookingData;
  onSuccess: (paymentData: any) => void;
  onFailure: (error: any) => void;
  onCancel?: () => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  bookingData,
  onSuccess,
  onFailure,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText || 'Unknown error' };
        }
        
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const responseData = await response.json();
      const { id: orderId, amount, currency, keyId } = responseData;

      // Configure Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'FurrChum Care Connect',
        description: `${bookingData.consultationMode.toUpperCase()} consultation with ${bookingData.vetName}`,
        image: '/logo.png', // Add your logo path
        order_id: orderId,
        prefill: {
          name: bookingData.userName,
          email: bookingData.userEmail,
          contact: bookingData.userContact,
        },
        theme: {
          color: '#3b82f6', // Primary blue color
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            if (onCancel) {
              onCancel();
            }
          },
        },
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: bookingData.bookingId,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verificationResult = await verifyResponse.json();
            
            toast.success('Payment successful! Your appointment is confirmed.');
            onSuccess({
              ...response,
              ...verificationResult,
              bookingId: bookingData.bookingId,
            });
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
            onFailure(error);
          } finally {
            setIsLoading(false);
          }
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed');
      toast.error('Payment failed. Please try again.');
      onFailure(error);
      setIsLoading(false);
    }
  };

  const serviceFee = bookingData.fee * 0.05;
  const totalAmount = bookingData.fee + serviceFee;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking Summary */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Consultation with:</span>
            <span className="font-medium">{bookingData.vetName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pet:</span>
            <span className="font-medium">{bookingData.petName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date & Time:</span>
            <span className="font-medium">{bookingData.date} at {bookingData.timeSlot}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium capitalize">{bookingData.consultationMode.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Consultation Fee:</span>
            <span>₹{bookingData.fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service Fee (5%):</span>
            <span>₹{serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <div className="font-medium">Secure Payment</div>
            <div>Your payment is processed securely through Razorpay</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ₹{totalAmount.toFixed(2)}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RazorpayCheckout; 