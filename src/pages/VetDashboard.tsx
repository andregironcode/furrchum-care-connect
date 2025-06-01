import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertCircle, Users, Calendar, FileText, ShieldAlert, Phone } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import ApprovalStatusBanner from '@/components/ApprovalStatusBanner';
import { VetProfile, Appointment } from '@/types/profiles';

const VetDashboard = () => {
  const { user, isLoading } = useAuth();
  const [vetProfile, setVetProfile] = useState<VetProfile | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        // Use optimized RPC function to get all vet dashboard data in single query
        const { data: dashboardData, error: dashboardError } = await (supabase as any)
          .rpc('get_vet_dashboard_data', { vet_user_id: user.id });
        
        if (dashboardError) {
          console.error('Error fetching dashboard data:', dashboardError);
          // Fallback to individual queries if RPC fails
          await fetchDataIndividually();
          return;
        }
        
        if (dashboardData) {
          // Set vet profile from optimized response
          if (dashboardData.vetProfile) {
            const transformedVetData: VetProfile = {
              id: dashboardData.vetProfile.id || '',
              first_name: dashboardData.vetProfile.first_name || '',
              last_name: dashboardData.vetProfile.last_name || '',
              created_at: dashboardData.vetProfile.created_at || '',
              approval_status: (dashboardData.vetProfile.approval_status as 'pending' | 'approved' | 'rejected') || 'pending',
            } as VetProfile;
            setVetProfile(transformedVetData);
          }
          
          // Set appointments from optimized response
          if (dashboardData.recentAppointments && Array.isArray(dashboardData.recentAppointments)) {
            const formattedAppointments = dashboardData.recentAppointments.map((appt: any) => ({
              id: appt.id,
              booking_date: appt.booking_date,
              start_time: appt.start_time,
              end_time: appt.end_time,
              consultation_type: appt.consultation_type,
              status: appt.status,
              notes: appt.notes,
              pet_id: '',
              pet_owner_id: '',
              vet_id: user?.id || '',
              created_at: '',
              updated_at: '',
              pets: { name: appt.pet_name, type: appt.pet_type },
              profiles: { full_name: appt.owner_name }
            } as Appointment));
            
            setRecentAppointments(formattedAppointments);
          }
        }
      } catch (err) {
        console.error('Error fetching optimized vet profile:', err);
        // Fallback to individual queries
        await fetchDataIndividually();
      } finally {
        setLoading(false);
      }
    };

    // Fallback function for individual queries (original logic)
    const fetchDataIndividually = async () => {
      if (!user) return;
      
      try {
        // Fetch vet profile
        const { data: vetData, error: vetError } = await supabase
          .from('vet_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (vetError && vetError.code !== 'PGRST116') {
          throw vetError;
        }
        
        if (vetData) {
          // Handle type-casting safely by creating an object with required fields
          // and using type assertion
          const transformedVetData: VetProfile = {
            id: vetData.id || '',
            first_name: vetData.first_name || '',
            last_name: vetData.last_name || '',
            created_at: vetData.created_at || '',
            approval_status: (vetData.approval_status as 'pending' | 'approved' | 'rejected') || 'pending',
            // Map known fields from vetData directly without accessing them individually
          } as VetProfile;
          setVetProfile(transformedVetData);
          
          // Fetch recent appointments with optimized query
          try {
            const { data: appointmentsData, error: appointmentsError } = await supabase
              .from('bookings')
              .select(`
                *,
                pets!left(name, type),
                profiles!bookings_pet_owner_id_fkey(full_name)
              `)
              .eq('vet_id', user.id)
              .order('booking_date', { ascending: false })
              .limit(5);
            
            if (appointmentsError) {
              console.error('Error fetching appointments:', appointmentsError);
              setRecentAppointments([]);
            } else {
              // Map to properly formatted appointments
              const formattedAppointments = (appointmentsData || []).map((appt: any) => ({
                id: appt.id,
                booking_date: appt.booking_date,
                start_time: appt.start_time,
                end_time: appt.end_time,
                consultation_type: appt.consultation_type,
                status: appt.status,
                notes: appt.notes,
                pet_id: appt.pet_id,
                pet_owner_id: appt.pet_owner_id,
                vet_id: appt.vet_id,
                created_at: appt.created_at,
                updated_at: appt.updated_at,
                pets: appt.pets || null,
                profiles: appt.profiles || null
              } as Appointment));
              
              setRecentAppointments(formattedAppointments);
            }
          } catch (appointmentError) {
            console.error('Error fetching appointments:', appointmentError);
            setRecentAppointments([]);
          }
        }
      } catch (err) {
        console.error('Error fetching vet profile:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      }
    };

    fetchProfile();
  }, [user]);

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

  // Note: We removed profile-based redirection since we're no longer fetching from profiles table
  // The route protection should be handled by checking if user has a vet_profile

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <VetSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold">Veterinarian Dashboard</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-8">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Display vet approval status banner */}
              {vetProfile && (
                <>
                  <ApprovalStatusBanner status={vetProfile.approval_status} />
                </>
              )}
              
              {/* Conditional notice for rejected or pending vets */}
              {vetProfile && (vetProfile.approval_status === 'rejected' || vetProfile.approval_status === 'pending') && (
                <Card className="mb-6 border-yellow-200 bg-yellow-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-yellow-800 flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-yellow-600" />
                      <span>Limited Access Mode</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-yellow-700">
                      {vetProfile.approval_status === 'pending' ? 
                        "While your account is pending approval, you can complete your profile and explore the dashboard, but you won't be able to accept appointments or use all features." :
                        "Your account approval was not granted. Please update your profile with valid information and credentials to request another review."}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Appointments Section */}
                <div className="lg:col-span-2">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>Today's Appointments</span>
                      </CardTitle>
                      <CardDescription>Manage your appointment schedule</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Pet</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="text-muted-foreground" colSpan={4}>
                              No appointments scheduled for today.
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter>
                      <Link to="/vet-appointments">
                        <Button>View All Appointments</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <Link to="/vet-patients" className="w-full">
                      <Button className="w-full justify-start">
                        <Users className="mr-2 h-4 w-4" /> Manage Patients
                      </Button>
                    </Link>
                    <Link to="/vet-appointments" className="w-full">
                      <Button className="w-full justify-start">
                        <Calendar className="mr-2 h-4 w-4" /> Schedule Appointment
                      </Button>
                    </Link>
                    <Link to="/vet-prescriptions" className="w-full">
                      <Button className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" /> Manage Prescriptions
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Patients Section */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Recent Patients</span>
                  </CardTitle>
                  <CardDescription>View and manage patient records</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pet Name</TableHead>
                        <TableHead>Species</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Last Visit</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-muted-foreground" colSpan={5}>
                          No patient records found.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VetDashboard;
