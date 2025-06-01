// Supabase database types for Furrchum Care Connect

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  avatar_url?: string | null;
  email?: string | null;
  user_type: string; // 'pet_owner' | 'vet'
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
}

export interface VetProfile {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  specialization: string | null;
  years_experience: number | null;
  consultation_fee: number | null;
  gender: string | null;
  languages: string[] | null;
  availability: string | null;
  rating: number | null;
  image_url: string | null;
  location: any | null; // JSONB field
  zip_code: string | null;
  about: string | null;
  phone: string | null;
  license_url: string | null;
  clinic_images: string[] | null;
  clinic_location: string | null;
  offers_video_calls: boolean | null;
  offers_in_person: boolean | null;
  approval_status: 'pending' | 'approved' | 'rejected' | null;
  approved_at: string | null;
  approved_by: string | null;
  // Banking fields
  pan_number: string | null;
  gst_number: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  ifsc_code: string | null;
}

export interface Pet {
  id: string;
  created_at?: string;
  updated_at?: string;
  owner_id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  gender?: 'male' | 'female' | 'unknown';
  color?: string;
  microchip_id?: string;
  medical_conditions?: string[];
  allergies?: string[];
  profile_image?: string;
  notes?: string;
}

export interface Booking {
  id: string;
  created_at?: string;
  updated_at?: string;
  vet_id: string;
  pet_id: string;
  pet_owner_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  consultation_type: 'in_person' | 'video_call' | 'video' | 'chat';
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'refunded';
  payment_id?: string;
  
  // Virtual fields for video meetings - not stored in database
  meeting_url?: string;
  host_meeting_url?: string;
  meeting_id?: string;
}

export interface MedicalRecord {
  id: string;
  created_at?: string;
  updated_at?: string;
  pet_id: string;
  vet_id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  follow_up_date?: string;
  attachments?: string[];
}

export interface Prescription {
  id: string;
  created_at?: string;
  updated_at?: string;
  pet_id: string;
  vet_id: string;
  pet_owner_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  instructions?: string;
  status: 'active' | 'completed' | 'cancelled';
  refills?: number;
}

export interface VetAvailability {
  id: string;
  vet_id: string;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Payment {
  id: string;
  created_at?: string;
  updated_at?: string;
  booking_id: string;
  pet_owner_id: string;
  vet_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  payment_method?: string;
  transaction_id?: string;
}

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export type SupabaseResponse<T> = {
  data: T | null;
  error: SupabaseError | null;
};

// Auth related types
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<SupabaseResponse<AuthUser | null>>;
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<SupabaseResponse<AuthUser | null>>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<SupabaseResponse<{ user: AuthUser | null; session: unknown | null }>>;
}
