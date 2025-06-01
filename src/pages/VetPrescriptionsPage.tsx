import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MoreVertical, PawPrint, FileText, Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreatePrescriptionModal from '@/components/CreatePrescriptionModal';
import PrescriptionDetailsModal from '@/components/PrescriptionDetailsModal';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  diagnosis?: string;
  prescribed_date: string;
  status: string;
  pet_id: string;
  pet_owner_id: string;
  pet?: {
    name: string;
    type: string;
    breed?: string;
  };
  owner?: {
    full_name?: string;
  };
  vet?: {
    first_name: string;
    last_name: string;
    specialization?: string;
  };
}

const VetPrescriptionsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for prescription details modal
  const [selectedPrescription, setSelectedPrescription] = useState<{
    id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string | null;
    diagnosis?: string | null;
    prescribed_date: string;
    status: string;
    created_at: string;
    updated_at: string;
    pet?: {
      name: string;
      type: string;
      breed?: string;
    };
    owner?: {
      full_name?: string;
    };
    vet?: {
      first_name: string;
      last_name: string;
      specialization?: string;
    };
  } | null>(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    }
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure user exists and has an ID
      if (!user?.id) {
        console.error('No user ID found');
        setError('User not authenticated');
        return;
      }

      // First get prescriptions for this vet
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('vet_id', user.id)
        .order('prescribed_date', { ascending: false });

      if (prescriptionsError) throw prescriptionsError;

      if (!prescriptionsData || prescriptionsData.length === 0) {
        setPrescriptions([]);
        return;
      }

      // Get unique pet IDs and owner IDs
      const petIds = [...new Set(prescriptionsData.map(p => p.pet_id))];
      const ownerIds = [...new Set(prescriptionsData.map(p => p.pet_owner_id))];

      // Fetch pets data
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('id, name, type, breed')
        .in('id', petIds);

      if (petsError) {
        console.error('Error fetching pets:', petsError);
      }

      // Fetch owners data
      const { data: ownersData, error: ownersError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', ownerIds);

      if (ownersError) {
        console.error('Error fetching owners:', ownersError);
      }

      // Fetch vet profile (current user's profile)
      const { data: vetData, error: vetError } = await supabase
        .from('vet_profiles')
        .select('id, first_name, last_name, specialization')
        .eq('id', user.id)
        .single();

      if (vetError) {
        console.error('Error fetching vet profile:', vetError);
      }

      // Combine the data
      const formattedPrescriptions = prescriptionsData.map(prescription => {
        const pet = petsData?.find(p => p.id === prescription.pet_id);
        const owner = ownersData?.find(o => o.id === prescription.pet_owner_id);
        
        return {
          ...prescription,
          instructions: prescription.instructions || undefined,
          diagnosis: prescription.diagnosis || undefined,
          pet: pet ? {
            name: pet.name,
            type: pet.type,
            breed: pet.breed || undefined
          } : undefined,
          owner: owner ? {
            full_name: owner.full_name || undefined
          } : undefined,
          vet: vetData ? {
            first_name: vetData.first_name,
            last_name: vetData.last_name,
            specialization: vetData.specialization || undefined
          } : undefined
        };
      });

      setPrescriptions(formattedPrescriptions);
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error);
      setError('Failed to load prescriptions');
      toast({
        title: "Error",
        description: "Failed to load prescriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePrescriptionStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Prescription ${newStatus}`,
      });

      fetchPrescriptions();
    } catch (error: any) {
      console.error('Error updating prescription:', error);
      toast({
        title: "Error",
        description: "Failed to update prescription",
        variant: "destructive",
      });
    }
  };

  // Handler for opening prescription details modal
  const handleViewPrescriptionDetails = (prescription: Prescription) => {
    // Transform the prescription to match the modal's expected interface
    const modalPrescription = {
      ...prescription,
      created_at: new Date().toISOString(), // fallback since we don't have this field
      updated_at: new Date().toISOString(), // fallback since we don't have this field
      instructions: prescription.instructions || undefined, // convert null to undefined
    };
    
    setSelectedPrescription(modalPrescription as any);
    setIsPrescriptionModalOpen(true);
  };

  // Handler for closing prescription details modal
  const handleClosePrescriptionModal = () => {
    setSelectedPrescription(null);
    setIsPrescriptionModalOpen(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return "default";
      case 'completed': return "secondary";
      case 'discontinued': return "destructive";
      default: return "outline";
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-cream-50">
          <VetSidebar />
          <SidebarInset className="lg:pl-0">
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-cream-50">
        <VetSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold text-accent-600">Prescriptions</h1>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Prescription
                </Button>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by pet name, medication, or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-primary">
                      <TableRow>
                        <TableHead className="text-white font-medium flex items-center">
                          <PawPrint className="h-4 w-4 mr-2" /> Pet Name
                        </TableHead>
                        <TableHead className="text-white font-medium">Owner</TableHead>
                        <TableHead className="text-white font-medium">Medication</TableHead>
                        <TableHead className="text-white font-medium">Dosage</TableHead>
                        <TableHead className="text-white font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2" /> Date
                        </TableHead>
                        <TableHead className="text-white font-medium">Status</TableHead>
                        <TableHead className="text-white font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrescriptions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            {prescriptions.length === 0 
                              ? "No prescriptions found. Create your first prescription!" 
                              : "No prescriptions match your search criteria."
                            }
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPrescriptions.map((prescription) => (
                          <TableRow key={prescription.id}>
                            <TableCell className="font-medium">
                              {prescription.pet?.name || 'Pet not found'}
                              <div className="text-sm text-muted-foreground">
                                {prescription.pet?.type}{prescription.pet?.breed && ` - ${prescription.pet.breed}`}
                              </div>
                            </TableCell>
                            <TableCell>{prescription.owner?.full_name || 'Unknown'}</TableCell>
                            <TableCell>
                              <div className="font-medium">{prescription.medication_name}</div>
                              {prescription.diagnosis && (
                                <div className="text-sm text-muted-foreground">
                                  For: {prescription.diagnosis}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>{prescription.dosage}</div>
                              <div className="text-sm text-muted-foreground">
                                {prescription.frequency} for {prescription.duration}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(prescription.prescribed_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(prescription.status)}>
                                {prescription.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewPrescriptionDetails(prescription)}>
                                    View Details
                                  </DropdownMenuItem>
                                  {prescription.status === 'active' && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => updatePrescriptionStatus(prescription.id, 'completed')}
                                      >
                                        Mark Completed
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => updatePrescriptionStatus(prescription.id, 'discontinued')}
                                      >
                                        Discontinue
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {prescription.status !== 'active' && (
                                    <DropdownMenuItem
                                      onClick={() => updatePrescriptionStatus(prescription.id, 'active')}
                                    >
                                      Reactivate
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
        
        <CreatePrescriptionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPrescriptionCreated={fetchPrescriptions}
        />
        
        {/* Prescription Details Modal */}
        <PrescriptionDetailsModal
          prescription={selectedPrescription}
          isOpen={isPrescriptionModalOpen}
          onClose={handleClosePrescriptionModal}
        />
      </div>
    </SidebarProvider>
  );
};

export default VetPrescriptionsPage;
