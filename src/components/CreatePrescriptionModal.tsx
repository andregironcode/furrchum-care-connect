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
import { Loader2, Plus, Trash2, Pill } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  owner_id: string;
  owner_name?: string;
}

interface Medicine {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
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
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: '1',
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: ''
    }
  ]);
  const [formData, setFormData] = useState({
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

  const addMedicine = () => {
    const newMedicine: Medicine = {
      id: Date.now().toString(),
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: ''
    };
    setMedicines([...medicines, newMedicine]);
  };

  const removeMedicine = (id: string) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(med => med.id !== id));
    }
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const validateMedicines = () => {
    return medicines.every(med => 
      med.medication_name.trim() && 
      med.dosage.trim() && 
      med.frequency.trim() && 
      med.duration.trim()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !user) return;

    if (!validateMedicines()) {
      toast({
        title: "Error",
        description: "Please fill in all fields for all medicines",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedPet = pets.find(p => p.id === selectedPetId);
      if (!selectedPet) throw new Error('Pet not found');

      // Create prescription records for each medicine
      const prescriptionPromises = medicines.map(medicine => 
        supabase
          .from('prescriptions')
          .insert({
            vet_id: user.id,
            pet_id: selectedPetId,
            pet_owner_id: selectedPet.owner_id,
            prescribed_date: new Date().toISOString().split('T')[0],
            status: 'active',
            medication_name: medicine.medication_name,
            dosage: medicine.dosage,
            frequency: medicine.frequency,
            duration: medicine.duration,
            instructions: formData.instructions,
            diagnosis: formData.diagnosis
          })
      );

      const results = await Promise.all(prescriptionPromises);
      
      // Check if any failed
      const failedInserts = results.filter(result => result.error);
      if (failedInserts.length > 0) {
        throw new Error('Failed to create some prescriptions');
      }

      toast({
        title: "Success",
        description: `Prescription created successfully with ${medicines.length} medicine${medicines.length > 1 ? 's' : ''}`,
      });

      onPrescriptionCreated();
      onClose();
      
      // Reset form
      setMedicines([{
        id: '1',
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: ''
      }]);
      setFormData({
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Prescription</DialogTitle>
          <DialogDescription>
            Create a prescription with multiple medicines for one of your patients
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              placeholder="e.g., Bacterial infection"
            />
          </div>

          {/* Medicines Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Medicines</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMedicine}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Medicine
              </Button>
            </div>

            {medicines.map((medicine, index) => (
              <Card key={medicine.id} className="relative">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Medicine {index + 1}
                    </span>
                    {medicines.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedicine(medicine.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`medication_name_${medicine.id}`}>Medication Name</Label>
                    <Input
                      id={`medication_name_${medicine.id}`}
                      value={medicine.medication_name}
                      onChange={(e) => updateMedicine(medicine.id, 'medication_name', e.target.value)}
                      placeholder="e.g., Amoxicillin"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`dosage_${medicine.id}`}>Dosage</Label>
                      <Input
                        id={`dosage_${medicine.id}`}
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(medicine.id, 'dosage', e.target.value)}
                        placeholder="e.g., 250mg"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`frequency_${medicine.id}`}>Frequency</Label>
                      <Input
                        id={`frequency_${medicine.id}`}
                        value={medicine.frequency}
                        onChange={(e) => updateMedicine(medicine.id, 'frequency', e.target.value)}
                        placeholder="e.g., Twice daily"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`duration_${medicine.id}`}>Duration</Label>
                      <Input
                        id={`duration_${medicine.id}`}
                        value={medicine.duration}
                        onChange={(e) => updateMedicine(medicine.id, 'duration', e.target.value)}
                        placeholder="e.g., 7 days"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Label htmlFor="instructions">General Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="General instructions for the pet owner..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedPetId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Prescription ({medicines.length} medicine{medicines.length > 1 ? 's' : ''})
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePrescriptionModal;
