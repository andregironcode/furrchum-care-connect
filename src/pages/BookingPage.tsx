import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Clock, CalendarIcon, MapPin, Phone, Star, CheckCircle, Badge as BadgeIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface VetDetails {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  consultation_fee: number;
  image_url: string;
  availability: string;
  about: string;
  years_experience: number;
  languages: string[];
  rating: number;
  zip_code: string;
  phone: string;
  clinic_location: string;
  offers_video_calls: boolean;
  offers_in_person: boolean;
}

interface Pet {
  id: string;
  name: string;
  type: string;
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
  const [isLoadingPets, setIsLoadingPets] = useState(false);
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
        .select(`
          id, 
          first_name, 
          last_name, 
          specialization, 
          consultation_fee, 
          image_url, 
          availability,
          about,
          years_experience,
          languages,
          rating,
          zip_code,
          phone,
          clinic_location,
          offers_video_calls,
          offers_in_person
        `)
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
      setIsLoadingPets(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error fetching pets:', error);
        throw error;
      }

      // Convert the data to match our Pet interface
      if (data) {
        const formattedPets = data.map(pet => ({
          id: pet.id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed || ''
        }));
        setPets(formattedPets);
      } else {
        setPets([]);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast.error('Failed to load your pets');
      setPets([]);
    } finally {
      setIsLoadingPets(false);
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
          {/* Vet Information - Enhanced */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Veterinarian Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Clock className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : vet ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
                      {vet.image_url ? (
                        <img 
                          src={vet.image_url}
                          alt={`${vet.first_name} ${vet.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">
                            {vet.first_name?.[0]}{vet.last_name?.[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-center">Dr. {vet.first_name} {vet.last_name}</h3>
                    <p className="text-emerald-600 text-center">{vet.specialization}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center mt-1">
                      <div className="flex items-center text-yellow-500 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(vet.rating) ? "fill-current" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{vet.rating}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Experience & Languages */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>{vet.years_experience || 5} years experience</span>
                    </div>
                    
                    {vet.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-blue-500 mr-2" />
                        <span>{vet.phone}</span>
                      </div>
                    )}
                    
                    {vet.zip_code && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-red-500 mr-2" />
                        <span>{vet.zip_code}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Languages */}
                  {vet.languages && vet.languages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-1">
                        {vet.languages.map((lang, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{lang}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Consultation Types */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Available Services</h4>
                    <div className="space-y-1">
                      {vet.offers_in_person && (
                        <div className="flex items-center text-sm">
                          <BadgeIcon className="h-3 w-3 text-green-500 mr-2" />
                          <span>In-person consultations</span>
                        </div>
                      )}
                      {vet.offers_video_calls && (
                        <div className="flex items-center text-sm">
                          <BadgeIcon className="h-3 w-3 text-blue-500 mr-2" />
                          <span>Video consultations</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* About */}
                  {vet.about && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">About</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{vet.about}</p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Consultation Fee */}
                  <div className="text-center bg-green-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600">Consultation Fee</div>
                    <div className="text-lg font-semibold text-green-700">${vet.consultation_fee}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500">
                  Veterinarian not found
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Booking Form - Fixed Calendar Layout */}
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Select Date</h3>
                  <div className="w-full overflow-hidden">
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
                      className="border rounded-md w-full"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4 w-full",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "space-x-1 flex items-center",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex w-full",
                        head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex-1 text-center",
                        row: "flex w-full mt-2",
                        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1",
                        day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground mx-auto",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Select Time</h3>
                  {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
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
                          {pet.name} ({pet.breed || pet.type})
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
                <Textarea
                  placeholder="Any additional information about your pet's condition..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-24"
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
