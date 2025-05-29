import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, X } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface AddPetFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddPetForm = ({ onSuccess, onCancel }: AddPetFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [petData, setPetData] = useState({
    name: '',
    type: 'dog',
    breed: '',
    age: '',
    weight: '',
    gender: 'male',
    color: '',
    chipNumber: '',
    vaccinationStatus: 'not_vaccinated',
    medicalHistory: '',
    allergies: '',
    medication: '',
    dietType: 'regular',
    specialNeeds: '',
    temperament: '',
    trainingLevel: 'none',
    favoriteActivity: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPetData({ ...petData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setPetData({ ...petData, [name]: value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const clearPhotoPreview = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to add a pet');
      return;
    }

    setIsSubmitting(true);
    try {
      let photoUrl: string | null = null;

      // Upload photo if exists
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pet_photos')
          .upload(filePath, photoFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
        photoUrl = filePath; // This is now a string, which is valid for our DB schema
      }

      // Insert pet data
      const { error: insertError } = await supabase
        .from('pets')
        .insert([
          {
            owner_id: user.id,
            name: petData.name,
            type: petData.type,
            breed: petData.breed || null,
            age: petData.age ? parseFloat(petData.age) : null,
            weight: petData.weight ? parseFloat(petData.weight) : null,
            gender: petData.gender,
            color: petData.color || null,
            chip_number: petData.chipNumber || null,
            vaccination_status: petData.vaccinationStatus,
            medical_history: petData.medicalHistory || null,
            allergies: petData.allergies || null,
            medication: petData.medication || null,
            diet_type: petData.dietType,
            special_needs: petData.specialNeeds || null,
            temperament: petData.temperament || null,
            training_level: petData.trainingLevel,
            favorite_activity: petData.favoriteActivity || null,
            photo_url: photoUrl as string | null, // Explicitly cast to match expected DB type
            status: 'healthy'
          }
        ]);

      if (insertError) throw insertError;

      toast.success('Pet added successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error adding pet:', error);
      toast.error(error.message || 'Failed to add pet');
    } finally {
      setIsSubmitting(false);
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    }
  };

  useEffect(() => {
    // Cleanup function for any created object URLs
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  return (
    <div className="flex flex-col h-full max-h-[90vh] sm:max-h-[95vh]">
      <DialogHeader className="p-4 sm:p-6 pb-0 flex-shrink-0">
        <DialogTitle className="text-xl sm:text-2xl font-bold">Add New Pet</DialogTitle>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100" />
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="name" className="text-sm font-medium">Pet Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter pet name"
                required
                value={petData.name}
                onChange={handleChange}
                className="h-10 sm:h-11"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="type" className="text-sm font-medium">Pet Type *</Label>
              <Select
                value={petData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
                required
              >
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue placeholder="Select pet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="bird">Bird</SelectItem>
                  <SelectItem value="rabbit">Rabbit</SelectItem>
                  <SelectItem value="hamster">Hamster</SelectItem>
                  <SelectItem value="fish">Fish</SelectItem>
                  <SelectItem value="reptile">Reptile</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="breed" className="text-sm font-medium">Breed</Label>
              <Input
                id="breed"
                name="breed"
                placeholder="Enter breed"
                value={petData.breed}
                onChange={handleChange}
                className="h-10 sm:h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="age" className="text-sm font-medium">Age (years)</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Enter age"
                  value={petData.age}
                  onChange={handleChange}
                  className="h-10 sm:h-11"
                />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="weight" className="text-sm font-medium">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Enter weight"
                  value={petData.weight}
                  onChange={handleChange}
                  className="h-10 sm:h-11"
                />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
              <Select
                value={petData.gender}
                onValueChange={(value) => handleSelectChange('gender', value)}
              >
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="color" className="text-sm font-medium">Color</Label>
              <Input
                id="color"
                name="color"
                placeholder="Enter color"
                value={petData.color}
                onChange={handleChange}
                className="h-10 sm:h-11"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm font-medium">Pet Photo</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 bg-gray-50">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Pet preview"
                      className="max-h-32 sm:max-h-48 max-w-full rounded-md"
                    />
                    <button
                      type="button"
                      onClick={clearPhotoPreview}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4 text-center">Click to upload or drag and drop</p>
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <label
                      htmlFor="photo"
                      className="bg-primary text-white py-2 px-3 sm:px-4 rounded-md cursor-pointer hover:bg-primary/90 text-sm"
                    >
                      Select Photo
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="chipNumber" className="text-sm font-medium">Microchip Number</Label>
              <Input
                id="chipNumber"
                name="chipNumber"
                placeholder="Enter microchip number"
                value={petData.chipNumber}
                onChange={handleChange}
                className="h-10 sm:h-11"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="vaccinationStatus" className="text-sm font-medium">Vaccination Status</Label>
              <Select
                value={petData.vaccinationStatus}
                onValueChange={(value) => handleSelectChange('vaccinationStatus', value)}
              >
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fully_vaccinated">Fully Vaccinated</SelectItem>
                  <SelectItem value="partially_vaccinated">Partially Vaccinated</SelectItem>
                  <SelectItem value="not_vaccinated">Not Vaccinated</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="medicalHistory" className="text-sm font-medium">Medical History</Label>
              <Textarea
                id="medicalHistory"
                name="medicalHistory"
                placeholder="Enter any relevant medical history"
                rows={2}
                value={petData.medicalHistory}
                onChange={handleChange}
                className="min-h-[60px] sm:min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="allergies" className="text-sm font-medium">Allergies</Label>
              <Textarea
                id="allergies"
                name="allergies"
                placeholder="Enter any allergies"
                rows={2}
                value={petData.allergies}
                onChange={handleChange}
                className="min-h-[60px] sm:min-h-[80px] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !petData.name}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Add Pet'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPetForm;