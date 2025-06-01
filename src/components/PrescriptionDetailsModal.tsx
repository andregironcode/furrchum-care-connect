import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Pill, User, PawPrint, Stethoscope } from 'lucide-react';

interface PrescriptionDetailsModalProps {
  prescription: {
    id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string | null;
    diagnosis?: string | null;
    prescribed_date: string;
    status: string;
    created_at: string;
    updated_at: string;
    pet?: {
      name: string;
      type: string;
      breed?: string;
    };
    owner?: {
      full_name?: string;
    };
    vet?: {
      first_name: string;
      last_name: string;
      specialization?: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const PrescriptionDetailsModal = ({ prescription, isOpen, onClose }: PrescriptionDetailsModalProps) => {
  if (!prescription) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return "default";
      case 'completed': return "secondary";
      case 'discontinued': return "destructive";
      default: return "outline";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Prescription Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">{prescription.medication_name}</h3>
              <p className="text-sm text-muted-foreground">Prescription ID: {prescription.id}</p>
            </div>
            <Badge variant={getStatusBadgeVariant(prescription.status)}>
              {prescription.status}
            </Badge>
          </div>

          {/* Pet Information */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <PawPrint className="h-4 w-4" />
              Pet Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pet Name</label>
                <p className="font-medium">{prescription.pet?.name || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type & Breed</label>
                <p className="font-medium">
                  {prescription.pet?.type}
                  {prescription.pet?.breed && ` - ${prescription.pet.breed}`}
                </p>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Pet Owner
            </h4>
            <div className="p-4 border rounded-lg">
              <p className="font-medium">{prescription.owner?.full_name || 'Unknown'}</p>
            </div>
          </div>

          {/* Veterinarian Information */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Prescribed by
            </h4>
            <div className="p-4 border rounded-lg">
              <p className="font-medium">
                Dr. {prescription.vet?.first_name} {prescription.vet?.last_name}
              </p>
              {prescription.vet?.specialization && (
                <p className="text-sm text-muted-foreground">{prescription.vet.specialization}</p>
              )}
            </div>
          </div>

          {/* Prescription Details */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Prescription Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dosage</label>
                <p className="font-medium">{prescription.dosage}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Frequency</label>
                <p className="font-medium">{prescription.frequency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="font-medium">{prescription.duration}</p>
              </div>
            </div>

            {prescription.diagnosis && (
              <div className="p-4 border rounded-lg">
                <label className="text-sm font-medium text-muted-foreground">Diagnosis</label>
                <p className="font-medium">{prescription.diagnosis}</p>
              </div>
            )}

            {prescription.instructions && (
              <div className="p-4 border rounded-lg">
                <label className="text-sm font-medium text-muted-foreground">Instructions</label>
                <p className="font-medium">{prescription.instructions}</p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Prescribed Date</label>
                <p className="font-medium">{new Date(prescription.prescribed_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="font-medium">{new Date(prescription.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionDetailsModal; 