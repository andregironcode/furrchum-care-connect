import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentTransaction {
  id: string;
  booking_id: string | null;
  amount: number;
  currency: string | null;
  status: string;
  payment_method: string | null;
  created_at: string | null;
  updated_at: string | null;
  pet_owner_id: string | null;
  transaction_reference: string | null;
  description: string | null;
  provider: string | null;
  provider_payment_id: string | null;
  provider_order_id: string | null;
  payment_intent_id: string | null;
  customer_email: string | null;
  
  // Joined data
  booking?: {
    id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    consultation_type: string;
    status: string;
    notes: string | null;
  };
  pet?: {
    id: string;
    name: string;
    type: string;
    breed: string | null;
  };
  vet?: {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string | null;
  };
  owner?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
  };
}

export interface PaymentStats {
  totalAmount: number;
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  thisMonthAmount: number;
  lastMonthAmount: number;
}

type UserRole = 'pet_owner' | 'vet' | 'admin';

interface UsePaymentsOptions {
  userRole: UserRole;
  userId: string;
  limit?: number;
  status?: string;
}

export const usePayments = ({ userRole, userId, limit, status }: UsePaymentsOptions) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('transactions')
        .select(`
          *,
          bookings!transactions_booking_id_fkey (
            id,
            booking_date,
            start_time,
            end_time,
            consultation_type,
            status,
            notes,
            pet_id,
            vet_id,
            pet_owner_id
          )
        `);

      // Filter based on user role
      if (userRole === 'pet_owner') {
        query = query.eq('pet_owner_id', userId);
      } else if (userRole === 'vet') {
        // For vets, we need to filter through bookings
        const { data: vetBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id')
          .eq('vet_id', userId);

        if (bookingsError) throw bookingsError;

        const bookingIds = vetBookings.map(b => b.id);
        if (bookingIds.length === 0) {
          setTransactions([]);
          setStats({
            totalAmount: 0,
            totalTransactions: 0,
            completedTransactions: 0,
            pendingTransactions: 0,
            failedTransactions: 0,
            thisMonthAmount: 0,
            lastMonthAmount: 0,
          });
          setLoading(false);
          return;
        }

        query = query.in('booking_id', bookingIds);
      }
      // For admin, no additional filtering needed (gets all transactions)

      if (status) {
        query = query.eq('status', status);
      }

      if (limit) {
        query = query.limit(limit);
      }

      query = query.order('created_at', { ascending: false });

      const { data: transactionsData, error: transactionsError } = await query;

      if (transactionsError) {
        throw transactionsError;
      }

      // Fetch additional related data
      const enrichedTransactions = await Promise.all(
        (transactionsData || []).map(async (transaction) => {
          const enriched: PaymentTransaction = { ...transaction };

          if (transaction.bookings) {
            enriched.booking = transaction.bookings;

            // Fetch pet data
            if (transaction.bookings.pet_id) {
              const { data: petData } = await supabase
                .from('pets')
                .select('id, name, type, breed')
                .eq('id', transaction.bookings.pet_id)
                .single();
              
              if (petData) enriched.pet = petData;
            }

            // Fetch vet data
            if (transaction.bookings.vet_id) {
              const { data: vetData } = await supabase
                .from('vet_profiles')
                .select('id, first_name, last_name, specialization')
                .eq('id', transaction.bookings.vet_id)
                .single();
              
              if (vetData) enriched.vet = vetData;
            }

            // Fetch pet owner data (for vet and admin views)
            if (transaction.bookings.pet_owner_id && userRole !== 'pet_owner') {
              const { data: ownerData } = await supabase
                .from('profiles')
                .select('id, full_name, phone_number')
                .eq('id', transaction.bookings.pet_owner_id)
                .single();
              
              if (ownerData) enriched.owner = ownerData;
            }
          }

          return enriched;
        })
      );

      setTransactions(enrichedTransactions);

      // Calculate stats
      const totalAmount = enrichedTransactions.reduce((sum, t) => {
        return t.status === 'completed' || t.status === 'success' ? sum + t.amount : sum;
      }, 0);

      const completedCount = enrichedTransactions.filter(t => t.status === 'completed' || t.status === 'success').length;
      const pendingCount = enrichedTransactions.filter(t => t.status === 'pending').length;
      const failedCount = enrichedTransactions.filter(t => t.status === 'failed').length;

      // Calculate monthly amounts
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const thisMonthAmount = enrichedTransactions
        .filter(t => {
          const transactionDate = new Date(t.created_at || '');
          return transactionDate >= thisMonth && (t.status === 'completed' || t.status === 'success');
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const lastMonthAmount = enrichedTransactions
        .filter(t => {
          const transactionDate = new Date(t.created_at || '');
          return transactionDate >= lastMonth && transactionDate <= lastMonthEnd && (t.status === 'completed' || t.status === 'success');
        })
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        totalAmount,
        totalTransactions: enrichedTransactions.length,
        completedTransactions: completedCount,
        pendingTransactions: pendingCount,
        failedTransactions: failedCount,
        thisMonthAmount,
        lastMonthAmount,
      });

    } catch (error: any) {
      console.error('Error fetching payments:', error);
      setError(error.message || 'Failed to fetch payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPayments();
    }
  }, [userRole, userId, limit, status]);

  const refetch = () => {
    fetchPayments();
  };

  return {
    transactions,
    stats,
    loading,
    error,
    refetch,
  };
};

// Helper hook for payment methods (simplified for now)
export const usePaymentMethods = (userId: string) => {
  // Since Razorpay handles payment methods on their end,
  // this is a placeholder for future payment method management
  return {
    paymentMethods: [],
    loading: false,
    error: null,
    addPaymentMethod: () => {},
    removePaymentMethod: () => {},
  };
}; 