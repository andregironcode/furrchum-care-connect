import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CreditCard, TestTube, CheckCircle, XCircle } from 'lucide-react';
import RazorpayCheckout from '@/components/RazorpayCheckout';

const TestPaymentPage = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [testResults, setTestResults] = useState<{
    scriptLoad: boolean | null;
    apiConnection: boolean | null;
    paymentFlow: boolean | null;
  }>({
    scriptLoad: null,
    apiConnection: null,
    paymentFlow: null,
  });

  // Test booking data
  const testBookingData = {
    bookingId: 'test-booking-123',
    vetId: 'test-vet-456',
    vetName: 'Dr. Test Veterinarian',
    petId: 'test-pet-789',
    petName: 'Test Pet',
    userId: 'test-user-101',
    userEmail: 'test@example.com',
    userName: 'Test User',
    userContact: '9999999999',
    consultationMode: 'video_call',
    consultationType: 'video_call',
    date: 'Today',
    timeSlot: '10:00 AM',
    fee: 500,
  };

  const testRazorpayScript = async () => {
    try {
      // Test if Razorpay script can be loaded
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      
      const loaded = await new Promise((resolve) => {
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      setTestResults(prev => ({ ...prev, scriptLoad: loaded as boolean }));
      
      if (loaded) {
        toast.success('Razorpay script loaded successfully');
      } else {
        toast.error('Failed to load Razorpay script');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, scriptLoad: false }));
      toast.error('Error testing Razorpay script');
    }
  };

  const testApiConnection = async () => {
    try {
      // Test the checkout session creation API
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingData: testBookingData }),
      });

      const success = response.ok;
      setTestResults(prev => ({ ...prev, apiConnection: success }));

      if (success) {
        const data = await response.json();
        toast.success('API connection successful');
        console.log('Checkout session created:', data);
      } else {
        const errorData = await response.json();
        toast.error(`API connection failed: ${errorData.error || 'Unknown error'}`);
        console.error('API error:', errorData);
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, apiConnection: false }));
      toast.error('Error testing API connection');
      console.error('API test error:', error);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setTestResults(prev => ({ ...prev, paymentFlow: true }));
    toast.success('Payment test completed successfully!');
    setShowPayment(false);
    console.log('Payment success:', paymentData);
  };

  const handlePaymentFailure = (error: any) => {
    setTestResults(prev => ({ ...prev, paymentFlow: false }));
    toast.error('Payment test failed');
    setShowPayment(false);
    console.error('Payment failure:', error);
  };

  const handlePaymentCancel = () => {
    toast.info('Payment test cancelled');
    setShowPayment(false);
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <TestTube className="h-4 w-4 text-gray-400" />;
    if (status === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return 'Not tested';
    if (status === true) return 'Passed';
    return 'Failed';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Razorpay Payment Integration Test</h1>
        <p className="text-gray-600">
          Test the Razorpay payment integration with your test keys
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Current Razorpay test keys configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Key ID:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  rzp_test_N2UcpugA4t44wo
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Environment:</span>
                <span className="text-sm text-green-600 font-medium">Test Mode</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Currency:</span>
                <span className="text-sm">INR</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Status of various payment integration tests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Razorpay Script Load</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.scriptLoad)}
                  <span className="text-sm">{getStatusText(testResults.scriptLoad)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Connection</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.apiConnection)}
                  <span className="text-sm">{getStatusText(testResults.apiConnection)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Flow</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.paymentFlow)}
                  <span className="text-sm">{getStatusText(testResults.paymentFlow)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Run Tests</CardTitle>
          <CardDescription>
            Execute individual tests to verify the payment integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={testRazorpayScript}
              variant="outline"
              className="w-full"
            >
              Test Script Loading
            </Button>
            <Button 
              onClick={testApiConnection}
              variant="outline"
              className="w-full"
            >
              Test API Connection
            </Button>
            <Button 
              onClick={() => setShowPayment(true)}
              className="w-full"
              disabled={!testResults.scriptLoad || !testResults.apiConnection}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Test Payment Flow
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 mt-4">
            <p><strong>Note:</strong> The payment flow test will open the Razorpay checkout modal. 
            You can use test card numbers to simulate payments without actual charges.</p>
            <p className="mt-2"><strong>Test Card:</strong> 4111 1111 1111 1111 | CVV: 123 | Expiry: Any future date</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Test Payment</h2>
              <p className="text-gray-600 text-sm">This is a test payment using Razorpay test mode</p>
            </div>
            <div className="p-4">
              <RazorpayCheckout
                bookingData={testBookingData}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onCancel={handlePaymentCancel}
              />
            </div>
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowPayment(false)}
                className="w-full"
              >
                Cancel Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPaymentPage; 