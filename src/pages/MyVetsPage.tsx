import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, Star, User, BookOpen, Phone } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Vet {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string | null;
  years_experience: number | null;
  rating: number | null;
  image_url?: string | null;
  consultation_fee?: number | null;
  clinic_location?: string | null;
  offers_video_calls: boolean | null;
  offers_in_person: boolean | null;
  phone?: string | null;
}

const MyVetsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vets, setVets] = useState<Vet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVets = async () => {
      try {
        if (user) {
          // Get all unique vet IDs from bookings made by this user
          const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select('vet_id')
            .eq('pet_owner_id', user.id);

          if (bookingsError) throw bookingsError;

          if (bookingsData && bookingsData.length > 0) {
            // Get unique vet IDs
            const vetIds = [...new Set(bookingsData.map(booking => booking.vet_id))];
            
            // Fetch vet profiles for these IDs
            const { data: vetsData, error: vetsError } = await supabase
              .from('vet_profiles')
              .select('*')
              .in('id', vetIds);

            if (vetsError) throw vetsError;

            setVets(vetsData || []);
          }
        }
      } catch (error: any) {
        console.error('Error fetching vets:', error);
        setError(error.message || 'Failed to fetch your veterinarians');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchVets();
    }
  }, [user, isLoading]);

  const filteredVets = vets.filter(vet => 
    `${vet.first_name} ${vet.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (vet.specialization && vet.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
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
const VetCard = ({ vet }: { vet: Vet }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const name = `Dr. ${vet.first_name} ${vet.last_name}`;
  
  const handleViewProfile = () => {
    navigate(`/vet-details/${vet.id}`);
  };

  const handleBookAppointment = () => {
    if (!user) {
      toast.error("Please login to book a consultation", {
        action: {
          label: "Login",
          onClick: () => navigate("/auth")
        }
      });
      return;
    }
    navigate(`/booking/${vet.id}`);
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow border-primary-300">
      <CardHeader className="bg-primary-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-primary-100">
            {vet.image_url ? (
              <img src={vet.image_url} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-500 text-2xl font-bold">
                {vet.first_name.charAt(0)}{vet.last_name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <p className="text-sm text-gray-500">{vet.specialization || 'General Practice'}</p>
            <div className="flex items-center mt-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm">{vet.rating || 5.0}</span>
              <span className="ml-2 text-xs text-gray-500">({vet.years_experience || 0} years exp)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {vet.consultation_fee && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Consultation Fee</p>
            <p className="font-medium">₹{(vet.consultation_fee || 0) + 121}</p>
          </div>
        )}
        {vet.clinic_location && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Location</p>
            <p className="font-medium">{vet.clinic_location}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-500 mb-1">Services</p>
          <div className="flex flex-wrap gap-2">
            {vet.offers_video_calls && (
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Video Calls
              </div>
            )}
            {vet.offers_in_person && (
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                In-Person
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          className="border-primary-300 text-primary-600 flex-1 flex items-center justify-center"
          onClick={handleViewProfile}
        >
          <User className="h-4 w-4 mr-2" /> View Profile
        </Button>
        <Button 
          className="bg-primary hover:bg-primary-600 flex-1 flex items-center justify-center" 
          onClick={handleBookAppointment}
        >
          <BookOpen className="h-4 w-4 mr-2" /> Book Appointment
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
        You haven't booked any appointments yet. Once you book an appointment with a veterinarian, they will appear here for easy access.
      </p>
      <Button className="bg-primary hover:bg-primary-600">
        <Plus className="mr-2 h-4 w-4" /> Find a Veterinarian
      </Button>
    </div>
  );
};

export default MyVetsPage;
