
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Search, FileText, Calendar, Dog, Cat } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';

const PrescriptionsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        if (user) {
          const { data, error } = await supabase
            .from('prescriptions')
            .select('*, vet:vets(*), pet:pets(*)')
            .eq('owner_id', user.id);
            
          if (error) throw error;
          setPrescriptions(data || []);
        }
      } catch (error: any) {
        console.error('Error fetching prescriptions:', error);
        setError(error.message);
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

  // Filter prescriptions by status
  const activePrescriptions = prescriptions.filter(
    prescription => new Date(prescription.end_date) >= new Date()
  );
  const expiredPrescriptions = prescriptions.filter(
    prescription => new Date(prescription.end_date) < new Date()
  );

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
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Search className="mr-2 h-4 w-4" /> Request Refill
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
                <TabsList className="w-full bg-orange-100 mb-4 h-12">
                  <TabsTrigger value="active" className="text-lg flex-1">Active</TabsTrigger>
                  <TabsTrigger value="expired" className="text-lg flex-1">Expired</TabsTrigger>
                  <TabsTrigger value="all" className="text-lg flex-1">All</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active">
                  {activePrescriptions.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {expiredPrescriptions.map((prescription) => (
                        <PrescriptionCard key={prescription.id} prescription={prescription} isExpired={true} />
                      ))}
                    </div>
                  ) : (
                    <EmptyPrescriptionState type="expired" />
                  )}
                </TabsContent>
                
                <TabsContent value="all">
                  {prescriptions.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {prescriptions.map((prescription) => (
                        <PrescriptionCard 
                          key={prescription.id} 
                          prescription={prescription} 
                          isExpired={new Date(prescription.end_date) < new Date()} 
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyPrescriptionState type="all" />
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
const PrescriptionCard = ({ prescription, isExpired = false }: { prescription: any, isExpired?: boolean }) => {
  // Generate placeholder dates if not available
  const startDate = prescription.start_date 
    ? new Date(prescription.start_date) 
    : new Date();
  
  const endDate = prescription.end_date 
    ? new Date(prescription.end_date) 
    : addDays(startDate, 30);

  const formattedStartDate = format(startDate, 'MMM d, yyyy');
  const formattedEndDate = format(endDate, 'MMM d, yyyy');
  
  // Calculate refills
  const refillsUsed = prescription.refills_used || 0;
  const totalRefills = prescription.total_refills || 3;
  const refillsRemaining = totalRefills - refillsUsed;

  return (
    <Card className="hover:shadow-lg transition-shadow border-orange-300">
      <CardHeader className="bg-orange-50 flex flex-row items-start gap-4 p-4">
        <div className="bg-orange-100 rounded-md p-3 text-orange-500">
          <FileText className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{prescription.medication_name || 'Medication'}</CardTitle>
            {isExpired ? (
              <Badge variant="destructive">Expired</Badge>
            ) : (
              <Badge className="bg-green-500">Active</Badge>
            )}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Rx #{prescription.rx_number || Math.floor(Math.random() * 9000000) + 1000000}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Pet Information */}
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="bg-orange-100 rounded-full p-1.5">
              {prescription.pet?.type === 'cat' ? (
                <Cat className="h-4 w-4 text-orange-500" />
              ) : (
                <Dog className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <span className="font-medium">{prescription.pet?.name || 'Pet'}</span>
            <span className="text-sm text-gray-500">({prescription.pet?.breed || prescription.pet?.type || 'Unknown'})</span>
          </div>
          
          {/* Medication Details */}
          <div>
            <div className="font-medium">Dosage</div>
            <div className="text-sm text-gray-700">{prescription.dosage || '10mg, twice daily'}</div>
          </div>
          
          {/* Date Range */}
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium">{formattedStartDate} to {formattedEndDate}</div>
              {isExpired && <div className="text-xs text-red-500">Expired {format(endDate, 'MMMM d, yyyy')}</div>}
            </div>
          </div>
          
          {/* Refill Status */}
          <div className="bg-orange-50 p-3 rounded-md">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Refills</span>
              <span className="text-sm font-medium">{refillsUsed} of {totalRefills} used</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${isExpired || refillsUsed >= totalRefills ? 'bg-red-500' : 'bg-green-500'}`} 
                style={{ width: `${(refillsUsed / totalRefills) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Prescriber */}
          <div className="text-sm text-gray-500">
            Prescribed by: {prescription.vet?.name || 'Dr. Veterinarian'}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" className="border-orange-300 text-orange-600">View Details</Button>
        {!isExpired && refillsRemaining > 0 && (
          <Button className="bg-orange-500 hover:bg-orange-600">Request Refill</Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Empty State Component
const EmptyPrescriptionState = ({ type = "all" }: { type?: string }) => {
  let message = '';
  let description = '';
  
  switch (type) {
    case 'active':
      message = "No active prescriptions";
      description = "You don't have any active prescriptions at the moment.";
      break;
    case 'expired':
      message = "No expired prescriptions";
      description = "You don't have any expired prescriptions in your history.";
      break;
    default:
      message = "No prescriptions found";
      description = "Your pet's prescriptions will appear here after a vet visit.";
  }
  
  return (
    <div className="flex flex-col items-center justify-center bg-orange-50 rounded-lg p-12">
      <div className="bg-orange-100 rounded-full p-6 mb-4">
        <FileText className="h-12 w-12 text-orange-300" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">{message}</h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        {description}
      </p>
    </div>
  );
};

export default PrescriptionsPage;
