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
        // We don't need to fetch from profiles table for vet dashboard
        // The user information is already available from auth context
        
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
          
          // Fetch recent appointments with proper error handling
          try {
            // First, try the direct approach with foreign key relationship
            let appointmentsData: any[] = [];
            let appointmentsError: any = null;
            
            // Attempt 1: Use foreign key relationship (after migration)
            const directQuery = await supabase
              .from('bookings')
              .select(`
                *,
                pets(name, type),
                profiles!bookings_pet_owner_id_fkey(full_name)
              `)
              .eq('vet_id', user.id)
              .order('booking_date', { ascending: false })
              .limit(5);
            
            if (directQuery.error && directQuery.error.code === 'PGRST200') {
              // Foreign key relationship doesn't exist yet, use manual approach
              console.log('Foreign key relationship not found, using manual join approach');
              
              // Attempt 2: Manual join approach
              const bookingsResponse = await supabase
                .from('bookings')
                .select('*')
                .eq('vet_id', user.id)
                .order('booking_date', { ascending: false })
                .limit(5);
              
              if (bookingsResponse.error) throw bookingsResponse.error;
              
              appointmentsData = bookingsResponse.data || [];
              
              // If we have bookings, fetch related data manually
              if (appointmentsData.length > 0) {
                const petIds = [...new Set(appointmentsData.map((b: any) => b.pet_id).filter(Boolean))] as string[];
                const ownerIds = [...new Set(appointmentsData.map((b: any) => b.pet_owner_id).filter(Boolean))] as string[];
                
                // Fetch pets data
                const petsData = petIds.length > 0 ? 
                  await supabase.from('pets').select('id, name, type').in('id', petIds) : 
                  { data: [], error: null };
                
                // Fetch profiles data (profiles table only has full_name, not email/phone_number)
                const profilesData = ownerIds.length > 0 ? 
                  await supabase.from('profiles').select('id, full_name').in('id', ownerIds) : 
                  { data: [], error: null };
                
                // Create lookup maps
                const petsMap = new Map((petsData.data || []).map((p: any) => [p.id, p]));
                const profilesMap = new Map((profilesData.data || []).map((p: any) => [p.id, p]));
                
                // Merge the data
                appointmentsData = appointmentsData.map((booking: any) => ({
                  ...booking,
                  pets: booking.pet_id ? petsMap.get(booking.pet_id) || null : null,
                  profiles: booking.pet_owner_id ? profilesMap.get(booking.pet_owner_id) || null : null
                }));
              }
            } else {
              // Direct query worked
              appointmentsData = directQuery.data || [];
              appointmentsError = directQuery.error;
            }
            
            if (appointmentsError) throw appointmentsError;
            
            // Map to properly formatted appointments
            if (appointmentsData && appointmentsData.length > 0) {
              const formattedAppointments = appointmentsData.map((appt: any) => {
                // Create a type-safe appointment object
                const appointment: Appointment = {
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
                  // Handle nested data safely
                  pets: appt.pets || null,
                  profiles: appt.profiles || null
                };
                return appointment;
              });
              
              setRecentAppointments(formattedAppointments);
            } else {
              setRecentAppointments([]);
            }
          } catch (appointmentError) {
            console.error('Error fetching appointments:', appointmentError);
            // Don't throw the error, just log it and continue without appointments
            setRecentAppointments([]);
          }
        }
      } catch (err) {
        console.error('Error fetching vet profile:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
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
