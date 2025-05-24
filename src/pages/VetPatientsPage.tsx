
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
  breed: string;
  age: number;
  weight: number;
  owner_id: string;
  photo_url?: string;
  gender?: string;
  status?: string;
}

interface MedicalRecord {
  id: string;
  pet_id: string;
  record_date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  created_by: string;
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
  diagnosis: string;
  instructions: string;
}

interface Booking {
  id: string;
  pet_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  status: string;
  notes: string;
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
            // Get unique pet IDs
            const petIds = [...new Set(bookingsData.map(booking => booking.pet_id).filter(Boolean))];
            
            if (petIds.length > 0) {
              // Fetch pet details for these IDs
              const { data: petsData, error: petsError } = await supabase
                .from('pets')
                .select('*')
                .in('id', petIds);

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

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by pet name, type, or breed..."
                    className="pl-10 pr-4 py-2 border rounded-lg w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredPatients.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Patient List
                    </CardTitle>
                    <CardDescription>
                      Click on a patient to view their detailed medical history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pet Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Breed</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPatients.map((pet) => (
                          <TableRow key={pet.id}>
                            <TableCell className="font-medium">{pet.name}</TableCell>
                            <TableCell>{pet.type}</TableCell>
                            <TableCell>{pet.breed || 'Unknown'}</TableCell>
                            <TableCell>{pet.age ? `${pet.age} years` : 'Unknown'}</TableCell>
                            <TableCell>{pet.weight ? `${pet.weight} kg` : 'Unknown'}</TableCell>
                            <TableCell>
                              <Badge variant={pet.status === 'Healthy' ? 'default' : 'secondary'}>
                                {pet.status || 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => fetchPetDetails(pet)}
                                  >
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {selectedPet?.name} - Medical History
                                    </DialogTitle>
                                    <DialogDescription>
                                      Complete medical records, prescriptions, and appointment history
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {detailsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                      <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                  ) : selectedPet && (
                                    <Tabs defaultValue="overview" className="w-full">
                                      <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="records">Medical Records</TabsTrigger>
                                        <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                                        <TabsTrigger value="appointments">Appointments</TabsTrigger>
                                      </TabsList>
                                      
                                      <TabsContent value="overview" className="space-y-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle>Pet Information</CardTitle>
                                          </CardHeader>
                                          <CardContent className="grid grid-cols-2 gap-4">
                                            <div>
                                              <p><strong>Name:</strong> {selectedPet.name}</p>
                                              <p><strong>Type:</strong> {selectedPet.type}</p>
                                              <p><strong>Breed:</strong> {selectedPet.breed || 'Unknown'}</p>
                                            </div>
                                            <div>
                                              <p><strong>Age:</strong> {selectedPet.age ? `${selectedPet.age} years` : 'Unknown'}</p>
                                              <p><strong>Weight:</strong> {selectedPet.weight ? `${selectedPet.weight} kg` : 'Unknown'}</p>
                                              <p><strong>Gender:</strong> {selectedPet.gender || 'Unknown'}</p>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </TabsContent>
                                      
                                      <TabsContent value="records">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                              <FileText className="h-5 w-5" />
                                              Medical Records
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            {medicalRecords.length > 0 ? (
                                              <div className="space-y-4">
                                                {medicalRecords.map((record) => (
                                                  <div key={record.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                      <h4 className="font-semibold">{record.diagnosis}</h4>
                                                      <span className="text-sm text-gray-500">
                                                        {new Date(record.record_date).toLocaleDateString()}
                                                      </span>
                                                    </div>
                                                    <p className="text-sm mb-2"><strong>Treatment:</strong> {record.treatment}</p>
                                                    {record.notes && (
                                                      <p className="text-sm text-gray-600">{record.notes}</p>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <p className="text-gray-500">No medical records found.</p>
                                            )}
                                          </CardContent>
                                        </Card>
                                      </TabsContent>
                                      
                                      <TabsContent value="prescriptions">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                              <Activity className="h-5 w-5" />
                                              Prescriptions
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            {prescriptions.length > 0 ? (
                                              <div className="space-y-4">
                                                {prescriptions.map((prescription) => (
                                                  <div key={prescription.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                      <h4 className="font-semibold">{prescription.medication_name}</h4>
                                                      <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                                                        {prescription.status}
                                                      </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                      <div>
                                                        <p><strong>Dosage:</strong> {prescription.dosage}</p>
                                                        <p><strong>Frequency:</strong> {prescription.frequency}</p>
                                                      </div>
                                                      <div>
                                                        <p><strong>Duration:</strong> {prescription.duration}</p>
                                                        <p><strong>Prescribed:</strong> {new Date(prescription.prescribed_date).toLocaleDateString()}</p>
                                                      </div>
                                                    </div>
                                                    {prescription.diagnosis && (
                                                      <p className="text-sm mt-2"><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                                                    )}
                                                    {prescription.instructions && (
                                                      <p className="text-sm text-gray-600 mt-2">{prescription.instructions}</p>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <p className="text-gray-500">No prescriptions found.</p>
                                            )}
                                          </CardContent>
                                        </Card>
                                      </TabsContent>
                                      
                                      <TabsContent value="appointments">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                              <Calendar className="h-5 w-5" />
                                              Appointment History
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            {appointments.length > 0 ? (
                                              <div className="space-y-4">
                                                {appointments.map((appointment) => (
                                                  <div key={appointment.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                      <div>
                                                        <h4 className="font-semibold">
                                                          {new Date(appointment.booking_date).toLocaleDateString()}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                          {appointment.start_time} - {appointment.end_time}
                                                        </p>
                                                      </div>
                                                      <Badge variant={
                                                        appointment.status === 'confirmed' ? 'default' :
                                                        appointment.status === 'completed' ? 'secondary' :
                                                        'outline'
                                                      }>
                                                        {appointment.status}
                                                      </Badge>
                                                    </div>
                                                    <p className="text-sm mb-2">
                                                      <strong>Type:</strong> {appointment.consultation_type}
                                                    </p>
                                                    {appointment.notes && (
                                                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <p className="text-gray-500">No appointments found.</p>
                                            )}
                                          </CardContent>
                                        </Card>
                                      </TabsContent>
                                    </Tabs>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Patients Found</h3>
                    <p className="text-gray-500 text-center max-w-md">
                      You don't have any patients yet. Patients will appear here once they book appointments with you.
                    </p>
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VetPatientsPage;
