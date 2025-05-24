import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Clock, CalendarIcon, MapPin, Phone, Star, CheckCircle, Badge as BadgeIcon, Loader2, Video as VideoIcon, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createMeeting } from '@/lib/whereby';

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

interface BookingData {
  vet_id: string;
  pet_owner_id: string;
  pet_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  consultation_type: 'in_person' | 'video_call';
  notes: string;
  meeting_id: string | null;
  meeting_url: string | null;
  host_meeting_url: string | null;
}

const BookingPage = () => {
  const { vetId } = useParams<{ vetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [vet, setVet] = useState<VetDetails | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [pet, setPet] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'in_person' | 'video_call'>('in_person');
  const [duration, setDuration] = useState<number>(30); // Default to 30 minutes
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityByDay, setAvailabilityByDay] = useState<Record<number, VetAvailability>>({});

  const fetchVetDetails = useCallback(async () => {
    if (!vetId) return;
    
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
      console.error('Error fetching vet details:', error);
      toast.error('Failed to load veterinarian details');
    } finally {
      setIsLoading(false);
    }
  }, [vetId]);

  const fetchUserPets = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingPets(true);
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id);
      
      if (error) throw error;
      
      // Convert the data to match our Pet interface
      const formattedPets = (data || []).map(pet => ({
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed || ''
      }));
      
      setPets(formattedPets);
      
      // Auto-select the first pet if available
      if (formattedPets.length > 0) {
        setPet(formattedPets[0].id);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast.error('Failed to load your pets');
      setPets([]);
    } finally {
      setIsLoadingPets(false);
    }
  }, [user]);

  const fetchVetAvailability = useCallback(async () => {
    if (!vetId) return;
    
    try {
      const { data, error } = await supabase
        .from('vet_availability')
        .select('*')
        .eq('vet_id', vetId);
      
      if (error) throw error;
      
      // Convert array to object with day_of_week as key
      const availabilityMap: Record<number, VetAvailability> = {};
      data?.forEach(avail => {
        availabilityMap[avail.day_of_week] = avail;
      });
      
      setAvailabilityByDay(availabilityMap);
    } catch (error) {
      console.error('Error fetching vet availability:', error);
      toast.error('Failed to load availability');
    }
  }, [vetId]);

  // Calculate available time slots based on vet's availability
  useEffect(() => {
    if (!date || !availabilityByDay) return;
    
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const availability = availabilityByDay[dayOfWeek];
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (!availability) {
      setTimeSlots([]);
      return;
    }
    
    // Don't show past time slots for today
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const startTime = availability.start_time;
    const endTime = availability.end_time;
    
    if (!startTime || !endTime) {
      setTimeSlots([]);
      return;
    }
    
    const startTimeParts = startTime.split(':');
    const endTimeParts = endTime.split(':');
    
    const startHour = parseInt(startTimeParts[0], 10);
    const startMinute = parseInt(startTimeParts[1], 10);
    const endHour = parseInt(endTimeParts[0], 10);
    const endMinute = parseInt(endTimeParts[1], 10);
    
    // Generate time slots based on selected duration
    const slots: string[] = [];
    let currentHourSlot = startHour;
    let currentMinuteSlot = startMinute;
    
    while (currentHourSlot < endHour || (currentHourSlot === endHour && currentMinuteSlot < endMinute)) {
      // Calculate slot end time
      const slotEndHour = currentMinuteSlot + duration > 59 ? currentHourSlot + 1 : currentHourSlot;
      const slotEndMinute = (currentMinuteSlot + duration) % 60;
      
      // Check if the slot fits before the end of the vet's availability
      if (slotEndHour > endHour || (slotEndHour === endHour && slotEndMinute > endMinute)) {
        break;
      }
      
      const formattedHour = currentHourSlot.toString().padStart(2, '0');
      const formattedMinute = currentMinuteSlot.toString().padStart(2, '0');
      
      // Skip past time slots for today
      if (isToday) {
        const slotTime = new Date();
        slotTime.setHours(currentHourSlot, currentMinuteSlot, 0, 0);
        if (slotTime >= now) {
          slots.push(`${formattedHour}:${formattedMinute}`);
        }
      } else {
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
      
      // Move to next slot (30-minute intervals for better UX)
      if (currentMinuteSlot + 30 > 59) {
        currentHourSlot += 1;
        currentMinuteSlot = 0;
      } else {
        currentMinuteSlot += 30;
      }
    }
    
    setTimeSlots(slots);
    
    // Reset selected time slot if the current one is not available in the new day
    if (timeSlot && !slots.includes(timeSlot)) {
      setTimeSlot('');
    }
  }, [date, availabilityByDay, timeSlot, duration]);

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
  }, [vetId, user, navigate, fetchVetDetails, fetchUserPets, fetchVetAvailability]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const validateBookingDetails = () => {
    if (!date) throw new Error("Please select a date for your appointment");
    if (!timeSlot) throw new Error("Please select a time slot");
    if (!pet) throw new Error("Please select a pet for the consultation");
    if (!user) throw new Error("You must be logged in to book an appointment");
    if (!vet) throw new Error("Veterinarian information is missing");
    
    // Validate consultation type availability
    if (consultationType === 'video_call' && !vet.offers_video_calls) {
      throw new Error("This veterinarian does not offer video call consultations");
    }
    
    if (consultationType === 'in_person' && !vet.offers_in_person) {
      throw new Error("This veterinarian does not offer in-person consultations");
    }
  };

  const createVideoMeeting = async (appointmentDate: Date) => {
    try {
      // Create a new date object for the meeting end time based on selected duration
      const endDate = new Date(appointmentDate);
      endDate.setMinutes(endDate.getMinutes() + duration);
      
      return await createMeeting({
        startDate: appointmentDate.toISOString(),
        endDate: endDate.toISOString(),
        roomNamePrefix: `vet-consult-${vetId}-${Date.now()}`,
        isLocked: true,
        fields: ['hostRoomUrl', 'viewerRoomUrl'],
        roomModeProps: {
          isWaitingRoomEnabled: true,
          isLocked: true,
          isRecordingEnabled: false
        }
      });
    } catch (error) {
      console.error("Error creating video meeting:", error);
      throw new Error("Failed to create video meeting. Please try again or select in-person consultation.");
    }
  };

  const saveBookingToDatabase = async (bookingData: Omit<BookingData, 'id'>) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();
    
    if (error) throw error;
    return data;
  };

  const handleProceedToConfirmation = async () => {
    try {
      // Validate all required fields
      validateBookingDetails();
      
      // Parse and validate the selected time
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const appointmentDate = new Date(date!);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      if (appointmentDate <= new Date()) {
        throw new Error("Please select a future time for your appointment");
      }

      // Calculate end time (30 minutes after start)
      const endDate = new Date(appointmentDate);
      endDate.setMinutes(endDate.getMinutes() + 30);

      // Format times for database
      const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:00`;
      const formattedDate = format(date!, 'yyyy-MM-dd');

      setIsSubmitting(true);
      
      // Create video meeting if needed
      let meetingData = null;
      if (consultationType === 'video_call') {
        meetingData = await createVideoMeeting(appointmentDate);
      }
      
      // Prepare booking data
      const bookingData = {
        vet_id: vetId,
        pet_owner_id: user!.id,
        pet_id: pet,
        booking_date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        consultation_type: consultationType,
        notes: notes,
        meeting_id: meetingData?.roomUrl?.split('/').pop() || null,
        meeting_url: meetingData?.viewerRoomUrl || null,
        host_meeting_url: meetingData?.hostRoomUrl || null,
      };
      
      // Save booking to database
      await saveBookingToDatabase(bookingData);
      
      // Show success and navigate
      toast.success("Appointment booked successfully!");
      navigate("/appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error(error instanceof Error ? error.message : 'An error occurred while processing your booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!vet) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center text-red-500">Veterinarian not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        ← Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Vet Info */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center">
                {vet.image_url ? (
                  <img 
                    src={vet.image_url} 
                    alt={`${vet.first_name} ${vet.last_name}`}
                    className="w-32 h-32 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <span className="text-2xl text-gray-500">
                      {vet.first_name[0]}{vet.last_name[0]}
                    </span>
                  </div>
                )}
                <h2 className="text-xl font-bold">Dr. {vet.first_name} {vet.last_name}</h2>
                <p className="text-gray-600">{vet.specialization}</p>
                <div className="flex items-center mt-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-medium">{vet.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">About</h3>
                  <p className="text-sm text-gray-600">{vet.about}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Services</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>In-Person: {vet.offers_in_person ? 'Available' : 'Not Available'}</span>
                    </div>
                    <div className="flex items-center">
                      <VideoIcon className="h-4 w-4 text-blue-500 mr-2" />
                      <span>Video Call: {vet.offers_video_calls ? 'Available' : 'Not Available'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Contact</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{vet.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{vet.clinic_location}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {vet.languages?.map((lang, index) => (
                      <Badge key={index} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Booking Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Book an Appointment</CardTitle>
              <CardDescription>
                Select a date and time for your {consultationType === 'video_call' ? 'video' : 'in-person'} consultation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Consultation Type */}
                <div className="space-y-2">
                  <Label htmlFor="consultation-type">Consultation Type</Label>
                  <RadioGroup
                    id="consultation-type"
                    value={consultationType}
                    onValueChange={(value: 'in_person' | 'video_call') => setConsultationType(value)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="in_person" id="in-person" className="peer sr-only" disabled={!vet.offers_in_person} />
                      <Label
                        htmlFor="in-person"
                        className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer ${!vet.offers_in_person ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <UsersIcon className="mb-3 h-6 w-6" />
                        <span>In-Person</span>
                        {!vet.offers_in_person && (
                          <span className="text-xs text-muted-foreground">Not Available</span>
                        )}
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem 
                        value="video_call" 
                        id="video-call" 
                        className="peer sr-only" 
                        disabled={!vet.offers_video_calls} 
                      />
                      <Label
                        htmlFor="video-call"
                        className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer ${!vet.offers_video_calls ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <VideoIcon className="mb-3 h-6 w-6" />
                        <span>Video Call</span>
                        {!vet.offers_video_calls && (
                          <span className="text-xs text-muted-foreground">Not Available</span>
                        )}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Duration Selector */}
                {consultationType === 'video_call' && (
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      value={duration.toString()}
                      onValueChange={(value) => setDuration(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Date Picker */}
                <div>
                  <h3 className="font-medium mb-2">Select Date</h3>
                  <div className="rounded-md border">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                      disabled={(date) => {
                        const day = date.getDay();
                        return !availabilityByDay[day];
                      }}
                      fromDate={new Date()}
                      toDate={addDays(new Date(), 30)}
                      initialFocus
                    />
                  </div>
                </div>
                
                {/* Time Slot Picker */}
                {date && (
                  <div>
                    <h3 className="font-medium mb-2">Select Time</h3>
                    {timeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={timeSlot === slot ? 'default' : 'outline'}
                            onClick={() => setTimeSlot(slot)}
                            className="h-10"
                          >
                            {formatTime(slot)}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No available time slots for this date. Please select another date.
                      </p>
                    )}
                  </div>
                )}
                
                {/* Pet Selection */}
                <div>
                  <h3 className="font-medium mb-2">Select Pet</h3>
                  {isLoadingPets ? (
                    <div className="flex items-center justify-center h-20">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : pets.length > 0 ? (
                    <Select value={pet} onValueChange={setPet}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a pet" />
                      </SelectTrigger>
                      <SelectContent>
                        {pets.map((pet) => (
                          <SelectItem key={pet.id} value={pet.id}>
                            {pet.name} ({pet.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No pets found. Please add a pet to your profile first.
                      <Button 
                        variant="link" 
                        className="p-0 ml-2 h-auto"
                        onClick={() => navigate('/profile/pets')}
                      >
                        Add Pet
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Notes */}
                <div>
                  <h3 className="font-medium mb-2">Notes (Optional)</h3>
                  <Textarea
                    placeholder="Any specific concerns or details you'd like to share with the veterinarian?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                
                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Appointment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{date ? format(date, 'PPP') : 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span>{timeSlot ? formatTime(timeSlot) : 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">
                        {consultationType === 'video_call' ? 'Video Call' : 'In-Person'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pet:</span>
                      <span>{pets.find(p => p.id === pet)?.name || 'Not selected'}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Consultation Fee:</span>
                      <span>${vet.consultation_fee?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <Button 
                  onClick={handleProceedToConfirmation}
                  disabled={
                    isSubmitting || 
                    !date || 
                    !timeSlot || 
                    !pet || 
                    (consultationType === 'in_person' && !vet.offers_in_person) ||
                    (consultationType === 'video_call' && !vet.offers_video_calls)
                  }
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {consultationType === 'video_call' ? 'Creating Meeting...' : 'Booking...'}
                    </>
                  ) : (
                    <>
                      {consultationType === 'video_call' ? (
                        <>
                          <VideoIcon className="mr-2 h-4 w-4" />
                          Book Video Call (${vet.consultation_fee?.toFixed(2) || '0.00'})
                        </>
                      ) : (
                        <>
                          <UsersIcon className="mr-2 h-4 w-4" />
                          Book In-Person (${vet.consultation_fee?.toFixed(2) || '0.00'})
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
