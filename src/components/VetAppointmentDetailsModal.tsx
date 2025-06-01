import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Phone, Mail, User, Stethoscope, FileText, X, Edit, Check, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Appointment {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  notes: string | null;
  status: string;
  pet_id: string;
  vet_id: string;
  pet_owner_id: string;
  meeting_url?: string;
  host_meeting_url?: string;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  gender?: string;
  color?: string;
  medical_history?: string;
  allergies?: string;
  medication?: string;
}

interface PetOwner {
  id: string;
  full_name?: string | null;
  phone_number?: string | null;
  address?: string | null;
}

interface VetAppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  pet: Pet | null;
  petOwner: PetOwner | null;
  onReschedule: (id: string, newDate: string, newStartTime: string, newEndTime: string) => void;
  onStatusUpdate: (id: string, newStatus: string) => void;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'confirmed': return "secondary";
    case 'pending': return "default";
    case 'completed': return "outline";
    case 'cancelled': return "destructive";
    default: return "default";
  }
};

const VetAppointmentDetailsModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  pet, 
  petOwner,
  onReschedule,
  onStatusUpdate
}: VetAppointmentDetailsModalProps) => {
  const navigate = useNavigate();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  // Define state for meeting details
  const [meetingDetails, setMeetingDetails] = useState<{
    roomUrl?: string;
    hostRoomUrl?: string;
    meetingId?: string;
    startDate?: string;
    endDate?: string;
  } | null>(null);

  // Load meeting details from localStorage
  useEffect(() => {
    if (appointment?.consultation_type === 'video_call' || appointment?.consultation_type === 'video') {
      console.log('🔍 DEBUG - Looking for video meeting data for appointment (vet view):', {
        id: appointment.id,
        date: appointment.booking_date,
        startTime: appointment.start_time,
        vetId: appointment.vet_id,
        type: appointment.consultation_type
      });
      
      // First try to look up by booking ID
      const meetingKey = `meeting-${appointment.id}`;
      let meetingData = localStorage.getItem(meetingKey);
      console.log('🔍 DEBUG - Checking by ID:', { key: meetingKey, found: !!meetingData });
      
      // If not found, try looking up by date-time-vet combination
      if (!meetingData) {
        const dateTimeKey = `meeting-${appointment.booking_date}-${appointment.start_time.replace(':', '')}-${appointment.vet_id}`;
        meetingData = localStorage.getItem(dateTimeKey);
        console.log('🔍 DEBUG - Checking by date-time-vet:', { key: dateTimeKey, found: !!meetingData });
      }
      
      // If still not found, try ALL localStorage keys - this is a fallback to help debug
      if (!meetingData) {
        console.log('🔍 DEBUG - Checking all localStorage keys:');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('meeting-')) {
            console.log(`  Key: ${key}`);
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              console.log(`  Data:`, data);
            } catch (e) {
              console.log(`  Data: [Error parsing]`);
            }
          }
        });
      }
      
      // Parse and store meeting data if found
      if (meetingData) {
        try {
          const parsedData = JSON.parse(meetingData);
          console.log('✅ DEBUG - Found meeting data for appointment (vet view):', parsedData);
          setMeetingDetails(parsedData);
        } catch (e) {
          console.error('❌ DEBUG - Error parsing meeting data:', e);
        }
      } else {
        console.log('❌ DEBUG - No meeting data found for appointment ID:', appointment.id);
      }
    }
  }, [appointment]);
  
  if (!appointment || !pet || !petOwner) return null;

  const handleReschedule = () => {
    if (newDate && newStartTime && newEndTime) {
      onReschedule(appointment.id, newDate, newStartTime, newEndTime);
      setIsRescheduling(false);
      setNewDate('');
      setNewStartTime('');
      setNewEndTime('');
      onClose();
    }
  };

  const startRescheduling = () => {
    setIsRescheduling(true);
    setNewDate(appointment.booking_date);
    setNewStartTime(appointment.start_time);
    setNewEndTime(appointment.end_time);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Appointment Details</DialogTitle>
            <Badge variant={getStatusBadgeVariant(appointment.status)}>
              {appointment.status}
            </Badge>
          </div>
          <DialogDescription>
            Comprehensive appointment and patient information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Appointment Info Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Appointment Information</h3>
            {isRescheduling ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reschedule-date">Date</Label>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reschedule-start">Start Time</Label>
                  <Input
                    id="reschedule-start"
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reschedule-end">End Time</Label>
                  <Input
                    id="reschedule-end"
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{appointment.booking_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex items-start gap-2">
              <FileText className="h-4 w-4 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{appointment.consultation_type}</p>
              </div>
            </div>

            {appointment.notes && (
              <div className="mt-4 flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p>{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Pet Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Pet Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Pet Name</p>
                  <p className="font-medium">{pet.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Type & Breed</p>
                  <p className="font-medium">{pet.type}{pet.breed && ` - ${pet.breed}`}</p>
                </div>
              </div>
              {pet.age && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{pet.age} years</p>
                  </div>
                </div>
              )}
              {pet.weight && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium">{pet.weight} kg</p>
                  </div>
                </div>
              )}
              {pet.gender && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{pet.gender}</p>
                  </div>
                </div>
              )}
              {pet.color && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-medium">{pet.color}</p>
                  </div>
                </div>
              )}
            </div>

            {pet.medical_history && (
              <div className="mt-4 flex items-start gap-2">
                <Stethoscope className="h-4 w-4 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Medical History</p>
                  <p className="text-sm">{pet.medical_history}</p>
                </div>
              </div>
            )}

            {pet.allergies && (
              <div className="mt-4 flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Allergies</p>
                  <p className="text-sm text-red-600">{pet.allergies}</p>
                </div>
              </div>
            )}

            {pet.medication && (
              <div className="mt-4 flex items-start gap-2">
                <Stethoscope className="h-4 w-4 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Medication</p>
                  <p className="text-sm">{pet.medication}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Pet Owner Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Pet Owner Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Owner Name</p>
                  <p className="font-medium">{petOwner.full_name || 'Unknown Owner'}</p>
                </div>
              </div>
              
              {petOwner.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{petOwner.phone_number}</p>
                  </div>
                </div>
              )}
            </div>
            
            {petOwner.address && (
              <div className="mt-4 flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Address (For Medicine Delivery)</p>
                  <p className="font-medium">{petOwner.address}</p>
                </div>
              </div>
            )}
            
            {!petOwner.phone_number && !petOwner.address && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">
                      Contact information not provided by pet owner. You may ask them to share their phone number and address during the consultation for medicine delivery.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />
          {(appointment.consultation_type === 'video_call' || appointment.consultation_type === 'video') && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Video Consultation</h3>
              <div className="space-y-4">
                {(() => {
                  const now = new Date();
                  const appointmentDate = new Date(`${appointment.booking_date}T${appointment.start_time}`);
                  const endTime = new Date(`${appointment.booking_date}T${appointment.end_time}`);
                  
                  // Calculate time boundaries for joining
                  const earliestJoinTime = new Date(appointmentDate);
                  earliestJoinTime.setMinutes(appointmentDate.getMinutes() - 15); // 15 minutes before appointment
                  
                  // Check if current time is AFTER the end time
                  const hasEnded = now > endTime;
                  
                  // Check if current time is BEFORE the earliest join time (15 min before start)
                  const isTooEarly = now < earliestJoinTime;
                  
                  console.log('Video call access times (vet view):', {
                    now: now.toISOString(),
                    appointmentTime: appointmentDate.toISOString(),
                    endTime: endTime.toISOString(),
                    earliestJoinTime: earliestJoinTime.toISOString(),
                    hasEnded,
                    isTooEarly
                  });

                  if (hasEnded) {
                    return (
                      <div className="text-sm text-muted-foreground">
                        This consultation has ended.
                      </div>
                    );
                  }

                  if (isTooEarly) {
                    return (
                      <div className="text-sm text-muted-foreground">
                        The video call link will be available 15 minutes before the appointment.
                      </div>
                    );
                  }

                  // Check if we have a meeting URL from localStorage or from appointment
                  const meetingUrl = meetingDetails?.roomUrl || appointment.meeting_url;
                  const hostMeetingUrl = meetingDetails?.hostRoomUrl || appointment.host_meeting_url;
                  
                  console.log('Meeting URLs for appointment (vet view):', {
                    fromAppointment: appointment.meeting_url,
                    fromLocalStorage: meetingDetails?.roomUrl,
                    useUrl: meetingUrl,
                    hostUrl: hostMeetingUrl
                  });
                  
                  if (!meetingUrl && !hostMeetingUrl) {
                    return (
                      <div className="text-sm text-muted-foreground">
                        Video call link is not available. Please{' '}
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-sm text-primary underline"
                          onClick={() => {
                            onClose();
                            navigate('/contact');
                          }}
                        >
                          contact support
                        </Button>.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {hostMeetingUrl ? (
                        <Button
                          variant="default"
                          onClick={() => window.open(hostMeetingUrl, '_blank')}
                          className="w-full sm:w-auto"
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Join as Host
                        </Button>
                      ) : meetingUrl ? (
                        <Button
                          variant="default"
                          onClick={() => window.open(meetingUrl, '_blank')}
                          className="w-full sm:w-auto"
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Join Video Call
                        </Button>
                      ) : null}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {isRescheduling ? (
            <>
              <Button
                onClick={handleReschedule}
                className="w-full sm:w-auto"
              >
                <Check className="mr-2 h-4 w-4" /> Confirm Reschedule
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsRescheduling(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                <>
                  <Button
                    onClick={startRescheduling}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="mr-2 h-4 w-4" /> Reschedule
                  </Button>
                  {appointment.status === 'pending' && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onStatusUpdate(appointment.id, 'confirmed');
                        onClose();
                      }}
                      className="w-full sm:w-auto"
                    >
                      <Check className="mr-2 h-4 w-4" /> Confirm
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onStatusUpdate(appointment.id, 'cancelled');
                      onClose();
                    }}
                    className="w-full sm:w-auto"
                  >
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </>
              )}
              {appointment.status === 'confirmed' && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    onStatusUpdate(appointment.id, 'completed');
                    onClose();
                  }}
                  className="w-full sm:w-auto"
                >
                  <Check className="mr-2 h-4 w-4" /> Mark Complete
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="w-full sm:w-auto sm:ml-auto"
              >
                Close
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VetAppointmentDetailsModal;
