
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, Dog, Cat, Rabbit, Trash2, ExternalLink } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import AddPetForm from '@/components/AddPetForm';
import EditPetForm from '@/components/EditPetForm';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';

// Define the expanded pet type interface
interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  gender: string | null;
  owner_id: string;
  status: string | null;
  created_at: string;
  updated_at: string;
  color: string | null;
  chip_number: string | null;
  vaccination_status: string | null;
  medical_history: string | null;
  allergies: string | null;
  medication: string | null;
  diet_type: string | null;
  special_needs: string | null;
  temperament: string | null;
  training_level: string | null;
  favorite_activity: string | null;
  photo_url: string | null;
  vaccination_certificate_url?: string | null;
}

const MyPetsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showPetDetails, setShowPetDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Fetch pets from Supabase
  const fetchPets = async () => {
    try {
      if (user) {
        setLoading(true);
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user.id);
          
        if (error) throw error;
        setPets(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching pets:', error);
      setError(error.message || 'Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  // Delete pet
  const handleDeletePet = async (petId: string) => {
    if (!petId) return;
    
    setIsDeleting(true);
    try {
      // First check if this pet has any associated bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('pet_id', petId)
        .limit(1);
      
      if (bookingsError) throw bookingsError;
      
      // If pet has bookings, use a soft delete approach (update status to 'inactive')
      if (bookingsData && bookingsData.length > 0) {
        const { error: updateError } = await supabase
          .from('pets')
          .update({ status: 'inactive' })
          .eq('id', petId);
        
        if (updateError) throw updateError;
        
        // Update local state
        setPets(pets.map(pet => 
          pet.id === petId ? { ...pet, status: 'inactive' } : pet
        ));
        
        toast({
          title: "Pet Archived",
          description: "Your pet has been archived because it has appointment history. You can still view its records but won't see it in active pets list.",
        });
      } else {
        // No bookings, proceed with hard delete
        // If there's a photo, delete it first
        const pet = pets.find(p => p.id === petId);
        if (pet?.photo_url) {
          await supabase
            .storage
            .from('pet_photos')
            .remove([pet.photo_url]);
        }
        
        const { error } = await supabase
          .from('pets')
          .delete()
          .eq('id', petId);
          
        if (error) throw error;
        
        // Update local state
        setPets(pets.filter(pet => pet.id !== petId));
        toast({
          title: "Pet Deleted",
          description: "Your pet has been successfully removed.",
        });
      }
    } catch (error: any) {
      console.error('Error deleting pet:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete pet",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingPetId(null);
    }
  };

  const handleViewPetDetails = (pet: Pet) => {
    setSelectedPet(pet);
    setShowPetDetails(true);
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setShowPetDetails(false);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setSelectedPet(null);
    fetchPets(); // Refresh the pets list
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setSelectedPet(null);
  };

  useEffect(() => {
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
                <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      <Plus className="mr-2 h-4 w-4" /> Add New Pet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[900px] p-0 w-11/12">
                    <AddPetForm 
                      onSuccess={() => {
                        setShowAddForm(false);
                        fetchPets();
                      }} 
                      onCancel={() => setShowAddForm(false)} 
                    />
                  </DialogContent>
                </Dialog>
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
                        <PetCard 
                          key={pet.id} 
                          pet={pet} 
                          onDelete={() => setDeletingPetId(pet.id)}
                          onViewDetails={() => handleViewPetDetails(pet)}
                        />
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
                        <PetCard 
                          key={pet.id} 
                          pet={pet} 
                          onDelete={() => setDeletingPetId(pet.id)}
                          onViewDetails={() => handleViewPetDetails(pet)}
                        />
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
                        <PetCard 
                          key={pet.id} 
                          pet={pet} 
                          onDelete={() => setDeletingPetId(pet.id)}
                          onViewDetails={() => handleViewPetDetails(pet)}
                        />
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
                        <PetCard 
                          key={pet.id} 
                          pet={pet} 
                          onDelete={() => setDeletingPetId(pet.id)}
                          onViewDetails={() => handleViewPetDetails(pet)}
                        />
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
      
      {/* Pet Details Dialog */}
      <Dialog open={showPetDetails} onOpenChange={setShowPetDetails}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedPet && (
            <div className="p-4">
              <DialogHeader className="mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-24 h-24 border-2 border-orange-200">
                    {selectedPet.photo_url ? (
                      <AvatarImage 
                        src={`${supabase.storage.from('pet_photos').getPublicUrl(selectedPet.photo_url).data.publicUrl}`}
                        alt={selectedPet.name} 
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-orange-100">
                        {selectedPet.type === 'dog' ? <Dog className="h-12 w-12 text-orange-500" /> :
                         selectedPet.type === 'cat' ? <Cat className="h-12 w-12 text-orange-500" /> : 
                         <Rabbit className="h-12 w-12 text-orange-500" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <DialogTitle className="text-2xl font-bold">{selectedPet.name}</DialogTitle>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold border-b border-orange-200 pb-2 mb-4">Basic Info</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Pet Name:</p>
                      <p className="font-medium">{selectedPet.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Breed:</p>
                      <p className="font-medium">{selectedPet.breed || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Color:</p>
                      <p className="font-medium">{selectedPet.color || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender:</p>
                      <p className="font-medium capitalize">{selectedPet.gender || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age:</p>
                      <p className="font-medium">{selectedPet.age !== null ? `${selectedPet.age} years` : 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weight:</p>
                      <p className="font-medium">{selectedPet.weight !== null ? `${selectedPet.weight} kg` : 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Chip Number:</p>
                      <p className="font-medium">{selectedPet.chip_number || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold border-b border-orange-200 pb-2 mb-4">Medical Info</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Vaccination Status:</p>
                      <p className="font-medium">{selectedPet.vaccination_status || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Medical History:</p>
                      <p className="font-medium">{selectedPet.medical_history || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Allergies:</p>
                      <p className="font-medium">{selectedPet.allergies || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Medication:</p>
                      <p className="font-medium">{selectedPet.medication || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>



              <div className="flex justify-end mt-6 gap-2">
                <Button 
                  variant="outline" 
                  className="border-orange-300 text-orange-600"
                  onClick={() => setShowPetDetails(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="default" 
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => handleEditPet(selectedPet)}
                >
                  Edit Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Pet Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {selectedPet && (
            <EditPetForm
              pet={selectedPet}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Pet Confirmation Dialog */}
      <AlertDialog open={!!deletingPetId} onOpenChange={(open) => !open && setDeletingPetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove your pet from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPetId && handleDeletePet(deletingPetId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

// Pet Card Component
const PetCard = ({ pet, onDelete, onViewDetails }: { pet: Pet; onDelete: () => void; onViewDetails: () => void }) => {
  const getPetIcon = () => {
    switch (pet.type.toLowerCase()) {
      case 'dog':
        return <Dog className="h-6 w-6 text-orange-500" />;
      case 'cat':
        return <Cat className="h-6 w-6 text-orange-500" />;
      default:
        return <Rabbit className="h-6 w-6 text-orange-500" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-orange-300 overflow-hidden">
      <CardHeader className="bg-orange-50 flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-14 h-14 border-2 border-orange-200">
            {pet.photo_url ? (
              <AvatarImage 
                src={`${supabase.storage.from('pet_photos').getPublicUrl(pet.photo_url).data.publicUrl}`}
                alt={pet.name} 
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-orange-100">
                {getPetIcon()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle className="text-xl">{pet.name}</CardTitle>
            <p className="text-sm text-gray-500 capitalize">{pet.breed || pet.type}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Age</p>
            <p className="font-medium">{pet.age !== null ? `${pet.age} years` : 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Weight</p>
            <p className="font-medium">{pet.weight !== null ? `${pet.weight} kg` : 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-medium capitalize">{pet.gender || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`font-medium ${pet.status === 'inactive' ? 'text-red-500' : 'text-green-500'}`}>
              {pet.status === 'inactive' ? 'Inactive' : (pet.status || 'Healthy')}
            </p>
          </div>
        </div>
        {(pet.medical_history || pet.allergies || pet.medication) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {pet.medical_history && (
              <div className="mb-2">
                <p className="text-sm text-gray-500">Medical History:</p>
                <p className="text-sm">{pet.medical_history}</p>
              </div>
            )}
            {pet.allergies && (
              <div className="mb-2">
                <p className="text-sm text-gray-500">Allergies:</p>
                <p className="text-sm">{pet.allergies}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          className="border-orange-300 text-orange-600"
          onClick={onViewDetails}
        >
          View Details
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
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
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="mr-2 h-4 w-4" /> Add New Pet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] p-0">
          <AddPetForm 
            onSuccess={() => {
              // This will close the dialog and reload pets
              window.location.reload();
            }} 
            onCancel={() => {
              // This will just close the dialog
              const closeButton = document.querySelector('[data-dialog-close]');
              if (closeButton && 'click' in closeButton) {
                (closeButton as HTMLElement).click();
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPetsPage;
