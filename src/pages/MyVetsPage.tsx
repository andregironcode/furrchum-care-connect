
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, Star, Phone, VideoIcon } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { Input } from '@/components/ui/input';

// Mock data for veterinarians until the database table is created
const mockVets = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Small Animal Care',
    experience: '8 years',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&h=300',
    distance: '2.3 miles',
    available: true
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Feline Specialist',
    experience: '12 years',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&h=300',
    distance: '4.1 miles',
    available: false
  },
  {
    id: '3',
    name: 'Dr. Amanda Lopez',
    specialty: 'Emergency Care',
    experience: '10 years',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=300&h=300',
    distance: '1.8 miles',
    available: true
  }
];

const MyVetsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vets, setVets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVets = async () => {
      try {
        if (user) {
          // In a real implementation, we would fetch from Supabase
          // Since the 'vet_favorites' table doesn't exist yet, we'll use mock data
          setVets(mockVets);
          
          // This comment explains what the real implementation would look like:
          // const { data, error } = await supabase
          //   .from('vet_favorites')
          //   .select('vet_id, vets(*)')
          //   .eq('user_id', user.id);
          //     
          // if (error) throw error;
          // setVets(data?.map(item => item.vets) || []);
        }
      } catch (error: any) {
        console.error('Error fetching vets:', error);
        setError(error.message || 'Failed to fetch favorite veterinarians');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchVets();
    }
  }, [user, isLoading]);

  const filteredVets = vets.filter(vet => 
    vet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    vet.specialty.toLowerCase().includes(searchTerm.toLowerCase())
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
        <PetOwnerSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold">My Veterinarians</h1>
                </div>
                <Button className="bg-primary hover:bg-primary-600">
                  <Plus className="mr-2 h-4 w-4" /> Find New Vet
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

              <div className="mb-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search by name or specialty..."
                    className="pl-4 pr-10 py-2 border rounded-lg w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredVets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVets.map((vet) => (
                    <VetCard key={vet.id} vet={vet} />
                  ))}
                </div>
              ) : (
                <EmptyVetState />
              )}
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
    <Card className="hover:shadow-lg transition-shadow border-primary-300">
      <CardHeader className="bg-primary-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-primary-100">
            {vet.image ? (
              <img src={vet.image} alt={vet.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-500 text-2xl font-bold">
                {vet.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <CardTitle className="text-xl">{vet.name}</CardTitle>
            <p className="text-sm text-gray-500">{vet.specialty}</p>
            <div className="flex items-center mt-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm">{vet.rating}</span>
              <span className="ml-2 text-xs text-gray-500">({vet.experience} exp)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Distance</p>
          <p className="font-medium">{vet.distance}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Availability</p>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            vet.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {vet.available ? 'Available Now' : 'Unavailable'}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline" className="border-primary-300 text-primary-600">
          <Phone className="h-4 w-4 mr-2" /> Call
        </Button>
        <Button className="bg-primary hover:bg-primary-600">
          <VideoIcon className="h-4 w-4 mr-2" /> Start Video
        </Button>
      </CardFooter>
    </Card>
  );
};

// Empty State Component
const EmptyVetState = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-primary-50 rounded-lg p-12">
      <div className="bg-primary-100 rounded-full p-6 mb-4">
        <Phone className="h-12 w-12 text-primary-500" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">No Veterinarians Found</h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        You haven't saved any veterinarians yet. Find and save your preferred vets for quick access to their services.
      </p>
      <Button className="bg-primary hover:bg-primary-600">
        <Plus className="mr-2 h-4 w-4" /> Find a Veterinarian
      </Button>
    </div>
  );
};

export default MyVetsPage;
