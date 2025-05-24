
import { useEffect, useState, ChangeEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Save, Edit2, Upload, Camera } from 'lucide-react';
import VetAvailabilityForm from './VetProfile/VetAvailabilityForm';
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

interface VetProfile {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  about: string;
  consultation_fee: number;
  image_url: string;
  years_experience: number;
  phone?: string;
  gender?: string;
  languages?: string[];
  zip_code?: string;
}

const VetProfilePage = () => {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<VetProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<VetProfile>({
    defaultValues: {
      first_name: '',
      last_name: '',
      specialization: '',
      about: '',
      consultation_fee: 0,
      years_experience: 0,
      phone: '',
      gender: '',
      zip_code: ''
    }
  });

  useEffect(() => {
    if (user) {
      fetchVetProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      // Reset form with profile data when profile is loaded or editing is toggled
      form.reset({
        ...profile,
        consultation_fee: profile.consultation_fee || 0,
        years_experience: profile.years_experience || 0
      });
      
      // Set image preview if exists
      if (profile.image_url) {
        setImagePreview(profile.image_url);
      }
    }
  }, [profile, form]);

  const fetchVetProfile = async () => {
    try {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from('vet_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching vet profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

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

  const uploadProfileImage = async (userId: string) => {
    if (!selectedImage) return null;
    
    try {
      setUploadingImage(true);
      
      // Create a unique file name
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;
      
      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('vet_profiles')
        .upload(fileName, selectedImage);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('vet_profiles')
        .getPublicUrl(fileName);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProfile = async (values: VetProfile) => {
    try {
      setIsSaving(true);
      
      // Handle image upload first if there's a new image
      let imageUrl = profile?.image_url;
      if (selectedImage) {
        const newImageUrl = await uploadProfileImage(user?.id as string);
        if (newImageUrl) {
          imageUrl = newImageUrl;
        }
      }
      
      const { error } = await supabase
        .from('vet_profiles')
        .update({
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
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      // Update local state with new values
      setProfile(prev => prev ? { ...prev, ...values, image_url: imageUrl as string } : null);
      setIsEditing(false);
      setSelectedImage(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating vet profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || loadingProfile) {
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                      <Card className="md:col-span-1">
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
                      
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>Your professional details visible to pet owners</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                            <h3 className="text-sm font-medium">Zip Code</h3>
                            <p className="text-lg">{profile?.zip_code || "Not provided"}</p>
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
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
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
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
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
                            </div>
                            <FormField
                              control={form.control}
                              name="zip_code"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Zip Code</FormLabel>
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
                                  setImagePreview(profile?.image_url || null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit"
                                disabled={isSaving || uploadingImage}
                                className="flex items-center gap-2"
                              >
                                {(isSaving || uploadingImage) ? (
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
                  <VetAvailabilityForm />
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
