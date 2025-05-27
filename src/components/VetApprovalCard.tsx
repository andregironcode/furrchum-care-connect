import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle, Clock, ExternalLink, FileText, Download, Eye } from 'lucide-react';
import { VetProfile } from '@/types/profiles';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  
  // Function to parse a Supabase URL and extract bucket and file path
  const parseSupabaseUrl = (url: string) => {
    try {
      // Handle different Supabase URL formats
      if (url.includes('storage.googleapis.com') || url.includes('supabase.co/storage')) {
        // Parse the URL to extract the bucket name and file path
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        
        // Find the bucket name in the URL path
        let bucketName = 'vet_profiles';
        let filePath = '';
        
        // Check if this is a public URL or a signed URL format
        if (pathParts.includes('public')) {
          // Format: /storage/v1/object/public/[bucket]/[filepath]
          const publicIndex = pathParts.indexOf('public');
          if (publicIndex !== -1 && publicIndex + 1 < pathParts.length) {
            bucketName = pathParts[publicIndex + 1];
            filePath = pathParts.slice(publicIndex + 2).join('/');
          }
        } else if (pathParts.includes('sign')) {
          // Format: /storage/v1/object/sign/[bucket]/[filepath]
          const signIndex = pathParts.indexOf('sign');
          if (signIndex !== -1 && signIndex + 1 < pathParts.length) {
            bucketName = pathParts[signIndex + 1];
            filePath = pathParts.slice(signIndex + 2).join('/');
          }
        }
        
        console.log(`Extracted bucket: ${bucketName}, file path: ${filePath}`);
        return { bucketName, filePath };
      }
    } catch (error) {
      console.error('Error parsing Supabase URL:', error);
    }
    
    // Default fallback
    return { bucketName: 'vet_profiles', filePath: url.split('/').pop() || '' };
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
      console.log('Opening document URL:', url);
      
      // Parse the URL to extract bucket and file path
      const { bucketName, filePath } = parseSupabaseUrl(url);
      
      if (!filePath) {
        // If we couldn't extract the path properly, try opening directly
        window.open(url, '_blank');
        return;
      }
      
      console.log(`Using bucket: ${bucketName}, file path: ${filePath}`);
      
      // Create a signed URL with Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60); // 60 seconds expiry
      
      if (error) {
        console.error('Error creating signed URL:', error);
        // Try direct access as fallback
        window.open(url, '_blank');
        return;
      }
      
      if (data?.signedUrl) {
        console.log('Opening signed URL:', data.signedUrl);
        window.open(data.signedUrl, '_blank');
      } else {
        // Try direct access as fallback
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      toast({
        title: "Error Opening Document",
        description: error instanceof Error ? error.message : "Failed to open the document",
        variant: "destructive",
      });
      
      // Try direct access as a last resort
      window.open(url, '_blank');
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
      console.log('Downloading document URL:', url);
      
      // Parse the URL to extract bucket and file path
      const { bucketName, filePath } = parseSupabaseUrl(url);
      
      if (!filePath) {
        toast({
          title: "Error",
          description: "Could not parse the document URL",
          variant: "destructive",
        });
        return;
      }
      
      console.log(`Using bucket: ${bucketName}, file path: ${filePath}`);
      
      // Create a signed URL with Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60); // 60 seconds expiry
      
      if (error) {
        console.error('Error creating signed URL for download:', error);
        
        // Try direct download as fallback
        const a = document.createElement('a');
        a.href = url;
        a.download = filePath.split('/').pop() || 'license-document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
          title: "Notice",
          description: "Attempting direct download instead",
        });
        return;
      }
      
      if (data?.signedUrl) {
        // Create a temporary anchor element to trigger the download
        const a = document.createElement('a');
        a.href = data.signedUrl;
        a.download = filePath.split('/').pop() || 'license-document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Document download started",
        });
      } else {
        // Try direct download as fallback
        const a = document.createElement('a');
        a.href = url;
        a.download = filePath.split('/').pop() || 'license-document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
          title: "Notice",
          description: "Attempting direct download instead",
        });
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error Downloading Document",
        description: error instanceof Error ? error.message : "Failed to download the document",
        variant: "destructive",
      });
      
      // Try direct download as a last resort
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = url.split('/').pop() || 'license-document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e) {
        console.error('Failed even with direct download:', e);
      }
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
