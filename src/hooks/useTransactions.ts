import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Transaction {
  id: string;
  created_at: string;
  updated_at: string;
  booking_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'success';
  payment_method: string | null;
  transaction_reference: string | null;
  description: string | null;
  pet_owner_id: string | null;
  provider: string;
  provider_payment_id: string | null;
  provider_order_id: string | null;
  payment_intent_id: string | null;
  customer_email: string | null;
  // Joined data
  booking?: {
    id: string;
    booking_date: string;
    start_time: string;
    consultation_type: string;
    vet_id: string;
    pet_id: string;
  };
  pet?: {
    id: string;
    name: string;
    type: string;
    breed?: string;
  };
  owner?: {
    id: string;
    full_name: string;
    email?: string;
  };
  vet?: {
    id: string;
    first_name: string;
    last_name: string;
    specialization?: string;
  };
}

export interface TransactionStats {
  totalAmount: number;
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  thisMonthAmount: number;
  lastMonthAmount: number;
  platformFees: number;
  vetEarnings: number;
}

interface UseTransactionsOptions {
  userRole: 'pet_owner' | 'vet' | 'admin';
  userId?: string;
  status?: string;
  limit?: number;
}

export const useTransactions = (options: UseTransactionsOptions) => {
  const { userRole, userId, status, limit = 1000 } = options;
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're in superadmin context FIRST - completely independent of Supabase Auth
      const isSuperAdmin = localStorage.getItem('superAdminAuth') === 'true';
      
      // For admin users OR SuperAdmin, bypass RLS by using service role or special handling
      if (userRole === 'admin' || isSuperAdmin) {
        console.log('🔧 Admin fetching ALL transactions with special handling...');
        console.log('🔐 SuperAdmin context:', isSuperAdmin);
        console.log('🔑 Supabase user context:', !!user);
        let adminTransactions: any[] = [];
        
        if (isSuperAdmin) {
          // For superadmin, we need to bypass RLS - use a direct approach
          // SuperAdmin works COMPLETELY INDEPENDENT of Supabase Auth
          console.log('🔐 SuperAdmin context detected, using server-side API...');
          
          // Primary method - use server-side endpoint with service role
          try {
            const response = await fetch('/api/admin-transactions', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('superAdminAuth')}`,
              },
            });
            
            if (response.ok) {
              const serverData = await response.json();
              console.log('✅ SuperAdmin server-side fetch successful:', serverData.length);
              adminTransactions = serverData;
            } else {
              const errorText = await response.text();
              console.error('❌ Server-side fetch failed:', response.status, errorText);
              throw new Error(`Server-side fetch failed: ${response.status}`);
            }
          } catch (serverError) {
            console.error('❌ Server-side fetch failed completely:', serverError);
            // For SuperAdmin, we don't fallback to direct query since it will fail due to RLS
            // Instead, show a clear error message
            throw new Error('SuperAdmin transaction fetch failed. Please check server-side API.');
          }
        } else if (userRole === 'admin' && user) {
          // Regular admin user (authenticated via Supabase) - only if user is authenticated
          console.log('🔧 Regular admin user with Supabase auth, using direct query...');
          const { data, error: fetchError } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

          if (fetchError) {
            console.error('Admin transaction fetch error:', fetchError);
            throw new Error(fetchError.message);
          }

          console.log('🎯 Regular admin fetched transactions:', data?.length || 0);
          adminTransactions = data || [];
        } else {
          // No valid authentication context
          console.error('❌ No valid admin authentication found');
          throw new Error('Admin authentication required');
        }

        // Transform and set transactions
        const processedTransactions: Transaction[] = adminTransactions.map((transaction: any) => ({
          ...transaction,
          created_at: transaction.created_at || new Date().toISOString(),
          updated_at: transaction.updated_at || new Date().toISOString(),
          currency: transaction.currency || 'INR',
          provider: transaction.provider || 'razorpay',
          status: transaction.status || 'pending',
          payment_method: transaction.payment_method || null,
          transaction_reference: transaction.transaction_reference || null,
          description: transaction.description || null,
          pet_owner_id: transaction.pet_owner_id || null,
          provider_payment_id: transaction.provider_payment_id || null,
          provider_order_id: transaction.provider_order_id || null,
          payment_intent_id: transaction.payment_intent_id || null,
          customer_email: transaction.customer_email || null
        }));

        setTransactions(processedTransactions);

        // Calculate and set stats for admin
        if (processedTransactions.length > 0) {
          const totalAmount = processedTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
          const totalTransactions = processedTransactions.length;
          const completedTransactions = processedTransactions.filter(t => 
            t.status === 'completed' || t.status === 'success'
          ).length;
          const pendingTransactions = processedTransactions.filter(t => t.status === 'pending').length;
          const failedTransactions = processedTransactions.filter(t => t.status === 'failed').length;

          const platformFees = completedTransactions * 121;
          const vetEarnings = totalAmount - platformFees;

          setStats({
            totalAmount,
            totalTransactions,
            completedTransactions,
            pendingTransactions,
            failedTransactions,
            thisMonthAmount: 0,
            lastMonthAmount: 0,
            platformFees,
            vetEarnings
          });
        } else {
          setStats(null);
        }

        return;
      }

      // Regular flow for non-admin users
      let query = supabase
        .from('transactions')
        .select(`
          *,
          bookings!transactions_booking_id_fkey (
            id,
            booking_date,
            start_time,
            consultation_type,
            vet_id,
            pet_id,
            pets!inner (
              id,
              name,
              type,
              breed
            )
          ),
          vet_profiles!transactions_vet_id_fkey (
            id,
            first_name,
            last_name,
            specialization
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply role-based filtering for non-admin users
      if (userRole === 'pet_owner') {
        const currentUserId = userId || user?.id;
        if (!currentUserId) {
          throw new Error('User ID not available');
        }
        query = query.eq('pet_owner_id', currentUserId);
      } else if (userRole === 'vet') {
        // For vets, filter by transactions for their bookings
        const currentUserId = userId || user?.id;
        if (!currentUserId) {
          throw new Error('User ID not available');
        }
        
        const { data: vetBookings } = await supabase
          .from('bookings')
          .select('id')
          .eq('vet_id', currentUserId);
        
        if (vetBookings && vetBookings.length > 0) {
          const bookingIds = vetBookings.map(b => b.id);
          query = query.in('booking_id', bookingIds);
        } else {
          // No bookings found for this vet
          setTransactions([]);
          setStats(null);
          setLoading(false);
          return;
        }
      }

      // Apply status filter if provided
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Get unique pet owner IDs to fetch profile data
      const ownerIds = [...new Set((data || []).map((t: any) => t.pet_owner_id).filter(Boolean))];
      
      // Fetch profile data for pet owners
      let ownerProfiles: any[] = [];
      if (ownerIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ownerIds);
        ownerProfiles = profileData || [];
      }
      
      // Process transactions with joined data
      const processedTransactions: Transaction[] = (data || []).map((transaction: any) => {
        const ownerProfile = ownerProfiles.find(p => p.id === transaction.pet_owner_id);
        return {
          ...transaction,
          booking: transaction.bookings,
          pet: transaction.bookings?.pets || null,
          owner: ownerProfile ? { 
            id: ownerProfile.id, 
            full_name: ownerProfile.full_name 
          } : null,
          vet: transaction.vet_profiles
        };
      });

      setTransactions(processedTransactions);

      // Calculate stats
      if (processedTransactions.length > 0) {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const totalAmount = processedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const totalTransactions = processedTransactions.length;
        const completedTransactions = processedTransactions.filter(t => 
          t.status === 'completed' || t.status === 'success'
        ).length;
        const pendingTransactions = processedTransactions.filter(t => t.status === 'pending').length;
        const failedTransactions = processedTransactions.filter(t => t.status === 'failed').length;

        const thisMonthTransactions = processedTransactions.filter(t => 
          new Date(t.created_at) >= startOfThisMonth
        );
        const thisMonthAmount = thisMonthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

        const lastMonthTransactions = processedTransactions.filter(t => {
          const date = new Date(t.created_at);
          return date >= startOfLastMonth && date <= endOfLastMonth;
        });
        const lastMonthAmount = lastMonthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

        // Calculate platform fees and vet earnings
        const platformFees = completedTransactions * 121; // Fixed ₹121 per completed transaction
        const vetEarnings = totalAmount - platformFees;

        setStats({
          totalAmount,
          totalTransactions,
          completedTransactions,
          pendingTransactions,
          failedTransactions,
          thisMonthAmount,
          lastMonthAmount,
          platformFees,
          vetEarnings
        });
      } else {
        setStats(null);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we're in SuperAdmin context first - works without Supabase Auth
    const isSuperAdmin = localStorage.getItem('superAdminAuth') === 'true';
    
    if (isSuperAdmin) {
      console.log('🔄 SuperAdmin: Fetching transactions without Supabase Auth dependency');
      fetchTransactions();
    } else if (user && (userRole === 'admin' || userId || user.id)) {
      console.log('🔄 Regular user: Fetching transactions with Supabase Auth');
      fetchTransactions();
    } else {
      console.log('⏸️ Waiting for authentication...', { userRole, hasUser: !!user });
    }
  }, [userRole, userId, status, user, limit]);

  const refetch = () => {
    fetchTransactions();
  };

  return {
    transactions,
    stats,
    loading,
    error,
    refetch
  };
}; 