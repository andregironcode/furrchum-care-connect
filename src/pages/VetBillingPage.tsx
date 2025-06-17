import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Search, DollarSign, TrendingUp, TrendingDown, Receipt, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import PaymentStatusBadge from '@/components/payments/PaymentStatusBadge';
import { toast } from 'sonner';
import { format } from 'date-fns';

const VetBillingPage = () => {
  const { user, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  const { 
    transactions, 
    stats, 
    loading: transactionsLoading, 
    error: transactionsError, 
    refetch 
  } = useTransactions({
    userRole: 'vet',
    userId: user?.id || '',
    status: selectedTab === 'all' ? undefined : selectedTab
  });

  if (isLoading || transactionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.pet?.name?.toLowerCase().includes(searchLower) ||
      transaction.owner?.full_name?.toLowerCase().includes(searchLower) ||
      transaction.provider_payment_id?.toLowerCase().includes(searchLower) ||
      transaction.booking?.consultation_type?.toLowerCase().includes(searchLower) ||
      transaction.description?.toLowerCase().includes(searchLower)
    );
  });

  const completedTransactions = filteredTransactions.filter(t => t.status === 'completed' || t.status === 'success');
  const pendingTransactions = filteredTransactions.filter(t => t.status === 'pending');

  const handleViewDetails = (transaction: Transaction) => {
    toast.info('Transaction details feature coming soon!');
  };

  const handleDownloadReceipt = (transaction: Transaction) => {
    toast.info('Receipt download feature coming soon!');
  };

  // Calculate growth percentage
  const getGrowthPercentage = () => {
    if (!stats || stats.lastMonthAmount === 0) return null;
    const growth = ((stats.thisMonthAmount - stats.lastMonthAmount) / stats.lastMonthAmount) * 100;
    return growth;
  };

  const growth = getGrowthPercentage();

  // Use the stats from the hook which already calculate with the fixed fee
  const vetEarnings = stats ? stats.vetEarnings : 0;
  const monthlyVetEarnings = stats ? stats.thisMonthAmount - (stats.thisMonthAmount > 0 ? (Math.round(stats.thisMonthAmount / (stats.totalAmount / stats.completedTransactions || 1)) * 121) : 0) : 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-cream-50">
        <VetSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold text-accent-600">Earnings & Transactions</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-6">
              {transactionsError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{transactionsError}</AlertDescription>
                </Alert>
              )}

              {/* Earnings Statistics */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">₹{vetEarnings.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        From {stats.completedTransactions} consultations
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
                      <div className="text-2xl font-bold text-green-600">₹{monthlyVetEarnings.toFixed(2)}</div>
                      {growth !== null && (
                        <p className={`text-xs ${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {growth > 0 ? '+' : ''}{growth.toFixed(1)}% from last month
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.pendingTransactions} pending payments
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Payment Success Rate</CardTitle>
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

              {/* Search and Filter Section */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Transaction History</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search by pet name, owner, or transaction ID"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-80 pl-9"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Transactions Section */}
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="w-full bg-primary-100 mb-6 h-12">
                  <TabsTrigger value="all" className="text-lg flex-1">
                    All ({filteredTransactions.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-lg flex-1">
                    Completed ({completedTransactions.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-lg flex-1">
                    Pending ({pendingTransactions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  {filteredTransactions.length > 0 ? (
                    <div className="space-y-6">
                      <VetTransactionTable transactions={filteredTransactions} />
                </div>
                  ) : (
                    <EmptyTransactionState />
                  )}
                </TabsContent>

                <TabsContent value="completed">
                  {completedTransactions.length > 0 ? (
                    <div className="space-y-6">
                      <VetTransactionTable transactions={completedTransactions} />
                  </div>
                  ) : (
                    <EmptyTransactionState type="completed" />
                  )}
                </TabsContent>

                <TabsContent value="pending">
                  {pendingTransactions.length > 0 ? (
                    <div className="space-y-6">
                      <VetTransactionTable transactions={pendingTransactions} />
                </div>
                  ) : (
                    <EmptyTransactionState type="pending" />
                  )}
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Transaction Table Component for detailed view
const VetTransactionTable = ({ transactions }: { transactions: Transaction[] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead className="text-white font-medium">
                <Calendar className="h-4 w-4 mr-2 inline" /> Date
              </TableHead>
              <TableHead className="text-white font-medium">Pet Owner</TableHead>
              <TableHead className="text-white font-medium">Pet Name</TableHead>
              <TableHead className="text-white font-medium">Service</TableHead>
              <TableHead className="text-white font-medium">Amount</TableHead>
              <TableHead className="text-white font-medium">Your Earnings</TableHead>
              <TableHead className="text-white font-medium">Status</TableHead>
              <TableHead className="text-white font-medium">Transaction ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {transaction.created_at ? format(new Date(transaction.created_at), 'MMM dd, yyyy') : 'Unknown'}
                </TableCell>
                <TableCell>{transaction.owner?.full_name || 'Unknown'}</TableCell>
                <TableCell>{transaction.pet?.name || 'Unknown'}</TableCell>
                <TableCell className="capitalize">
                  {transaction.booking?.consultation_type?.replace('_', ' ') || 'Consultation'}
                </TableCell>
                <TableCell className="font-medium">₹{transaction.amount.toFixed(2)}</TableCell>
                <TableCell className="font-medium text-green-600">
                  ₹{(transaction.amount - 121).toFixed(2)}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={transaction.status} size="sm" />
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {transaction.provider_payment_id || 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyTransactionState = ({ type = "all" }: { type?: string }) => {
  let message = '';
  let description = '';
  
  switch (type) {
    case 'completed':
      message = "No completed transactions";
      description = "You don't have any completed transactions yet.";
      break;
    case 'pending':
      message = "No pending transactions";
      description = "You don't have any pending transactions.";
      break;
    default:
      message = "No transactions found";
      description = "You haven't received any payments yet.";
  }
  
  return (
    <div className="flex flex-col items-center justify-center bg-primary-50 rounded-lg p-12">
      <div className="bg-primary-100 rounded-full p-6 mb-4">
        <FileText className="h-12 w-12 text-primary-500" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">{message}</h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        {description} Your earnings will appear here after patients pay for consultations.
      </p>
    </div>
  );
};

export default VetBillingPage;
