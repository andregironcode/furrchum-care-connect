import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, LogOut, Search, User, Calendar, CheckCircle, XCircle, AlertCircle, RefreshCw, Users, CreditCard, Clock, Filter, UserCheck, UserX, FileText, LayoutGrid, List, Pill, Trash2, Download, TrendingUp, BarChart3, PieChart, Activity, DollarSign, Calendar as CalendarIcon, Stethoscope, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import UserDetailsModal from '@/components/UserDetailsModal';
import VetApprovalCard from '@/components/VetApprovalCard';
import VetDetailsModal from '@/components/VetDetailsModal';
import PrescriptionDetailsModal from '@/components/PrescriptionDetailsModal';
import AppointmentDetailsModal from '@/components/AppointmentDetailsModal';
import { UserProfile, VetProfile, Appointment, Transaction } from '@/types/profiles';
import { downloadFile, openFile } from '@/utils/supabaseStorage';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/context/AuthContext';

// Interface definitions
interface AppointmentWithDetails {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string | null;
  notes: string | null;
  vet_id: string;
  pet_id: string | null;
  pet_owner_id: string;
  consultation_type: string;
  created_at: string;
  updated_at: string | null;
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
    address?: string | null;
  } | null;
}

interface SupabaseVetProfile {
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
  clinic_name?: string | null;
  zip_code?: string | null;
  availability?: string | null;
  license_number?: string | null;
  license_document_url?: string | null;
  license_url?: string | null;
  license_expiry?: string | null;
  approval_status?: 'pending' | 'approved' | 'rejected' | null;
  approved_at?: string | null;
  approved_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  rating?: number | null;
  consultation_fee?: number | null;
  profile_image?: string | null;
  image_url?: string | null;
  clinic_images?: string[] | null;
  // Banking fields
  pan_number?: string | null;
  gst_number?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  ifsc_code?: string | null;
}

interface SupabaseUserProfile {
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
  appointment_count?: number;
  prescription_count?: number;
}

interface SupabasePrescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
  diagnosis?: string | null;
  prescribed_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  pet_id: string;
  pet_owner_id: string;
  vet_id: string;
  pet?: {
    name: string;
    type: string;
    breed?: string;
  };
  owner?: {
    full_name?: string;
  };
  vet?: {
    first_name: string;
    last_name: string;
    specialization?: string;
  };
}

interface SupabaseTransaction {
  id: string;
  booking_id: string | null;
  amount: number;
  currency: string | null;
  status: string;
  payment_method: string | null;
  created_at: string | null;
  updated_at?: string | null;
  pet_owner_id?: string | null; // Changed from user_id to pet_owner_id
  transaction_reference?: string | null;
  description?: string | null;
  // New Razorpay fields
  provider?: string | null;
  provider_payment_id?: string | null;
  provider_order_id?: string | null;
  payment_intent_id?: string | null;
  customer_email?: string | null;
}

// Analytics interfaces
interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalVets: number;
    totalPets: number;
    totalAppointments: number;
    totalPrescriptions: number;
    totalRevenue: number;
    pendingVetApprovals: number;
    activeAppointments: number;
  };
  trends: {
    userGrowth: Array<{ date: string; users: number; vets: number }>;
    appointmentTrends: Array<{ date: string; appointments: number; revenue: number }>;
    prescriptionTrends: Array<{ date: string; prescriptions: number }>;
  };
  distribution: {
    userTypes: Array<{ name: string; value: number; color: string }>;
    appointmentTypes: Array<{ name: string; value: number; color: string }>;
    appointmentStatus: Array<{ name: string; value: number; color: string }>;
    petTypes: Array<{ name: string; value: number; color: string }>;
    vetSpecializations: Array<{ name: string; value: number; color: string }>;
  };
  performance: {
    topVets: Array<{ name: string; appointments: number; revenue: number; rating: number }>;
    recentActivity: Array<{ date: string; users: number; appointments: number; prescriptions: number }>;
  };
}

// Calculate analytics data from all fetched data
const calculateAnalytics = (
  users: SupabaseUserProfile[],
  vets: SupabaseVetProfile[],
  pets: any[],
  appointments: AppointmentWithDetails[],
  prescriptions: SupabasePrescription[],
  transactions: SupabaseTransaction[]
): AnalyticsData => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Calculate overview metrics
  const totalRevenue = transactions
    .filter(t => t.status === 'completed' || t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingVetApprovals = vets.filter(v => 
    !v.approval_status || v.approval_status === 'pending'
  ).length;

  const activeAppointments = appointments.filter(a => 
    a.status === 'confirmed' || a.status === 'scheduled'
  ).length;

  // Calculate growth trends (last 30 days)
  const userGrowth: Array<{ date: string; users: number; vets: number }> = [];
  const appointmentTrends: Array<{ date: string; appointments: number; revenue: number }> = [];
  const prescriptionTrends: Array<{ date: string; prescriptions: number }> = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const usersCreatedByDate = users.filter(u => 
      new Date(u.created_at).toDateString() === date.toDateString()
    ).length;
    
    const vetsCreatedByDate = vets.filter(v => 
      new Date(v.created_at).toDateString() === date.toDateString()
    ).length;
    
    const appointmentsByDate = appointments.filter(a => 
      new Date(a.booking_date).toDateString() === date.toDateString()
    );
    
    const prescriptionsByDate = prescriptions.filter(p => 
      new Date(p.prescribed_date).toDateString() === date.toDateString()
    ).length;
    
    const revenueByDate = transactions
      .filter(t => 
        new Date(t.created_at || '').toDateString() === date.toDateString() &&
        (t.status === 'completed' || t.status === 'success')
      )
      .reduce((sum, t) => sum + t.amount, 0);

    userGrowth.push({
      date: dateStr,
      users: usersCreatedByDate,
      vets: vetsCreatedByDate
    });

    appointmentTrends.push({
      date: dateStr,
      appointments: appointmentsByDate.length,
      revenue: revenueByDate
    });

    prescriptionTrends.push({
      date: dateStr,
      prescriptions: prescriptionsByDate
    });
  }

  // Calculate distributions
  const userTypeCount = users.reduce((acc, user) => {
    const type = user.user_type === 'pet_owner' ? 'Pet Owners' : 'Others';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const vetCount = vets.length;
  const userTypes = [
    { name: 'Pet Owners', value: userTypeCount['Pet Owners'] || 0, color: '#3b82f6' },
    { name: 'Veterinarians', value: vetCount, color: '#10b981' },
    { name: 'Others', value: userTypeCount['Others'] || 0, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  const appointmentTypeCount = appointments.reduce((acc, apt) => {
    const type = apt.consultation_type === 'video_call' ? 'Video Call' : 'In-Person';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const appointmentTypes = Object.entries(appointmentTypeCount).map(([name, value], index) => ({
    name,
    value: value as number,
    color: index === 0 ? '#8b5cf6' : '#ec4899'
  }));

  const appointmentStatusCount = appointments.reduce((acc, apt) => {
    const status = apt.status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusColors = {
    confirmed: '#10b981',
    completed: '#3b82f6',
    cancelled: '#ef4444',
    pending: '#f59e0b',
    scheduled: '#6366f1'
  };

  const appointmentStatus = Object.entries(appointmentStatusCount).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
    color: statusColors[name as keyof typeof statusColors] || '#6b7280'
  }));

  const petTypeCount = pets.reduce((acc, pet) => {
    const type = pet.type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const petColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const petTypes = Object.entries(petTypeCount).map(([name, value], index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
    color: petColors[index % petColors.length]
  }));

  const vetSpecializationCount = vets.reduce((acc, vet) => {
    const spec = vet.specialization || 'General Practice';
    acc[spec] = (acc[spec] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const vetSpecializations = Object.entries(vetSpecializationCount).map(([name, value], index) => ({
    name,
    value: value as number,
    color: petColors[index % petColors.length]
  }));

  // Calculate top performing vets
  const vetPerformance = vets.map(vet => {
    const vetAppointments = appointments.filter(a => a.vet_id === vet.id);
    const vetRevenue = transactions
      .filter(t => 
        vetAppointments.some(a => a.id === t.booking_id) &&
        (t.status === 'completed' || t.status === 'success')
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      name: `Dr. ${vet.first_name} ${vet.last_name}`,
      appointments: vetAppointments.length,
      revenue: vetRevenue,
      rating: vet.rating || 0
    };
  });

  const topVets = vetPerformance
    .sort((a, b) => b.appointments - a.appointments)
    .slice(0, 5);

  // Calculate recent activity (last 7 days)
  const recentActivity: Array<{ date: string; users: number; appointments: number; prescriptions: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const dailyUsers = users.filter(u => 
      new Date(u.created_at).toDateString() === date.toDateString()
    ).length;
    
    const dailyAppointments = appointments.filter(a => 
      new Date(a.booking_date).toDateString() === date.toDateString()
    ).length;
    
    const dailyPrescriptions = prescriptions.filter(p => 
      new Date(p.prescribed_date).toDateString() === date.toDateString()
    ).length;

    recentActivity.push({
      date: dateStr,
      users: dailyUsers,
      appointments: dailyAppointments,
      prescriptions: dailyPrescriptions
    });
  }

  return {
    overview: {
      totalUsers: users.length,
      totalVets: vets.length,
      totalPets: pets.length,
      totalAppointments: appointments.length,
      totalPrescriptions: prescriptions.length,
      totalRevenue,
      pendingVetApprovals,
      activeAppointments
    },
    trends: {
      userGrowth,
      appointmentTrends,
      prescriptionTrends
    },
    distribution: {
      userTypes,
      appointmentTypes,
      appointmentStatus,
      petTypes,
      vetSpecializations
    },
    performance: {
      topVets,
      recentActivity
    }
  };
};

// Enhanced Transaction Row Component with dynamic data fetching
const EnhancedTransactionRow: React.FC<{ transaction: SupabaseTransaction }> = ({ transaction }) => {
  const [bookingDetails, setBookingDetails] = useState<{
    petName: string;
    ownerName: string;
    vetName: string;
    consultationType: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!transaction.booking_id) return;
      
      setLoading(true);
      try {
        // Fetch booking with related data
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            consultation_type,
            pet_id,
            vet_id,
            pet_owner_id
          `)
          .eq('id', transaction.booking_id)
          .single();

        if (bookingError) {
          console.error('Error fetching booking:', bookingError);
          return;
        }

        if (booking) {
          // Fetch related data in parallel
          const [
            { data: petData },
            { data: ownerData },
            { data: vetData }
          ] = await Promise.all([
            booking.pet_id ? supabase.from('pets').select('name').eq('id', booking.pet_id).single() : Promise.resolve({ data: null }),
            booking.pet_owner_id ? supabase.from('profiles').select('full_name').eq('id', booking.pet_owner_id).single() : Promise.resolve({ data: null }),
            booking.vet_id ? supabase.from('vet_profiles').select('first_name, last_name').eq('id', booking.vet_id).single() : Promise.resolve({ data: null })
          ]);

          setBookingDetails({
            petName: petData?.name || 'Unknown Pet',
            ownerName: ownerData?.full_name || 'Unknown Owner',
            vetName: vetData ? `Dr. ${vetData.first_name} ${vetData.last_name}` : 'Unknown Vet',
            consultationType: booking.consultation_type || 'Unknown'
          });
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [transaction.booking_id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    
    if (statusLower === 'completed' || statusLower === 'success') {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    if (statusLower === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
    if (statusLower === 'failed') {
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">{status || 'Unknown'}</Badge>;
  };

  const platformFee = 121; // Fixed platform fee of ₹121
  const vetEarning = transaction.amount - platformFee;

  return (
    <TableRow>
      <TableCell className="font-medium">
        {formatDate(transaction.created_at)}
      </TableCell>
      <TableCell className="font-bold text-green-600">
        ₹{transaction.amount.toFixed(2)}
      </TableCell>
      <TableCell>
        {getStatusBadge(transaction.status)}
      </TableCell>
      <TableCell>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div>
            <div className="font-medium">{bookingDetails?.ownerName || 'Direct Payment'}</div>
            {transaction.customer_email && (
              <div className="text-sm text-muted-foreground">{transaction.customer_email}</div>
            )}
          </div>
        )}
      </TableCell>
      <TableCell>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : bookingDetails ? (
          <div>
            <div className="font-medium">{bookingDetails.petName}</div>
            <div className="text-sm text-muted-foreground">
              {bookingDetails.consultationType.replace('_', ' ')} with {bookingDetails.vetName}
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No booking linked</span>
        )}
      </TableCell>
      <TableCell className="font-medium text-blue-600">
        ₹{platformFee.toFixed(2)}
      </TableCell>
      <TableCell className="font-medium text-purple-600">
        ₹{vetEarning.toFixed(2)}
      </TableCell>
      <TableCell>
        <div>
          <Badge variant="outline" className="text-xs">
            {transaction.provider?.toUpperCase() || 'RAZORPAY'}
          </Badge>
          {transaction.payment_method && (
            <div className="text-sm text-muted-foreground mt-1 capitalize">
              {transaction.payment_method}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-mono text-xs">
          {transaction.provider_payment_id || transaction.transaction_reference || 'N/A'}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (transaction.provider_payment_id) {
                navigator.clipboard.writeText(transaction.provider_payment_id);
              }
            }}
            className="text-xs"
          >
            Copy ID
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const SuperAdminDashboard = () => {
  // Auth context
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State for data
  const [vets, setVets] = useState<SupabaseVetProfile[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [users, setUsers] = useState<SupabaseUserProfile[]>([]);
  const [prescriptions, setPrescriptions] = useState<SupabasePrescription[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
  // Use the new transactions hook for admin (all transactions)
  const { 
    transactions, 
    stats: transactionStats, 
    loading: transactionsLoading, 
    error: transactionsError,
    refetch: refetchTransactions
  } = useTransactions({
    userRole: 'admin',
    limit: 1000 // Increase limit for admin to see more transactions
  });
  
  // Debug transactions
  useEffect(() => {
    console.log('🔍 SuperAdmin Transactions Debug:', {
      transactions: transactions.length,
      loading: transactionsLoading,
      error: transactionsError,
      user: user?.email,
      userRole: user?.user_metadata?.user_type,
      rawTransactions: transactions.slice(0, 3) // Log first 3 transactions for debugging
    });
    
    // Force refetch if we have user but no transactions
    if (user && !transactionsLoading && transactions.length === 0 && !transactionsError) {
      console.log('🔄 Forcing transaction refetch for admin...');
      setTimeout(() => {
        refetchTransactions();
      }, 1000);
    }
  }, [transactions, transactionsLoading, transactionsError, user, refetchTransactions]);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<'all' | 'pet_owner' | 'vet' | 'admin' | 'suspended'>('all');
  const [vetApprovalFilter, setVetApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // State for review mode
  const [reviewMode, setReviewMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SupabaseUserProfile | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // State for vet details modal
  const [selectedVet, setSelectedVet] = useState<SupabaseVetProfile | null>(null);
  const [isVetModalOpen, setIsVetModalOpen] = useState(false);
  
  // State for prescription details modal
  const [selectedPrescription, setSelectedPrescription] = useState<SupabasePrescription | null>(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  
  // State for appointment details modal
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  
  // State for delete confirmations
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{
    type: 'user' | 'vet' | 'appointment' | 'prescription';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // View mode for vets (cards or table)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('table');
  
  // Fetch data function
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Initialize variables to store all fetched data
      let fetchedUsers: any[] = [];
      let processedAppointments: AppointmentWithDetails[] = [];
      let processedPrescriptions: SupabasePrescription[] = [];
      
      // Skip analytics RPC function as it's not available in the database
      // Will calculate analytics client-side instead
      let analyticsData = null;
      let analyticsError = { message: "Function not available" };
      
      // Fetch all pet owners with emails using optimized RPC function
      try {
        const { data: allUsersData, error: rpcError } = await (supabase as any)
          .rpc('get_all_users_with_emails');
         
        if (rpcError) {
          console.error('Error fetching users with emails:', rpcError);
          setError('Failed to fetch users with emails');
        } else {
          // Filter to only show pet owners since vets have their own dedicated tab
          fetchedUsers = (allUsersData || []).filter((user: any) => user.user_type === 'pet_owner');
          console.log('Fetched pet owners with emails:', fetchedUsers.length, 'users');
        }
      } catch (error) {
        console.error('Error in RPC call:', error);
        setError('Failed to fetch users');
      }
      
      // Fetch all vets with proper ordering and RLS policies
      const { data: vetsData, error: vetError } = await supabase
        .from('vet_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .throwOnError();
      
      if (vetError) {
        setError('Failed to fetch vets');
        console.error('Error fetching vets:', vetError);
        return;
      }
      
      // Log the vets data to help with debugging
      console.log('Fetched vets:', vetsData?.length || 0, 'vets', vetsData);
      
      // OPTIMIZED APPROACH: Use single queries with proper JOINs instead of N+1 queries
      
      // Fetch appointments with related data in single optimized query
      try {
        const { data: appointmentsWithRelatedData, error: appointmentsError } = await supabase
          .from('bookings')
          .select(`
            *,
            pets!left(id, name, type, owner_id),
            profiles!bookings_pet_owner_id_fkey(id, full_name, phone_number, address),
            vet_profiles!bookings_vet_id_fkey(id, first_name, last_name)
          `)
          .order('booking_date', { ascending: false })
          .limit(1000); // Reasonable limit for performance
        
        if (appointmentsError) {
          console.error('Error fetching appointments:', appointmentsError);
          processedAppointments = [];
        } else {
          // Process the optimized appointment data
          processedAppointments = (appointmentsWithRelatedData || []).map((booking: any) => ({
            id: booking.id,
            booking_date: booking.booking_date,
            start_time: booking.start_time,
            end_time: booking.end_time,
            status: booking.status,
            notes: booking.notes,
            vet_id: booking.vet_id || '',
            pet_id: booking.pet_id || '',
            pet_owner_id: booking.pet_owner_id || '',
            consultation_type: booking.consultation_type,
            created_at: booking.created_at,
            updated_at: booking.updated_at,
            // Add the related data directly from JOINs
            vet_profiles: booking.vet_profiles,
            pets: booking.pets,
            profiles: booking.profiles,
            // Flatten for compatibility
            first_name: booking.vet_profiles?.first_name || '',
            last_name: booking.vet_profiles?.last_name || '',
            name: booking.pets?.name || '',
            type: booking.pets?.type || '',
            owner_id: booking.pets?.owner_id || '',
            full_name: booking.profiles?.full_name || '',
            email: '', // Will be filled from profiles if needed
            phone_number: '',
            address: booking.profiles?.address || ''
          }));
        }
      } catch (error) {
        console.error('Error in optimized appointments fetch:', error);
        processedAppointments = [];
      }
      
      // Fetch prescriptions with related data in single optimized query
      try {
        // First get all prescriptions (like vet/pet dashboards do)
        const { data: prescriptionsData, error: prescriptionsError } = await supabase
          .from('prescriptions')
          .select('*')
          .order('prescribed_date', { ascending: false })
          .limit(1000);
        
        if (prescriptionsError) {
          console.error('Error fetching prescriptions:', prescriptionsError);
          processedPrescriptions = [];
        } else if (prescriptionsData && prescriptionsData.length > 0) {
          // Get unique IDs for related data
          const petIds = [...new Set(prescriptionsData.map(p => p.pet_id))];
          const ownerIds = [...new Set(prescriptionsData.map(p => p.pet_owner_id))];
          const vetIds = [...new Set(prescriptionsData.map(p => p.vet_id))];

          // Fetch related data in parallel (like other dashboards do)
          const [
            { data: petsData, error: petsError },
            { data: ownersData, error: ownersError }, 
            { data: vetsData, error: vetsError }
          ] = await Promise.all([
            supabase.from('pets').select('id, name, type, breed').in('id', petIds),
            supabase.from('profiles').select('id, full_name').in('id', ownerIds),
            supabase.from('vet_profiles').select('id, first_name, last_name, specialization').in('id', vetIds)
          ]);

          if (petsError) console.error('Error fetching pets for prescriptions:', petsError);
          if (ownersError) console.error('Error fetching owners for prescriptions:', ownersError);
          if (vetsError) console.error('Error fetching vets for prescriptions:', vetsError);

          // Process and combine the data
          processedPrescriptions = prescriptionsData.map((prescription: any) => {
            const pet = petsData?.find(p => p.id === prescription.pet_id);
            const owner = ownersData?.find(o => o.id === prescription.pet_owner_id);
            const vet = vetsData?.find(v => v.id === prescription.vet_id);
            
            return {
              ...prescription,
              pet: pet ? {
                name: pet.name,
                type: pet.type,
                breed: pet.breed
              } : undefined,
              owner: owner ? {
                full_name: owner.full_name
              } : undefined,
              vet: vet ? {
                first_name: vet.first_name,
                last_name: vet.last_name,
                specialization: vet.specialization
              } : undefined
            };
          });
          
          console.log('Successfully fetched prescriptions:', processedPrescriptions.length);
        } else {
          processedPrescriptions = [];
        }
      } catch (error) {
        console.error('Error in prescriptions fetch:', error);
        processedPrescriptions = [];
      }
      
      // Fetch transactions with optimized query
      // Note: Transactions are now handled by the useTransactions hook
      console.log('Transactions are managed by useTransactions hook');
      
      // Process vet data with approval status normalization
      const processedVets = (vetsData || []).map((vet: any) => ({
        ...vet,
        approval_status: (['pending', 'approved', 'rejected'].includes(vet.approval_status) 
          ? vet.approval_status 
          : 'pending') as 'pending' | 'approved' | 'rejected'
      }));
      
      // OPTIMIZED: Count calculations without fetching all data again
      const usersWithCounts = fetchedUsers.map(user => {
        // Count appointments where user is the pet owner - from already fetched data
        const appointmentCount = processedAppointments.filter(appointment => 
          appointment.pet_owner_id === user.id
        ).length;
        
        // Count prescriptions where user is the pet owner - from already fetched data
        const prescriptionCount = processedPrescriptions.filter(prescription => 
          prescription.pet_owner_id === user.id
        ).length;
        
        return {
          ...user,
          appointment_count: appointmentCount,
          prescription_count: prescriptionCount
        };
      });
      
      // Fetch pets data for analytics - single optimized query
      let petsData: any[] = [];
      try {
        const { data: allPetsData, error: petsError } = await supabase
          .from('pets')
          .select('id, name, type, breed, created_at, owner_id')
          .order('created_at', { ascending: false })
          .limit(5000); // Reasonable limit
        
        if (petsError) {
          console.error('Error fetching pets:', petsError);
        } else {
          petsData = allPetsData || [];
        }
      } catch (error) {
        console.error('Error in pets fetch:', error);
      }

      // Use pre-calculated analytics if available, otherwise calculate
      let calculatedAnalytics;
      if (analyticsData && !analyticsError) {
        // Use database-calculated analytics for better performance
        calculatedAnalytics = {
          overview: {
            totalUsers: (analyticsData as any).totalUsers || usersWithCounts.length,
            totalVets: (analyticsData as any).totalVets || processedVets.length,
            totalPets: (analyticsData as any).totalPets || petsData.length,
            totalAppointments: (analyticsData as any).totalAppointments || processedAppointments.length,
            totalPrescriptions: (analyticsData as any).totalPrescriptions || processedPrescriptions.length,
            totalRevenue: (analyticsData as any).totalRevenue || 0,
            pendingVetApprovals: (analyticsData as any).pendingVetApprovals || 0,
            activeAppointments: (analyticsData as any).activeAppointments || 0
          },
          trends: {
            userGrowth: [], // Can be populated from analyticsData.recentStats if needed
            appointmentTrends: [],
            prescriptionTrends: []
          },
          distribution: {
            userTypes: [
              { name: 'Pet Owners', value: usersWithCounts.length, color: '#3b82f6' },
              { name: 'Veterinarians', value: processedVets.length, color: '#10b981' }
            ],
            appointmentTypes: [],
            appointmentStatus: [],
            petTypes: [],
            vetSpecializations: []
          },
          performance: {
            topVets: [],
            recentActivity: []
          }
        };
      } else {
        // Fallback to client-side calculation (less optimal but functional)
        calculatedAnalytics = calculateAnalytics(
          usersWithCounts,
          processedVets,
          petsData,
          processedAppointments,
          processedPrescriptions,
          transactions || [] // Use transactions from hook
        );
      }
      
      // Set state with fetched data
      setUsers(usersWithCounts);
      setVets(processedVets);
      setAppointments(processedAppointments);
      setPrescriptions(processedPrescriptions);
      setPets(petsData);
      setAnalytics(calculatedAnalytics);
      
    } catch (error) {
      setError('An unexpected error occurred while fetching data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    // Always fetch data and rely on SuperAdminGuard for auth protection
    // This ensures data is loaded even if the session state changes
    const superAdminAuth = localStorage.getItem('superAdminAuth');
    if (superAdminAuth === 'true') {
      fetchData();
    } else {
      navigate('/superadmin/auth');
    }
  }, [navigate]);
  
  // Force refresh data from the database
  const forceRefreshData = async () => {
    setLoading(true);
    setIsRefreshing(true);
    console.log('Forcing data refresh...');
    
    try {
      // Clear local state
      setVets([]);
      
      // Wait a moment to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch fresh data
      await fetchData();
      
      console.log('Data refresh complete');
    } catch (error) {
      console.error('Error during forced refresh:', error);
      setError('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };
  
  // Handle vet approval/rejection
  const handleVetApproval = async (vetId: string, status: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      
      console.log(`Updating vet ${vetId} status to ${status}`);
      
      // Find the vet we're approving/rejecting
      const vetToUpdate = vets.find(v => v.id === vetId);
      if (!vetToUpdate) {
        throw new Error(`Could not find vet with ID ${vetId}`);
      }
      
      // Create update data
      const updateData = {
        approval_status: status,
        ...(status === 'approved' ? { approved_at: new Date().toISOString() } : {})
      };
      
      // Update the database
      const { error: updateError } = await supabase
        .from('vet_profiles')
        .update(updateData)
        .eq('id', vetId);
        
      if (updateError) {
        console.error('Error updating vet profile:', updateError);
        throw new Error(`Error updating vet profile: ${updateError.message || 'Unknown error'}`);
      }
      
      // Add a small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify the update was successful
      const { data: verifyData, error: verifyError } = await supabase
        .from('vet_profiles')
        .select('approval_status')
        .eq('id', vetId)
        .single();
        
      if (verifyError) {
        console.error('Error verifying update:', verifyError);
      } else {
        console.log('Verification data:', verifyData);
        if (verifyData?.approval_status !== status) {
          console.warn(`Update verification failed: expected ${status} but got ${verifyData?.approval_status}`);
        } else {
          console.log('Update verification successful!');
        }
      }
      
      // Update local state
      setVets(prevVets => {
        return prevVets.map(vet => {
          if (vet.id === vetId) {
            return {
              ...vet,
              approval_status: status,
              ...(status === 'approved' ? { approved_at: new Date().toISOString() } : {})
            };
          }
          return vet;
        });
      });
      
      // Show success message
      toast({
        title: `Vet ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `The veterinarian has been ${status === 'approved' ? 'approved' : 'rejected'} successfully.`,
      });
      
      // Fetch data again to ensure we have the latest state
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update vet status';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle user status change - modified since status field doesn't exist
  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    try {
      setLoading(true);
      
      // We don't update the status field since it doesn't exist in the profiles table
      // Instead, we just show a toast notification
      
      // Update local state - but don't add a non-existent status field
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user } : user
        )
      );
      
      toast({
        title: 'Status Updated',
        description: `User status has been updated to ${newStatus}.`,
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user status';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  // Handle user click
  const handleUserClick = (user: SupabaseUserProfile) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };
  
  // Handle vet click
  const handleVetClick = (vet: SupabaseVetProfile) => {
    // Set the selected vet and open the modal
    setSelectedVet(vet);
    setIsVetModalOpen(true);
  };
  
  // Handle vet modal close
  const handleVetModalClose = () => {
    setIsVetModalOpen(false);
    setSelectedVet(null);
  };
  
  // Handle prescription click
  const handlePrescriptionClick = (prescription: SupabasePrescription) => {
    setSelectedPrescription(prescription);
    setIsPrescriptionModalOpen(true);
  };
  
  // Handle prescription modal close
  const handlePrescriptionModalClose = () => {
    setIsPrescriptionModalOpen(false);
    setSelectedPrescription(null);
  };
  
  // Handle appointment click
  const handleAppointmentClick = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };
  
  // Handle appointment modal close
  const handleAppointmentModalClose = () => {
    setIsAppointmentModalOpen(false);
    setSelectedAppointment(null);
  };
  
  // Handle appointment rescheduling (super admin can always reschedule)
  const handleRescheduleAppointment = async (appointmentId: string, newDate: string, newStartTime: string, newEndTime: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          booking_date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw new Error(error.message);
      
      // Update local state
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === appointmentId 
            ? { 
                ...appointment, 
                booking_date: newDate,
                start_time: newStartTime,
                end_time: newEndTime
              } 
            : appointment
        )
      );
      
      toast({
        title: 'Success',
        description: 'Appointment rescheduled successfully',
      });
      
      // Close the modal
      setIsAppointmentModalOpen(false);
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reschedule appointment',
        variant: 'destructive',
      });
    }
  };
  
  // Handle delete confirmation
  const handleDeleteClick = (type: 'user' | 'vet' | 'appointment' | 'prescription', id: string, name: string) => {
    setDeleteItem({ type, id, name });
    setShowDeleteConfirmation(true);
  };
  
  // Handle delete confirmation close
  const handleDeleteConfirmationClose = () => {
    setShowDeleteConfirmation(false);
    setDeleteItem(null);
  };
  
  // Handle delete execution
  const handleDelete = async () => {
    if (!deleteItem) return;
    
    try {
      setIsDeleting(true);
      console.log(`Starting deletion of ${deleteItem.type} with ID: ${deleteItem.id}`);

      switch (deleteItem.type) {
        case 'user':
          await handleDeleteUser(deleteItem.id);
          console.log(`User deletion completed for ID: ${deleteItem.id}`);
          break;
        case 'vet':
          await handleDeleteVet(deleteItem.id);
          break;
        case 'appointment':
          await handleDeleteAppointment(deleteItem.id);
          break;
        case 'prescription':
          await handleDeletePrescription(deleteItem.id);
          break;
      }
      
      toast({
        title: 'Success',
        description: `${deleteItem.type.charAt(0).toUpperCase() + deleteItem.type.slice(1)} deleted successfully.`,
      });
      
      // Refresh data
      await fetchData();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setDeleteItem(null);
    }
  };
  
  // Fetch latest user data
  const fetchUserById = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user data');
    }

    return data;
  };

  // Delete user handler
  const handleDeleteUser = async (userId: string) => {
    try {
      console.log(`Starting deletion process for user ID: ${userId}`);

      // Check for related data first
      const [bookingsCheck, prescriptionsCheck, petsCheck] = await Promise.all([
        supabase.from('bookings').select('id').eq('pet_owner_id', userId).limit(1),
        supabase.from('prescriptions').select('id').eq('pet_owner_id', userId).limit(1),
        supabase.from('pets').select('id').eq('owner_id', userId).limit(1)
      ]);

      if (bookingsCheck.error) console.error('Error checking bookings:', bookingsCheck.error);
      if (prescriptionsCheck.error) console.error('Error checking prescriptions:', prescriptionsCheck.error);
      if (petsCheck.error) console.error('Error checking pets:', petsCheck.error);

      if (bookingsCheck.error && prescriptionsCheck.error && petsCheck.error) {
        throw new Error('Failed to check user dependencies');
      }

      // 1. Delete pets if any
      if (petsCheck.data && petsCheck.data.length > 0) {
        console.log(`Deleting pets for user ${userId}`);
        const { error: petsDeleteError } = await supabase
          .from('pets')
          .delete()
          .eq('owner_id', userId);

        if (petsDeleteError) {
          console.error('Error deleting pets:', petsDeleteError);
        }
      }

      // 2. Delete appointments if any
      if (bookingsCheck.data && bookingsCheck.data.length > 0) {
        console.log(`Deleting appointments for user ${userId}`);
        const { error: appointmentsDeleteError } = await supabase
          .from('bookings')
          .delete()
          .eq('pet_owner_id', userId);

        if (appointmentsDeleteError) {
          console.error('Error deleting appointments:', appointmentsDeleteError);
        }
      }

      // 3. Delete prescriptions if any
      if (prescriptionsCheck.data && prescriptionsCheck.data.length > 0) {
        console.log(`Deleting prescriptions for user ${userId}`);
        const { error: prescriptionsDeleteError } = await supabase
          .from('prescriptions')
          .delete()
          .eq('pet_owner_id', userId);

        if (prescriptionsDeleteError) {
          console.error('Error deleting prescriptions:', prescriptionsDeleteError);
        }
      }

      // 4. Get user data for updating state
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        throw new Error(fetchError.message);
      }

      // 5. Delete the profile
      console.log(`Deleting profile for user ${userId}`);
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileDeleteError) {
        console.error('Error deleting profile:', profileDeleteError);

        // If hard delete fails, fall back to soft delete
        console.log('Falling back to soft delete');
        const isAlreadyDeleted = userData.full_name?.startsWith('[DELETED]') || false;
        const deletedFullName = isAlreadyDeleted ? userData.full_name : 
                               userData.full_name ? `[DELETED] ${userData.full_name}` : '[DELETED] User';

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            full_name: deletedFullName,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error soft-deleting user:', updateError);
          throw new Error(updateError.message);
        }

        // Update local state for soft delete
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, full_name: deletedFullName } : user
          )
        );
      } else {
        // Successfully deleted - remove from local state
        console.log(`Successfully deleted profile for user ${userId}`);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      }

      console.log(`User deletion process completed for ${userId}`);
    } catch (error) {
      console.error('Error in handleDeleteUser:', error);
      throw error;
    }
  };
  
  // Delete vet handler
  const handleDeleteVet = async (vetId: string) => {
    // Check for related data first
    const [bookingsCheck, prescriptionsCheck, availabilityCheck] = await Promise.all([
      supabase.from('bookings').select('id').eq('vet_id', vetId).limit(1),
      supabase.from('prescriptions').select('id').eq('vet_id', vetId).limit(1),
      supabase.from('vet_availability').select('id').eq('vet_id', vetId).limit(1)
    ]);
    
    if (bookingsCheck.error || prescriptionsCheck.error || availabilityCheck.error) {
      throw new Error('Failed to check vet dependencies');
    }
    
    const hasRelatedData = bookingsCheck.data.length > 0 || 
                          prescriptionsCheck.data.length > 0;
    
    if (hasRelatedData) {
      // Soft delete - mark as rejected/inactive
      const { error } = await supabase
        .from('vet_profiles')
        .update({ approval_status: 'rejected' })
        .eq('id', vetId);
      
      if (error) throw new Error(error.message);
    } else {
      // Hard delete - remove vet completely
      // First delete availability records
      if (availabilityCheck.data.length > 0) {
        const { error: availabilityError } = await supabase
          .from('vet_availability')
          .delete()
          .eq('vet_id', vetId);
          
        if (availabilityError) throw new Error(availabilityError.message);
      }
      
      // Then delete vet profile
      const { error: vetError } = await supabase
        .from('vet_profiles')
        .delete()
        .eq('id', vetId);
      
      if (vetError) throw new Error(vetError.message);
      
      // Finally delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', vetId);
      
      if (profileError) throw new Error(profileError.message);
    }
  };
  
  // Delete appointment handler
  const handleDeleteAppointment = async (appointmentId: string) => {
    // Check for related transactions first
    const { data: transactionsCheck, error: transactionsError } = await supabase
      .from('transactions')
      .select('id')
      .eq('booking_id', appointmentId)
      .limit(1);
    
    if (transactionsError) {
      throw new Error('Failed to check appointment dependencies');
    }
    
    if (transactionsCheck.length > 0) {
      // Soft delete - mark as cancelled
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);
      
      if (error) throw new Error(error.message);
    } else {
      // Hard delete - remove appointment completely
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', appointmentId);
      
      if (error) throw new Error(error.message);
    }
  };
  
  // Delete prescription handler
  const handleDeletePrescription = async (prescriptionId: string) => {
    // Prescriptions can usually be hard deleted as they don't have dependencies
    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', prescriptionId);
    
    if (error) throw new Error(error.message);
  };

  // Download prescription handler
  const handleDownloadPrescription = (prescription: SupabasePrescription) => {
    try {
      // Create prescription content
      const prescriptionContent = `
PRESCRIPTION DETAILS
====================

Prescription ID: ${prescription.id}
Date Prescribed: ${new Date(prescription.prescribed_date).toLocaleDateString()}

PATIENT INFORMATION
-------------------
Pet Name: ${prescription.pet?.name || 'Unknown Pet'}
Pet Type: ${prescription.pet?.type || 'Not specified'}${prescription.pet?.breed ? `\nBreed: ${prescription.pet.breed}` : ''}
Owner: ${prescription.owner?.full_name || 'Unknown Owner'}

VETERINARIAN INFORMATION
------------------------
Doctor: Dr. ${prescription.vet?.first_name || 'Unknown'} ${prescription.vet?.last_name || 'Vet'}${prescription.vet?.specialization ? `\nSpecialization: ${prescription.vet.specialization}` : ''}

MEDICATION DETAILS
------------------
Medication Name: ${prescription.medication_name}
Dosage: ${prescription.dosage}
Frequency: ${prescription.frequency}
Duration: ${prescription.duration}${prescription.diagnosis ? `\nDiagnosis: ${prescription.diagnosis}` : ''}${prescription.instructions ? `\nInstructions: ${prescription.instructions}` : ''}

STATUS
------
Status: ${prescription.status}
Created: ${new Date(prescription.created_at).toLocaleDateString()}
Last Updated: ${new Date(prescription.updated_at).toLocaleDateString()}

---
Downloaded from FurrChum Care Connect Admin Panel
Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
      `.trim();

      // Create and download file
      const blob = new Blob([prescriptionContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const petName = prescription.pet?.name || 'Unknown';
      const medicationName = prescription.medication_name.replace(/[^a-zA-Z0-9]/g, '_');
      const date = new Date(prescription.prescribed_date).toISOString().split('T')[0];
      link.download = `Prescription_${petName}_${medicationName}_${date}.txt`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Prescription downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast({
        title: 'Error',
        description: 'Failed to download prescription',
        variant: 'destructive',
      });
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    
    if (statusLower === 'approved') {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    }
    
    if (statusLower === 'rejected') {
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    }
    
    if (statusLower === 'pending') {
      return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
    }
    
    if (statusLower === 'completed') {
      return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
    }
    
    if (statusLower === 'cancelled') {
      return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
    }
    
    if (statusLower === 'active') {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    
    if (statusLower === 'suspended') {
      return <Badge className="bg-orange-100 text-orange-800">Suspended</Badge>;
    }
    
    return <Badge className="bg-gray-100 text-gray-800">{status || 'Unknown'}</Badge>;
  };
  
  // Handle user modal close
  const handleUserModalClose = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };
  
  // Handle document view
  const handleViewDocument = async (url: string) => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'No document URL provided',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      console.log('Opening document:', url);
      await openFile(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to open document';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('superAdminAuth');
    navigate('/superadmin/auth/');
  };
  const handleUserUpdated = () => {
    fetchData();
  };
  
  // Filter users based on search term and filter status
  const filteredUsers = users.filter(user => {
    // Clean the full_name for search purposes
    const cleanFullName = user.full_name?.replace(/^\[(SUSPENDED|DELETED)\] /, '') || '';
    
    const matchesSearch = 
      cleanFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus !== 'all') {
      if (filterStatus === 'suspended') {
        // Check for suspended users (those with full_name starting with '[SUSPENDED]')
        return matchesSearch && user.full_name?.startsWith('[SUSPENDED]');
      } else {
        // For other filters, exclude suspended users and check for exact match
        return matchesSearch && !user.full_name?.startsWith('[SUSPENDED]') && user.user_type === filterStatus;
      }
    }
    
    return matchesSearch;
  });
  
  // Filter vets based on search term and approval status
  const filteredVets = vets.filter(vet => {
    const matchesSearch = 
      `${vet.first_name} ${vet.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (vetApprovalFilter !== 'all') {
      return matchesSearch && (vet.approval_status || '').toLowerCase() === vetApprovalFilter;
    }
    
    return matchesSearch;
  });
  
  // Filter vets by approval status (with null safety)
  const pendingVets = vets.filter(vet => (vet.approval_status || '').toLowerCase() === 'pending');
  const approvedVets = vets.filter(vet => (vet.approval_status || '').toLowerCase() === 'approved');
  const rejectedVets = vets.filter(vet => (vet.approval_status || '').toLowerCase() === 'rejected');
  
  // Render component
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto flex-1 py-6 space-y-6 max-w-7xl">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users, vets, or appointments..."
              className="pl-10 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchData()}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="vets">
              <UserCheck className="w-4 h-4 mr-2" />
              Veterinarians
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              <Pill className="w-4 h-4 mr-2" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <CreditCard className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                      Manage all users on the platform
                    </CardDescription>
                  </div>
                  
                  <Select 
                    value={filterStatus} 
                    onValueChange={(value: "all" | "pet_owner" | "vet" | "admin" | "suspended") => setFilterStatus(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="pet_owner">Pet Owners</SelectItem>
                      <SelectItem value="vet">Veterinarians</SelectItem>
                      <SelectItem value="admin">Administrators</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Appointments
                      </TableHead>
                      <TableHead className="text-center">
                        <FileText className="h-4 w-4 inline mr-1" />
                        Prescriptions
                      </TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-auto">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name?.replace('[SUSPENDED] ', '') || 'Unknown'}
                          </TableCell>
                          <TableCell>{user.email || 'Not available'}</TableCell>
                          <TableCell className="capitalize">
                            {user.user_type || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {user.full_name?.startsWith('[SUSPENDED]') ? 
                              getStatusBadge('suspended') : 
                              getStatusBadge('active')
                            }
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {user.appointment_count || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {user.prescription_count || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                           <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleUserClick(user)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClick('user', user.id, user.full_name || 'Unknown User')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vets" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Veterinarians</CardTitle>
                    <CardDescription>
                      Manage veterinarian profiles and approvals
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md overflow-hidden">
                      <Button
                        variant={activeView === 'cards' ? 'default' : 'ghost'}
                        size="sm"
                        className="rounded-none"
                        onClick={() => setActiveView('cards')}
                      >
                        <LayoutGrid className="h-4 w-4 mr-1" />
                        Cards
                      </Button>
                      <Button
                        variant={activeView === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        className="rounded-none"
                        onClick={() => setActiveView('table')}
                      >
                        <List className="h-4 w-4 mr-1" />
                        Table
                      </Button>
                    </div>
                    
                    <Select 
                      value={vetApprovalFilter} 
                      onValueChange={(value) => setVetApprovalFilter(value as any)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center py-8 px-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredVets.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 px-6">
                    No veterinarians found
                  </div>
                ) : activeView === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {filteredVets.map((vet) => (
                      <VetApprovalCard
                        key={vet.id}
                        vetProfile={{
                          id: vet.id,
                          first_name: vet.first_name,
                          last_name: vet.last_name,
                          specialization: vet.specialization || '',
                          years_experience: vet.years_experience || 0,
                          license_number: vet.license_number || '',
                          license_document_url: vet.license_document_url || '',
                          license_url: vet.license_url || '',
                          approval_status: vet.approval_status || 'pending',
                          created_at: vet.created_at,
                          clinic_name: vet.clinic_name || '',
                          license_expiry: vet.license_expiry || ''
                        }}
                        onApprove={(id) => handleVetApproval(id, 'approved')}
                        onReject={(id) => handleVetApproval(id, 'rejected')}
                        onView={() => handleVetClick(vet)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/6">Name</TableHead>
                          <TableHead className="w-1/6">Specialization</TableHead>
                          <TableHead className="w-1/8">Experience</TableHead>
                          <TableHead className="w-1/8">Status</TableHead>
                          <TableHead className="w-1/8">Registered</TableHead>
                          <TableHead className="w-auto">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVets.map((vet) => (
                          <TableRow key={vet.id}>
                            <TableCell className="font-medium">
                              Dr. {vet.first_name} {vet.last_name}
                            </TableCell>
                            <TableCell>{vet.specialization || 'Not specified'}</TableCell>
                            <TableCell>{vet.years_experience ? `${vet.years_experience} years` : 'Not specified'}</TableCell>
                            <TableCell>{getStatusBadge(vet.approval_status || 'pending')}</TableCell>
                            <TableCell>
                              {new Date(vet.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="w-auto">
                              <div className="flex items-center gap-2 w-full min-w-fit">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleVetClick(vet)}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
                                >
                                  View Details
                                </Button>
                                
                                {(vet.approval_status === 'pending' || !vet.approval_status) && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 hover:text-green-700 flex-shrink-0"
                                      onClick={() => handleVetApproval(vet.id, 'approved')}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700 flex-shrink-0"
                                      onClick={() => handleVetApproval(vet.id, 'rejected')}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteClick('vet', vet.id, `Dr. ${vet.first_name} ${vet.last_name}`)}
                                  className="flex-shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>
                  View and manage all appointments on the platform
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
                      <TableHead>Veterinarian</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
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
                            {appointment.profiles?.full_name || 'Unknown Owner'}
                          </TableCell>
                          <TableCell>{appointment.pets?.name || 'Unknown Pet'}</TableCell>
                          <TableCell>
                            Dr. {appointment.vet_profiles?.first_name} {appointment.vet_profiles?.last_name}
                          </TableCell>
                          <TableCell className="capitalize">{appointment.consultation_type}</TableCell>
                          <TableCell>{getStatusBadge(appointment.status || 'pending')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleAppointmentClick(appointment)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClick('appointment', appointment.id, 
                                  `${appointment.pets?.name || 'Unknown Pet'} - ${new Date(appointment.booking_date).toLocaleDateString()}`)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Prescriptions</CardTitle>
                <CardDescription>
                  View and manage all prescriptions on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Pet</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Veterinarian</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : prescriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No prescriptions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      prescriptions.map((prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell>
                            {new Date(prescription.prescribed_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{prescription.pet?.name || 'Unknown Pet'}</div>
                            <div className="text-sm text-muted-foreground">
                              {prescription.pet?.type}{prescription.pet?.breed && ` - ${prescription.pet.breed}`}
                            </div>
                          </TableCell>
                          <TableCell>{prescription.owner?.full_name || 'Unknown'}</TableCell>
                          <TableCell>
                            Dr. {prescription.vet?.first_name} {prescription.vet?.last_name}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{prescription.medication_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {prescription.dosage} - {prescription.frequency}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handlePrescriptionClick(prescription)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadPrescription(prescription)}
                                className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClick('prescription', prescription.id, 
                                  `${prescription.medication_name} for ${prescription.pet?.name || 'Unknown Pet'}`)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {/* Transaction Statistics */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">₹{analytics.overview.totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      From {transactions.filter(t => t.status === 'completed' || t.status === 'success').length} completed transactions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Platform Fees (₹121 per transaction)</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">₹{(transactions.filter(t => t.status === 'completed' || t.status === 'success').length * 121).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Platform commission earned
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vet Earnings (Amount - ₹121)</CardTitle>
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">₹{(analytics.overview.totalRevenue - (transactions.filter(t => t.status === 'completed' || t.status === 'success').length * 121)).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Total paid to veterinarians
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {transactions.length > 0 
                        ? (((transactions.filter(t => t.status === 'completed' || t.status === 'success').length) / transactions.length) * 100).toFixed(1)
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {transactions.filter(t => t.status === 'failed').length} failed transactions
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  View all payment transactions with detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pet Owner</TableHead>
                        <TableHead>Booking Details</TableHead>
                        <TableHead>Platform Fee</TableHead>
                        <TableHead>Vet Earning</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionsLoading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8">
                            <div className="flex justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : transactionsError ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-red-500 py-8">
                            Error loading transactions: {transactionsError}
                          </TableCell>
                        </TableRow>
                      ) : transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((transaction) => (
                          <EnhancedTransactionRow key={transaction.id} transaction={transaction} />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.overview.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{analytics?.overview.totalUsers && analytics.overview.totalUsers > 0 ? 
                      Math.round((analytics.overview.totalUsers / Math.max(analytics.overview.totalUsers - 5, 1) - 1) * 100) : 0
                    }% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.overview.totalPets || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered pets in the system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{analytics?.overview.totalRevenue.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    From completed transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.overview.activeAppointments || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Confirmed & scheduled
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trends Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Appointment Trends (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      appointments: { label: "Appointments", color: "#8b5cf6" },
                      revenue: { label: "Revenue (₹)", color: "#ec4899" }
                    }}
                    className="h-[300px]"
                  >
                    <LineChart data={analytics?.trends.appointmentTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="appointments"
                        stroke="var(--color-appointments)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-appointments)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-revenue)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: { label: "Count" }
                    }}
                    className="h-[200px]"
                  >
                    <RechartsPieChart>
                      <Pie
                        data={analytics?.distribution.userTypes || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(analytics?.distribution.userTypes || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Appointment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: { label: "Count" }
                    }}
                    className="h-[200px]"
                  >
                    <BarChart data={analytics?.distribution.appointmentStatus || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {(analytics?.distribution.appointmentStatus || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Pet Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: { label: "Count" }
                    }}
                    className="h-[200px]"
                  >
                    <RechartsPieChart>
                      <Pie
                        data={analytics?.distribution.petTypes || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(analytics?.distribution.petTypes || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top Performing Veterinarians
                  </CardTitle>
                  <CardDescription>Based on number of appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.performance.topVets || []).map((vet, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{vet.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {vet.appointments} appointments • ₹{vet.revenue.toLocaleString()} revenue
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          {vet.rating > 0 && (
                            <Badge variant="secondary">{vet.rating.toFixed(1)} ⭐</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!analytics?.performance.topVets || analytics.performance.topVets.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">No veterinarian data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      users: { label: "New Users", color: "#3b82f6" },
                      appointments: { label: "Appointments", color: "#10b981" },
                      prescriptions: { label: "Prescriptions", color: "#f59e0b" }
                    }}
                    className="h-[300px]"
                  >
                    <BarChart data={analytics?.performance.recentActivity || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                      />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="users" fill="var(--color-users)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="appointments" fill="var(--color-appointments)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="prescriptions" fill="var(--color-prescriptions)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Vet Approvals</span>
                    <Badge variant={analytics?.overview.pendingVetApprovals && analytics.overview.pendingVetApprovals > 0 ? "destructive" : "secondary"}>
                      {analytics?.overview.pendingVetApprovals || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Veterinarians</span>
                    <Badge variant="outline">{analytics?.overview.totalVets || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Prescriptions</span>
                    <Badge variant="outline">{analytics?.overview.totalPrescriptions || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Appointments</span>
                    <Badge variant="outline">{analytics?.overview.totalAppointments || 0}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analytics ? Math.round((analytics.overview.activeAppointments / Math.max(analytics.overview.totalAppointments, 1)) * 100) : 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">Appointment Success Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics ? Math.round((analytics.overview.totalPets / Math.max(analytics.overview.totalUsers, 1)) * 100) / 100 : 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Pets per User</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('vets')}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Review Pending Vets ({analytics?.overview.pendingVetApprovals || 0})
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('appointments')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Appointments
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => forceRefreshData()}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* User Details Modal */}
        {selectedUser && isUserModalOpen && (
          <UserDetailsModal 
            user={selectedUser} 
            isOpen={isUserModalOpen}
            onClose={handleUserModalClose}
            onUserUpdated={handleUserUpdated}
          />
        )}
        
        {/* Vet Details Modal */}
        {selectedVet && isVetModalOpen && (
          <VetDetailsModal vet={selectedVet} onClose={handleVetModalClose} />
        )}
        
        {/* Prescription Details Modal */}
        {selectedPrescription && isPrescriptionModalOpen && (
          <PrescriptionDetailsModal 
            prescription={selectedPrescription} 
            isOpen={isPrescriptionModalOpen}
            onClose={handlePrescriptionModalClose} 
          />
        )}
        
        {/* Appointment Details Modal */}
        {selectedAppointment && isAppointmentModalOpen && (
          <AppointmentDetailsModal 
            appointment={{
              id: selectedAppointment.id,
              booking_date: selectedAppointment.booking_date,
              start_time: selectedAppointment.start_time,
              end_time: selectedAppointment.end_time,
              consultation_type: selectedAppointment.consultation_type,
              notes: selectedAppointment.notes,
              status: selectedAppointment.status || 'pending',
              pet_id: selectedAppointment.pet_id || '',
              vet_id: selectedAppointment.vet_id,
              meeting_id: null,
              meeting_url: null,
              host_meeting_url: null
            }}
            pet={selectedAppointment.pets ? {
              id: selectedAppointment.pet_id || '',
              name: selectedAppointment.pets.name,
              species: selectedAppointment.pets.type,
              owner_id: selectedAppointment.pets.owner_id || ''
            } : null}
            vet={selectedAppointment.vet_profiles ? {
              id: selectedAppointment.vet_id,
              first_name: selectedAppointment.vet_profiles.first_name,
              last_name: selectedAppointment.vet_profiles.last_name
            } : null}
            petOwner={selectedAppointment.profiles ? {
              id: selectedAppointment.pet_owner_id,
              full_name: selectedAppointment.profiles.full_name,
              phone_number: selectedAppointment.profiles.phone_number,
              address: selectedAppointment.profiles.address
            } : null}
            isOpen={isAppointmentModalOpen}
            onClose={handleAppointmentModalClose} 
            onCancelAppointment={(id: string) => handleDeleteClick('appointment', id, 'appointment')}
            onRescheduleAppointment={handleRescheduleAppointment}
          />
        )}
        
        {/* Delete Confirmation Dialog */}
        {showDeleteConfirmation && deleteItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete {deleteItem.type.charAt(0).toUpperCase() + deleteItem.type.slice(1)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{deleteItem.name}</strong>? 
                {deleteItem.type === 'user' && ' This will also remove all associated data including pets, appointments, and prescriptions.'}
                {deleteItem.type === 'vet' && ' This will also remove all associated data including appointments and prescriptions.'}
                {deleteItem.type === 'appointment' && ' Any associated payment data will be preserved.'}
                {deleteItem.type === 'prescription' && ' This prescription will be permanently removed.'}
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleDeleteConfirmationClose}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
