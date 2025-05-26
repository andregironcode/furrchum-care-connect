import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Mail, Phone, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ApprovalStatusBannerProps {
  status: string;
  rejectionReason?: string;
  approvedAt?: string;
  submittedAt?: string;
  onUpdateDocuments?: () => void;
  showProfileLink?: boolean;
  className?: string;
}

const ApprovalStatusBanner: React.FC<ApprovalStatusBannerProps> = ({ 
  status, 
  rejectionReason, 
  approvedAt, 
  submittedAt,
  onUpdateDocuments,
  showProfileLink = true,
  className = ''
}) => {
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  if (status === 'approved') {
    return (
      <Alert className="bg-green-50 border-green-200 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <AlertTitle className="text-green-800 font-medium text-lg mb-1">Approved Account</AlertTitle>
            <AlertDescription className="text-green-700">
              Your veterinary account has been approved. You can now receive appointments and provide consultations.
              {approvedAt && (
                <div className="text-sm mt-1 text-green-600">
                  Approved {getTimeAgo(approvedAt)}
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  if (status === 'rejected') {
    return (
      <Alert className="bg-red-50 border-red-200 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-100 rounded-full">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <AlertTitle className="text-red-800 font-medium text-lg mb-1">Account Approval Rejected</AlertTitle>
            <AlertDescription className="text-red-700">
              <p>Your veterinary account approval has been rejected.</p>
              {rejectionReason && (
                <div className="mt-3 p-3 bg-white border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <strong className="text-red-800">Feedback from reviewer:</strong>
                  </div>
                  <p className="text-gray-700">{rejectionReason}</p>
                </div>
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                {showProfileLink && (
                  <Link to="/vet-profile">
                    <Button 
                      variant="outline" 
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Update Profile
                    </Button>
                  </Link>
                )}
                {onUpdateDocuments && (
                  <Button 
                    onClick={onUpdateDocuments}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Update Documents
                  </Button>
                )}
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <Alert className={`bg-amber-50 border-amber-200 mb-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-2 bg-amber-100 rounded-full">
          <Clock className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <AlertTitle className="text-amber-800 font-medium text-lg mb-1">Approval Pending</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p>
              Your veterinary account is currently under review. This process typically takes 1-2 business days.
              You'll be notified when your account is approved.
            </p>
            {submittedAt && (
              <div className="mt-2 text-sm text-amber-600">
                Application submitted {getTimeAgo(submittedAt)}
              </div>
            )}
            <div className="mt-4 space-x-2">
              <a href="tel:+918700608887">
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
              </a>
              <Button variant="ghost" className="text-amber-700 hover:bg-amber-100/50">
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default ApprovalStatusBanner;
