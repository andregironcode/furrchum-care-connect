import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, AlertCircle, Clock, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadFile, openFile } from '@/utils/supabaseStorage';

interface VetDetailsModalProps {
  vet: any;
  onClose: () => void;
}

const VetDetailsModal: React.FC<VetDetailsModalProps> = ({ vet, onClose }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    
    if (statusLower === 'approved') {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    }
    
    if (statusLower === 'rejected') {
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    }
    
    if (statusLower === 'pending') {
      return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
    }
    
    return <Badge className="bg-gray-100 text-gray-800">{status || 'Unknown'}</Badge>;
  };
  
  const getCreatedTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  // Function to handle viewing the license document
  const viewDocument = async (url: string) => {
    if (!url) {
      toast({
        title: "Error",
        description: "Document URL is not available",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await openFile(url);
      
      if (!success) {
        toast({
          title: "Warning",
          description: "Could not generate a signed URL. Attempting direct access instead.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error opening document:', error);
      toast({
        title: "Error Opening Document",
        description: error instanceof Error ? error.message : "Failed to open the document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle downloading the license document
  const downloadDocument = async (url: string) => {
    if (!url) {
      toast({
        title: "Error",
        description: "Document URL is not available",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const fileName = 'license-document';
      const success = await downloadFile(url, fileName);
      
      if (success) {
        toast({
          title: "Success",
          description: "Document download started",
        });
      } else {
        toast({
          title: "Warning",
          description: "Could not generate a signed URL. Attempting direct download instead.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error Downloading Document",
        description: error instanceof Error ? error.message : "Failed to download the document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Veterinarian Details</h2>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">Dr. {vet.first_name} {vet.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{vet.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{vet.phone_number || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div>{getStatusBadge(vet.approval_status || 'pending')}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registered</p>
                <p className="font-medium">{getCreatedTimeAgo(vet.created_at)}</p>
              </div>
              {vet.approved_at && (
                <div>
                  <p className="text-sm text-gray-500">Approved At</p>
                  <p className="font-medium">{new Date(vet.approved_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Specialization</p>
                <p className="font-medium">{vet.specialization || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Years of Experience</p>
                <p className="font-medium">{vet.years_experience || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Consultation Fee</p>
                <p className="font-medium">{vet.consultation_fee ? `₹${vet.consultation_fee}` : 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-medium">{vet.rating || 'Not rated yet'}</p>
              </div>
            </div>
            
            {vet.about && (
              <div>
                <p className="text-sm text-gray-500">About</p>
                <p className="mt-1">{vet.about}</p>
              </div>
            )}
          </div>
          
          {/* License Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">License Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">License Number</p>
                <p className="font-medium">{vet.license_number || 'Not provided'}</p>
              </div>
              {(vet.license_document_url || vet.license_url) && (
                <div>
                  <p className="text-sm text-gray-500">License Document</p>
                  <div className="flex space-x-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => viewDocument(vet.license_document_url || vet.license_url || '')}
                      disabled={isLoading}
                    >
                      <Eye size={16} className="mr-2" />
                      View
                      {isLoading && <span className="ml-2 animate-spin">⟳</span>}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => downloadDocument(vet.license_document_url || vet.license_url || '')}
                      disabled={isLoading}
                    >
                      <Download size={16} className="mr-2" />
                      Download
                      {isLoading && <span className="ml-2 animate-spin">⟳</span>}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Banking & Tax Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Banking & Tax Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">PAN Number</p>
                <p className="font-medium">{vet.pan_number || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">GST Number</p>
                <p className="font-medium">{vet.gst_number || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank Name</p>
                <p className="font-medium">{vet.bank_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank Account Number</p>
                <p className="font-medium">
                  {vet.bank_account_number || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IFSC Code</p>
                <p className="font-medium">{vet.ifsc_code || 'Not provided'}</p>
              </div>
            </div>
          </div>
          
          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Location Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Clinic Location</p>
                <p className="font-medium">{vet.clinic_location || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ZIP Code</p>
                <p className="font-medium">{vet.zip_code || 'Not provided'}</p>
              </div>
            </div>
          </div>
          
          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Availability</h3>
            <p>{vet.availability || 'No availability information provided'}</p>
          </div>
          
          {/* Profile Images */}
          {(vet.profile_image || vet.image_url || (vet.clinic_images && vet.clinic_images.length > 0)) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(vet.profile_image || vet.image_url) && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Profile Image</p>
                    <img 
                      src={vet.profile_image || vet.image_url} 
                      alt="Profile" 
                      className="rounded-md object-cover h-40 w-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                  </div>
                )}
                
                {vet.clinic_images && vet.clinic_images.length > 0 && vet.clinic_images.map((image: string, index: number) => (
                  <div key={index}>
                    <p className="text-sm text-gray-500 mb-2">Clinic Image {index + 1}</p>
                    <img 
                      src={image} 
                      alt={`Clinic ${index + 1}`} 
                      className="rounded-md object-cover h-40 w-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="sticky bottom-0 bg-white p-6 border-t">
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetDetailsModal;
