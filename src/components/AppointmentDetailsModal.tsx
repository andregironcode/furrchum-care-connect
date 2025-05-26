import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Phone, Mail, User, Stethoscope, FileText, X } from "lucide-react";

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
  meeting_id?: string | null;
  meeting_url?: string | null;
  host_meeting_url?: string | null;
}

interface Pet {
  id: string;
  name: string;
  species?: string;
  type?: string;
  breed?: string | null;
  owner_id: string;
}

interface Vet {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  specialization?: string | null;
  phone?: string | null;
  zip_code?: string | null;
  about?: string | null;
}

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  pet: Pet | null;
  vet: Vet | null;
  onCancelAppointment: (id: string) => void;
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

const AppointmentDetailsModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  pet, 
  vet,
  onCancelAppointment 
}: AppointmentDetailsModalProps) => {
  // Always define state hooks at the top level
  const [meetingDetails, setMeetingDetails] = useState<{
    roomUrl?: string;
    hostRoomUrl?: string;
    meetingId?: string;
    startDate?: string;
    endDate?: string;
  } | null>(null);
  
  // Load meeting details from localStorage
  useEffect(() => {
    // Safety check inside the effect
    if (!isOpen || !appointment || !pet || !vet) return;
    
    if (appointment.consultation_type === 'video_call') {
      console.log('🔍 DEBUG - Looking for video meeting data for appointment:', {
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
          console.log('✅ DEBUG - Found meeting data for appointment:', parsedData);
          setMeetingDetails(parsedData);
        } catch (e) {
          console.error('❌ DEBUG - Error parsing meeting data:', e);
        }
      } else {
        console.log('❌ DEBUG - No meeting data found for appointment ID:', appointment.id);
      }
    }
  }, [isOpen, appointment, pet, vet]);

  // Early return for safety (in case component renders despite the hooks check)
  if (!isOpen || !appointment || !pet || !vet) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Appointment Details</DialogTitle>
            <Badge variant={getStatusBadgeVariant(appointment.status)}>
              {appointment.status}
            </Badge>
          </div>
          <DialogDescription>
            View your appointment information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Appointment Info Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Appointment Information</h3>
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
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <div>
                <span className="text-sm font-medium">Pet:</span>
                <p className="text-base">{pet.name} - {pet.species || pet.type || 'Pet'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Vet Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Veterinarian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-sm font-medium">Veterinarian:</span>
                  <p className="text-base">{vet.full_name ? 
                    vet.full_name : 
                    `Dr. ${vet.first_name || ''} ${vet.last_name || ''}`.trim()}</p>
                </div>
              </div>
              
              {vet.specialization && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Specialization</p>
                    <p className="font-medium">{vet.specialization}</p>
                  </div>
                </div>
              )}
            </div>

            {vet.phone && (
              <div className="mt-4 flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{vet.phone}</p>
                </div>
              </div>
            )}
            
            {vet.zip_code && (
              <div className="mt-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">Zip Code: {vet.zip_code}</p>
                </div>
              </div>
            )}

            {vet.about && (
              <div className="mt-4 flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">About</p>
                  <p className="text-sm">{vet.about}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Call Section */}
        {appointment.consultation_type === 'video_call' && (
          <>
            <Separator />
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
                  
                  console.log('Video call access times:', {
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
                  
                  console.log('Meeting URLs for appointment:', {
                    fromAppointment: appointment.meeting_url,
                    fromLocalStorage: meetingDetails?.roomUrl,
                    useUrl: meetingUrl
                  });
                  
                  if (!meetingUrl) {
                    return (
                      <div className="text-sm text-muted-foreground">
                        Video call link is not available. Please contact support.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <Button
                        variant="default"
                        onClick={() => window.open(meetingUrl, '_blank')}
                        className="w-full sm:w-auto"
                      >
                        Join Video Call
                      </Button>
                      
                      {hostMeetingUrl && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-1">For veterinarians only:</p>
                          <Button
                            variant="outline"
                            onClick={() => window.open(hostMeetingUrl, '_blank')}
                            className="w-full sm:w-auto"
                            size="sm"
                          >
                            Join as Host
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
            <Button
              variant="destructive"
              onClick={() => {
                onCancelAppointment(appointment.id);
                onClose();
              }}
              className="w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" /> Cancel Appointment
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full sm:w-auto sm:ml-auto"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;
