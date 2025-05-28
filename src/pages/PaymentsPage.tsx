import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, CreditCard, Calendar, Receipt, Download, FileText } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { format } from 'date-fns';

// Mock data for payments until the database table is created
const mockPayments = [
  {
    id: '1',
    amount: 85.00,
    date: new Date(2025, 5, 18),
    vet_name: 'Dr. Sarah Johnson',
    service: 'Routine Check-up',
    pet_name: 'Max',
    status: 'completed',
    payment_method: 'Visa •••• 4242'
  },
  {
    id: '2',
    amount: 120.00,
    date: new Date(2025, 5, 10),
    vet_name: 'Dr. Michael Chen',
    service: 'Vaccination & Deworming',
    pet_name: 'Luna',
    status: 'completed',
    payment_method: 'Mastercard •••• 5555'
  },
  {
    id: '3',
    amount: 45.00,
    date: new Date(2025, 5, 25),
    vet_name: 'Dr. Amanda Lopez',
    service: 'Prescription Renewal',
    pet_name: 'Max',
    status: 'pending',
    payment_method: 'PayPal'
  }
];

// Mock data for payment methods
const mockPaymentMethods = [
  {
    id: '1',
    type: 'visa',
    last4: '4242',
    expiry: '08/27',
    is_default: true
  },
  {
    id: '2',
    type: 'mastercard',
    last4: '5555',
    expiry: '11/26',
    is_default: false
  },
  {
    id: '3',
    type: 'paypal',
    email: 'user@example.com',
    is_default: false
  }
];

const PaymentsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          // In a real implementation, we would fetch from Supabase
          // Since the 'payments' and 'payment_methods' tables don't exist yet, we'll use mock data
          setPayments(mockPayments);
          setPaymentMethods(mockPaymentMethods);
          
          // This comment explains what the real implementation would look like:
          // const paymentsPromise = supabase
          //   .from('payments')
          //   .select('*, pets(*), vets(*)')
          //   .eq('user_id', user.id)
          //   .order('date', { ascending: false });
          //
          // const methodsPromise = supabase
          //   .from('payment_methods')
          //   .select('*')
          //   .eq('user_id', user.id)
          //   .order('is_default', { ascending: false });
          //
          // const [paymentsRes, methodsRes] = await Promise.all([paymentsPromise, methodsPromise]);
          //
          // if (paymentsRes.error) throw paymentsRes.error;
          // if (methodsRes.error) throw methodsRes.error;
          //
          // setPayments(paymentsRes.data || []);
          // setPaymentMethods(methodsRes.data || []);
        }
      } catch (error: any) {
        console.error('Error fetching payment data:', error);
        setError(error.message || 'Failed to fetch payment information');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchData();
    }
  }, [user, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const completedPayments = payments.filter(p => p.status === 'completed');
  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PetOwnerSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold">Billing & Payments</h1>
                </div>
                <Button className="bg-primary hover:bg-primary-600">
                  <Plus className="mr-2 h-4 w-4" /> Add Payment Method
                </Button>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-8">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Payment Methods Section */}
              <section className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Payment Methods</h2>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add New
                  </Button>
                </div>
                
                {paymentMethods.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paymentMethods.map((method) => (
                      <PaymentMethodCard key={method.id} method={method} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="bg-gray-100 mx-auto rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                      <CreditCard className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Payment Methods</h3>
                    <p className="text-gray-500 mb-4">You haven't added any payment methods yet.</p>
                    <Button className="bg-primary hover:bg-primary-600">
                      <Plus className="mr-2 h-4 w-4" /> Add Payment Method
                    </Button>
                  </div>
                )}
              </section>

              {/* Transactions Section */}
              <section>
                <h2 className="text-xl font-semibold mb-6">Transaction History</h2>
                
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full bg-primary-100 mb-4 h-12">
                    <TabsTrigger value="all" className="text-lg flex-1">All</TabsTrigger>
                    <TabsTrigger value="completed" className="text-lg flex-1">Completed</TabsTrigger>
                    <TabsTrigger value="pending" className="text-lg flex-1">Pending</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    {payments.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {payments.map((payment) => (
                          <PaymentCard key={payment.id} payment={payment} />
                        ))}
                      </div>
                    ) : (
                      <EmptyPaymentState />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="completed">
                    {completedPayments.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {completedPayments.map((payment) => (
                          <PaymentCard key={payment.id} payment={payment} />
                        ))}
                      </div>
                    ) : (
                      <EmptyPaymentState type="completed" />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="pending">
                    {pendingPayments.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {pendingPayments.map((payment) => (
                          <PaymentCard key={payment.id} payment={payment} />
                        ))}
                      </div>
                    ) : (
                      <EmptyPaymentState type="pending" />
                    )}
                  </TabsContent>
                </Tabs>
              </section>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Payment Method Card Component
const PaymentMethodCard = ({ method }: { method: any }) => {
  let cardIcon;
  
  if (method.type === 'paypal') {
    cardIcon = <div className="bg-blue-600 rounded text-white px-2 py-1 text-xs">PayPal</div>;
  } else if (method.type === 'visa') {
    cardIcon = <div className="bg-blue-800 rounded text-white px-2 py-1 text-xs">VISA</div>;
  } else if (method.type === 'mastercard') {
    cardIcon = <div className="bg-red-600 rounded text-white px-2 py-1 text-xs">MasterCard</div>;
  } else {
    cardIcon = <CreditCard className="h-5 w-5 text-gray-500" />;
  }
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-4">
            {cardIcon}
            {method.is_default && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Default</span>
            )}
          </div>
          
          {method.type !== 'paypal' ? (
            <div>
              <div className="font-medium">•••• {method.last4}</div>
              <div className="text-sm text-gray-500">Expires: {method.expiry}</div>
            </div>
          ) : (
            <div>
              <div className="font-medium">{method.email}</div>
              <div className="text-sm text-gray-500">PayPal Account</div>
            </div>
          )}
        </div>
        
        <div className="space-x-2">
          {!method.is_default && (
            <Button variant="outline" size="sm" className="text-xs">Set Default</Button>
          )}
          <Button variant="outline" size="sm" className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700">Remove</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Payment Card Component
const PaymentCard = ({ payment }: { payment: any }) => {
  const isPending = payment.status === 'pending';
  
  return (
    <Card className={`hover:shadow-lg transition-shadow border-${isPending ? 'orange' : 'primary'}-200`}>
      <CardHeader className="bg-gray-50 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">
              {format(new Date(payment.date), 'MMM dd, yyyy')}
            </div>
            <CardTitle className="text-xl">₹{payment.amount.toFixed(2)}</CardTitle>
          </div>
          <div className={`px-2 py-1 rounded-md text-xs font-medium 
            ${isPending ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
            {isPending ? 'Pending' : 'Completed'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Service:</span>
            <span className="font-medium">{payment.service}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Veterinarian:</span>
            <span>{payment.vet_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pet:</span>
            <span>{payment.pet_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment Method:</span>
            <span>{payment.payment_method}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <Button variant="outline" size="sm" className="text-xs">
          <Receipt className="mr-1 h-3 w-3" /> View Receipt
        </Button>
        {!isPending && (
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="mr-1 h-3 w-3" /> Download Invoice
          </Button>
        )}
        {isPending && (
          <Button size="sm" className="text-xs bg-primary hover:bg-primary-600">
            Pay Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Empty State Component
const EmptyPaymentState = ({ type = "all" }: { type?: string }) => {
  let message = '';
  
  switch (type) {
    case 'completed':
      message = "You don't have any completed payments.";
      break;
    case 'pending':
      message = "You don't have any pending payments.";
      break;
    default:
      message = "No payment history found.";
  }
  
  return (
    <div className="flex flex-col items-center justify-center bg-primary-50 rounded-lg p-12">
      <div className="bg-primary-100 rounded-full p-6 mb-4">
        <FileText className="h-12 w-12 text-primary-500" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">{message}</h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        Your payment history will appear here after you've made payments for veterinary services.
      </p>
    </div>
  );
};

export default PaymentsPage;
