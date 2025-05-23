
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, Dog, Cat, Rabbit } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';

// Mock data for pets until the database table is created
const mockPets = [
  {
    id: '1',
    name: 'Max',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 30,
    gender: 'male',
    owner_id: '123'
  },
  {
    id: '2',
    name: 'Luna',
    type: 'cat',
    breed: 'Siamese',
    age: 2,
    weight: 4.5,
    gender: 'female',
    owner_id: '123'
  }
];

const MyPetsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pets, setPets] = useState<any[]>([]);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        if (user) {
          // In a real implementation, we would fetch from Supabase
          // Since the 'pets' table doesn't exist yet, we'll use mock data
          setPets(mockPets.filter(pet => pet.owner_id === user.id || true)); // true for demo purposes
          
          // This comment explains what the real implementation would look like:
          // const { data, error } = await supabase
          //   .from('pets')
          //   .select('*')
          //   .eq('owner_id', user.id);
          //     
          // if (error) throw error;
          // setPets(data || []);
        }
      } catch (error: any) {
        console.error('Error fetching pets:', error);
        setError(error.message || 'Failed to fetch pets');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchPets();
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
                  <h1 className="text-2xl font-bold">My Pets</h1>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="mr-2 h-4 w-4" /> Add New Pet
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

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full bg-orange-100 mb-4 h-12">
                  <TabsTrigger value="all" className="text-lg flex-1">All Pets</TabsTrigger>
                  <TabsTrigger value="dogs" className="text-lg flex-1">Dogs</TabsTrigger>
                  <TabsTrigger value="cats" className="text-lg flex-1">Cats</TabsTrigger>
                  <TabsTrigger value="others" className="text-lg flex-1">Other Pets</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {pets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pets.map((pet) => (
                        <PetCard key={pet.id} pet={pet} />
                      ))}
                    </div>
                  ) : (
                    <EmptyPetState />
                  )}
                </TabsContent>
                
                <TabsContent value="dogs">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.filter(pet => pet.type === 'dog').length > 0 ? (
                      pets.filter(pet => pet.type === 'dog').map((pet) => (
                        <PetCard key={pet.id} pet={pet} />
                      ))
                    ) : (
                      <EmptyPetState type="dogs" />
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="cats">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.filter(pet => pet.type === 'cat').length > 0 ? (
                      pets.filter(pet => pet.type === 'cat').map((pet) => (
                        <PetCard key={pet.id} pet={pet} />
                      ))
                    ) : (
                      <EmptyPetState type="cats" />
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="others">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.filter(pet => pet.type !== 'dog' && pet.type !== 'cat').length > 0 ? (
                      pets.filter(pet => pet.type !== 'dog' && pet.type !== 'cat').map((pet) => (
                        <PetCard key={pet.id} pet={pet} />
                      ))
                    ) : (
                      <EmptyPetState type="others" />
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

// Pet Card Component
const PetCard = ({ pet }: { pet: any }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow border-orange-300">
      <CardHeader className="bg-orange-50 flex items-center gap-3">
        <div className="rounded-full bg-orange-100 p-3">
          {pet.type === 'dog' ? (
            <Dog className="h-6 w-6 text-orange-500" />
          ) : pet.type === 'cat' ? (
            <Cat className="h-6 w-6 text-orange-500" />
          ) : (
            <Rabbit className="h-6 w-6 text-orange-500" />
          )}
        </div>
        <div>
          <CardTitle className="text-xl">{pet.name}</CardTitle>
          <p className="text-sm text-gray-500 capitalize">{pet.breed || pet.type}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Age</p>
            <p className="font-medium">{pet.age} years</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Weight</p>
            <p className="font-medium">{pet.weight} kg</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-medium capitalize">{pet.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium text-green-500">Healthy</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" className="border-orange-300 text-orange-600">View Details</Button>
      </CardFooter>
    </Card>
  );
};

// Empty State Component
const EmptyPetState = ({ type = "all" }: { type?: string }) => {
  let message = '';
  let icon = <Dog className="h-12 w-12 text-orange-300" />;
  
  switch (type) {
    case 'dogs':
      message = "You haven't added any dogs yet";
      icon = <Dog className="h-12 w-12 text-orange-300" />;
      break;
    case 'cats':
      message = "You haven't added any cats yet";
      icon = <Cat className="h-12 w-12 text-orange-300" />;
      break;
    case 'others':
      message = "You haven't added any other pets yet";
      icon = <Rabbit className="h-12 w-12 text-orange-300" />;
      break;
    default:
      message = "You haven't added any pets yet";
  }
  
  return (
    <div className="col-span-full flex flex-col items-center justify-center bg-orange-50 rounded-lg p-12">
      <div className="bg-orange-100 rounded-full p-6 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">{message}</h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        Add your pet to track their health records, schedule appointments, and manage their care.
      </p>
      <Button className="bg-orange-500 hover:bg-orange-600">
        <Plus className="mr-2 h-4 w-4" /> Add New Pet
      </Button>
    </div>
  );
};

export default MyPetsPage;
