
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, Pill, Calendar, Dog, ShoppingCart } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { format, isPast, addDays } from 'date-fns';

// Mock data for prescriptions until the database table is created
const mockPrescriptions = [
  {
    id: '1',
    medication: 'Amoxicillin',
    pet_name: 'Max',
    vet_name: 'Dr. Sarah Johnson',
    dosage: '50mg',
    frequency: 'Twice daily',
    start_date: new Date(2025, 4, 20),
    end_date: new Date(2025, 5, 3),
    refills: 2,
    status: 'active',
    instructions: 'Give with food. Complete entire course even if symptoms improve.'
  },
  {
    id: '2',
    medication: 'Metacam',
    pet_name: 'Luna',
    vet_name: 'Dr. Michael Chen',
    dosage: '5ml',
    frequency: 'Once daily',
    start_date: new Date(2025, 5, 15),
    end_date: new Date(2025, 5, 30),
    refills: 1,
    status: 'active',
    instructions: 'For pain and inflammation. Administer orally with dropper provided.'
  },
  {
    id: '3',
    medication: 'Frontline Plus',
    pet_name: 'Max',
    vet_name: 'Dr. Amanda Lopez',
    dosage: '1 applicator',
    frequency: 'Once monthly',
    start_date: new Date(2025, 3, 10),
    end_date: new Date(2025, 4, 10),
    refills: 0,
    status: 'expired',
    instructions: 'Apply between shoulder blades. Do not bathe pet for 48 hours after application.'
  }
];

const PrescriptionsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        if (user) {
          // In a real implementation, we would fetch from Supabase
          // Since the 'prescriptions' table doesn't exist yet, we'll use mock data
          setPrescriptions(mockPrescriptions);
          
          // This comment explains what the real implementation would look like:
          // const { data, error } = await supabase
          //   .from('prescriptions')
          //   .select('*, vets(*), pets(*)')
          //   .eq('user_id', user.id);
          //     
          // if (error) throw error;
          // setPrescriptions(data || []);
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

  const activePrescriptions = prescriptions.filter(rx => rx.status === 'active');
  const expiredPrescriptions = prescriptions.filter(rx => rx.status === 'expired');

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
                <Button className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="mr-2 h-4 w-4" /> Request Prescription
                </Button>
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
                <TabsList className="w-full bg-purple-100 mb-4 h-12">
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
const PrescriptionCard = ({ prescription }: { prescription: any }) => {
  const isExpired = prescription.status === 'expired' || isPast(new Date(prescription.end_date));
  const daysLeft = isExpired ? 0 : Math.ceil((new Date(prescription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Card className={`hover:shadow-lg transition-shadow border-${isExpired ? 'gray' : 'purple'}-300`}>
      <CardHeader className={`bg-${isExpired ? 'gray' : 'purple'}-50 flex flex-col space-y-2`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{prescription.medication}</CardTitle>
          <div className={`px-2 py-1 rounded-md text-xs font-medium 
            ${isExpired ? 'bg-gray-100 text-gray-800' : 'bg-purple-100 text-purple-800'}`}>
            {isExpired ? 'Expired' : 'Active'}
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
        
        <div className="flex items-center gap-3 mb-4">
          <Calendar className={`h-5 w-5 ${isExpired ? 'text-gray-500' : 'text-purple-500'}`} />
          <div>
            <p className="text-sm text-gray-500">
              {isExpired ? 'Expired on' : 'Valid until'}
            </p>
            <p className="font-medium">
              {format(new Date(prescription.end_date), 'MMMM d, yyyy')}
              {!isExpired && daysLeft <= 7 && (
                <span className="ml-2 text-red-500 text-xs font-bold">{daysLeft} days left</span>
              )}
            </p>
          </div>
        </div>
        
        {prescription.instructions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Instructions</p>
            <p className="text-sm">{prescription.instructions}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {!isExpired && (
          <>
            <div className="text-sm">
              <span className="text-gray-500">Refills: </span>
              <span className={`font-medium ${prescription.refills > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {prescription.refills} remaining
              </span>
            </div>
            <Button className="bg-purple-500 hover:bg-purple-600">
              <ShoppingCart className="mr-2 h-4 w-4" /> Refill
            </Button>
          </>
        )}
        {isExpired && (
          <Button variant="outline" className="ml-auto border-gray-300 text-gray-600">Request Renewal</Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Empty State Component
const EmptyPrescriptionState = ({ type = "active" }: { type: string }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-purple-50 rounded-lg p-12">
      <div className="bg-purple-100 rounded-full p-6 mb-4">
        <Pill className="h-12 w-12 text-purple-500" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">
        {type === "active" ? "No Active Prescriptions" : "No Expired Prescriptions"}
      </h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        {type === "active" 
          ? "You don't have any active prescriptions. After a vet visit, your prescriptions will appear here."
          : "You don't have any expired prescriptions. When prescriptions expire, they will be moved here for reference."}
      </p>
      {type === "active" && (
        <Button className="bg-purple-500 hover:bg-purple-600">
          <Plus className="mr-2 h-4 w-4" /> Request Prescription
        </Button>
      )}
    </div>
  );
};

export default PrescriptionsPage;
