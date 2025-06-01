
import { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Calendar, Search } from 'lucide-react';

// Mock data for billing transactions
const mockTransactions = [
  { id: 1, date: '12/05/2025', petName: 'NA', transactionId: 'pay_QTzIoOyb0gUmaj', amount: '₹ 650', method: 'NA' },
  { id: 2, date: '12/05/2025', petName: 'my pet', transactionId: 'pay_QU0MQxmd6o8w3K', amount: '₹ 650', method: 'NA' },
  { id: 3, date: '13/05/2025', petName: 'Oggy', transactionId: 'pay_QUJmZo4IRS6wLJ', amount: '₹ 650', method: 'NA' },
  { id: 4, date: '14/05/2025', petName: 'my pet', transactionId: 'pay_QUlTgO9mPyqhbs', amount: '₹ 700', method: 'card' },
  { id: 5, date: '15/05/2025', petName: 'rrrrr', transactionId: 'pay_QV7hvMSNJcjRyo', amount: '₹ 650', method: 'card' },
  { id: 6, date: '15/05/2025', petName: 'Bravo', transactionId: 'pay_QVBGF1qg2z9sEq', amount: '₹ 650', method: 'card' },
  { id: 7, date: '15/05/2025', petName: 'Bravo', transactionId: 'pay_QVCcMDPuwztzPg', amount: '₹ 700', method: 'card' },
  { id: 8, date: '15/05/2025', petName: 'Bravo', transactionId: 'pay_QVD8Dwvxq5CJN5', amount: '₹ 700', method: 'card' },
  { id: 9, date: '16/05/2025', petName: 'Bravo', transactionId: 'pay_QVUS6s8ENhIn6h', amount: '₹ 700', method: 'card' },
  { id: 10, date: '16/05/2025', petName: 'tommy', transactionId: 'pay_QVUZu479vOUMKv', amount: '₹ 700', method: 'card' },
  { id: 11, date: '16/05/2025', petName: 'Bravo', transactionId: 'pay_QVUexJK8IWOZi2', amount: '₹ 700', method: 'card' },
  { id: 12, date: '16/05/2025', petName: 'Oggy', transactionId: 'pay_QVV8HcZNwqDZY0', amount: '₹ 700', method: 'card' },
  { id: 13, date: '16/05/2025', petName: 'Bravo', transactionId: 'pay_QVVAx5qN0MxrxK', amount: '₹ 700', method: 'card' },
];

const VetBillingPage = () => {
  const [transactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.petName.toLowerCase().includes(searchLower) ||
      transaction.transactionId.toLowerCase().includes(searchLower)
    );
  });

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
                  <h1 className="text-2xl font-bold text-accent-600">Recent Transactions</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  {/* Additional filters could be added here */}
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search by pet, vet or transaction"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-72 pl-9"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-white">Search</Button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-primary">
                      <TableRow>
                        <TableHead className="text-white font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2" /> Date
                        </TableHead>
                        <TableHead className="text-white font-medium">Pet Name</TableHead>
                        <TableHead className="text-white font-medium">Transaction ID</TableHead>
                        <TableHead className="text-white font-medium">Amount</TableHead>
                        <TableHead className="text-white font-medium">Method</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.petName}</TableCell>
                          <TableCell className="font-mono text-sm">{transaction.transactionId}</TableCell>
                          <TableCell>{transaction.amount}</TableCell>
                          <TableCell>{transaction.method}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end p-4 border-t">
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>
                      &lt;
                    </Button>
                    <Button variant="outline" size="sm" className="bg-primary text-white hover:bg-primary/90">
                      1
                    </Button>
                    <Button variant="outline" size="sm">2</Button>
                    <Button variant="outline" size="sm">3</Button>
                    <Button variant="outline" size="sm">&gt;</Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VetBillingPage;
