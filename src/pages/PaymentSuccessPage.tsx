import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  interface Booking {
    id: string;
    vet_id: string;
    pet_id: string | null;
    pet_owner_id?: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    consultation_mode?: string;
    consultation_type: string;
    status: string;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
    vets?: {
      first_name: string;
      last_name: string;
    };
    // Using Record type instead of index signature for better type safety
    [key: string]: string | number | boolean | null | undefined | Record<string, unknown>;
  }

  const [booking, setBooking] = useState<Booking | null>(null);
  const [vetName, setVetName] = useState('');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Store success flag in sessionStorage
    sessionStorage.setItem('paymentSuccess', 'true');
    
    const verifyPayment = async () => {
      if (!user) {
        setIsVerifying(false);
        return;
      }

      try {
        // Find the booking associated with this payment
        // Handle null session ID
        const checkoutSessionId = sessionId || '';
        if (!checkoutSessionId) {
          toast.error('No session ID found');
          setIsVerifying(false);
          return;
        }

        const { data: bookings, error: bookingError } = await supabase
          .from('transactions')
          .select('booking_id')
          .eq('payment_intent_id', sessionId || '')
          .single();

        if (bookingError || !bookings) {
          console.error('Error finding booking:', bookingError);
          toast.error('Could not verify your payment. Please contact support.');
          setIsVerifying(false);
          return;
        }

        // Get the booking details
        // Get booking ID safely
        const bookingId = bookings?.booking_id || '';
        
        const { data: bookingData, error: bookingDetailsError } = await supabase
          .from('bookings')
          .select('*, vets:vet_id(first_name, last_name)')
          .eq('id', bookingId)
          .single();

        if (bookingDetailsError || !bookingData) {
          console.error('Error getting booking details:', bookingDetailsError);
          setIsVerifying(false);
          return;
        }

        setBooking(bookingData);
        
        // Extract vet name from the joined data
        if (bookingData.vets) {
          const vet = bookingData.vets as { first_name: string; last_name: string };
          setVetName(`${vet.first_name} ${vet.last_name}`);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, user, navigate]);

  const handleViewAppointments = () => {
    navigate('/appointments');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Verifying Your Payment</CardTitle>
            <CardDescription>Please wait while we confirm your booking</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your appointment has been confirmed
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {booking && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 space-y-2">
              <p className="font-medium">Appointment Details:</p>
              <p>
                <span className="text-gray-500">Vet:</span> {vetName}
              </p>
              <p>
                <span className="text-gray-500">Date:</span> {new Date(booking.booking_date).toLocaleDateString()}
              </p>
              <p>
                <span className="text-gray-500">Time:</span> {booking.start_time} - {booking.end_time}
              </p>
              <p>
                <span className="text-gray-500">Type:</span> {booking.consultation_mode} consultation
              </p>
            </div>
          )}

          <p className="text-center text-sm text-gray-500">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>

        <CardFooter>
          <Button 
            onClick={handleViewAppointments} 
            className="w-full"
          >
            View My Appointments
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
