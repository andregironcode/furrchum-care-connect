import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Calendar, CreditCard, CheckCircle, XCircle, Clock, Search, UserCheck, UserX, FileText, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserDetailsModal from '@/components/UserDetailsModal';
import VetApprovalCard from '@/components/VetApprovalCard';
import { UserProfile, VetProfile, Appointment, Transaction } from '@/types/profiles';

// Use the imported types from profiles.ts

const SuperAdminDashboard = () => {
  const [vets, setVets] = useState<VetProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reviewMode, setReviewMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch pending vets
      const { data: vetsData, error: vetsError } = await supabase
        .from('vet_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (vetsError) throw vetsError;

      // Fetch all users from profiles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch all appointments with detailed information
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          start_time,
          end_time,
          consultation_type,
          status,
          notes,
          created_at,
          vet_id,
          pet_id,
          pet_owner_id,
          vet_profiles!inner(first_name, last_name),
          pets!inner(name, owner_id)
        `)
        .order('created_at', { ascending: false });

      if (appointmentsError) {
        console.error('Appointments error:', appointmentsError);
        throw appointmentsError;
      }

      // Fetch pet owner details for appointments
      let enhancedAppointments: AppointmentWithDetails[] = [];
      if (appointmentsData && appointmentsData.length > 0) {
        const ownerIds = [...new Set(appointmentsData.map(apt => apt.pet_owner_id))];
        
        const { data: ownersData, error: ownersError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ownerIds);

        if (ownersError) {
          console.error('Owners error:', ownersError);
          throw ownersError;
        }

        const ownersMap = new Map(ownersData?.map(owner => [owner.id, owner]) || []);

        enhancedAppointments = appointmentsData.map(apt => ({
          ...apt,
          pet_owner: ownersMap.get(apt.pet_owner_id)
        }));
      }

      // Fetch all transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      setVets(vetsData || []);
      setUsers(usersData || []);
      setAppointments(enhancedAppointments);
      setTransactions(transactionsData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVetApproval = async (vetId: string, status: 'approved' | 'rejected', feedback?: string) => {
    try {
      setLoading(true);

      const updateData: any = {
        approval_status: status,
        approved_at: new Date().toISOString(),
        approved_by: 'Super Admin'
      };
      
      // Add feedback for rejections
      if (status === 'rejected' && feedback) {
        updateData.rejection_reason = feedback;
      }

      const { error } = await supabase
        .from('vet_profiles')
        .update(updateData)
        .eq('id', vetId);

      if (error) throw error;

      // Send notification to the vet (this would normally be an email or in-app notification)
      // For now, we'll just log it
      console.log(`Notification to vet ${vetId}: Your account has been ${status}${feedback ? ` with feedback: ${feedback}` : ''}`);

      toast({
        title: `Vet ${status}`,
        description: `The veterinarian has been ${status} successfully.`,
      });

      // Refresh all data after approval
      fetchData();
    } catch (error: any) {
      console.error('Error updating vet status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update vet status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    try {
      // Note: This would typically update a user_status table or similar
      // For now, we'll just show a toast as the basic profiles table doesn't have status
      toast({
        title: 'User Status Updated',
        description: `User status changed to ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superAdminAuth');
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleVetClick = (vet: any) => {
    // Check if we have a corresponding user profile first
    const vetUser = users.find(user => user.id === vet.id);
    if (vetUser) {
      // Use the full user profile if available
      setSelectedUser({
        ...vetUser,
        ...vet,
        user_type: 'vet',
        full_name: `${vet.first_name} ${vet.last_name}`
      });
    } else {
      // Fallback to just the vet profile data
      setSelectedUser({
        ...vet,
        user_type: 'vet',
        full_name: `${vet.first_name} ${vet.last_name}`
      });
    }
    setIsUserModalOpen(true);
  };

  const handleUserModalClose = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    fetchData(); // Refresh data when user is updated
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const petOwners = filteredUsers.filter(user => user.user_type === 'pet_owner');
  const vetUsers = filteredUsers.filter(user => user.user_type === 'vet');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Super Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {petOwners.length} pet owners, {vetUsers.length} vets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vets.filter(vet => vet.approval_status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="vets">Vet Approvals</TabsTrigger>
            <TabsTrigger value="appointments">All Appointments</TabsTrigger>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="vets">
            <Card>
              <CardHeader>
                <CardTitle>Veterinarian Approvals</CardTitle>
                <CardDescription>
                  Review and approve or reject veterinarian applications. Click "View Documents" to review their credentials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vets.map((vet) => (
                      <TableRow key={vet.id}>
                        <TableCell>
                          {vet.first_name} {vet.last_name}
                        </TableCell>
                        <TableCell>{vet.specialization || 'General Practice'}</TableCell>
                        <TableCell>{vet.years_experience || 0} years</TableCell>
                        <TableCell>{getStatusBadge(vet.approval_status)}</TableCell>
                        <TableCell>
                          {new Date(vet.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVetClick(vet)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View Documents
                            </Button>
                            {vet.approval_status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleVetApproval(vet.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleVetApproval(vet.id, 'rejected')}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>
                  View all appointments booked on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Pet Owner</TableHead>
                      <TableHead>Pet</TableHead>
                      <TableHead>Vet</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {new Date(appointment.booking_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {appointment.start_time} - {appointment.end_time}
                          </TableCell>
                          <TableCell>
                            {appointment.pet_owner?.full_name || 'Unknown Owner'}
                          </TableCell>
                          <TableCell>{appointment.pets?.name || 'Unknown Pet'}</TableCell>
                          <TableCell>
                            Dr. {appointment.vet_profiles?.first_name} {appointment.vet_profiles?.last_name}
                          </TableCell>
                          <TableCell className="capitalize">{appointment.consultation_type}</TableCell>
                          <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  View all payment transactions on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            ${transaction.amount}
                          </TableCell>
                          <TableCell>{transaction.currency}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell>{transaction.payment_method || '-'}</TableCell>
                          <TableCell>{transaction.transaction_reference || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <UserDetailsModal
          user={selectedUser}
          isOpen={isUserModalOpen}
          onClose={handleUserModalClose}
          onUserUpdated={handleUserUpdated}
        />
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
