
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Plus, CreditCard, Calendar, FileText, ChevronDown, Check } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const PaymentsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        if (user) {
          // Fetch payment history
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*, vet:vets(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (paymentsError) throw paymentsError;
          setPayments(paymentsData || []);
          
          // Fetch payment methods
          const { data: methodsData, error: methodsError } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('user_id', user.id);
            
          if (methodsError) throw methodsError;
          setPaymentMethods(methodsData || []);
        }
      } catch (error: any) {
        console.error('Error fetching payment data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchPayments();
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
                  <h1 className="text-2xl font-bold">Payments</h1>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600">
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

              <Tabs defaultValue="payment-methods" className="w-full">
                <TabsList className="w-full bg-orange-100 mb-4 h-12">
                  <TabsTrigger value="payment-methods" className="text-lg flex-1">Payment Methods</TabsTrigger>
                  <TabsTrigger value="invoices" className="text-lg flex-1">Invoices</TabsTrigger>
                  <TabsTrigger value="history" className="text-lg flex-1">Payment History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="payment-methods">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Saved Payment Methods</h2>
                    </div>
                    
                    {paymentMethods.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paymentMethods.map((method) => (
                          <PaymentMethodCard key={method.id} method={method} />
                        ))}
                      </div>
                    ) : (
                      <EmptyPaymentState type="payment-methods" />
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="invoices">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Pending Invoices</h2>
                    </div>
                    
                    <EmptyPaymentState type="invoices" />
                  </div>
                </TabsContent>
                
                <TabsContent value="history">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Payment History</h2>
                    </div>
                    
                    {payments.length > 0 ? (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <PaymentHistoryItem key={payment.id} payment={payment} />
                        ))}
                      </div>
                    ) : (
                      <EmptyPaymentState type="history" />
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Payment Method Card Component
const PaymentMethodCard = ({ method }: { method: any }) => {
  const getCardIcon = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'visa':
        return <span className="font-bold text-blue-600">VISA</span>;
      case 'mastercard':
        return <span className="font-bold text-red-500">MC</span>;
      case 'amex':
        return <span className="font-bold text-blue-500">AMEX</span>;
      case 'discover':
        return <span className="font-bold text-orange-600">DISC</span>;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const last4 = method.last4 || '4242';
  const expiryMonth = method.expiry_month || '12';
  const expiryYear = method.expiry_year || '25';

  return (
    <Card className="hover:shadow-lg transition-shadow border-orange-300">
      <CardHeader className="bg-orange-50 flex flex-row items-center gap-4 p-4">
        <div className="bg-orange-100 rounded-md p-3 text-orange-500">
          {getCardIcon(method.card_type)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">•••• •••• •••• {last4}</CardTitle>
            {method.is_default && (
              <Badge className="bg-green-500">Default</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-sm text-gray-500">Expires {expiryMonth}/{expiryYear}</div>
            {method.card_type && (
              <div className="text-sm text-gray-500 capitalize">{method.card_type}</div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex justify-end gap-3">
        <Button variant="outline" className="text-xs border-orange-300 text-orange-600">Edit</Button>
        {!method.is_default && (
          <Button variant="outline" className="text-xs border-orange-300 text-orange-600">Set Default</Button>
        )}
        <Button variant="outline" className="text-xs border-red-300 text-red-600">Remove</Button>
      </CardContent>
    </Card>
  );
};

// Payment History Item Component
const PaymentHistoryItem = ({ payment }: { payment: any }) => {
  const [expanded, setExpanded] = useState(false);
  const paymentDate = payment.created_at ? new Date(payment.created_at) : new Date();
  const formattedDate = format(paymentDate, 'MMM d, yyyy');
  
  let statusBadge;
  switch(payment.status) {
    case 'completed':
      statusBadge = <Badge className="bg-green-500">Paid</Badge>;
      break;
    case 'pending':
      statusBadge = <Badge className="bg-yellow-500">Pending</Badge>;
      break;
    case 'failed':
      statusBadge = <Badge className="bg-red-500">Failed</Badge>;
      break;
    default:
      statusBadge = <Badge className="bg-blue-500">Processing</Badge>;
  }
  
  return (
    <Card className="hover:shadow-sm transition-shadow border-gray-200">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${payment.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'}`}>
            {payment.status === 'completed' ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <FileText className="h-5 w-5 text-orange-500" />
            )}
          </div>
          <div>
            <div className="font-medium">{payment.description || `Payment to ${payment.vet?.name || 'Veterinarian'}`}</div>
            <div className="text-sm text-gray-500">{formattedDate}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-bold">${payment.amount?.toFixed(2) || '0.00'}</div>
            <div>{statusBadge}</div>
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? 'transform rotate-180' : ''}`} />
        </div>
      </div>
      
      {expanded && (
        <CardContent className="border-t pt-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-sm text-gray-500">Payment ID</div>
                <div className="font-medium">{payment.payment_id || payment.id || 'XXXXXXXX'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Method</div>
                <div className="font-medium">{payment.payment_method || 'Visa •••• 4242'}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Service</div>
              <div className="font-medium">{payment.service_description || 'Veterinary services'}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Clinic</div>
              <div className="font-medium">{payment.vet?.name || 'Veterinary Clinic'}</div>
              <div className="text-sm">{payment.vet?.address || 'Clinic address'}</div>
            </div>
            
            {payment.invoice_number && (
              <div className="flex justify-end">
                <Button variant="outline" className="text-sm border-orange-300 text-orange-600">
                  View Receipt
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Empty State Component
const EmptyPaymentState = ({ type = "payment-methods" }: { type?: string }) => {
  let message = '';
  let description = '';
  let icon = <CreditCard className="h-12 w-12 text-orange-300" />;
  
  switch (type) {
    case 'payment-methods':
      message = "No payment methods saved";
      description = "Add a credit card or payment method to easily pay for veterinary services.";
      break;
    case 'invoices':
      message = "No pending invoices";
      description = "You don't have any bills that need to be paid at this time.";
      icon = <FileText className="h-12 w-12 text-orange-300" />;
      break;
    case 'history':
      message = "No payment history";
      description = "Your payment history will appear here after you make payments for veterinary services.";
      icon = <Calendar className="h-12 w-12 text-orange-300" />;
      break;
    default:
      message = "No payment information";
      description = "Add payment methods to manage your veterinary expenses.";
  }
  
  return (
    <div className="flex flex-col items-center justify-center bg-orange-50 rounded-lg p-12">
      <div className="bg-orange-100 rounded-full p-6 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">{message}</h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        {description}
      </p>
      {type === 'payment-methods' && (
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="mr-2 h-4 w-4" /> Add Payment Method
        </Button>
      )}
    </div>
  );
};

export default PaymentsPage;
