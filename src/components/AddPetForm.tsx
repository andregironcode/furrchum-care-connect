
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Dog, Cat, Rabbit, X, Upload } from 'lucide-react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  type: z.string().min(1, 'Pet type is required'),
  breed: z.string().optional(),
  age: z.string().optional(), // Keep as string in the form
  weight: z.string().optional(), // Keep as string in the form
  gender: z.string().optional(),
  color: z.string().optional(),
  chipNumber: z.string().optional(),
  vaccinationStatus: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  medication: z.string().optional(),
  dietType: z.string().optional(),
  specialNeeds: z.string().optional(),
  temperament: z.string().optional(),
  trainingLevel: z.string().optional(),
  favoriteActivity: z.string().optional(),
});

type PetFormValues = z.infer<typeof petSchema>;

interface AddPetFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddPetForm({ onSuccess, onCancel }: AddPetFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: '',
      type: '',
      breed: '',
      age: '',
      weight: '',
      gender: '',
      color: '',
      chipNumber: '',
      vaccinationStatus: '',
      medicalHistory: '',
      allergies: '',
      medication: '',
      dietType: '',
      specialNeeds: '',
      temperament: '',
      trainingLevel: '',
      favoriteActivity: '',
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: PetFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add a pet.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert the new pet into Supabase
      const { data: pet, error } = await supabase
        .from('pets')
        .insert({
          name: data.name,
          type: data.type,
          breed: data.breed || null,
          age: data.age ? parseFloat(data.age) : null, // Convert string to number or null
          weight: data.weight ? parseFloat(data.weight) : null, // Convert string to number or null
          gender: data.gender || null,
          color: data.color || null,
          chip_number: data.chipNumber || null,
          vaccination_status: data.vaccinationStatus || null,
          medical_history: data.medicalHistory || null,
          allergies: data.allergies || null,
          medication: data.medication || null,
          diet_type: data.dietType || null,
          special_needs: data.specialNeeds || null,
          temperament: data.temperament || null,
          training_level: data.trainingLevel || null,
          favorite_activity: data.favoriteActivity || null,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload photo if one was selected
      if (photo && pet) {
        const fileExt = photo.name.split('.').pop();
        const filePath = `${pet.id}.${fileExt}`;

        const { error: uploadError } = await supabase
          .storage
          .from('pet_photos')
          .upload(filePath, photo);

        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
          toast({
            title: "Warning",
            description: "Pet added successfully, but there was an error uploading the photo.",
            variant: "destructive",
          });
        } else {
          // Update pet record with photo URL
          await supabase
            .from('pets')
            .update({ photo_url: filePath })
            .eq('id', pet.id);
        }
      }

      toast({
        title: "Pet Added Successfully",
        description: `${data.name} has been added to your pets.`,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error adding pet:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add pet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add New Pet</h2>
        <Button 
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-gray-500"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center mb-4">
            <div className="rounded-full overflow-hidden w-32 h-32 border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 relative bg-gray-50">
              {photoPreview ? (
                <Avatar className="w-full h-full rounded-full">
                  <AvatarImage src={photoPreview} alt="Pet preview" className="object-cover" />
                  <AvatarFallback>Pet</AvatarFallback>
                </Avatar>
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <Upload className="h-8 w-8" />
                  <span className="text-xs mt-1">Add Photo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-sm text-gray-500">Click to upload a pet photo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Info</h3>
            
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pet Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your pet's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pet Type*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pet type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dog">
                          <div className="flex items-center">
                            <Dog className="mr-2 h-4 w-4 text-orange-500" />
                            <span>Dog</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="cat">
                          <div className="flex items-center">
                            <Cat className="mr-2 h-4 w-4 text-orange-500" />
                            <span>Cat</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="other">
                          <div className="flex items-center">
                            <Rabbit className="mr-2 h-4 w-4 text-orange-500" />
                            <span>Other</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breed</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter breed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chipNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chip Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter chip number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">Physical Attributes</h3>
              
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        placeholder="Enter age" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        placeholder="Enter weight" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">Medical Info</h3>
              
              <FormField
                control={form.control}
                name="vaccinationStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaccination Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="up-to-date">Up to date</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="not-vaccinated">Not vaccinated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical History</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter medical history" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter allergies" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="medication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter medication" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">Other Info</h3>
              
              <FormField
                control={form.control}
                name="dietType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diet Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter diet type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specialNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Needs</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter special needs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="temperament"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperament</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter temperament" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="trainingLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select training level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="favoriteActivity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favorite Activity</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter favorite activity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-orange-300 text-orange-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Pet
                </>
              ) : 'Add Pet'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
