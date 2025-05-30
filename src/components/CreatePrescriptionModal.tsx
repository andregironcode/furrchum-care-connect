import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  owner_id: string;
  owner_name?: string;
}

interface CreatePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrescriptionCreated: () => void;
}

const CreatePrescriptionModal = ({ isOpen, onClose, onPrescriptionCreated }: CreatePrescriptionModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    diagnosis: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchPetsForVet();
    }
  }, [isOpen, user]);

  const fetchPetsForVet = async () => {
    try {
      // Get pets that have appointments with this vet
      const { data: appointments, error: appointmentsError } = await supabase
        .from('bookings')
        .select('pet_id, pet_owner_id')
        .eq('vet_id', user?.id)
        .not('pet_id', 'is', null);

      if (appointmentsError) throw appointmentsError;

      if (!appointments || appointments.length === 0) {
        setPets([]);
        return;
      }

      // Get unique pet IDs and owner IDs
      const petIds = [...new Set(appointments.map(a => a.pet_id))];
      const ownerIds = [...new Set(appointments.map(a => a.pet_owner_id))];

      // Fetch pets data
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('id, name, type, breed, owner_id')
        .in('id', petIds);

      if (petsError) throw petsError;

      // Fetch owners data
      const { data: ownersData, error: ownersError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', ownerIds);

      if (ownersError) throw ownersError;

      // Combine pets with owner names
      const petsWithOwners = petsData?.map(pet => {
        const owner = ownersData?.find(o => o.id === pet.owner_id);
        return {
          ...pet,
          owner_name: owner?.full_name || 'Unknown'
        };
      }) || [];

      setPets(petsWithOwners);
    } catch (error: any) {
      console.error('Error fetching pets:', error);
      toast({
        title: "Error",
        description: "Failed to load pets",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !user) return;

    setLoading(true);
    try {
      const selectedPet = pets.find(p => p.id === selectedPetId);
      if (!selectedPet) throw new Error('Pet not found');

      const { error } = await supabase
        .from('prescriptions')
        .insert({
          vet_id: user.id,
          pet_id: selectedPetId,
          pet_owner_id: selectedPet.owner_id,
          prescribed_date: new Date().toISOString().split('T')[0],
          status: 'active',
          ...formData
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });

      onPrescriptionCreated();
      onClose();
      
      // Reset form
      setFormData({
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        diagnosis: ''
      });
      setSelectedPetId('');
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      toast({
        title: "Error",
        description: "Failed to create prescription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Prescription</DialogTitle>
          <DialogDescription>
            Create a prescription for one of your patients
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pet">Select Pet</Label>
            <Select value={selectedPetId} onValueChange={setSelectedPetId} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a pet..." />
              </SelectTrigger>
              <SelectContent>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name} ({pet.type}{pet.breed && ` - ${pet.breed}`}) - Owner: {pet.owner_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="medication_name">Medication Name</Label>
            <Input
              id="medication_name"
              value={formData.medication_name}
              onChange={(e) => setFormData(prev => ({ ...prev, medication_name: e.target.value }))}
              placeholder="e.g., Amoxicillin"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 250mg"
                required
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                placeholder="e.g., Twice daily"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g., 7 days"
              required
            />
          </div>

          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              placeholder="e.g., Bacterial infection"
            />
          </div>

          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="Additional instructions for the pet owner..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedPetId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Prescription
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePrescriptionModal;
