import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, AlertCircle, Users, Search, Calendar, FileText, Activity } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string | null;
  age?: number | null;
  weight?: number | null;
  owner_id: string;
  photo_url?: string | null;
  gender?: string | null;
  status?: string | null;
}

interface MedicalRecord {
  id: string;
  pet_id: string;
  record_date: string;
  diagnosis?: string | null;
  treatment?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

interface Prescription {
  id: string;
  pet_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribed_date: string;
  status: string;
  diagnosis?: string | null;
  instructions?: string | null;
}

interface Booking {
  id: string;
  pet_id?: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  status: string;
  notes?: string | null;
}

const VetPatientsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Pet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (user) {
          // Get all unique pet IDs from bookings with this vet
          const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select('pet_id')
            .eq('vet_id', user.id);

          if (bookingsError) throw bookingsError;

          if (bookingsData && bookingsData.length > 0) {
            // Get unique pet IDs and filter out null values
            const validPetIds = [...new Set(bookingsData.map(booking => booking.pet_id).filter((id): id is string => id !== null))];
            
            if (validPetIds.length > 0) {
              // Fetch pet details for these IDs
              const { data: petsData, error: petsError } = await supabase
                .from('pets')
                .select('*')
                .in('id', validPetIds);

              if (petsError) throw petsError;

              setPatients(petsData || []);
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching patients:', error);
        setError(error.message || 'Failed to fetch patients');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchPatients();
    }
  }, [user, isLoading]);

  const fetchPetDetails = async (pet: Pet) => {
    setDetailsLoading(true);
    try {
      // Fetch medical records
      const { data: recordsData, error: recordsError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('pet_id', pet.id)
        .order('record_date', { ascending: false });

      if (recordsError) throw recordsError;

      // Fetch prescriptions
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('pet_id', pet.id)
        .order('prescribed_date', { ascending: false });

      if (prescriptionsError) throw prescriptionsError;

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('pet_id', pet.id)
        .order('booking_date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      setMedicalRecords(recordsData || []);
      setPrescriptions(prescriptionsData || []);
      setAppointments(appointmentsData || []);
      setSelectedPet(pet);
    } catch (error: any) {
      console.error('Error fetching pet details:', error);
      toast.error('Failed to fetch pet details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredPatients = patients.filter(pet => 
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                  <h1 className="text-2xl font-bold">My Patients</h1>
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

              {/* Search */}
              <Card className="mb-6">
                <CardContent className="p-4 sm:p-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search patients by name, type, or breed..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Patients Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-primary" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Patients</p>
                        <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Cases</p>
                        <p className="text-2xl font-bold text-gray-900">{patients.filter(p => p.status === 'active').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">This Month</p>
                        <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Records</p>
                        <p className="text-2xl font-bold text-gray-900">{medicalRecords.length + prescriptions.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Patients List */}
              {filteredPatients.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                    <p className="text-gray-600">
                      {patients.length === 0 
                        ? "You don't have any patients yet." 
                        : "No patients match your search criteria."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden space-y-4">
                    {filteredPatients.map((pet) => (
                      <Card key={pet.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-primary font-semibold text-lg">
                                  {pet.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                                <p className="text-sm text-gray-600 capitalize">{pet.type}</p>
                              </div>
                            </div>
                            <Badge variant={pet.status === 'active' ? 'default' : 'secondary'}>
                              {pet.status || 'Active'}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            {pet.breed && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Breed:</span>
                                <span>{pet.breed}</span>
                              </div>
                            )}
                            {pet.age && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Age:</span>
                                <span>{pet.age} years</span>
                              </div>
                            )}
                            {pet.weight && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Weight:</span>
                                <span>{pet.weight} kg</span>
                              </div>
                            )}
                          </div>

                          <Button
                            size="sm"
                            onClick={() => fetchPetDetails(pet)}
                            className="w-full"
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <Card className="hidden lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pet</TableHead>
                          <TableHead>Type & Breed</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPatients.map((pet) => (
                          <TableRow key={pet.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-primary font-semibold">
                                    {pet.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{pet.name}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium capitalize">{pet.type}</div>
                                {pet.breed && <div className="text-sm text-gray-500">{pet.breed}</div>}
                              </div>
                            </TableCell>
                            <TableCell>{pet.age ? `${pet.age} years` : 'N/A'}</TableCell>
                            <TableCell>{pet.weight ? `${pet.weight} kg` : 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={pet.status === 'active' ? 'default' : 'secondary'}>
                                {pet.status || 'Active'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => fetchPetDetails(pet)}
                                variant="outline"
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VetPatientsPage;
