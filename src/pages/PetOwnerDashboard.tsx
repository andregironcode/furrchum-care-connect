import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, AlertCircle, Calendar, 
  PawPrint, CreditCard
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';

type UserType = 'pet_owner' | 'vet';

interface Profile {
  id: string;
  email: string;
  user_type: UserType;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

const PetOwnerDashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  
  // State management with proper typing
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use effect to load profile data when component mounts
  useEffect(() => {
    if (!isAuthLoading && user) {
      const fetchProfileData = async () => {
        setIsLoading(true);
        try {
          // Use optimized RPC function to get all pet owner dashboard data in single query
          const { data: dashboardData, error: dashboardError } = await (supabase as any)
            .rpc('get_pet_owner_dashboard_data', { owner_user_id: user.id });
          
          if (dashboardError) {
            console.error('Error fetching optimized dashboard data:', dashboardError);
            // Fallback to individual query
            await fetchDataIndividually();
            return;
          }
          
          if (dashboardData) {
            // Set profile from optimized response
            if (dashboardData.profile) {
              setProfile(dashboardData.profile as Profile);
            }
            
            // Additional data like pets and appointments are available but not currently used in this simple dashboard
            // They can be accessed via dashboardData.pets and dashboardData.recentAppointments if needed
          }
        } catch (error: any) {
          console.error('Error loading optimized dashboard data:', error);
          // Fallback to individual query
          await fetchDataIndividually();
        } finally {
          setIsLoading(false);
        }
      };

      // Fallback function for individual queries (original logic)
      const fetchDataIndividually = async () => {
        try {
          // Get the profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            console.error('Error loading profile:', profileError);
            setError('Failed to load profile');
            return;
          }
          
          setProfile(profileData as Profile);
        } catch (error: any) {
          console.error('Error loading profile data:', error);
          setError('Something went wrong while loading your dashboard');
        }
      };

      fetchProfileData();
    }
  }, [isAuthLoading, user]);

  // Render loading state
  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if no user or not a pet owner
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PetOwnerSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-xl font-semibold">Pet Owner Dashboard</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-8">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Book Appointment</CardTitle>
                      <CardDescription>Schedule a visit with a veterinarian</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">Choose date and time</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full" size="sm">
                        <Link to="/vets">Book Now</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Add New Pet</CardTitle>
                      <CardDescription>Register a new pet to your account</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center text-muted-foreground">
                        <PawPrint className="h-4 w-4 mr-2" />
                        <span className="text-sm">Enter pet details</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full" size="sm">
                        <Link to="/my-pets">Add Pet</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Payment History</CardTitle>
                      <CardDescription>View your payment history</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center text-muted-foreground">
                        <CreditCard className="h-4 w-4 mr-2" />
                        <span className="text-sm">View invoices and receipts</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full" size="sm" variant="outline">
                        <Link to="/payments">View History</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PetOwnerDashboard;
