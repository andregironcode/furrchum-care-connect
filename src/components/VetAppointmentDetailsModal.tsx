
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Phone, Mail, User, Stethoscope, FileText, X, Edit, Check } from "lucide-react";
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
  full_name?: string;
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
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

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
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Owner Name</p>
                <p className="font-medium">{petOwner.full_name || 'Unknown Owner'}</p>
              </div>
            </div>
          </div>
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
