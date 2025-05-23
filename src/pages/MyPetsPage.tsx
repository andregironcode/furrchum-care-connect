
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, Dog, Cat, Rabbit, Trash2 } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import AddPetForm from '@/components/AddPetForm';
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

// Define the pet type interface
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
}

const MyPetsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
                  <DialogContent className="sm:max-w-[600px] p-0">
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
const PetCard = ({ pet, onDelete }: { pet: Pet; onDelete: () => void }) => {
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
    <Card className="hover:shadow-lg transition-shadow border-orange-300">
      <CardHeader className="bg-orange-50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-orange-100 p-3">
            {getPetIcon()}
          </div>
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
            <p className="font-medium text-green-500">{pet.status || 'Healthy'}</p>
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
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="mr-2 h-4 w-4" /> Add New Pet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] p-0">
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
