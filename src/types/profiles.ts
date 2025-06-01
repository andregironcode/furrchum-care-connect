import { Database } from '@/integrations/supabase/types';

// Type for User Profile from Supabase
export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  user_type: 'vet' | 'pet_owner' | 'admin';
  created_at: string;
  updated_at?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  profile_image_url?: string;
  status?: string;
}

// Type for Vet Profile from Supabase
export interface VetProfile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  license_number?: string;
  license_expiry?: string;
  specialty?: string;
  experience_years?: number;
  consultation_fee?: number | null;
  education?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  bio?: string;
  profile_image_url?: string;
  rating?: number;
  created_at: string;
  updated_at?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  license_document_url?: string;
  license_url?: string; // Added for compatibility with existing code
  clinic_name?: string;
  clinic_address?: string;
  availability?: Record<string, unknown>;
  consultation_modes?: string[];
  is_available?: boolean;
  about?: string;
  specialization?: string;
  years_experience?: number;
  languages?: string[];
  clinic_location?: string;
  offers_in_person?: boolean;
  offers_video_calls?: boolean;
  clinic_images?: string[];
  location?: any;
  image_url?: string;
  // Banking fields
  pan_number?: string;
  gst_number?: string;
  bank_name?: string;
  bank_account_number?: string;
  ifsc_code?: string;
}

// Type for appointment/booking data
export interface Appointment {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  consultation_mode?: 'video' | 'chat' | 'in-person';
  status: string; // 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string | null;
  pet_id: string | null;
  pet_owner_id: string;
  vet_id: string;
  created_at: string;
  updated_at: string;
  payment_status?: 'pending' | 'paid' | 'refunded';
  meeting_url?: string;
  vet_profiles?: {
    first_name: string;
    last_name: string;
  };
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
  pet_owner?: {
    full_name: string;
  };
}

// Type for transaction data
export interface Transaction {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  payment_intent_id?: string;
  customer_email?: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  transaction_reference?: string;
}
