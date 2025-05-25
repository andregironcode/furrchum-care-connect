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
  type: string;
}

interface Vet {
  id: string;
  first_name: string;
  last_name: string;
  specialization?: string;
  phone?: string;
  zip_code?: string;
  about?: string;
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
  if (!appointment || !pet || !vet) return null;

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
                <p className="text-sm text-muted-foreground">Pet Name & Type</p>
                <p className="font-medium">{pet.name} - {pet.type}</p>
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
                  <p className="text-sm text-muted-foreground">Veterinarian</p>
                  <p className="font-medium">Dr. {vet.first_name} {vet.last_name}</p>
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
                  const isWithin15Minutes = appointmentDate.getTime() - now.getTime() <= 15 * 60 * 1000;
                  const hasStarted = now >= appointmentDate;
                  const hasEnded = now > endTime;

                  if (hasEnded) {
                    return (
                      <div className="text-sm text-muted-foreground">
                        This consultation has ended.
                      </div>
                    );
                  }

                  if (!hasStarted && !isWithin15Minutes) {
                    return (
                      <div className="text-sm text-muted-foreground">
                        The video call link will be available 15 minutes before the appointment.
                      </div>
                    );
                  }

                  // Check if we have a meeting URL before showing the button
                  if (!appointment.meeting_url) {
                    return (
                      <div className="text-sm text-muted-foreground">
                        Video call link is not available. Please contact support.
                      </div>
                    );
                  }

                  return (
                    <Button
                      variant="default"
                      onClick={() => window.open(appointment.meeting_url!, '_blank')}
                      className="w-full sm:w-auto"
                    >
                      Join Video Call
                    </Button>
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
