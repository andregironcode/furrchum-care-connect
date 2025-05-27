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

// Extended types for the component
interface AppointmentWithDetails {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  status: string;
  notes: string | null;
  pet_id: string | null;
  pet_owner_id: string;
  vet_id: string;
  created_at: string;
  updated_at?: string;
  payment_status?: string;
  meeting_url?: string;
  vet_profiles?: {
    first_name: string;
    last_name: string;
  } | null;
  pets?: {
    name: string;
    type?: string;
    owner_id?: string;
  } | null;
  profiles?: {
    full_name: string | null;
    email?: string | null;
    phone_number?: string | null;
  } | null;
}

// Make properties nullable to match Supabase response
type SupabaseVetProfile = {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone_number?: string | null;
  specialization?: string | null;
  years_experience?: number | null;
  about?: string | null;
  clinic_location?: string | null;
  zip_code?: string | null;
  availability?: string | null;
  license_number?: string | null;
  license_document?: string | null;
  approval_status?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  rating?: number | null;
  consultation_fee?: number | null;
  profile_image?: string | null;
  clinic_images?: string[] | null;
};

type SupabaseUserProfile = {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  email?: string | null;
  phone_number?: string | null;
  user_type: string;
  status?: string | null;
  address?: string | null;
  image_url?: string | null;
};

type SupabaseTransaction = {
  id: string;
  booking_id: string | null;
  amount: number;
  currency: string | null;
  status: string;
  payment_method: string | null;
  created_at: string | null;
  updated_at?: string | null;
  user_id?: string | null;
  transaction_reference?: string | null;
  description?: string | null;
};

// Use the imported types from profiles.ts

const SuperAdminDashboard = () => {
  const [vets, setVets] = useState<SupabaseVetProfile[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [transactions, setTransactions] = useState<SupabaseTransaction[]>([]);
  const [users, setUsers] = useState<SupabaseUserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pet_owner' | 'vet' | 'admin'>('all');
  const [vetApprovalFilter, setVetApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reviewMode, setReviewMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data for SuperAdmin dashboard...');
      
      // Fetch all vets with detailed logging
      console.log('Fetching vet profiles...');
      const { data: vetsData, error: vetsError } = await supabase
        .from('vet_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (vetsError) {
        console.error('Error fetching vet profiles:', vetsError);
        throw vetsError;
      }
      console.log('Vet profiles fetched:', vetsData?.length || 0, 'records');
      console.log('Sample vet data:', vetsData?.[0]);

      // Fetch all users from profiles with detailed logging
      console.log('Fetching user profiles...');
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching user profiles:', usersError);
        throw usersError;
      }
      console.log('User profiles fetched:', usersData?.length || 0, 'records');
      console.log('Sample user data:', usersData?.[0]);

      // Fetch all appointments with detailed information
      console.log('Fetching appointments...');
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('bookings')
        .select(`
          *,
          vet_profiles:vet_id(first_name, last_name),
          pets:pet_id(name, type, owner_id)
        `)
        .order('created_at', { ascending: false });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw appointmentsError;
      }
      console.log('Appointments fetched:', appointmentsData?.length || 0, 'records');
      console.log('Sample appointment data:', appointmentsData?.[0]);

      // Fetch all transactions
      console.log('Fetching transactions...');
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        throw transactionsError;
      }
      console.log('Transactions fetched:', transactionsData?.length || 0, 'records');
      console.log('Sample transaction data:', transactionsData?.[0]);

      // Process the data to match our types
      console.log('Processing data...');
      
      // Process vet data - ensure we have the right structure
      const processedVets = vetsData ? vetsData.map((vet: any) => {
        // Ensure each vet has the required fields
        return {
          ...vet,
          id: vet.id || '',
          user_id: vet.user_id || vet.id || '',
          first_name: vet.first_name || '',
          last_name: vet.last_name || '',
          created_at: vet.created_at || new Date().toISOString(),
          approval_status: vet.approval_status || 'pending'
        };
      }) : [];
      console.log('Processed vets:', processedVets.length);
      
      // Process user data - ensure all required fields are present
      const processedUsers = usersData ? usersData.map((user: any) => {
        // Ensure each user has the required fields
        const processedUser = {
          ...user,
          id: user.id || '',
          full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
          email: user.email || '',
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString(),
          status: user.status || 'active'
        };
        
        // If user_type is missing, try to determine it
        if (!user.user_type) {
          // Check if this user is a vet
          const isVet = processedVets.some(vet => vet.user_id === user.id);
          if (isVet) {
            processedUser.user_type = 'vet';
          } else {
            // Default to pet_owner if not a vet
            processedUser.user_type = 'pet_owner';
          }
        }
        
        return processedUser;
      }) : [];
      
      // Add any vets that might not be in the users list
      processedVets.forEach((vet: any) => {
        const vetExists = processedUsers.some(user => user.id === vet.user_id);
        if (!vetExists && vet.user_id) {
          processedUsers.push({
            id: vet.user_id,
            full_name: `${vet.first_name} ${vet.last_name}`,
            email: vet.email || '',
            user_type: 'vet',
            created_at: vet.created_at,
            updated_at: vet.updated_at || vet.created_at,
            status: 'active'
          });
        }
      });
      
      console.log('Processed users:', processedUsers.length);
      
      const processedAppointments = appointmentsData || [];
      const processedTransactions = transactionsData || [];

      // Filter users by type for statistics
      const petOwners = processedUsers.filter(user => user.user_type === 'pet_owner');
      const veterinarians = processedUsers.filter(user => user.user_type === 'vet');
      
      console.log('Pet Owners count:', petOwners.length);
      console.log('Vets count:', veterinarians.length);
      
      // Set state with the processed data
      setVets(processedVets as SupabaseVetProfile[]);
      setUsers(processedUsers as SupabaseUserProfile[]);
      setAppointments(processedAppointments as AppointmentWithDetails[]);
      setTransactions(processedTransactions as SupabaseTransaction[]);

      // Log counts for debugging
      console.log('Final counts:');
      console.log('- Users:', processedUsers.length);
      console.log('- Pet Owners:', petOwners.length);
      console.log('- Vets:', veterinarians.length);
      console.log('- Appointments:', processedAppointments.length);
      console.log('- Transactions:', processedTransactions.length);
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

  const handleUserClick = (user: any) => {
    // Ensure user has all required fields before opening modal
    const processedUser = {
      ...user,
      id: user.id || '',
      full_name: user.full_name || 'Unknown',
      email: user.email || '',
      user_type: user.user_type || 'pet_owner',
      status: user.status || 'active'
    };
    
    setSelectedUser(processedUser);
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

  // Apply search filter to users
  const filteredUsers = users.filter(user => 
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.user_type && user.user_type.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Get counts for different user types - ensure we're checking if user_type exists
  const petOwners = users.filter(user => user.user_type === 'pet_owner');
  const vetUsers = users.filter(user => user.user_type === 'vet');

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
              <div className="text-2xl font-bold">{users.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {petOwners.length || 0} pet owners, {vetUsers.length || 0} vets
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
                {vets.filter(vet => vet.approval_status === 'pending').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {appointments.filter(apt => apt.status === 'confirmed').length || 0} confirmed, 
                {appointments.filter(apt => apt.status === 'pending').length || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(tx => tx.status === 'completed').length || 0} completed
              </p>
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
          
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage all users on the platform. Filter by user type or search by name.
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-background rounded-md border px-3 py-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="bg-transparent border-none focus:outline-none text-sm w-40 md:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={filterStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('all')}
                      className="text-xs"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === 'pet_owner' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('pet_owner')}
                      className="text-xs"
                    >
                      Pet Owners
                    </Button>
                    <Button
                      variant={filterStatus === 'vet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('vet')}
                      className="text-xs"
                    >
                      Vets
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>User Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers
                        .filter(user => {
                          // Log each user to debug
                          console.log('Filtering user:', user);
                          return filterStatus === 'all' || user.user_type === filterStatus;
                        })
                        .map((user) => {
                          // Format the user type display
                          const userTypeDisplay = user.user_type === 'pet_owner' ? 'Pet Owner' : 
                                                user.user_type === 'vet' ? 'Veterinarian' : 
                                                user.user_type === 'admin' ? 'Admin' : 
                                                user.user_type || 'Unknown';
                          
                          return (
                            <TableRow key={user.id}>
                              <TableCell>{user.full_name || 'Unknown'}</TableCell>
                              <TableCell>{user.email || '-'}</TableCell>
                              <TableCell>
                                <Badge variant={user.user_type === 'pet_owner' ? 'outline' : 'secondary'}>
                                  {userTypeDisplay}
                                </Badge>
                              </TableCell>
                              <TableCell>{getStatusBadge(user.status || 'active')}</TableCell>
                              <TableCell>
                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserClick(user)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

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
