import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, CreditCard, TrendingUp, TrendingDown, DollarSign, FileText, Receipt } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { usePayments, usePaymentMethods } from '@/hooks/usePayments';
import TransactionCard from '@/components/payments/TransactionCard';
import { toast } from 'sonner';

const PaymentsPage = () => {
  const { user, isLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState('all');
  
  const { 
    transactions, 
    stats, 
    loading: paymentsLoading, 
    error: paymentsError, 
    refetch 
  } = usePayments({
    userRole: 'pet_owner',
    userId: user?.id || '',
    status: selectedTab === 'all' ? undefined : selectedTab
  });

  const { paymentMethods, loading: methodsLoading } = usePaymentMethods(user?.id || '');

  if (isLoading || paymentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const completedTransactions = transactions.filter(t => t.status === 'completed' || t.status === 'success');
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const failedTransactions = transactions.filter(t => t.status === 'failed');

  const handleViewDetails = (transaction: any) => {
    toast.info('Transaction details feature coming soon!');
  };

  const handleDownloadReceipt = (transaction: any) => {
    toast.info('Receipt download feature coming soon!');
  };

  const handleAddPaymentMethod = () => {
    toast.info('Payment method management coming soon! Currently handled by Razorpay during checkout.');
  };

  // Calculate growth percentage
  const getGrowthPercentage = () => {
    if (!stats || stats.lastMonthAmount === 0) return null;
    const growth = ((stats.thisMonthAmount - stats.lastMonthAmount) / stats.lastMonthAmount) * 100;
    return growth;
  };

  const growth = getGrowthPercentage();

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
                <Button onClick={handleAddPaymentMethod} className="bg-primary hover:bg-primary-600">
                  <Plus className="mr-2 h-4 w-4" /> Add Payment Method
                </Button>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-8">
              {paymentsError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{paymentsError}</AlertDescription>
                </Alert>
              )}

              {/* Payment Statistics */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{stats.totalAmount.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.completedTransactions} completed payments
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      {growth !== null && growth > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : growth !== null && growth < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{stats.thisMonthAmount.toFixed(2)}</div>
                      {growth !== null && (
                        <p className={`text-xs ${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {growth > 0 ? '+' : ''}{growth.toFixed(1)}% from last month
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.pendingTransactions} pending
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalTransactions > 0 
                          ? ((stats.completedTransactions / stats.totalTransactions) * 100).toFixed(1)
                          : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.failedTransactions} failed payments
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Payment Methods Section */}
              <section className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Payment Methods</h2>
                  <Button onClick={handleAddPaymentMethod} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add New
                  </Button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <div className="bg-blue-100 mx-auto rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Secure Payment Processing</h3>
                  <p className="text-blue-700 mb-4">
                    Payment methods are securely managed by Razorpay during checkout. 
                    You can save payment methods during the booking process.
                  </p>
                  <Button onClick={handleAddPaymentMethod} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Manage Payment Methods
                  </Button>
                </div>
              </section>

              {/* Transactions Section */}
              <section>
                <h2 className="text-xl font-semibold mb-6">Transaction History</h2>
                
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                  <TabsList className="w-full bg-primary-100 mb-6 h-12">
                    <TabsTrigger value="all" className="text-lg flex-1">
                      All ({transactions.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-lg flex-1">
                      Completed ({completedTransactions.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="text-lg flex-1">
                      Pending ({pendingTransactions.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    {transactions.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {transactions.map((transaction) => (
                          <TransactionCard
                            key={transaction.id}
                            transaction={transaction}
                            userRole="pet_owner"
                            onViewDetails={handleViewDetails}
                            onDownloadReceipt={handleDownloadReceipt}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyPaymentState />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="completed">
                    {completedTransactions.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {completedTransactions.map((transaction) => (
                          <TransactionCard
                            key={transaction.id}
                            transaction={transaction}
                            userRole="pet_owner"
                            onViewDetails={handleViewDetails}
                            onDownloadReceipt={handleDownloadReceipt}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyPaymentState type="completed" />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="pending">
                    {pendingTransactions.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {pendingTransactions.map((transaction) => (
                          <TransactionCard
                            key={transaction.id}
                            transaction={transaction}
                            userRole="pet_owner"
                            onViewDetails={handleViewDetails}
                            onDownloadReceipt={handleDownloadReceipt}
                          />
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

// Empty State Component
const EmptyPaymentState = ({ type = "all" }: { type?: string }) => {
  let message = '';
  let description = '';
  
  switch (type) {
    case 'completed':
      message = "No completed payments";
      description = "You don't have any completed payments yet.";
      break;
    case 'pending':
      message = "No pending payments";
      description = "You don't have any pending payments.";
      break;
    default:
      message = "No payment history";
      description = "You haven't made any payments yet.";
  }
  
  return (
    <div className="flex flex-col items-center justify-center bg-primary-50 rounded-lg p-12">
      <div className="bg-primary-100 rounded-full p-6 mb-4">
        <FileText className="h-12 w-12 text-primary-500" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">{message}</h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        {description} Your payment history will appear here after you've made payments for veterinary services.
      </p>
    </div>
  );
};

export default PaymentsPage;
