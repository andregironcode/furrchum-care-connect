
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';

// Define form schema using zod
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  consultationFee: z.string().refine(val => !isNaN(Number(val)), { 
    message: "Must be a valid number"
  }),
  gender: z.string().optional(),
  specialization: z.string().optional(),
  yearsExperience: z.string().refine(val => val === '' || !isNaN(Number(val)), {
    message: "Must be a valid number if provided" 
  }).optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  languages: z.string().optional(),
  zipCode: z.string().optional(),
  about: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const VetProfilePage = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  
  // Initialize form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      consultationFee: "",
      gender: "Select Gender",
      specialization: "",
      yearsExperience: "",
      email: "",
      phone: "",
      languages: "",
      zipCode: "",
      about: "",
    }
  });

  // Fetch existing profile data
  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      setLoading(true);
      
      try {
        // First get email from auth user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (userData?.user?.email) {
          form.setValue('email', userData.user.email);
        }
        
        // Then fetch vet profile data
        const { data, error } = await supabase
          .from('vet_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is expected for new users
          throw error;
        }
        
        if (data) {
          // Populate the form with existing data
          form.setValue('firstName', data.first_name);
          form.setValue('lastName', data.last_name);
          form.setValue('consultationFee', data.consultation_fee?.toString() || '');
          form.setValue('gender', data.gender || 'Select Gender');
          form.setValue('specialization', data.specialization || '');
          form.setValue('yearsExperience', data.years_experience?.toString() || '');
          form.setValue('phone', data.phone || '');
          form.setValue('languages', data.languages ? data.languages.join(', ') : '');
          form.setValue('zipCode', data.zip_code || '');
          form.setValue('about', data.about || '');
          
          // Set profile image if exists
          if (data.image_url) {
            setProfileImage(data.image_url);
          }
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast.error('Error loading profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      return;
    }
    
    setUploading(true);
    
    try {
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${uuidv4()}.${fileExt}`;
      
      // Upload image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vet-profile-images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vet-profile-images')
        .getPublicUrl(filePath);
        
      setProfileImage(publicUrl);
      toast.success('Profile image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (profileImage) {
      setProfileImage(null);
      toast.success('Profile image removed');
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    setSaving(true);
    
    try {
      const profileData = {
        id: user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        consultation_fee: data.consultationFee ? parseFloat(data.consultationFee) : null,
        gender: data.gender === 'Select Gender' ? null : data.gender,
        specialization: data.specialization || null,
        years_experience: data.yearsExperience ? parseInt(data.yearsExperience) : null,
        languages: data.languages ? data.languages.split(',').map(lang => lang.trim()) : null,
        zip_code: data.zipCode || null,
        about: data.about || null,
        phone: data.phone || null,
        image_url: profileImage,
        // We'll use a default value for availability
        availability: 'Available Soon',
      };
      
      const { error } = await supabase
        .from('vet_profiles')
        .upsert(profileData)
        .select();
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-cream-50">
        <VetSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold text-accent-600">Profile</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-6">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
                  <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-5 mb-8">
                      <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        Account Information
                      </TabsTrigger>
                      <TabsTrigger value="professional" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        Professional Details
                      </TabsTrigger>
                      <TabsTrigger value="clinic" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        Clinic Information
                      </TabsTrigger>
                      <TabsTrigger value="banking" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        Banking Details
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        Documents
                      </TabsTrigger>
                    </TabsList>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <TabsContent value="account">
                          {/* Profile Image Upload */}
                          <div className="mb-6 flex flex-col items-center">
                            <div className="relative w-32 h-32 mb-4">
                              {profileImage ? (
                                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary">
                                  <img 
                                    src={profileImage} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                  />
                                  <button 
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl text-white font-bold border-4 border-primary">
                                  {form.watch('firstName') && form.watch('lastName') ? 
                                    `${form.watch('firstName')[0]}${form.watch('lastName')[0]}` : 'VP'}
                                </div>
                              )}

                              {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center">
                              <label 
                                htmlFor="profileImage" 
                                className="cursor-pointer flex items-center px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-accent/90"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Photo
                              </label>
                              <input 
                                id="profileImage" 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="hidden"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium">
                                    First Name <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} className="w-full" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium">
                                    Last Name <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} className="w-full" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="consultationFee"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium">
                                    Consultation Fee <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} className="w-full" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="gender"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium">
                                    Gender <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <select 
                                      {...field}
                                      className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md"
                                    >
                                      <option value="Select Gender" disabled>Select Gender</option>
                                      <option value="Female">Female</option>
                                      <option value="Male">Male</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="specialization"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium">
                                    Specialization <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} className="w-full" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium">
                                    Email Address <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" className="w-full" readOnly />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium">
                                    Phone Number <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} className="w-full" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="yearsExperience"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium">
                                    Years Experience
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" className="w-full" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="languages"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium">
                                    Languages (comma separated)
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="English, Spanish, etc." className="w-full" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="zipCode"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-sm font-medium">
                                    Zip Code
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} className="w-full" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="col-span-1 md:col-span-2">
                              <FormField
                                control={form.control}
                                name="about"
                                render={({ field }) => (
                                  <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium">
                                      About Yourself
                                    </FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        className="w-full min-h-[100px]" 
                                        placeholder="Share your professional background, specialties, and approach to veterinary care"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="professional">
                          <div className="p-4 text-center">
                            <p className="text-muted-foreground">Professional details will be shown here in future updates.</p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="clinic">
                          <div className="p-4 text-center">
                            <p className="text-muted-foreground">Clinic information will be shown here in future updates.</p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="banking">
                          <div className="p-4 text-center">
                            <p className="text-muted-foreground">Banking details will be shown here in future updates.</p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="documents">
                          <div className="p-4 text-center">
                            <p className="text-muted-foreground">Documents will be shown here in future updates.</p>
                          </div>
                        </TabsContent>
                        
                        <div className="flex flex-wrap gap-4 mt-8">
                          <Button 
                            type="submit" 
                            className="bg-primary hover:bg-primary/90 text-white"
                            disabled={saving}
                          >
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Profile
                          </Button>
                          <Button variant="outline" type="button" className="text-primary border-primary hover:bg-primary hover:text-white">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </Tabs>
                </div>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VetProfilePage;
