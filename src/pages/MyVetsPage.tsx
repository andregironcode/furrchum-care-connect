
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, Search, Star, MapPin, Phone, Clock } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { supabase } from '@/integrations/supabase/client';

const MyVetsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vets, setVets] = useState<any[]>([]);

  useEffect(() => {
    const fetchVets = async () => {
      try {
        if (user) {
          const { data, error } = await supabase
            .from('vet_favorites')
            .select('vet_id, vets(*)')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          // Extract vet data from the join
          const formattedVets = data?.map(item => item.vets) || [];
          setVets(formattedVets);
        }
      } catch (error: any) {
        console.error('Error fetching vets:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchVets();
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
                  <h1 className="text-2xl font-bold">My Vets</h1>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Search className="mr-2 h-4 w-4" /> Find Vets
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

              <Tabs defaultValue="favorites" className="w-full">
                <TabsList className="w-full bg-orange-100 mb-4 h-12">
                  <TabsTrigger value="favorites" className="text-lg flex-1">Favorite Vets</TabsTrigger>
                  <TabsTrigger value="recent" className="text-lg flex-1">Recent Visits</TabsTrigger>
                  <TabsTrigger value="all" className="text-lg flex-1">All Vets</TabsTrigger>
                </TabsList>
                
                <TabsContent value="favorites">
                  {vets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {vets.map((vet) => (
                        <VetCard key={vet.id} vet={vet} />
                      ))}
                    </div>
                  ) : (
                    <EmptyVetState type="favorites" />
                  )}
                </TabsContent>
                
                <TabsContent value="recent">
                  <EmptyVetState type="recent" />
                </TabsContent>
                
                <TabsContent value="all">
                  <EmptyVetState type="all" />
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Vet Card Component
const VetCard = ({ vet }: { vet: any }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow border-orange-300">
      <CardHeader className="bg-orange-50 flex flex-row items-center gap-4 p-4">
        <div className="h-16 w-16 rounded-full bg-orange-200 overflow-hidden">
          {vet.profile_picture ? (
            <img src={vet.profile_picture} alt={vet.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-orange-200 text-orange-600 font-bold text-xl">
              {vet.name?.charAt(0) || 'V'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <CardTitle className="text-xl">{vet.name || 'Veterinarian'}</CardTitle>
          <div className="flex items-center mt-1">
            <p className="text-sm text-gray-500">{vet.specialty || 'General Practitioner'}</p>
            <div className="flex ml-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < (vet.rating || 4) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <span className="text-sm">{vet.address || '123 Pet Street, Animal City, AC 12345'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-orange-500" />
            <span className="text-sm">{vet.phone || '(555) 123-4567'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="text-sm">{vet.hours || 'Mon-Fri: 9AM-6PM | Sat: 10AM-4PM'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" className="border-orange-300 text-orange-600">View Profile</Button>
        <Button className="bg-orange-500 hover:bg-orange-600">Book Appointment</Button>
      </CardFooter>
    </Card>
  );
};

// Empty State Component
const EmptyVetState = ({ type = "all" }: { type?: string }) => {
  let message = '';
  let description = '';
  let buttonText = '';
  let icon = <Search className="h-12 w-12 text-orange-300" />;
  
  switch (type) {
    case 'favorites':
      message = "No favorite vets yet";
      description = "Add vets to your favorites for quick access to their profiles and easy appointment scheduling.";
      buttonText = "Find Vets";
      break;
    case 'recent':
      message = "No recent vet visits";
      description = "Your recent veterinary visits will appear here after appointments.";
      buttonText = "Schedule an Appointment";
      break;
    default:
      message = "No vets found";
      description = "Search for veterinarians in your area to add to your network.";
      buttonText = "Find Vets";
  }
  
  return (
    <div className="flex flex-col items-center justify-center bg-orange-50 rounded-lg p-12">
      <div className="bg-orange-100 rounded-full p-6 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">{message}</h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        {description}
      </p>
      <Button className="bg-orange-500 hover:bg-orange-600">
        <Search className="mr-2 h-4 w-4" /> {buttonText}
      </Button>
    </div>
  );
};

export default MyVetsPage;
