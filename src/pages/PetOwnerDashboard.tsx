import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, Calendar, FileText, User, PawPrint, CreditCard, Pill } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from 'lucide-react';
import { generatePrescriptionPDF } from '@/utils/pdfGenerator';

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  diagnosis: string;
  prescribed_date: string;
  status: string;
  pet_id: string;
  pet_name: string;
  vet_name: string;
}

const PetOwnerDashboard = () => {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true);

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

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        if (user) {
          // First get all prescriptions for this pet owner
          const { data: prescriptionsData, error: prescriptionsError } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('pet_owner_id', user.id)
            .eq('status', 'active')
            .order('prescribed_date', { ascending: false })
            .limit(5);

          if (prescriptionsError) throw prescriptionsError;

          if (prescriptionsData && prescriptionsData.length > 0) {
            // Get pet names
            const petIds = [...new Set(prescriptionsData.map(p => p.pet_id))];
            const { data: petsData, error: petsError } = await supabase
              .from('pets')
              .select('id, name')
              .in('id', petIds);

            if (petsError) throw petsError;

            // Get vet names
            const vetIds = [...new Set(prescriptionsData.map(p => p.vet_id))];
            const { data: vetsData, error: vetsError } = await supabase
              .from('vet_profiles')
              .select('id, first_name, last_name')
              .in('id', vetIds);

            if (vetsError) throw vetsError;

            // Combine data
            const enrichedPrescriptions = prescriptionsData.map(prescription => {
              const pet = petsData?.find(p => p.id === prescription.pet_id);
              const vet = vetsData?.find(v => v.id === prescription.vet_id);
              
              return {
                ...prescription,
                pet_name: pet?.name || 'Unknown Pet',
                vet_name: vet ? `Dr. ${vet.first_name} ${vet.last_name}` : 'Unknown Vet'
              };
            });

            setPrescriptions(enrichedPrescriptions);
          }
        }
      } catch (error: any) {
        console.error('Error fetching prescriptions:', error);
      } finally {
        setPrescriptionsLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchPrescriptions();
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
            <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold text-primary-600">Dashboard</h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {profile?.full_name || 'Pet Parent'}
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

              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white shadow-md border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">My Pets</CardTitle>
                      <CardDescription>Manage your pets</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary">3</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white shadow-md border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                      <CardDescription>Scheduled visits</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary">2</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white shadow-md border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Active Prescriptions</CardTitle>
                      <CardDescription>Current medications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary">{prescriptions.length}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Tabs defaultValue="pets" className="w-full">
                <TabsList className="w-full bg-white border-b mb-4 rounded-none justify-start">
                  <TabsTrigger value="pets" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                    Quick Actions
                  </TabsTrigger>
                  <TabsTrigger value="prescriptions" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                    Active Prescriptions
                  </TabsTrigger>
                  <TabsTrigger value="appointments" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                    Recent Activity
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pets">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                          <PawPrint className="h-5 w-5 text-primary" />
                          <span>Add New Pet</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Register your pet's information and health records</p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full bg-primary hover:bg-primary-600">
                          <Plus className="mr-2 h-4 w-4" /> Add Pet
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span>Book Appointment</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Schedule a consultation with a veterinarian</p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full bg-primary hover:bg-primary-600">
                          <Calendar className="mr-2 h-4 w-4" /> Schedule
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                          <FileText className="h-5 w-5 text-primary" />
                          <span>View Health Records</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Access your pets' medical history and reports</p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full bg-primary hover:bg-primary-600">
                          <FileText className="mr-2 h-4 w-4" /> View Records
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="prescriptions">
                  {prescriptionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {prescriptions.map((prescription) => (
                        <Card key={prescription.id} className="bg-white">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                  <Pill className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{prescription.medication_name}</CardTitle>
                                  <CardDescription>
                                    For: {prescription.pet_name} • Prescribed by: {prescription.vet_name}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  {prescription.status}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generatePrescriptionPDF(prescription)}
                                  className="flex items-center gap-1"
                                >
                                  <Download className="h-4 w-4" />
                                  PDF
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                    <Card className="bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-base">Annual Check-up</CardTitle>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">May 25, 2025</span>
                        </div>
                        <CardDescription>For: Max (Golden Retriever)</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <p className="text-sm text-muted-foreground">Dr. Sarah Johnson • Downtown Pet Clinic</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-base">Vaccination</CardTitle>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">May 28, 2025</span>
                        </div>
                        <CardDescription>For: Bella (Siamese Cat)</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <p className="text-sm text-muted-foreground">Dr. Michael Chen • Westside Veterinary</p>
                      </CardContent>
                    </Card>
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
