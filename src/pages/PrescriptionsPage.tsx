import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, Pill, Calendar, Dog, Download } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { generatePrescriptionPDF } from '@/utils/pdfGenerator';

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  diagnosis: string | null;
  prescribed_date: string;
  status: string;
  pet_id: string;
  pet_name: string;
  vet_name: string;
  // Additional fields for enhanced PDF
  pet: {
    name: string;
    type: string;
    breed?: string;
    age?: number;
    weight?: number;
  };
  vet: {
    first_name: string;
    last_name: string;
    clinic_location?: string;
  };
}

const PrescriptionsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        if (user) {
          // Fetch all prescriptions for this pet owner
          const { data: prescriptionsData, error: prescriptionsError } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('pet_owner_id', user.id)
            .order('prescribed_date', { ascending: false });

          if (prescriptionsError) throw prescriptionsError;

          if (prescriptionsData && prescriptionsData.length > 0) {
            // Get pet names and details
            const petIds = [...new Set(prescriptionsData.map(p => p.pet_id))];
            const { data: petsData, error: petsError } = await supabase
              .from('pets')
              .select('id, name, type, breed, age, weight')
              .in('id', petIds);

            if (petsError) throw petsError;

            // Get vet names and details
            const vetIds = [...new Set(prescriptionsData.map(p => p.vet_id))];
            const { data: vetsData, error: vetsError } = await supabase
              .from('vet_profiles')
              .select('id, first_name, last_name, clinic_location')
              .in('id', vetIds);

            if (vetsError) throw vetsError;

            // Combine data and ensure it matches the Prescription interface
            const enrichedPrescriptions = prescriptionsData.map(prescription => {
              const pet = petsData?.find(p => p.id === prescription.pet_id);
              const vet = vetsData?.find(v => v.id === prescription.vet_id);
              
              return {
                id: prescription.id,
                medication_name: prescription.medication_name,
                dosage: prescription.dosage,
                frequency: prescription.frequency,
                duration: prescription.duration,
                instructions: prescription.instructions || null,
                diagnosis: prescription.diagnosis || null,
                prescribed_date: prescription.prescribed_date,
                status: prescription.status,
                pet_id: prescription.pet_id,
                pet_name: pet?.name || 'Unknown Pet',
                vet_name: vet 
                  ? `Dr. ${vet.first_name} ${vet.last_name}` 
                  : 'Unknown Vet',
                // Additional structured data for PDF
                pet: {
                  name: pet?.name || 'Unknown Pet',
                  type: pet?.type || 'Unknown',
                  breed: pet?.breed || undefined,
                  age: pet?.age || undefined,
                  weight: pet?.weight || undefined,
                },
                vet: {
                  first_name: vet?.first_name || 'Unknown',
                  last_name: vet?.last_name || 'Vet',
                  clinic_location: vet?.clinic_location || undefined,
                }
              } as Prescription;
            });

            setPrescriptions(enrichedPrescriptions);
          }
        }
      } catch (error: any) {
        console.error('Error fetching prescriptions:', error);
        setError(error.message || 'Failed to fetch prescriptions');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
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

  // Helper function to calculate if a prescription is actually expired based on date + duration
  const isPrescriptionExpired = (prescription: Prescription): boolean => {
    try {
      const prescribedDate = new Date(prescription.prescribed_date);
      const today = new Date();
      
      // Extract number of days from duration (e.g., "7 days" -> 7, "2 weeks" -> 14)
      const duration = prescription.duration.toLowerCase();
      let durationDays = 0;
      
      if (duration.includes('day')) {
        const match = duration.match(/(\d+)/);
        durationDays = match ? parseInt(match[1]) : 0;
      } else if (duration.includes('week')) {
        const match = duration.match(/(\d+)/);
        durationDays = match ? parseInt(match[1]) * 7 : 0;
      } else if (duration.includes('month')) {
        const match = duration.match(/(\d+)/);
        durationDays = match ? parseInt(match[1]) * 30 : 0;
      } else {
        // If we can't parse duration, assume it's not expired
        return false;
      }
      
      // Calculate expiry date
      const expiryDate = new Date(prescribedDate);
      expiryDate.setDate(expiryDate.getDate() + durationDays);
      
      // Check if expired (past expiry date) OR manually marked as completed/expired
      return today > expiryDate || prescription.status === 'completed' || prescription.status === 'expired' || prescription.status === 'discontinued';
    } catch (error) {
      console.error('Error calculating prescription expiry:', error);
      // If there's an error, fall back to status-based checking
      return prescription.status === 'completed' || prescription.status === 'expired' || prescription.status === 'discontinued';
    }
  };

  // Filter prescriptions properly
  const activePrescriptions = prescriptions.filter(rx => !isPrescriptionExpired(rx));
  const expiredPrescriptions = prescriptions.filter(rx => isPrescriptionExpired(rx));

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
                  <h1 className="text-2xl font-bold">Prescriptions</h1>
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

              <Tabs defaultValue="active" className="w-full">
                <TabsList className="w-full bg-primary-100 mb-4 h-12">
                  <TabsTrigger value="active" className="text-lg flex-1">Active</TabsTrigger>
                  <TabsTrigger value="expired" className="text-lg flex-1">Expired</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active">
                  {activePrescriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activePrescriptions.map((prescription) => (
                        <PrescriptionCard key={prescription.id} prescription={prescription} />
                      ))}
                    </div>
                  ) : (
                    <EmptyPrescriptionState type="active" />
                  )}
                </TabsContent>
                
                <TabsContent value="expired">
                  {expiredPrescriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {expiredPrescriptions.map((prescription) => (
                        <PrescriptionCard key={prescription.id} prescription={prescription} />
                      ))}
                    </div>
                  ) : (
                    <EmptyPrescriptionState type="expired" />
                  )}
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Prescription Card Component
const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => {
  // Use the same logic to determine if prescription is expired
  const isPrescriptionExpired = (prescription: Prescription): boolean => {
    try {
      const prescribedDate = new Date(prescription.prescribed_date);
      const today = new Date();
      
      // Extract number of days from duration (e.g., "7 days" -> 7, "2 weeks" -> 14)
      const duration = prescription.duration.toLowerCase();
      let durationDays = 0;
      
      if (duration.includes('day')) {
        const match = duration.match(/(\d+)/);
        durationDays = match ? parseInt(match[1]) : 0;
      } else if (duration.includes('week')) {
        const match = duration.match(/(\d+)/);
        durationDays = match ? parseInt(match[1]) * 7 : 0;
      } else if (duration.includes('month')) {
        const match = duration.match(/(\d+)/);
        durationDays = match ? parseInt(match[1]) * 30 : 0;
      } else {
        // If we can't parse duration, assume it's not expired
        return false;
      }
      
      // Calculate expiry date
      const expiryDate = new Date(prescribedDate);
      expiryDate.setDate(expiryDate.getDate() + durationDays);
      
      // Check if expired (past expiry date) OR manually marked as completed/expired
      return today > expiryDate || prescription.status === 'completed' || prescription.status === 'expired' || prescription.status === 'discontinued';
    } catch (error) {
      console.error('Error calculating prescription expiry:', error);
      // If there's an error, fall back to status-based checking
      return prescription.status === 'completed' || prescription.status === 'expired' || prescription.status === 'discontinued';
    }
  };

  const isExpired = isPrescriptionExpired(prescription);
  
  return (
    <Card className={`hover:shadow-lg transition-shadow border-${isExpired ? 'gray' : 'primary'}-300`}>
      <CardHeader className={`bg-${isExpired ? 'gray' : 'primary'}-50 flex flex-col space-y-2`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{prescription.medication_name}</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-md text-xs font-medium 
              ${isExpired ? 'bg-gray-100 text-gray-800' : 'bg-primary-100 text-primary-800'}`}>
              {isExpired ? 'Expired' : 'Active'}
            </div>
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
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-1 mb-1">
            <Dog className="h-4 w-4" />
            <span>For: {prescription.pet_name}</span>
          </div>
          <div>Prescribed by: {prescription.vet_name}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Dosage</p>
            <p className="font-medium">{prescription.dosage}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Frequency</p>
            <p className="font-medium">{prescription.frequency}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500">Duration</p>
          <p className="font-medium">{prescription.duration}</p>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <Calendar className={`h-5 w-5 ${isExpired ? 'text-gray-500' : 'text-primary-500'}`} />
          <div>
            <p className="text-sm text-gray-500">Prescribed Date</p>
            <p className="font-medium">
              {format(new Date(prescription.prescribed_date), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        
        {prescription.diagnosis && (
          <div className="mb-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Diagnosis</p>
            <p className="text-sm">{prescription.diagnosis}</p>
          </div>
        )}
        
        {prescription.instructions && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Instructions</p>
            <p className="text-sm">{prescription.instructions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Empty State Component
const EmptyPrescriptionState = ({ type = "active" }: { type: string }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-primary-50 rounded-lg p-12">
      <div className="bg-primary-100 rounded-full p-6 mb-4">
        <Pill className="h-12 w-12 text-primary-500" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">
        {type === "active" ? "No Active Prescriptions" : "No Expired Prescriptions"}
      </h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        {type === "active" 
          ? "You don't have any active prescriptions. After a vet visit, your prescriptions will appear here."
          : "You don't have any expired prescriptions. When prescriptions expire, they will be moved here for reference."}
      </p>
    </div>
  );
};

export default PrescriptionsPage;
