import { useState, useEffect, useCallback, ChangeEvent, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Edit2, FileText, MapPin, Video, User, Camera, Upload, Trash2, Save } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from "@/integrations/supabase/client";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import PhoneInput from '@/components/ui/phone-input';
import PinCodeInput from '@/components/ui/pin-code-input';
import VetAvailabilityForm from '@/pages/VetProfile/VetAvailabilityForm';

// Function to get coordinates from ZIP code using OpenStreetMap Nominatim
const getCoordinatesFromZipCode = async (zipCode: string, countryCode = 'in'): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zipCode)}&country=${countryCode}&format=json`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch coordinates');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
};

// Define the database response type to ensure it matches the actual DB schema
type VetProfileDB = {
  id: string;
  user_id?: string;
  first_name: string | null;
  last_name: string | null;
  specialization: string | null;
  about: string | null;
  consultation_fee: number | null;
  image_url: string | null;
  years_experience: number | null;
  phone: string | null;
  gender: string | null;
  languages: string[] | null;
  zip_code: string | null;
  license_url: string | null;
  clinic_location: string | null;
  clinic_images: string[] | null;
  offers_video_calls: boolean | null; // Database field name 
  offers_in_person: boolean | null;
  latitude: number | null;
  longitude: number | null;
  approval_status: string | null;
  approved_at: string | null;
  approved_by: string | null;
  availability: string | null;
  clinic_name: string | null;
  created_at: string | null;
  updated_at: string | null;
  experience_years: number | null;
  is_available: boolean | null;
  profile_image: string | null;
  qualifications: string | null;
  services: string | null;
  state: string | null;
};

// Client-side representation with proper types
interface VetProfile {
  id: string; // Primary key, matches the user's ID
  first_name: string;
  last_name: string;
  specialization: string;
  about: string;
  consultation_fee: number;
  image_url: string;
  years_experience: number;
  phone: string;
  gender: string;
  languages: string[];
  zip_code: string;
  license_url: string;
  clinic_location: string;
  clinic_images: string[];
  offers_telemedicine: boolean; // Our UI field that maps to offers_video_calls in DB
  offers_in_person: boolean;
  user_id?: string;
  // Optional fields that might come from the database
  offers_video_calls?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  approval_status?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  availability?: string | null;
  clinic_name?: string;
  created_at?: string;
  updated_at?: string;
  experience_years?: number;
  is_available?: boolean;
  profile_image?: string | null;
  qualifications?: string | null;
  services?: string | null;
  state?: string;
}

const VetProfilePage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<VetProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [uploadingClinicImages, setUploadingClinicImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<File | null>(null);
  const [selectedClinicImages, setSelectedClinicImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [clinicImagePreviews, setClinicImagePreviews] = useState<string[]>([]);
  const [defaultValues, setDefaultValues] = useState<Partial<VetProfile>>({});
  const [languagesInput, setLanguagesInput] = useState<string>('');
  
  // Track if user has made changes to prevent auth-triggered resets
  const hasUnsavedChangesRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  
  // Track form values to detect changes
  const [initialFormValues, setInitialFormValues] = useState<VetProfile | null>(null);

  // Optional coordinates state for location services
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  // Validation schema for vet profile form
  const vetProfileSchema = z.object({
    id: z.string(),
    first_name: z.string().min(1, { message: 'First name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
    specialization: z.string().min(1, { message: 'Specialization is required' }),
    about: z.string().min(1, { message: 'About section is required' }),
    consultation_fee: z.number().min(0, { message: 'Consultation fee must be 0 or greater' }),
    image_url: z.string().optional().or(z.literal('')),
    years_experience: z.number().min(0, { message: 'Years of experience must be 0 or greater' }).int({ message: 'Must be a whole number' }),
    phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }).max(15, { message: 'Phone number is too long' }),
    gender: z.string().min(1, { message: 'Gender is required' }),
    languages: z.array(z.string()).min(1, { message: 'At least one language is required' }),
    zip_code: z.string().length(6, { message: 'PIN code must be 6 digits' }).regex(/^\d+$/, { message: 'PIN code must contain only numbers' }),
    license_url: z.string().optional().or(z.literal('')),
    clinic_location: z.string().min(1, { message: 'Clinic location is required' }),
    clinic_images: z.array(z.string()).optional().or(z.array(z.string()).length(0)),
    offers_telemedicine: z.boolean(),
    offers_in_person: z.boolean()
  }).refine(data => data.offers_telemedicine || data.offers_in_person, {
    message: "Online consultations are compulsory for all veterinarians",
    path: ["offers_telemedicine"]
  });

  const form = useForm<VetProfile>({
    resolver: zodResolver(vetProfileSchema),
    defaultValues: {
      id: '',
      first_name: '',
      last_name: '',
      specialization: '',
      about: '',
      consultation_fee: 0,
      image_url: '',
      years_experience: 0,
      phone: '',
      gender: '',
      languages: [],
      zip_code: '',
      license_url: '',
      clinic_location: '',
      clinic_images: [],
      offers_telemedicine: true, // Make online consultations compulsory by default
      offers_in_person: false,
      ...defaultValues,
    },
  });

  const createVetProfile = async () => {
    if (!user?.id) return null;

    try {
      console.log('Creating new vet profile for user:', user.id);
      
      // Create initial profile data
      const newProfile = {
        id: user.id, // Primary key in the vet_profiles table
        first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        specialization: 'General Veterinarian',
        about: 'Please update your profile with information about your veterinary experience and expertise.',
        consultation_fee: 0,
        years_experience: 0,
        phone: '',
        gender: '',
        languages: ['English'], // Set default language to pass validation
        zip_code: '',
        image_url: user.user_metadata?.avatar_url || '',
        license_url: '',
        clinic_location: '',
        clinic_images: [],
        offers_video_calls: true, // Make online consultations compulsory
        offers_in_person: true // Set default to true to pass validation
      };

      const { data, error } = await supabase
        .from('vet_profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) throw error;

      console.log('Created new vet profile:', data);
      
      // Convert to our VetProfile type
      const sanitizedProfile: VetProfile = {
        id: data.id || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        specialization: data.specialization || '',
        about: data.about || '',
        consultation_fee: Number(data.consultation_fee) || 0,
        image_url: data.image_url || '',
        years_experience: Number(data.years_experience) || 0,
        phone: data.phone || '',
        gender: data.gender || '',
        languages: Array.isArray(data.languages) ? data.languages : [],
        zip_code: data.zip_code || '',
        license_url: data.license_url || '',
        clinic_location: data.clinic_location || '',
        clinic_images: Array.isArray(data.clinic_images) ? data.clinic_images : [],
        offers_telemedicine: Boolean(data.offers_video_calls),
        offers_in_person: Boolean(data.offers_in_person)
      };
      
      return sanitizedProfile;
    } catch (error) {
      console.error('Error creating vet profile:', error);
      toast.error('Failed to create profile');
      return null;
    }
  };

  // Check if the database has the required columns and log instructions if not
  const checkDatabaseSchema = async () => {
    try {
      // Try to query a record with the new columns
      const { data, error } = await supabase
        .from('vet_profiles')
        .select('id,latitude,longitude,offers_video_calls,offers_in_person')
        .limit(1);

      if (error) {
        if ((error as any).code === '42703') { // Undefined column error
          console.warn('Database schema needs to be updated. Please run these SQL commands in your Supabase SQL editor:');
          console.log(`
--- Add required columns to vet_profiles
ALTER TABLE vet_profiles 
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS offers_video_calls BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS offers_in_person BOOLEAN DEFAULT FALSE;
          `);
          toast.warning('Database needs update for location features. Check console for SQL to run.');
        } else {
          console.error('Error checking database schema:', error);
        }
      } else {
        console.log('Database schema is up to date');
      }
    } catch (error) {
      console.error('Error checking database schema:', error);
    }
  };

  const fetchVetProfile = useCallback(async (forceRefresh: boolean = false) => {
    if (!user?.id) return;
    
    // Prevent overwriting unsaved changes unless it's a forced refresh
    if (!forceRefresh && hasUnsavedChangesRef.current && !isInitialLoadRef.current) {
      console.log('Skipping profile fetch to preserve unsaved changes');
      return;
    }
    
    try {
      setLoadingProfile(true);
      console.log('Fetching vet profile for user ID:', user.id);
      
      // Query using id as the primary key
      const { data, error } = await supabase
        .from('vet_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          console.log('No vet profile found, creating new one');
          const newProfile = await createVetProfile();
          if (newProfile) {
            setProfile(newProfile);
            setInitialFormValues(newProfile);
            
            // Only reset form if not editing or this is initial load
            if (!isEditing || isInitialLoadRef.current) {
              form.reset(newProfile);
              setImagePreview(newProfile.image_url);
              setClinicImagePreviews(newProfile.clinic_images);
              setLanguagesInput(Array.isArray(newProfile.languages) ? newProfile.languages.join(', ') : '');
            }
            
            setIsPageLoading(false);
            isInitialLoadRef.current = false;
          }
          return;
        }
        throw error;
      }

      if (data) {
        // Cast database response to our VetProfileDB type
        const dbProfile = data as unknown as VetProfileDB;
        
        // Convert database values to proper types
        const sanitizedProfile: VetProfile = {
          id: dbProfile.id || '',
          first_name: dbProfile.first_name || '',
          last_name: dbProfile.last_name || '',
          specialization: dbProfile.specialization || '',
          about: dbProfile.about || '',
          consultation_fee: Number(dbProfile.consultation_fee) || 0,
          image_url: dbProfile.image_url || '',
          years_experience: Number(dbProfile.years_experience) || 0,
          phone: dbProfile.phone || '',
          gender: dbProfile.gender || '',
          languages: Array.isArray(dbProfile.languages) ? dbProfile.languages : [],
          zip_code: dbProfile.zip_code || '',
          license_url: dbProfile.license_url || '',
          clinic_location: dbProfile.clinic_location || '',
          clinic_images: Array.isArray(dbProfile.clinic_images) ? dbProfile.clinic_images : [],
          // Map database field to UI field
          offers_telemedicine: Boolean(dbProfile.offers_video_calls),
          offers_in_person: Boolean(dbProfile.offers_in_person)
        };
        
        setProfile(sanitizedProfile);
        setInitialFormValues(sanitizedProfile);
        
        // Only reset form if not editing or this is initial load
        if (!isEditing || isInitialLoadRef.current) {
          form.reset(sanitizedProfile);
          setImagePreview(sanitizedProfile.image_url);
          setClinicImagePreviews(sanitizedProfile.clinic_images);
          setLanguagesInput(Array.isArray(sanitizedProfile.languages) ? sanitizedProfile.languages.join(', ') : '');
        }
        
        setIsPageLoading(false);
        isInitialLoadRef.current = false;
      }
    } catch (error) {
      console.error('Error fetching vet profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  }, [supabase, user, form, toast, isEditing]);

  useEffect(() => {
    if (user?.id) {
      // Check database schema and fetch profile
      checkDatabaseSchema();
      fetchVetProfile();
    }
  }, [user?.id, fetchVetProfile]);

  useEffect(() => {
    if (profile && (isInitialLoadRef.current || !isEditing)) {
      // Initialize form with profile data only on initial load or when not editing
      setIsPageLoading(false);

      // Set profile defaults for form
      const formData = {
        ...profile,
        consultation_fee: profile.consultation_fee || 0,
        years_experience: profile.years_experience || 0,
        offers_telemedicine: true, // Always enforce online consultations
        offers_in_person: profile.offers_in_person || false
      };

      form.reset(formData);
      setInitialFormValues(formData);

      // Set clinic image previews if exist
      setClinicImagePreviews(profile.clinic_images || []);
      
      // Initialize languages input state
      setLanguagesInput(Array.isArray(profile.languages) ? profile.languages.join(', ') : '');
      
      // Reset unsaved changes flag after initial load
      hasUnsavedChangesRef.current = false;
    }
  }, [profile, form, isEditing]);

  // Watch for form changes to detect unsaved changes
  useEffect(() => {
    if (!isInitialLoadRef.current && isEditing && initialFormValues) {
      const subscription = form.watch((values) => {
        // Compare current form values with initial values to detect changes
        const hasChanges = JSON.stringify(values) !== JSON.stringify(initialFormValues);
        hasUnsavedChangesRef.current = hasChanges;
      });

      return () => subscription.unsubscribe();
    }
  }, [form, isEditing, initialFormValues]);

  // Handle browser/tab close with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current && isEditing) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditing]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size and type
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Please upload a JPG or PNG image');
      return;
    }

    setSelectedImage(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLicenseChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size and type
    if (file.size > 10 * 1024 * 1024) {
      toast.error('License file size should be less than 10MB');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setSelectedLicense(file);
    toast.success('License file selected');
  };

  const handleClinicImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const currentPreviews = clinicImagePreviews || [];
    const currentImages = profile?.clinic_images || [];
    
    // Calculate total images including existing ones in the database
    const totalExistingImages = currentImages.length;
    
    // Add only new files up to a maximum of 5 total (including those already in the database)
    const remainingSlots = 5 - (totalExistingImages - selectedClinicImages.length);
    
    if (remainingSlots <= 0) {
      toast.error("Maximum of 5 clinic images allowed");
      return;
    }
    
    // Process only up to the remaining slots
    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      newFiles.push(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const previewUrl = e.target.result as string;
          setClinicImagePreviews(prev => [...(prev || []), previewUrl]);
        }
      };
      reader.readAsDataURL(file);
    }
    
    setSelectedClinicImages([...selectedClinicImages, ...newFiles]);
  };

  const removeClinicImage = (index: number) => {
    // Get current clinic images from profile
    const currentImages = profile?.clinic_images || [];
    const currentPreviews = clinicImagePreviews || [];
    
    // Track which images to remove from the database
    const imagesToRemove = [...(form.getValues('clinic_images') || [])];
    
    // Check if we're removing a selected image or an existing one
    if (index < currentPreviews.length) {
      // Remove from previews
      const newPreviews = [...currentPreviews];
      newPreviews.splice(index, 1);
      setClinicImagePreviews(newPreviews);
      
      // If it's also in the selectedClinicImages, remove it
      if (index < selectedClinicImages.length) {
        const newSelectedImages = [...selectedClinicImages];
        newSelectedImages.splice(index, 1);
        setSelectedClinicImages(newSelectedImages);
      }
      
      // If it's an existing image in the database, mark it for removal
      if (index < currentImages.length) {
        imagesToRemove.splice(index, 1);
        form.setValue('clinic_images', imagesToRemove);
      }
    }
  };

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${user?.id}/${uuidv4()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const uploadProfileImage = async (userId: string) => {
    if (!selectedImage) return null;
    
    try {
      setUploadingImage(true);
      return await uploadFile(selectedImage, 'vet_profiles', 'profile_images');
    } catch (error) {
      toast.error('Failed to upload profile image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadLicense = async (userId: string) => {
    if (!selectedLicense) return null;
    
    try {
      setUploadingLicense(true);
      return await uploadFile(selectedLicense, 'vet_profiles', 'licenses');
    } catch (error) {
      toast.error('Failed to upload license');
      return null;
    } finally {
      setUploadingLicense(false);
    }
  };

  const uploadClinicImages = async (userId: string) => {
    if (selectedClinicImages.length === 0) return [];
    
    try {
      setUploadingClinicImages(true);
      const uploadPromises = selectedClinicImages.map(file => 
        uploadFile(file, 'vet_profiles', 'clinic_images')
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      toast.error('Failed to upload clinic images');
      return [];
    } finally {
      setUploadingClinicImages(false);
    }
  };

  const saveProfile = async (values: VetProfile): Promise<void> => {
    console.log('1. saveProfile called with values:', values);
    
    if (!user?.id) {
      console.error('No user ID found');
      toast.error('User not authenticated');
      return;
    }
    console.log('2. User authenticated:', user.id);
    
    // Check if form is valid before proceeding
    try {
      setIsSaving(true);
      console.log('3. Form validation starting');
      
      // Process the current languages input and update form before validation
      const processedLanguages = languagesInput
        .split(',')
        .map(lang => lang.trim())
        .filter(lang => lang.length > 0);
      
      // Update the form with processed languages and ensure telemedicine is true
      form.setValue('languages', processedLanguages);
      form.setValue('offers_telemedicine', true);
      
      const isValid = await form.trigger();
      console.log('4. Form validation result:', isValid, 'Errors:', form.formState.errors);
      
      if (!isValid) {
        console.error('Form validation failed:', form.formState.errors);
        toast.error('Please fill in all required fields correctly');
        setIsSaving(false);
        return;
      }
      
      console.log('5. Form validation passed');
      
      // Handle image uploads
      let imageUrl = profile?.image_url || '';
      let licenseUrl = profile?.license_url || '';
      console.log('6. Initial URLs:', { imageUrl, licenseUrl });
      
      // Get the current form values for clinic_images
      let clinicImages = Array.isArray(values.clinic_images) ? values.clinic_images : [];
      console.log('7. Initial clinic images:', clinicImages.length);

      // Upload new profile image if selected
      if (selectedImage) {
        const newImageUrl = await uploadProfileImage(user.id);
        if (newImageUrl) {
          imageUrl = newImageUrl;
        }
      }

      // Upload new license if selected
      if (selectedLicense) {
        const newLicenseUrl = await uploadLicense(user.id);
        if (newLicenseUrl) {
          licenseUrl = newLicenseUrl;
        }
      }

      // Handle clinic images upload
      if (selectedClinicImages.length > 0) {
        const newClinicImages = await uploadClinicImages(user.id);
        
        // Ensure we don't exceed 5 images total
        const totalImages = clinicImages.length + newClinicImages.length;
        if (totalImages > 5) {
          // Only add enough to reach 5 total
          const availableSlots = Math.max(0, 5 - clinicImages.length);
          clinicImages = [...clinicImages, ...newClinicImages.slice(0, availableSlots)];
          toast.warning(`Only added ${availableSlots} images to stay within the 5 image limit`);
        } else {
          clinicImages = [...clinicImages, ...newClinicImages.filter((url): url is string => Boolean(url))];
        }
      }
      
      // Get coordinates from ZIP code if it has changed
      let coordinates: { latitude: number; longitude: number } | null = null;
      if (values.zip_code && (!profile || values.zip_code !== profile.zip_code)) {
        coordinates = await getCoordinatesFromZipCode(values.zip_code);
        if (!coordinates) {
          toast.warning('Could not determine location from ZIP code. Distance-based features may be limited.');
        }
      }

      // Prepare profile data for database
      const dbProfileData: any = {
        id: user.id,
        first_name: values.first_name,
        last_name: values.last_name,
        specialization: values.specialization,
        about: values.about,
        consultation_fee: Number(values.consultation_fee) || 0,
        years_experience: Number(values.years_experience) || 0,
        phone: values.phone,
        gender: values.gender,
        languages: values.languages,
        zip_code: values.zip_code,
        image_url: imageUrl,
        license_url: licenseUrl,
        clinic_images: clinicImages,
        clinic_location: values.clinic_location,
        offers_video_calls: true, // Always enforce online consultations
        offers_in_person: values.offers_in_person,
        updated_at: new Date().toISOString()
      };
      
      // Add coordinates if available
      if (coordinates) {
        dbProfileData.latitude = coordinates.latitude;
        dbProfileData.longitude = coordinates.longitude;
      }
      
      console.log('8. Saving to database with data:', dbProfileData);
      
      // Use upsert to handle both create and update cases
      const { data, error } = await supabase
        .from('vet_profiles')
        .upsert(dbProfileData)
        .eq('id', user.id)
        .select();

      console.log('9. Database response:', { data, error });

      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Failed to save profile: ' + error.message);
        setIsSaving(false);
        return;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned from database');
        toast.error('Failed to save profile: No data returned');
        setIsSaving(false);
        return;
      }

      // Map database fields to our VetProfile interface
      const savedProfile = data[0];
      const sanitizedProfile: VetProfile = {
        id: savedProfile.id || user.id,
        first_name: savedProfile.first_name || '',
        last_name: savedProfile.last_name || '',
        specialization: savedProfile.specialization || '',
        about: savedProfile.about || '',
        consultation_fee: Number(savedProfile.consultation_fee) || 0,
        image_url: savedProfile.image_url || '',
        years_experience: Number(savedProfile.years_experience) || 0,
        phone: savedProfile.phone || '',
        gender: savedProfile.gender || '',
        languages: Array.isArray(savedProfile.languages) ? savedProfile.languages : [],
        zip_code: savedProfile.zip_code || '',
        license_url: savedProfile.license_url || '',
        clinic_location: savedProfile.clinic_location || '',
        clinic_images: Array.isArray(savedProfile.clinic_images) ? savedProfile.clinic_images : [],
        offers_telemedicine: Boolean(savedProfile.offers_video_calls),
        offers_in_person: Boolean(savedProfile.offers_in_person)
      };
      
      console.log('10. Profile updated successfully:', sanitizedProfile);
      
      // Update local state
      setProfile(sanitizedProfile);
      setDefaultValues(sanitizedProfile);
      setInitialFormValues(sanitizedProfile);
      form.reset(sanitizedProfile);
      
      // Reset UI state
      setSelectedImage(null);
      setSelectedLicense(null);
      setSelectedClinicImages([]);
      setIsEditing(false);
      
      // Reset unsaved changes flag
      hasUnsavedChangesRef.current = false;
      
      // Show success notification
      toast.success("Profile Updated Successfully", {
        description: "Your changes have been saved successfully.",
        action: {
          label: "Dismiss",
          onClick: () => {}
        },
        duration: 5000
      });
      
      // Refresh profile data to ensure everything is in sync (with force refresh)
      await fetchVetProfile(true);
      
    } catch (error) {
      console.error('Error in saveProfile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
    finally {
      setIsSaving(false);
    }
  }

  // Helper function to start editing mode
  const startEditing = () => {
    setIsEditing(true);
    hasUnsavedChangesRef.current = false; // Reset unsaved changes when starting edit
    
    // Store current form values as initial values for comparison
    if (profile) {
      const currentFormData = {
        ...profile,
        consultation_fee: profile.consultation_fee || 0,
        years_experience: profile.years_experience || 0,
        offers_telemedicine: true,
        offers_in_person: profile.offers_in_person || false
      };
      setInitialFormValues(currentFormData);
    }
  };

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-background w-full">
        <VetSidebar />
        <SidebarInset className="lg:pl-0 w-full">
          <div className="flex flex-col h-full w-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold">Your Profile</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-8 w-full">
              <Tabs defaultValue="profile">
                <TabsList className="mb-8">
                  <TabsTrigger value="profile">Profile Information</TabsTrigger>
                  <TabsTrigger value="availability">Manage Availability</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="w-full">
                  {!isEditing ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                      <div className="lg:col-span-1 space-y-6">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Profile Picture</CardTitle>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={startEditing}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </CardHeader>
                          <CardContent className="flex flex-col items-center">
                            <Avatar className="w-48 h-48 rounded-full">
                              {profile?.image_url ? (
                                <AvatarImage 
                                  src={profile.image_url} 
                                  alt={`${profile.first_name} ${profile.last_name}`}
                                />
                              ) : (
                                <AvatarFallback className="text-4xl">
                                  {profile?.first_name?.charAt(0) || ''}
                                  {profile?.last_name?.charAt(0) || ''}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              License
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {profile?.license_url ? (
                              <div className="space-y-2">
                                <p className="text-sm text-green-600">License uploaded</p>
                                <Button variant="outline" size="sm" asChild>
                                  <a href={profile.license_url} target="_blank" rel="noopener noreferrer">
                                    View License
                                  </a>
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No license uploaded</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card className="lg:col-span-2">
                        <CardHeader>
                          <CardTitle>Professional Information</CardTitle>
                          <CardDescription>Your professional details visible to pet owners</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium">Full Name</h3>
                              <p className="text-lg">{profile?.first_name} {profile?.last_name}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Specialization</h3>
                              <p className="text-lg">{profile?.specialization || "Not specified"}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium">About</h3>
                            <p className="text-base">{profile?.about || "No description provided"}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium">Consultation Types</h3>
                              <div className="flex gap-2 mt-1">
                                {profile?.offers_telemedicine && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    <Video className="h-3 w-3" />
                                    Video Calls
                                  </div>
                                )}
                                {profile?.offers_in_person && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    <User className="h-3 w-3" />
                                    In-Person
                                  </div>
                                )}
                                {(!profile?.offers_telemedicine && !profile?.offers_in_person) && (
                                  <p className="text-muted-foreground text-sm">Not specified</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Clinic Location</h3>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <p className="text-lg">{profile?.clinic_location || "Not provided"}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium">Experience</h3>
                              <p className="text-lg">{profile?.years_experience || 0} years</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Consultation Fee</h3>
                              <p className="text-lg">₹{profile?.consultation_fee || 0}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium">Phone</h3>
                              <p className="text-lg">{profile?.phone || "Not provided"}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Gender</h3>
                              <p className="text-lg">{profile?.gender || "Not specified"}</p>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium">PIN Code</h3>
                            <p className="text-lg">{profile?.zip_code || "Not provided"}</p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium mb-3">Clinic Images</h3>
                            {profile?.clinic_images && profile.clinic_images.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {profile.clinic_images.map((imageUrl, index) => (
                                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                    <img 
                                      src={imageUrl} 
                                      alt={`Clinic image ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No clinic images uploaded</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="w-full">
                      <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>Update your professional information</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <form onSubmit={(e) => {
                              e.preventDefault();
                              console.log('Form submitted directly');
                              const values = form.getValues();
                              console.log('Form values in submit handler:', values);
                              saveProfile(values as VetProfile);
                            }} 
                            className="space-y-6">
                            <div className="flex flex-col items-center mb-4">
                              <div className="relative w-40 h-40 mb-4">
                                <Avatar className="w-full h-full">
                                  {imagePreview ? (
                                    <AvatarImage 
                                      src={imagePreview} 
                                      alt="Profile Preview"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <AvatarFallback className="text-4xl">
                                      {form.getValues("first_name")?.charAt(0) || ''}
                                      {form.getValues("last_name")?.charAt(0) || ''}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <Label
                                  htmlFor="profile-image"
                                  className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer shadow-md"
                                >
                                  <Camera className="h-5 w-5 text-white" />
                                </Label>
                                <Input 
                                  id="profile-image" 
                                  type="file" 
                                  onChange={handleImageChange}
                                  accept="image/png, image/jpeg, image/jpg"
                                  className="hidden"
                                />
                              </div>
                              {selectedImage && (
                                <p className="text-sm text-muted-foreground">{selectedImage.name}</p>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="specialization"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Specialization</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="about"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>About</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      placeholder="Tell pet owners about your experience and expertise..."
                                      className="min-h-[120px]"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <div>
                              <Label className="text-sm font-medium">Consultation Types</Label>
                              <div className="flex flex-col gap-3 mt-2">
                                <FormField
                                  control={form.control}
                                  name="offers_telemedicine"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={true}
                                          onCheckedChange={() => {}}
                                          disabled={true}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>
                                          Video Calls (Required)
                                        </FormLabel>
                                        <FormDescription>
                                          Online consultations are mandatory for all veterinarians
                                        </FormDescription>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="offers_in_person"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>
                                          In-Person Visits
                                        </FormLabel>
                                        <FormDescription>
                                          I offer in-person consultations at my clinic
                                        </FormDescription>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <FormField
                              control={form.control}
                              name="clinic_location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Clinic Location</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="123 Main St, City, State" />
                                  </FormControl>
                                  <FormDescription>
                                    Full address of your clinic
                                  </FormDescription>
                                </FormItem>
                              )}
                            />

                            <div>
                              <Label className="text-sm font-medium">Veterinary License (PDF)</Label>
                              <div className="mt-2">
                                <div className="flex items-center gap-4">
                                  <Label
                                    htmlFor="license-file"
                                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                  >
                                    <FileText className="h-5 w-5" />
                                    Upload License
                                  </Label>
                                  <Input 
                                    id="license-file" 
                                    type="file" 
                                    onChange={handleLicenseChange}
                                    accept="application/pdf"
                                    className="hidden"
                                  />
                                  {profile?.license_url && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={profile.license_url} target="_blank" rel="noopener noreferrer">
                                        View Current
                                      </a>
                                    </Button>
                                  )}
                                </div>
                                {selectedLicense && (
                                  <p className="text-sm text-muted-foreground mt-2">{selectedLicense.name}</p>
                                )}
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Clinic Images (Max 5)</Label>
                              <div className="mt-2">
                                <div className="flex items-center gap-4 mb-4">
                                  <Label
                                    htmlFor="clinic-images"
                                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                  >
                                    <Upload className="h-5 w-5" />
                                    Upload Images
                                  </Label>
                                  <Input 
                                    id="clinic-images" 
                                    type="file" 
                                    onChange={handleClinicImagesChange}
                                    accept="image/png, image/jpeg, image/jpg"
                                    multiple
                                    className="hidden"
                                  />
                                </div>
                                {clinicImagePreviews.length > 0 && (
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {clinicImagePreviews.map((imageUrl, index) => (
                                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                        <img 
                                          src={imageUrl} 
                                          alt={`Clinic preview ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          className="absolute top-2 right-2 h-8 w-8 p-0"
                                          onClick={() => removeClinicImage(index)}
                                          type="button"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="years_experience"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Years of Experience</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value))} 
                                        value={field.value === 0 ? '' : field.value}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="consultation_fee"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Consultation Fee (₹)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                        value={field.value === 0 ? '' : field.value}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid w-full items-center gap-1.5">
                              <PhoneInput<VetProfile>
                                name="phone"
                                label="Phone Number"
                                control={form.control}
                                description="Enter your phone number"
                                error={form.formState.errors.phone?.message}
                              />
                            </div>

                            <div className="grid w-full items-center gap-1.5">
                              <PinCodeInput<VetProfile>
                                name="zip_code"
                                label="PIN Code"
                                control={form.control}
                                description="Enter your 6-digit PIN code"
                                error={form.formState.errors.zip_code?.message}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="gender"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Gender</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="languages"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Languages Spoken</FormLabel>
                                  <FormControl>
                                    <Input 
                                      value={languagesInput}
                                      onChange={(e) => {
                                        setLanguagesInput(e.target.value);
                                      }}
                                      onBlur={() => {
                                        // Process the languages when user finishes typing
                                        const languages = languagesInput
                                          .split(',')
                                          .map(lang => lang.trim())
                                          .filter(lang => lang.length > 0);
                                        field.onChange(languages);
                                      }}
                                      placeholder="e.g., English, Hindi, Spanish"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Enter languages separated by commas (e.g., English, Hindi, Spanish)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end space-x-4">
                              <Button
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  // Check for unsaved changes and warn user
                                  if (hasUnsavedChangesRef.current) {
                                    const confirmDiscard = confirm(
                                      "You have unsaved changes. Are you sure you want to discard them?"
                                    );
                                    if (!confirmDiscard) {
                                      return;
                                    }
                                  }
                                  
                                  // Reset to original state
                                  setIsEditing(false);
                                  setSelectedImage(null);
                                  setSelectedLicense(null);
                                  setSelectedClinicImages([]);
                                  setImagePreview(profile?.image_url || null);
                                  setClinicImagePreviews(profile?.clinic_images || []);
                                  setLanguagesInput(Array.isArray(profile?.languages) ? profile.languages.join(', ') : '');
                                  
                                  // Reset form to original profile data
                                  if (profile) {
                                    const originalFormData = {
                                      ...profile,
                                      consultation_fee: profile.consultation_fee || 0,
                                      years_experience: profile.years_experience || 0,
                                      offers_telemedicine: true, // Always enforce online consultations
                                      offers_in_person: profile.offers_in_person || false
                                    };
                                    form.reset(originalFormData);
                                    setInitialFormValues(originalFormData);
                                  }
                                  
                                  // Clear unsaved changes flag
                                  hasUnsavedChangesRef.current = false;
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit"
                                disabled={isSaving || uploadingImage || uploadingLicense || uploadingClinicImages}
                                className="flex items-center gap-2"
                              >
                                {(isSaving || uploadingImage || uploadingLicense || uploadingClinicImages) ? (
                                  <>
                                    <Loader2 className="h-5 w-5 animate-spin" /> 
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="availability">
                  <Card>
                    <CardHeader>
                      <CardTitle>Manage Your Availability</CardTitle>
                      <CardDescription>
                        Set your working hours and availability for appointments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VetAvailabilityForm />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VetProfilePage;
