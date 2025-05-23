
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertCircle, CalendarIcon, Clock, Video, MessageSquare } from 'lucide-react';

const BookingPage = () => {
  const { vetId } = useParams<{ vetId: string }>();
  const navigate = useNavigate();
  const [consultationType, setConsultationType] = useState<'schedule' | 'immediate'>('schedule');
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [pet, setPet] = useState<string>('');
  const [consultationMode, setConsultationMode] = useState<'video' | 'chat'>('video');

  // Mock data for the selected vet
  const vet = {
    id: vetId,
    name: 'Dr. Sarah Johnson',
    specialization: 'General Practice',
    fee: 45,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop',
    availability: 'Available Now'
  };

  // Mock pets data
  const pets = [
    { id: '1', name: 'Max', species: 'Dog', breed: 'Golden Retriever' },
    { id: '2', name: 'Luna', species: 'Cat', breed: 'Siamese' },
    { id: '3', name: 'Charlie', species: 'Dog', breed: 'Beagle' }
  ];

  // Mock time slots
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
  ];

  const handleProceedToPayment = () => {
    // Validation
    if (consultationType === 'schedule' && (!date || !timeSlot)) {
      toast.error("Please select a date and time slot");
      return;
    }
    
    if (!pet) {
      toast.error("Please select a pet for the consultation");
      return;
    }

    // Prepare booking data to pass to payment page
    const bookingData = {
      vetId,
      vetName: vet.name,
      petId: pet,
      petName: pets.find(p => p.id === pet)?.name,
      consultationType,
      consultationMode,
      fee: consultationType === 'immediate' ? vet.fee * 1.5 : vet.fee,
      date: date ? format(date, 'yyyy-MM-dd') : null,
      timeSlot: consultationType === 'schedule' ? timeSlot : 'Immediate'
    };

    // In a real app, you'd store this in state management or sessionStorage
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    navigate('/payment');
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
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                  <img 
                    src={vet.image}
                    alt={vet.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold">{vet.name}</h3>
                <p className="text-emerald-600">{vet.specialization}</p>
                <div className="mt-2 text-sm text-slate-600">
                  Base Consultation Fee: ${vet.fee}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Booking Form */}
          <Card className="md:col-span-2 bg-white">
            <CardHeader>
              <CardTitle>Book Your Consultation</CardTitle>
              <CardDescription>Choose your preferred consultation type and time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Consultation Type */}
              <div>
                <h3 className="font-medium mb-3">Consultation Type</h3>
                <RadioGroup 
                  value={consultationType} 
                  onValueChange={(v) => setConsultationType(v as 'schedule' | 'immediate')}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="schedule" id="schedule" className="peer sr-only" />
                    <Label
                      htmlFor="schedule"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-primary"
                    >
                      <CalendarIcon className="mb-3 h-6 w-6" />
                      <div className="font-medium">Scheduled Consultation</div>
                      <div className="text-xs text-center mt-1">Book at your convenience</div>
                      <div className="font-medium text-center mt-2">${vet.fee}</div>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="immediate" id="immediate" className="peer sr-only" />
                    <Label
                      htmlFor="immediate"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-primary"
                    >
                      <AlertCircle className="mb-3 h-6 w-6 text-red-500" />
                      <div className="font-medium">Immediate Consultation</div>
                      <div className="text-xs text-center mt-1">For urgent cases</div>
                      <div className="font-medium text-center mt-2 text-red-500">${Math.round(vet.fee * 1.5)} (Premium)</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Scheduled Consultation Options */}
              {consultationType === 'schedule' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Select Date</h3>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        className="border rounded-md"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium mb-3">Select Time</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((slot) => (
                          <Button 
                            key={slot}
                            variant={timeSlot === slot ? "default" : "outline"}
                            className={`text-sm ${timeSlot === slot ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                            onClick={() => setTimeSlot(slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Immediate Consultation Notice */}
              {consultationType === 'immediate' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">
                  <div className="font-medium mb-1">Immediate consultation will connect you with the first available veterinarian.</div>
                  <div>Premium fee applies for priority service. You may have to wait briefly in a virtual waiting room.</div>
                </div>
              )}
              
              {/* Pet Selection */}
              <div>
                <h3 className="font-medium mb-3">Select Pet</h3>
                <Select value={pet} onValueChange={setPet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} ({pet.breed})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Consultation Mode */}
              <div>
                <h3 className="font-medium mb-3">Consultation Mode</h3>
                <RadioGroup 
                  value={consultationMode} 
                  onValueChange={(v) => setConsultationMode(v as 'video' | 'chat')}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="video" id="video" className="peer sr-only" />
                    <Label
                      htmlFor="video"
                      className="flex items-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Video className="h-5 w-5" />
                      <div>Video Call</div>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="chat" id="chat" className="peer sr-only" />
                    <Label
                      htmlFor="chat"
                      className="flex items-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <div>Chat Only</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleProceedToPayment} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Proceed to Payment
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
