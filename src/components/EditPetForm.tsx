import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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

interface EditPetFormProps {
  pet: Pet;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditPetForm = ({ pet, onSuccess, onCancel }: EditPetFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [vaccinationCertFile, setVaccinationCertFile] = useState<File | null>(null);
  const [petData, setPetData] = useState({
    name: pet.name || '',
    type: pet.type || 'dog',
    breed: pet.breed || '',
    age: pet.age?.toString() || '',
    weight: pet.weight?.toString() || '',
    gender: pet.gender || 'male',
    color: pet.color || '',
    chipNumber: pet.chip_number || '',
    vaccinationStatus: pet.vaccination_status || 'not_vaccinated',
    medicalHistory: pet.medical_history || '',
    allergies: pet.allergies || '',
    medication: pet.medication || '',
    dietType: pet.diet_type || 'regular',
    specialNeeds: pet.special_needs || '',
    temperament: pet.temperament || '',
    trainingLevel: pet.training_level || 'none',
    favoriteActivity: pet.favorite_activity || ''
  });

  useEffect(() => {
    // Set photo preview if pet has existing photo
    if (pet.photo_url) {
      const photoUrl = supabase.storage.from('pet_photos').getPublicUrl(pet.photo_url).data.publicUrl;
      setPhotoPreview(photoUrl);
    }
  }, [pet.photo_url]);

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

  const handleVaccinationCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG) or PDF file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setVaccinationCertFile(file);
      toast.success('Vaccination certificate selected');
    }
  };

  const clearPhotoPreview = () => {
    setPhotoFile(null);
    if (photoPreview && !pet.photo_url) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(pet.photo_url ? supabase.storage.from('pet_photos').getPublicUrl(pet.photo_url).data.publicUrl : null);
  };

  const clearVaccinationCert = () => {
    setVaccinationCertFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to edit a pet');
      return;
    }

    setIsSubmitting(true);
    try {
      let photoUrl: string | null = pet.photo_url;
      let vaccinationCertUrl: string | null = pet.vaccination_certificate_url || null;

      // Upload new photo if exists
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
        photoUrl = filePath;
      }

      // Upload vaccination certificate if exists
      if (vaccinationCertFile) {
        const fileExt = vaccinationCertFile.name.split('.').pop();
        const fileName = `vaccination_cert_${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/vaccination_certificates/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pet_photos')
          .upload(filePath, vaccinationCertFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
        vaccinationCertUrl = filePath;
      }

      // Update pet data
      const { error: updateError } = await supabase
        .from('pets')
        .update({
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
          photo_url: photoUrl,
          vaccination_certificate_url: vaccinationCertUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', pet.id);

      if (updateError) throw updateError;

      toast.success('Pet updated successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating pet:', error);
      toast.error(error.message || 'Failed to update pet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Edit Pet Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Pet Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter pet name"
                    required
                    value={petData.name}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">Pet Type *</Label>
                  <Select
                    value={petData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                    required
                  >
                    <SelectTrigger className="h-11">
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

                <div className="space-y-2">
                  <Label htmlFor="breed" className="text-sm font-medium">Breed</Label>
                  <Input
                    id="breed"
                    name="breed"
                    placeholder="Enter breed"
                    value={petData.breed}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
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
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
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
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                    <Select
                      value={petData.gender}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color" className="text-sm font-medium">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      placeholder="Enter color"
                      value={petData.color}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Pet Photo</Label>
                  <div className="flex flex-col items-center space-y-3">
                    {photoPreview && (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Pet preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={clearPhotoPreview}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {!photoPreview && (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="photo"
                        className="bg-primary text-white py-2 px-4 rounded-md cursor-pointer hover:bg-primary/90 text-sm"
                      >
                        {photoPreview ? 'Change Photo' : 'Select Photo'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chipNumber" className="text-sm font-medium">Microchip Number</Label>
                  <Input
                    id="chipNumber"
                    name="chipNumber"
                    placeholder="Enter microchip number"
                    value={petData.chipNumber}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vaccinationStatus" className="text-sm font-medium">Vaccination Status</Label>
                  <Select
                    value={petData.vaccinationStatus}
                    onValueChange={(value) => handleSelectChange('vaccinationStatus', value)}
                  >
                    <SelectTrigger className="h-11">
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

                {/* Vaccination Certificate Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vaccination Certificate</Label>
                  <div className="space-y-2">
                    {pet.vaccination_certificate_url && !vaccinationCertFile && (
                      <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Certificate uploaded</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = supabase.storage.from('pet_photos').getPublicUrl(pet.vaccination_certificate_url!).data.publicUrl;
                            window.open(url, '_blank');
                          }}
                        >
                          View
                        </Button>
                      </div>
                    )}
                    {vaccinationCertFile && (
                      <div className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700">{vaccinationCertFile.name}</span>
                        <button
                          type="button"
                          onClick={clearVaccinationCert}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Input
                        id="vaccinationCert"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleVaccinationCertChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="vaccinationCert"
                        className="bg-blue-500 text-white py-2 px-4 rounded-md cursor-pointer hover:bg-blue-600 text-sm"
                      >
                        {pet.vaccination_certificate_url || vaccinationCertFile ? 'Change Certificate' : 'Upload Certificate'}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">Upload vaccination certificate (Image or PDF, max 5MB)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalHistory" className="text-sm font-medium">Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    placeholder="Enter any relevant medical history"
                    rows={3}
                    value={petData.medicalHistory}
                    onChange={handleChange}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-sm font-medium">Allergies</Label>
                  <Textarea
                    id="allergies"
                    name="allergies"
                    placeholder="Enter any allergies"
                    rows={2}
                    value={petData.allergies}
                    onChange={handleChange}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medication" className="text-sm font-medium">Current Medication</Label>
                  <Textarea
                    id="medication"
                    name="medication"
                    placeholder="Enter current medications"
                    rows={2}
                    value={petData.medication}
                    onChange={handleChange}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !petData.name}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Pet'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPetForm; 