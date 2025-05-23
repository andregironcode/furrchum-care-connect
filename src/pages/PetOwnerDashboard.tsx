
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, Calendar, FileText, User, PawPrint, CreditCard } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';

const PetOwnerDashboard = () => {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          setProfile(data);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchProfile();
    }
  }, [user, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Redirect vets to their dashboard
  if (profile && profile.user_type === 'vet') {
    return <Navigate to="/vet-dashboard" />;
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
                  <h1 className="text-2xl font-bold">Pet Owner Dashboard</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-8">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* My Pets Card */}
                <Card className="border-orange-300 shadow-md">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="flex items-center gap-2">
                      <PawPrint className="h-6 w-6 text-orange-500" />
                      <span className="text-xl">My Pets</span>
                    </CardTitle>
                    <CardDescription>Manage your pets' information</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">Add your pets to manage their health records and appointments.</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      <Plus className="mr-2 h-4 w-4" /> Add Pet
                    </Button>
                  </CardFooter>
                </Card>

                {/* My Vet Card */}
                <Card className="border-orange-300 shadow-md">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-6 w-6 text-orange-500" />
                      <span className="text-xl">My Vet</span>
                    </CardTitle>
                    <CardDescription>Your veterinarians</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">Find and connect with veterinarians for your pets.</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      <User className="mr-2 h-4 w-4" /> Find Vet
                    </Button>
                  </CardFooter>
                </Card>

                {/* Appointments Card */}
                <Card className="border-orange-300 shadow-md">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-orange-500" />
                      <span className="text-xl">Appointments</span>
                    </CardTitle>
                    <CardDescription>Schedule vet appointments</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">Schedule and manage veterinary appointments for your pets.</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      <Calendar className="mr-2 h-4 w-4" /> Schedule Appointment
                    </Button>
                  </CardFooter>
                </Card>

                {/* Prescription Card */}
                <Card className="border-orange-300 shadow-md">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-6 w-6 text-orange-500" />
                      <span className="text-xl">Prescriptions</span>
                    </CardTitle>
                    <CardDescription>View your pets' prescriptions</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">Access and manage prescriptions for your pets' treatments.</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      <FileText className="mr-2 h-4 w-4" /> View Prescriptions
                    </Button>
                  </CardFooter>
                </Card>

                {/* Payment Card */}
                <Card className="border-orange-300 shadow-md">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-6 w-6 text-orange-500" />
                      <span className="text-xl">Payments</span>
                    </CardTitle>
                    <CardDescription>Manage your payment information</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">View billing history and manage payment methods.</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      <CreditCard className="mr-2 h-4 w-4" /> View Payments
                    </Button>
                  </CardFooter>
                </Card>

                {/* Profile Card */}
                <Card className="border-orange-300 shadow-md">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-6 w-6 text-orange-500" />
                      <span className="text-xl">Profile</span>
                    </CardTitle>
                    <CardDescription>Manage your profile</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">Update your personal information and account settings.</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      <User className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PetOwnerDashboard;
