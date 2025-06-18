export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string
          content: string
          featured_image: string | null
          author_name: string
          author_avatar: string | null
          tags: string[]
          category: string
          reading_time: number
          published: boolean
          is_featured: boolean
          meta_title: string | null
          meta_description: string | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt: string
          content: string
          featured_image?: string | null
          author_name?: string
          author_avatar?: string | null
          tags?: string[]
          category?: string
          reading_time?: number
          published?: boolean
          is_featured?: boolean
          meta_title?: string | null
          meta_description?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          featured_image?: string | null
          author_name?: string
          author_avatar?: string | null
          tags?: string[]
          category?: string
          reading_time?: number
          published?: boolean
          is_featured?: boolean
          meta_title?: string | null
          meta_description?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          consultation_type: string
          created_at: string
          end_time: string
          id: string
          notes: string | null
          pet_id: string | null
          pet_owner_id: string
          start_time: string
          status: string
          updated_at: string
          vet_id: string
          payment_status: string | null
          meeting_id: string | null
          meeting_url: string | null
          host_meeting_url: string | null
          payment_id: string | null
          payment_provider: string | null
          payment_data: Json | null
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
        }
        Insert: {
          booking_date: string
          consultation_type: string
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          pet_id?: string | null
          pet_owner_id: string
          start_time: string
          status?: string
          updated_at?: string
          vet_id: string
          payment_status?: string | null
          meeting_id?: string | null
          meeting_url?: string | null
          host_meeting_url?: string | null
          payment_id?: string | null
          payment_provider?: string | null
          payment_data?: Json | null
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
        }
        Update: {
          booking_date?: string
          consultation_type?: string
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          pet_id?: string | null
          pet_owner_id?: string
          start_time?: string
          status?: string
          updated_at?: string
          vet_id?: string
          payment_status?: string | null
          meeting_id?: string | null
          meeting_url?: string | null
          host_meeting_url?: string | null
          payment_id?: string | null
          payment_provider?: string | null
          payment_data?: Json | null
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "vet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          created_at: string
          created_by: string | null
          diagnosis: string | null
          id: string
          notes: string | null
          pet_id: string
          record_date: string
          treatment: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          diagnosis?: string | null
          id?: string
          notes?: string | null
          pet_id: string
          record_date?: string
          treatment?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          diagnosis?: string | null
          id?: string
          notes?: string | null
          pet_id?: string
          record_date?: string
          treatment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          age: number | null
          allergies: string | null
          breed: string | null
          chip_number: string | null
          color: string | null
          created_at: string
          diet_type: string | null
          favorite_activity: string | null
          gender: string | null
          id: string
          medical_history: string | null
          medication: string | null
          name: string
          owner_id: string
          photo_url: string | null
          special_needs: string | null
          status: string | null
          temperament: string | null
          training_level: string | null
          type: string
          updated_at: string
          vaccination_status: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          breed?: string | null
          chip_number?: string | null
          color?: string | null
          created_at?: string
          diet_type?: string | null
          favorite_activity?: string | null
          gender?: string | null
          id?: string
          medical_history?: string | null
          medication?: string | null
          name: string
          owner_id: string
          photo_url?: string | null
          special_needs?: string | null
          status?: string | null
          temperament?: string | null
          training_level?: string | null
          type: string
          updated_at?: string
          vaccination_status?: string | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string | null
          breed?: string | null
          chip_number?: string | null
          color?: string | null
          created_at?: string
          diet_type?: string | null
          favorite_activity?: string | null
          gender?: string | null
          id?: string
          medical_history?: string | null
          medication?: string | null
          name?: string
          owner_id?: string
          photo_url?: string | null
          special_needs?: string | null
          status?: string | null
          temperament?: string | null
          training_level?: string | null
          type?: string
          updated_at?: string
          vaccination_status?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          diagnosis: string | null
          dosage: string
          duration: string
          frequency: string
          id: string
          instructions: string | null
          medication_name: string
          pet_id: string
          pet_owner_id: string
          prescribed_date: string
          status: string
          updated_at: string
          vet_id: string
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          dosage: string
          duration: string
          frequency: string
          id?: string
          instructions?: string | null
          medication_name: string
          pet_id: string
          pet_owner_id: string
          prescribed_date?: string
          status?: string
          updated_at?: string
          vet_id: string
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          instructions?: string | null
          medication_name?: string
          pet_id?: string
          pet_owner_id?: string
          prescribed_date?: string
          status?: string
          updated_at?: string
          vet_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_type: string
          phone_number: string | null
          address: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          user_type: string
          phone_number?: string | null
          address?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_type?: string
          phone_number?: string | null
          address?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          payment_method: string | null
          status: string
          transaction_reference: string | null
          updated_at: string | null
          pet_owner_id: string | null
          provider: string | null
          provider_payment_id: string | null
          provider_order_id: string | null
          payment_intent_id: string | null
          customer_email: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_reference?: string | null
          updated_at?: string | null
          pet_owner_id?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          provider_order_id?: string | null
          payment_intent_id?: string | null
          customer_email?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_reference?: string | null
          updated_at?: string | null
          pet_owner_id?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          provider_order_id?: string | null
          payment_intent_id?: string | null
          customer_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_pet_owner_id_fkey"
            columns: ["pet_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vet_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          updated_at: string
          vet_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          updated_at?: string
          vet_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          updated_at?: string
          vet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vet_availability_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "vet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vet_profiles: {
        Row: {
          about: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          availability: string | null
          bank_account_number: string | null
          bank_name: string | null
          clinic_images: string[] | null
          clinic_location: string | null
          consultation_fee: number | null
          created_at: string
          first_name: string
          gender: string | null
          gst_number: string | null
          id: string
          ifsc_code: string | null
          image_url: string | null
          languages: string[] | null
          last_name: string
          license_url: string | null
          location: Json | null
          offers_in_person: boolean | null
          offers_video_calls: boolean | null
          pan_number: string | null
          phone: string | null
          rating: number | null
          specialization: string | null
          updated_at: string
          years_experience: number | null
          zip_code: string | null
        }
        Insert: {
          about?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          availability?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          clinic_images?: string[] | null
          clinic_location?: string | null
          consultation_fee?: number | null
          created_at?: string
          first_name: string
          gender?: string | null
          gst_number?: string | null
          id: string
          ifsc_code?: string | null
          image_url?: string | null
          languages?: string[] | null
          last_name: string
          license_url?: string | null
          location?: Json | null
          offers_in_person?: boolean | null
          offers_video_calls?: boolean | null
          pan_number?: string | null
          phone?: string | null
          rating?: number | null
          specialization?: string | null
          updated_at?: string
          years_experience?: number | null
          zip_code?: string | null
        }
        Update: {
          about?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          availability?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          clinic_images?: string[] | null
          clinic_location?: string | null
          consultation_fee?: number | null
          created_at?: string
          first_name?: string
          gender?: string | null
          gst_number?: string | null
          id?: string
          ifsc_code?: string | null
          image_url?: string | null
          languages?: string[] | null
          last_name?: string
          license_url?: string | null
          location?: Json | null
          offers_in_person?: boolean | null
          offers_video_calls?: boolean | null
          pan_number?: string | null
          phone?: string | null
          rating?: number | null
          specialization?: string | null
          updated_at?: string
          years_experience?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vet_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_blog_post_views: {
        Args: {
          post_slug: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
