import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle, Clock, ExternalLink, FileText, Download, Eye } from 'lucide-react';
import { VetProfile } from '@/types/profiles';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { downloadFile, openFile } from '@/utils/supabaseStorage';

interface VetApprovalCardProps {
  vetProfile: VetProfile;
  onApprove: (id: string, feedback?: string) => void;
  onReject: (id: string, feedback: string) => void;
  onView: (id: string) => void;
  className?: string;
}

const VetApprovalCard: React.FC<VetApprovalCardProps> = ({
  vetProfile,
  onApprove,
  onReject,
  onView,
  className = '',
}) => {
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
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
  
  // Removed parseSupabaseUrl function as it's now imported from utils/supabaseStorage
  
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
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Dr. {vetProfile.first_name} {vetProfile.last_name}
            </CardTitle>
            <CardDescription>
              {vetProfile.specialty || 'General Veterinarian'} • {vetProfile.experience_years || 0} years experience
            </CardDescription>
          </div>
          {getStatusBadge(vetProfile.approval_status)}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">License Number</p>
            <p className="font-medium">{vetProfile.license_number || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500">License Expires</p>
            <p className="font-medium">{vetProfile.license_expiry || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500">Clinic</p>
            <p className="font-medium">{vetProfile.clinic_name || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-500">Application Date</p>
            <p className="font-medium">{getCreatedTimeAgo(vetProfile.created_at)}</p>
          </div>
        </div>
        
        {(vetProfile.license_document_url || vetProfile.license_url) && (
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium text-gray-700">License Document</p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => viewDocument(vetProfile.license_document_url || vetProfile.license_url || '')}
                disabled={isLoading}
              >
                <Eye size={16} className="mr-2" />
                View
                {isLoading && <span className="ml-2 animate-spin">⟳</span>}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => downloadDocument(vetProfile.license_document_url || vetProfile.license_url || '')}
                disabled={isLoading}
              >
                <Download size={16} className="mr-2" />
                Download
                {isLoading && <span className="ml-2 animate-spin">⟳</span>}
              </Button>
            </div>
          </div>
        )}
        
        {showFeedback && (
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-gray-700">Feedback (Required for Rejection)</p>
            <Textarea
              placeholder="Provide feedback for the vet..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="h-20"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        {vetProfile.approval_status === 'pending' ? (
          <>
            <Button 
              onClick={() => onView(vetProfile.id)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              View Details
            </Button>
            
            <Button 
              onClick={() => {
                if (showFeedback) {
                  onApprove(vetProfile.id, feedback);
                } else {
                  onApprove(vetProfile.id);
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Approve
            </Button>
            
            {!showFeedback ? (
              <Button 
                onClick={() => setShowFeedback(true)}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50 w-full sm:w-auto"
              >
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  if (feedback.trim()) {
                    onReject(vetProfile.id, feedback);
                  }
                }}
                disabled={!feedback.trim()}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 w-full sm:w-auto"
              >
                <XCircle className="mr-2 h-4 w-4" /> Confirm Rejection
              </Button>
            )}
          </>
        ) : (
          <Button 
            onClick={() => onView(vetProfile.id)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default VetApprovalCard;
