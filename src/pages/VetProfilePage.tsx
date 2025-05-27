import { useState, useEffect, useCallback, ChangeEvent } from 'react';
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
  offers_telemedicine: boolean; // Maps to offers_video_calls in DB
  offers_in_person: boolean;
  offers_video_calls?: boolean; // For database compatibility
}

const VetProfilePage = () => {
  const { user, isLoading } = useAuth();
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

  // Validation schema for vet profile form
  const vetProfileSchema = z.object({
    id: z.string(),
    first_name: z.string().min(1, { message: 'First name is required' }),
    last_name: z.string().min(1, { message: 'Last name is required' }),
    specialization: z.string().min(1, { message: 'Specialization is required' }),
    about: z.string(),
    consultation_fee: z.number().min(0),
    image_url: z.string(),
    years_experience: z.number().min(0),
    phone: z.string().optional(),
    gender: z.string(),
    languages: z.array(z.string()),
    zip_code: z.string(),
    license_url: z.string(),
    clinic_location: z.string(),
    clinic_images: z.array(z.string()),
    offers_telemedicine: z.boolean(),
    offers_in_person: z.boolean()
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
      offers_telemedicine: false,
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
        about: '',
        consultation_fee: 0,
        years_experience: 0,
        phone: '',
        gender: '',
        languages: [],
        zip_code: '',
        image_url: user.user_metadata?.avatar_url || '',
        license_url: '',
        clinic_location: '',
        clinic_images: [],
        offers_video_calls: false,
        offers_in_person: false
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

  const fetchVetProfile = useCallback(async () => {
    if (!user?.id) return;
    
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
            form.reset(newProfile);
            setImagePreview(newProfile.image_url);
            setClinicImagePreviews(newProfile.clinic_images);
            setIsPageLoading(false);
          }
          return;
        }
        throw error;
      }

      if (data) {
        // Convert database values to proper types
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
          offers_telemedicine: Boolean(data.offers_telemedicine || data.offers_video_calls),
          offers_in_person: Boolean(data.offers_in_person)
        };
        
        setProfile(sanitizedProfile);
        form.reset(sanitizedProfile);
        setImagePreview(sanitizedProfile.image_url);
        setClinicImagePreviews(sanitizedProfile.clinic_images);
        setIsPageLoading(false);
      }
    } catch (error) {
      console.error('Error fetching vet profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  }, [supabase, user, form, toast]);

  useEffect(() => {
    if (user) {
      fetchVetProfile();
    }
  }, [user, fetchVetProfile]);

  useEffect(() => {
    if (profile) {
      // Initialize form with profile data
      setIsPageLoading(false);

      // Set profile defaults for form
      form.reset({
        ...profile,
        consultation_fee: profile.consultation_fee || 0,
        years_experience: profile.years_experience || 0,
        offers_telemedicine: profile.offers_telemedicine || false,
        offers_in_person: profile.offers_in_person || false
      });

      // Set clinic image previews if exist
      setClinicImagePreviews(profile.clinic_images || []);
    }
  }, [profile, form]);

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

  const saveProfile = async (values: VetProfile) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Handle image uploads
      let imageUrl = profile?.image_url;
      let licenseUrl = profile?.license_url;
      
      // Get the current form values for clinic_images
      // This ensures we only keep the images that weren't deleted in the UI
      let clinicImages = values.clinic_images || [];

      if (selectedImage) {
        const newImageUrl = await uploadProfileImage(user.id);
        if (newImageUrl) {
          imageUrl = newImageUrl;
        }
      }

      if (selectedLicense) {
        const newLicenseUrl = await uploadLicense(user.id);
        if (newLicenseUrl) {
          licenseUrl = newLicenseUrl;
        }
      }

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
          clinicImages = [...clinicImages, ...newClinicImages.filter(url => url)];
        }
      }
      
      // Prepare profile data with proper type handling
      const profileData = {
        first_name: values.first_name,
        last_name: values.last_name,
        specialization: values.specialization,
        about: values.about,
        consultation_fee: values.consultation_fee,
        years_experience: values.years_experience,
        phone: values.phone,
        gender: values.gender,
        zip_code: values.zip_code,
        image_url: imageUrl,
        license_url: licenseUrl,
        clinic_images: clinicImages,
        clinic_location: values.clinic_location,
        offers_video_calls: values.offers_telemedicine, // Map to correct DB column
        offers_in_person: values.offers_in_person
      };
      
      console.log('Saving profile data:', profileData);
      
      const { data, error } = await supabase
        .from('vet_profiles')
        .update(profileData)
        .eq('id', user.id) // Use id field which is the primary key
        .select();

      if (error) throw error;
      
      // Update local state with returned data
      if (data && data.length > 0) {
        const profile = data[0] as unknown as VetProfile;
        // Handle null values from database and convert to expected types
        const sanitizedProfile: VetProfile = {
          id: profile.id || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          specialization: profile.specialization || '',
          about: profile.about || '',
          consultation_fee: Number(profile.consultation_fee) || 0,
          image_url: profile.image_url || '',
          years_experience: Number(profile.years_experience) || 0,
          phone: profile.phone || '',
          gender: profile.gender || '',
          languages: Array.isArray(profile.languages) ? profile.languages : [],
          zip_code: profile.zip_code || '',
          license_url: profile.license_url || '',
          clinic_location: profile.clinic_location || '',
          clinic_images: Array.isArray(profile.clinic_images) ? profile.clinic_images : [],
          offers_telemedicine: Boolean(profile.offers_video_calls),
          offers_in_person: Boolean(profile.offers_in_person)
        };
        
        setProfile(sanitizedProfile);
        setDefaultValues(sanitizedProfile);
        form.reset(sanitizedProfile);
      }
      
      setIsEditing(false);
      setSelectedImage(null);
      setSelectedLicense(null);
      setSelectedClinicImages([]);
      toast.success("Profile updated successfully");
      
      // Refresh profile data
      fetchVetProfile();
    } catch (error) {
      console.error('Error updating vet profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isPageLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                              onClick={() => setIsEditing(true)}
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
                              <p className="text-lg">${profile?.consultation_fee || 0}</p>
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
                          <form onSubmit={form.handleSubmit(saveProfile)} className="space-y-6">
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
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>
                                          Video Calls
                                        </FormLabel>
                                        <FormDescription>
                                          I offer video consultations
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
                                    <FormLabel>Consultation Fee ($)</FormLabel>
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

                            <div className="flex justify-end space-x-4">
                              <Button
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  setIsEditing(false);
                                  setSelectedImage(null);
                                  setSelectedLicense(null);
                                  setSelectedClinicImages([]);
                                  setImagePreview(profile?.image_url || null);
                                  setClinicImagePreviews(profile?.clinic_images || []);
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
                                  <Loader2 className="h-4 w-4 animate-spin" /> 
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                                Save Changes
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
                      {/* Placeholder for availability management - will be implemented separately */}
                      <p>Availability management will be implemented in a future update.</p>
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
