
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays, parse } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertCircle, CalendarIcon, Clock, Video, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface VetDetails {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  consultation_fee: number;
  image_url: string;
  availability: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
}

interface VetAvailability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

const BookingPage = () => {
  const { vetId } = useParams<{ vetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [pet, setPet] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data states
  const [vet, setVet] = useState<VetDetails | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [availabilityByDay, setAvailabilityByDay] = useState<{[key: number]: VetAvailability}>({});
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  useEffect(() => {
    if (!user) {
      toast.error("Please login to book a consultation");
      navigate("/auth");
      return;
    }
    
    if (vetId) {
      fetchVetDetails();
      fetchUserPets();
      fetchVetAvailability();
    }
  }, [vetId, user]);
  
  useEffect(() => {
    if (date && availabilityByDay) {
      generateTimeSlotsForDate(date);
    }
  }, [date, availabilityByDay]);

  const fetchVetDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vet_profiles')
        .select('id, first_name, last_name, specialization, consultation_fee, image_url, availability')
        .eq('id', vetId)
        .single();
      
      if (error) throw error;
      setVet(data);
    } catch (error) {
      console.error("Error fetching vet details:", error);
      toast.error("Failed to load veterinarian details");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUserPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('id, name, type as species, breed')
        .eq('owner_id', user?.id);
      
      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error("Error fetching pets:", error);
      toast.error("Failed to load your pets");
    }
  };
  
  const fetchVetAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('vet_availability')
        .select('id, day_of_week, start_time, end_time')
        .eq('vet_id', vetId)
        .eq('is_available', true);
      
      if (error) throw error;
      
      // Group availability by day of week
      const availabilityMap: {[key: number]: VetAvailability} = {};
      data?.forEach(slot => {
        availabilityMap[slot.day_of_week] = slot;
      });
      
      setAvailabilityByDay(availabilityMap);
    } catch (error) {
      console.error("Error fetching vet availability:", error);
      toast.error("Failed to load veterinarian availability");
    }
  };

  const generateTimeSlotsForDate = (selectedDate: Date) => {
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = selectedDate.getDay();
    
    // Check if vet is available on this day
    const dayAvailability = availabilityByDay[dayOfWeek];
    
    if (!dayAvailability) {
      setTimeSlots([]);
      return;
    }
    
    // Parse start and end times
    const startTimeParts = dayAvailability.start_time.split(':');
    const endTimeParts = dayAvailability.end_time.split(':');
    
    const startHour = parseInt(startTimeParts[0], 10);
    const startMinute = parseInt(startTimeParts[1], 10);
    const endHour = parseInt(endTimeParts[0], 10);
    
    // Generate 30-minute slots
    const slots: string[] = [];
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < parseInt(endTimeParts[1], 10))) {
      const formattedHour = currentHour.toString().padStart(2, '0');
      const formattedMinute = currentMinute.toString().padStart(2, '0');
      slots.push(`${formattedHour}:${formattedMinute}`);
      
      // Advance 30 minutes
      if (currentMinute === 30) {
        currentHour += 1;
        currentMinute = 0;
      } else {
        currentMinute = 30;
      }
    }
    
    setTimeSlots(slots);
    
    // Reset selected time slot if the current one is not available in the new day
    if (timeSlot && !slots.includes(timeSlot)) {
      setTimeSlot('');
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const handleProceedToConfirmation = async () => {
    // Validation
    if (!date) {
      toast.error("Please select a date for your appointment");
      return;
    }
    
    if (!timeSlot) {
      toast.error("Please select a time slot");
      return;
    }
    
    if (!pet) {
      toast.error("Please select a pet for the consultation");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to book an appointment");
      navigate("/auth");
      return;
    }
    
    if (!vet) {
      toast.error("Veterinarian information is missing");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate end time (30 minutes after start)
      const [hours, minutes] = timeSlot.split(':');
      const startTime = `${hours}:${minutes}:00`;
      
      // Parse the start time to calculate end time
      const startHour = parseInt(hours, 10);
      let startMinute = parseInt(minutes, 10);
      
      // Add 30 minutes
      let endHour = startHour;
      let endMinute = startMinute + 30;
      
      // Handle minute overflow
      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }
      
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;
      
      // Format the date for PostgreSQL
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Insert booking into database
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            vet_id: vetId,
            pet_owner_id: user.id,
            pet_id: pet,
            booking_date: formattedDate,
            start_time: startTime,
            end_time: endTime,
            consultation_type: 'in_person', // Only in-person consultations for now
            notes: notes,
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Appointment booked successfully!");
      navigate("/appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/vets')}
          className="mb-6"
        >
          ← Back to Veterinarians
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vet Information */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Veterinarian</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Clock className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : vet ? (
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                    {vet.image_url ? (
                      <img 
                        src={vet.image_url}
                        alt={`${vet.first_name} ${vet.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {vet.first_name?.[0]}{vet.last_name?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold">Dr. {vet.first_name} {vet.last_name}</h3>
                  <p className="text-emerald-600">{vet.specialization}</p>
                  <div className="mt-2 text-sm text-slate-600">
                    Base Consultation Fee: ${vet.consultation_fee}
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500">
                  Veterinarian not found
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Booking Form */}
          <Card className="md:col-span-2 bg-white">
            <CardHeader>
              <CardTitle>Book In-Person Consultation</CardTitle>
              <CardDescription>Select date and time for your visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Consultation Type Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800">
                <div className="font-medium mb-1">In-person consultations only</div>
                <div>Video consultations are coming soon! Currently, only in-person visits are available.</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Select Date</h3>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => {
                      // Disable dates in the past
                      if (date < new Date()) return true;
                      
                      // Disable days of the week where vet is not available
                      const dayOfWeek = date.getDay();
                      return !availabilityByDay[dayOfWeek];
                    }}
                    className="border rounded-md"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-3">Select Time</h3>
                  {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <Button 
                          key={slot}
                          variant={timeSlot === slot ? "default" : "outline"}
                          className={`text-sm ${timeSlot === slot ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                          onClick={() => setTimeSlot(slot)}
                        >
                          {formatTime(slot)}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-gray-50 border rounded-md text-gray-500">
                      {date ? "No available time slots for this date" : "Please select a date first"}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Pet Selection */}
              <div>
                <h3 className="font-medium mb-3">Select Pet</h3>
                {pets.length > 0 ? (
                  <Select value={pet} onValueChange={setPet}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} ({pet.breed || pet.species})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-center p-4 bg-gray-50 border rounded-md text-gray-500">
                    You don't have any pets registered. Please add a pet first.
                  </div>
                )}
              </div>
              
              {/* Notes */}
              <div>
                <h3 className="font-medium mb-3">Notes (Optional)</h3>
                <textarea
                  className="w-full h-24 p-3 border rounded-md"
                  placeholder="Any additional information about your pet's condition..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleProceedToConfirmation} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isSubmitting || !date || !timeSlot || !pet}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
