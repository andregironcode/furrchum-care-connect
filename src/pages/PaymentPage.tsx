
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CreditCard, WalletCards, AlertCircle } from 'lucide-react';

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
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [saveCard, setSaveCard] = useState(false);

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
  }, [navigate]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card number with spaces every 4 digits
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) {
      setCardNumber(value.replace(/(.{4})/g, '$1 ').trim());
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format expiry as MM/YY
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardExpiry(
        value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value
      );
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit CVC to 3 or 4 digits
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardCvc(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'card' && (!cardNumber || !cardName || !cardExpiry || !cardCvc)) {
      toast.error("Please fill in all card details");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Payment successful! Your appointment has been confirmed.");
      
      // Clear booking data from session storage
      sessionStorage.removeItem('bookingData');
      
      // Redirect to dashboard
      navigate('/appointments');
    }, 2000);
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
                  <span className="font-semibold">${bookingData.fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-500">Platform Fee</span>
                  <span>${(bookingData.fee * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold mt-4 text-lg">
                  <span>Total</span>
                  <span>${(bookingData.fee * 1.05).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <h3 className="font-medium mb-3">Payment Method</h3>
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={(v) => setPaymentMethod(v as 'card' | 'wallet')}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="card" id="card" className="peer sr-only" />
                      <Label
                        htmlFor="card"
                        className="flex items-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <CreditCard className="h-5 w-5" />
                        <div>Credit/Debit Card</div>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem value="wallet" id="wallet" className="peer sr-only" />
                      <Label
                        htmlFor="wallet"
                        className="flex items-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <WalletCards className="h-5 w-5" />
                        <div>Wallet</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Card Details */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCvc">CVC</Label>
                        <Input
                          id="cardCvc"
                          placeholder="123"
                          value={cardCvc}
                          onChange={handleCvcChange}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="saveCard" 
                        checked={saveCard}
                        onCheckedChange={() => setSaveCard(!saveCard)}
                      />
                      <label
                        htmlFor="saveCard"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Save this card for future payments
                      </label>
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
                    <Checkbox id="terms" className="mt-1" required />
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
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={isProcessing || paymentMethod === 'wallet'}
                >
                  {isProcessing ? 'Processing...' : `Pay $${(bookingData.fee * 1.05).toFixed(2)}`}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
