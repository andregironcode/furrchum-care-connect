
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import VetAvailabilityForm from './VetProfile/VetAvailabilityForm';
import { supabase } from "@/integrations/supabase/client";

interface VetProfile {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  about: string;
  consultation_fee: number;
  image_url: string;
  years_experience: number;
}

const VetProfilePage = () => {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<VetProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVetProfile();
    }
  }, [user]);

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
      <div className="min-h-screen flex bg-background">
        <VetSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold">Your Profile</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-8">
              <Tabs defaultValue="profile">
                <TabsList className="mb-8">
                  <TabsTrigger value="profile">Profile Information</TabsTrigger>
                  <TabsTrigger value="availability">Manage Availability</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1">
                      <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center">
                        <div className="w-48 h-48 rounded-full overflow-hidden">
                          {profile?.image_url ? (
                            <img 
                              src={profile.image_url} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                              <span className="text-4xl font-bold text-primary">
                                {profile?.first_name?.charAt(0) || ''}
                                {profile?.last_name?.charAt(0) || ''}
                              </span>
                            </div>
                          )}
                        </div>
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
                      </CardContent>
                    </Card>
                  </div>
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
