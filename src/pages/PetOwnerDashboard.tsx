import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, AlertCircle, Plus, Calendar, 
  PawPrint, CreditCard, Pill, Clock, 
  MapPin, Video, Download, FileText
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  owner_id: string;
  date_of_birth: string | null;
  age: number | null;
  weight: number | null;
  image_url: string | null;
  color: string | null;
  gender: string | null;
  chip_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Appointment {
  id: string;
  pet_owner_id: string;
  vet_id: string;
  pet_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  consultation_type: 'in_person' | 'video_call';
  created_at: string;
  updated_at: string;
  pet_name: string;
  vet_name: string;
  meeting_url?: string;
}

interface Prescription {
  id: string;
  pet_id: string;
  vet_id: string;
  pet_owner_id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  diagnosis: string | null;
  prescribed_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  pet_name?: string;
  vet_name?: string;
}

const PetOwnerDashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  
  // State management with proper typing
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState<boolean>(false);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate age from date of birth
  const calculateAge = useCallback((dob: string | null): number | null => {
    if (!dob) return null;
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Error calculating age:', error);
      return null;
    }
  }, []);

  // Helper function to get pet name by ID
  const getPetNameById = useCallback((petId: string): string => {
    if (!petId) return 'Your Pet';
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : 'Your Pet';
  }, [pets]);

  // Function to handle video call initiation
  const handleStartVideoCall = useCallback((appointment: Appointment) => {
    if (appointment.consultation_type === 'video_call' && appointment.meeting_url) {
      window.open(appointment.meeting_url, '_blank', 'noopener,noreferrer');
    } else {
      setError('Video call not available for this appointment');
    }
  }, []);

  // Data fetching functions with proper error handling and typing
  // Define type for pet record from database
  interface PetRecord {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    owner_id: string;
    date_of_birth: string | null;
    weight: number | null;
    image_url: string | null;
    color: string | null;
    gender: string | null;
    chip_number: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  }

  const fetchPets = useCallback(async (userId: string): Promise<Pet[]> => {
    try {
      console.log('Fetching pets for user:', userId);
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId);

      if (error) {
        console.error('Error fetching pets:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No pets found for user');
        return [];
      }

      console.log('Found', data.length, 'pets for user');
      return (data as PetRecord[]).map((pet): Pet => ({
        id: pet.id,
        name: pet.name || 'Unnamed Pet',
        species: pet.species || 'Unknown',
        breed: pet.breed || null,
        owner_id: pet.owner_id,
        date_of_birth: pet.date_of_birth || null,
        age: calculateAge(pet.date_of_birth || null),
        weight: pet.weight || null,
        image_url: pet.image_url || null,
        color: pet.color || null,
        gender: pet.gender || null,
        chip_number: pet.chip_number || null,
        notes: pet.notes || null,
        created_at: pet.created_at || new Date().toISOString(),
        updated_at: pet.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching pets:', error);
      setError('Failed to load pets');
      return [];
    }
  }, [calculateAge]);

  // Define types for Supabase responses to avoid 'any'
  interface BookingRecord {
    id: string;
    pet_owner_id: string;
    vet_id: string;
    pet_id: string | null;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: string;
    notes: string | null;
    consultation_type: string;
    created_at: string;
    updated_at: string;
    meeting_url?: string;
  }

  interface VetProfile {
    id: string;
    full_name: string | null;
  }

  const fetchAppointments = useCallback(async (userId: string): Promise<Appointment[]> => {
    try {
      setIsLoadingAppointments(true);
      console.log('Fetching bookings for user:', userId);
      
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('pet_owner_id', userId)
        .order('booking_date', { ascending: true });

      if (error) {
        console.log('Error fetching from bookings table:', error);
        return [];
      }
      
      if (!bookingsData || bookingsData.length === 0) {
        console.log('No booking data found');
        return [];
      }

      console.log('Appointment data found:', bookingsData.length, 'appointments');

      // Get vet names
      const vetIds = [...new Set(bookingsData.map((b: BookingRecord) => b.vet_id))];
      console.log('Fetching vet profiles for', vetIds.length, 'vets');
      
      const { data: vetData, error: vetError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', vetIds);

      if (vetError) {
        console.error('Error fetching vet profiles:', vetError);
        // Continue with unknown vet names
      }

      const vetMap = new Map(
        (vetData as VetProfile[] | null)?.map(v => [v.id, v.full_name || 'Unknown Vet']) || []
      );

      // Transform and validate data
      return (bookingsData as BookingRecord[]).map((booking): Appointment => {
        // Debug the booking data
        console.log('Processing booking:', booking.id, 'for pet:', booking.pet_id);
        
        return {
          id: booking.id,
          pet_owner_id: booking.pet_owner_id,
          vet_id: booking.vet_id,
          pet_id: booking.pet_id || '',
          booking_date: booking.booking_date,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: booking.status || 'scheduled',
          notes: booking.notes || null,
          consultation_type: booking.consultation_type === 'video_call' ? 'video_call' : 'in_person',
          created_at: booking.created_at || new Date().toISOString(),
          updated_at: booking.updated_at || new Date().toISOString(),
          pet_name: getPetNameById(booking.pet_id || ''),
          vet_name: vetMap.get(booking.vet_id) || 'Unknown Vet',
          meeting_url: booking.meeting_url
        };
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
      return [];
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [getPetNameById]);

  // Define types for prescription data
  interface PrescriptionRecord {
    id: string;
    pet_id: string;
    vet_id: string;
    pet_owner_id: string;
    medication?: string;
    medication_name?: string; // Some records might use this field instead
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string | null;
    diagnosis: string | null;
    prescribed_date: string;
    status: string;
    created_at: string;
    updated_at: string;
  }

  interface PetNameRecord {
    id: string;
    name: string;
  }

  const fetchPrescriptions = useCallback(async (userId: string): Promise<Prescription[]> => {
    try {
      setIsLoadingPrescriptions(true);
      console.log('Fetching prescriptions for user:', userId);
      
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('pet_owner_id', userId)
        .order('prescribed_date', { ascending: false });

      if (error) {
        console.error('Error fetching prescriptions:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No prescriptions found');
        return [];
      }

      console.log('Found', data.length, 'prescriptions');

      // Get pet and vet names in separate queries - using type assertion to avoid TypeScript errors
      const typedData = data as Array<{pet_id: string, vet_id: string}>;
      const petIds = [...new Set(typedData.map(p => p.pet_id))];
      const vetIds = [...new Set(typedData.map(p => p.vet_id))];

      console.log('Fetching pet and vet names for', petIds.length, 'pets and', vetIds.length, 'vets');
      
      // Handle each query separately to better handle errors
      let petMap = new Map<string, string>();
      let vetMap = new Map<string, string>();
      
      try {
        const { data: petData, error: petError } = await supabase
          .from('pets')
          .select('id, name')
          .in('id', petIds);
          
        if (petError) {
          console.error('Error fetching pet names:', petError);
        } else if (petData) {
          petMap = new Map((petData as PetNameRecord[]).map(p => [p.id, p.name]));
          console.log('Pet names fetched successfully');
        }
      } catch (petQueryError) {
        console.error('Exception fetching pet names:', petQueryError);
      }
      
      try {
        const { data: vetData, error: vetError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', vetIds);
          
        if (vetError) {
          console.error('Error fetching vet names:', vetError);
        } else if (vetData) {
          vetMap = new Map((vetData as VetProfile[]).map(v => [v.id, v.full_name || 'Unknown Vet']));
          console.log('Vet names fetched successfully');
        }
      } catch (vetQueryError) {
        console.error('Exception fetching vet names:', vetQueryError);
      }

      // Use type assertion with a more specific type to avoid TypeScript errors
      return (data as Array<{id: string, pet_id: string, vet_id: string, pet_owner_id: string, medication?: string, medication_name?: string, dosage: string, frequency: string, duration: string, instructions: string | null, diagnosis: string | null, prescribed_date: string, status: string, created_at: string, updated_at: string}>).map((prescription): Prescription => ({
        id: prescription.id,
        pet_id: prescription.pet_id,
        vet_id: prescription.vet_id,
        pet_owner_id: prescription.pet_owner_id,
        medication: prescription.medication || prescription.medication_name || 'Unspecified Medication',
        dosage: prescription.dosage || '',
        frequency: prescription.frequency || '',
        duration: prescription.duration || '',
        instructions: prescription.instructions || null,
        diagnosis: prescription.diagnosis || null,
        prescribed_date: prescription.prescribed_date,
        status: prescription.status || 'active',
        created_at: prescription.created_at || new Date().toISOString(),
        updated_at: prescription.updated_at || new Date().toISOString(),
        pet_name: petMap.get(prescription.pet_id) || 'Unknown Pet',
        vet_name: vetMap.get(prescription.vet_id) || 'Unknown Vet'
      }));
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setError('Failed to load prescriptions');
      return [];
    } finally {
      setIsLoadingPrescriptions(false);
    }
  }, []);

  // Define profile data type from Supabase
  interface ProfileData {
    id: string;
    full_name: string | null;
    user_type: string;
    phone?: string | null;
    address?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    created_at: string;
    updated_at: string;
  }

  // Memoize the data fetching functions to prevent unnecessary recreations
  const memoizedFetchPets = useCallback(async (userId: string) => {
    return fetchPets(userId);
  }, [fetchPets]);

  const memoizedFetchAppointments = useCallback(async (userId: string) => {
    return fetchAppointments(userId);
  }, [fetchAppointments]);

  const memoizedFetchPrescriptions = useCallback(async (userId: string) => {
    return fetchPrescriptions(userId);
  }, [fetchPrescriptions]);

  // Initialize data on component mount and when user changes
  useEffect(() => {
    let isMounted = true;
    
    const loadDataWrapper = async () => {
      if (!user) return;
      
      try {
        console.log('Starting to load data for user:', user.id);
        setIsLoading(true);
        setError(null);

        // Fetch profile
        console.log('Fetching user profile...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }
        
        if (!profileData) {
          console.error('No profile data found');
          throw new Error('Profile not found');
        }

        console.log('Profile data fetched successfully:', profileData);

        // Cast the profile data to the correct type and set default values
        const typedProfileData = profileData as unknown as ProfileData;
        
        if (isMounted) {
          // Set profile with proper typing
          setProfile({
            id: user.id,
            email: user.email || '',
            user_type: (typedProfileData.user_type as UserType) || 'pet_owner',
            full_name: typedProfileData.full_name || null,
            phone: typedProfileData.phone || null,
            address: typedProfileData.address || null,
            avatar_url: typedProfileData.avatar_url || null,
            bio: typedProfileData.bio || null,
            created_at: typedProfileData.created_at || new Date().toISOString(),
            updated_at: typedProfileData.updated_at || new Date().toISOString()
          });

          // Fetch all data in parallel
          console.log('Fetching pets, appointments, and prescriptions...');
          
          try {
            const petsData = await fetchPets(user.id);
            console.log('Pets data fetched:', petsData.length, 'pets');
            setPets(petsData);
          } catch (petsError) {
            console.error('Error fetching pets:', petsError);
            // Continue with other data fetching even if pets fail
          }
          
          try {
            const appointmentsData = await fetchAppointments(user.id);
            console.log('Appointments data fetched:', appointmentsData.length, 'appointments');
            setAppointments(appointmentsData);
          } catch (appointmentsError) {
            console.error('Error fetching appointments:', appointmentsError);
            // Continue with other data fetching even if appointments fail
          }
          
          try {
            const prescriptionsData = await fetchPrescriptions(user.id);
            console.log('Prescriptions data fetched:', prescriptionsData.length, 'prescriptions');
            setPrescriptions(prescriptionsData);
          } catch (prescriptionsError) {
            console.error('Error fetching prescriptions:', prescriptionsError);
            // Continue with other data fetching even if prescriptions fail
          }
          
          console.log('All data loaded successfully');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to load data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadDataWrapper();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Only depend on user.id instead of the whole user object and loadData

  // Generate PDF for prescription (placeholder function)
  const generatePrescriptionPDF = (prescription: Prescription) => {
    console.log('Generating PDF for prescription:', prescription.id);
    // In a real implementation, this would generate a PDF
    alert('PDF generation would happen here in production');
  };

  // Render loading state
  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if no user or not a pet owner
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PetOwnerSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-xl font-semibold">Pet Owner Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {profile?.full_name || 'Pet Owner'}
                  </span>
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
              
              <Tabs defaultValue="pets" className="w-full">
                <TabsList className="w-full bg-white border-b mb-4 rounded-none justify-start">
                  <TabsTrigger value="pets" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                    Quick Actions
                  </TabsTrigger>
                  <TabsTrigger value="appointments" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                    Appointments
                  </TabsTrigger>
                  <TabsTrigger value="prescriptions" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                    Prescriptions
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pets">
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
                          <Link to="/booking">Book Now</Link>
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
                          <Link to="/add-pet">Add Pet</Link>
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
                </TabsContent>
                
                <TabsContent value="prescriptions">
                  {isLoadingPrescriptions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {prescriptions.map(prescription => (
                        <Card key={prescription.id} className="bg-white">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-base">{prescription.medication}</CardTitle>
                              <span className={`text-xs px-2 py-1 rounded ${
                                prescription.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                              </span>
                            </div>
                            <CardDescription>For: {prescription.pet_name} • Prescribed by: Dr. {prescription.vet_name}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-2 pb-4">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Dosage</p>
                                <p className="text-sm">{prescription.dosage}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Frequency</p>
                                <p className="text-sm">{prescription.frequency}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Duration</p>
                                <p className="text-sm">{prescription.duration}</p>
                              </div>
                            </div>
                            {prescription.diagnosis && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-600">Diagnosis</p>
                                <p className="text-sm">{prescription.diagnosis}</p>
                              </div>
                            )}
                            {prescription.instructions && (
                              <div>
                                <p className="text-sm font-medium text-gray-600">Instructions</p>
                                <p className="text-sm">{prescription.instructions}</p>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="flex justify-between items-center pt-4 border-t">
                            <span className="text-sm text-gray-500">
                              Prescribed: {new Date(prescription.prescribed_date).toLocaleDateString()}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => generatePrescriptionPDF(prescription)}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              <span>Download</span>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                        <Pill className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No Active Prescriptions</h3>
                      <p className="text-gray-500">You don't have any active prescriptions at the moment.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="appointments">
                  <div className="space-y-4">
                    {isLoadingAppointments ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : appointments.length > 0 ? (
                      <div className="space-y-4">
                        {appointments.map(appointment => (
                          <Card key={appointment.id} className="bg-white">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between">
                                <CardTitle className="text-base">
                                  {appointment.consultation_type === 'video_call' ? 'Video Consultation' : 'In-Person Visit'}
                                </CardTitle>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {new Date(appointment.booking_date).toLocaleDateString()} • {appointment.start_time}
                                </span>
                              </div>
                              <CardDescription>For: {appointment.pet_name} • With: Dr. {appointment.vet_name}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-2">
                              <div className="flex items-center text-muted-foreground mb-2">
                                {appointment.consultation_type === 'video_call' ? (
                                  <Video className="h-4 w-4 mr-2" />
                                ) : (
                                  <MapPin className="h-4 w-4 mr-2" />
                                )}
                                <span className="text-sm">
                                  {appointment.consultation_type === 'video_call' 
                                    ? 'Video call appointment' 
                                    : 'In-person at the clinic'}
                                </span>
                              </div>
                              {appointment.notes && (
                                <div className="text-sm text-muted-foreground mt-2">
                                  <p className="font-medium">Notes:</p>
                                  <p>{appointment.notes}</p>
                                </div>
                              )}
                            </CardContent>
                            <CardFooter>
                              {appointment.consultation_type === 'video_call' && appointment.meeting_url && (
                                <Button 
                                  className="w-full" 
                                  size="sm"
                                  onClick={() => handleStartVideoCall(appointment)}
                                >
                                  <Video className="h-4 w-4 mr-2" />
                                  Join Video Call
                                </Button>
                              )}
                              {appointment.consultation_type !== 'video_call' && (
                                <Button variant="outline" className="w-full" size="sm">
                                  View Details
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Upcoming Appointments</h3>
                        <p className="text-gray-500">You don't have any appointments scheduled.</p>
                        <Button className="mt-4" asChild>
                          <Link to="/booking">Book an Appointment</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PetOwnerDashboard;
