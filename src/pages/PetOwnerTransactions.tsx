import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Search, DollarSign, TrendingUp, Receipt, Loader2, AlertCircle, FileText, Download } from 'lucide-react';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import PaymentStatusBadge from '@/components/payments/PaymentStatusBadge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PetOwnerTransactions = () => {
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
    userRole: 'pet_owner',
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
      transaction.vet?.first_name?.toLowerCase().includes(searchLower) ||
      transaction.vet?.last_name?.toLowerCase().includes(searchLower) ||
      transaction.provider_payment_id?.toLowerCase().includes(searchLower) ||
      transaction.booking?.consultation_type?.toLowerCase().includes(searchLower) ||
      transaction.description?.toLowerCase().includes(searchLower)
    );
  });

  const completedTransactions = filteredTransactions.filter(t => t.status === 'completed' || t.status === 'success');
  const pendingTransactions = filteredTransactions.filter(t => t.status === 'pending');

  const handleDownloadReceipt = (transaction: Transaction) => {
    try {
      // Create receipt content
      const receiptContent = `
PAYMENT RECEIPT
===============

Receipt ID: ${transaction.id}
Date: ${new Date(transaction.created_at).toLocaleDateString()}
Time: ${new Date(transaction.created_at).toLocaleTimeString()}

TRANSACTION DETAILS
-------------------
Transaction ID: ${transaction.provider_payment_id || 'N/A'}
Order ID: ${transaction.provider_order_id || 'N/A'}
Status: ${transaction.status.toUpperCase()}
Payment Method: ${transaction.payment_method || 'Razorpay'}
Provider: ${transaction.provider.toUpperCase()}

CONSULTATION DETAILS
--------------------
Pet: ${transaction.pet?.name || 'Unknown Pet'}
Pet Type: ${transaction.pet?.type || 'Not specified'}${transaction.pet?.breed ? `\nBreed: ${transaction.pet.breed}` : ''}
Veterinarian: Dr. ${transaction.vet?.first_name || 'Unknown'} ${transaction.vet?.last_name || 'Vet'}${transaction.vet?.specialization ? `\nSpecialization: ${transaction.vet.specialization}` : ''}
Consultation Type: ${transaction.booking?.consultation_type?.replace('_', ' ') || 'Unknown'}
Booking Date: ${transaction.booking?.booking_date ? new Date(transaction.booking.booking_date).toLocaleDateString() : 'Unknown'}

PAYMENT BREAKDOWN
-----------------
Consultation Fee: ₹${(transaction.amount - 121).toFixed(2)}
Service Fee: ₹121.00
Total Amount: ₹${transaction.amount.toFixed(2)}
Currency: ${transaction.currency}

---
Downloaded from FurrChum Care Connect
Customer Portal: ${window.location.origin}
Support: info@furrchum.com
Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
      `.trim();

      // Create and download file
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const petName = transaction.pet?.name || 'Unknown';
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      link.download = `Receipt_${petName}_${date}_${transaction.provider_payment_id || 'transaction'}.txt`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-cream-50">
        <PetOwnerSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold text-accent-600">Payment History</h1>
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

              {/* Payment Statistics */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">₹{stats.totalAmount.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        From {stats.totalTransactions} consultations
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">₹{stats.thisMonthAmount.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        Recent spending
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.completedTransactions}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.pendingTransactions} pending
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

              {/* Search Section */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Payment History</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search by pet name, vet, or transaction ID"
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
                    <PetOwnerTransactionTable 
                      transactions={filteredTransactions} 
                      onDownloadReceipt={handleDownloadReceipt}
                    />
                  ) : (
                    <EmptyTransactionState />
                  )}
                </TabsContent>

                <TabsContent value="completed">
                  {completedTransactions.length > 0 ? (
                    <PetOwnerTransactionTable 
                      transactions={completedTransactions} 
                      onDownloadReceipt={handleDownloadReceipt}
                    />
                  ) : (
                    <EmptyTransactionState type="completed" />
                  )}
                </TabsContent>

                <TabsContent value="pending">
                  {pendingTransactions.length > 0 ? (
                    <PetOwnerTransactionTable 
                      transactions={pendingTransactions} 
                      onDownloadReceipt={handleDownloadReceipt}
                    />
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

// Pet Owner Transaction Table Component
const PetOwnerTransactionTable = ({ 
  transactions, 
  onDownloadReceipt 
}: { 
  transactions: Transaction[];
  onDownloadReceipt: (transaction: Transaction) => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead className="text-white font-medium">
                <Calendar className="h-4 w-4 mr-2 inline" /> Date
              </TableHead>
              <TableHead className="text-white font-medium">Pet</TableHead>
              <TableHead className="text-white font-medium">Veterinarian</TableHead>
              <TableHead className="text-white font-medium">Service</TableHead>
              <TableHead className="text-white font-medium">Amount</TableHead>
              <TableHead className="text-white font-medium">Status</TableHead>
              <TableHead className="text-white font-medium">Transaction ID</TableHead>
              <TableHead className="text-white font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {transaction.created_at ? format(new Date(transaction.created_at), 'MMM dd, yyyy') : 'Unknown'}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{transaction.pet?.name || 'Unknown Pet'}</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.pet?.type}{transaction.pet?.breed && ` - ${transaction.pet.breed}`}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    Dr. {transaction.vet?.first_name || 'Unknown'} {transaction.vet?.last_name || 'Vet'}
                  </div>
                  {transaction.vet?.specialization && (
                    <div className="text-sm text-muted-foreground">{transaction.vet.specialization}</div>
                  )}
                </TableCell>
                <TableCell className="capitalize">
                  {transaction.booking?.consultation_type?.replace('_', ' ') || 'Consultation'}
                </TableCell>
                <TableCell className="font-medium">₹{transaction.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <PaymentStatusBadge status={transaction.status} size="sm" />
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {transaction.provider_payment_id || 'N/A'}
                </TableCell>
                <TableCell>
                  {(transaction.status === 'completed' || transaction.status === 'success') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadReceipt(transaction)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Receipt
                    </Button>
                  )}
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
      message = "No completed payments";
      description = "You don't have any completed payments yet.";
      break;
    case 'pending':
      message = "No pending payments";
      description = "You don't have any pending payments.";
      break;
    default:
      message = "No payments found";
      description = "You haven't made any payments yet.";
  }
  
  return (
    <div className="flex flex-col items-center justify-center bg-primary-50 rounded-lg p-12">
      <div className="bg-primary-100 rounded-full p-6 mb-4">
        <FileText className="h-12 w-12 text-primary-500" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">{message}</h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        {description} Your payment history will appear here after you book consultations.
      </p>
    </div>
  );
};

export default PetOwnerTransactions; 