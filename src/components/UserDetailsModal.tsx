import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, XCircle, Calendar, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { UserProfile, VetProfile, Appointment } from '@/types/profiles';
import { User, FileText, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, Download, Eye } from 'lucide-react';

interface UserDetailsModalProps {
  user: UserProfile & Partial<VetProfile>;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: () => void;
}

const UserDetailsModal = ({ user, isOpen, onClose, onUserUpdated }: UserDetailsModalProps) => {
  const [vetProfile, setVetProfile] = useState<VetProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      fetchUserDetails();
    }
  }, [isOpen, user]);

  const fetchUserDetails = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch vet profile if user is a vet
      if (user.user_type === 'vet') {
        const { data: vetData, error: vetError } = await supabase
          .from('vet_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (vetError && vetError.code !== 'PGRST116') {
          console.error('Error fetching vet profile:', vetError);
        } else {
          setVetProfile(vetData);
          console.log('Vet profile data:', vetData); // Debug log
        }
      }

      // Fetch recent appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('bookings')
        .select(`
          *,
          vet_profiles(first_name, last_name),
          pets(name)
        `)
        .or(`pet_owner_id.eq.${user.id},vet_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      } else {
        setAppointments(appointmentsData || []);
      }
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVetApproval = async (status: 'approved' | 'rejected', feedback?: string) => {
    if (!vetProfile || !user) return;

    try {
      setLoading(true);
      console.log(`Updating vet profile ${vetProfile.id} to status: ${status}`);

      const updateData: any = {
        approval_status: status,
        approved_at: new Date().toISOString(),
        approved_by: 'Super Admin'
      };

      // Add feedback for rejections
      if (status === 'rejected' && feedback) {
        updateData.rejection_reason = feedback;
      }

      // First, update the vet profile
      const { error: profileError } = await supabase
        .from('vet_profiles')
        .update(updateData)
        .eq('id', vetProfile.id);

      if (profileError) {
        console.error('Error updating vet profile:', profileError);
        throw profileError;
      }

      console.log(`Successfully updated vet profile ${vetProfile.id} to status: ${status}`);

      // Next, update the user metadata in the auth system
      // This is important for role-based access control
      // Cast user to any to access user_metadata which might not be in the type definition
      const userData = user as any;
      const currentMetadata = userData.user_metadata || {};
      
      const { error: userError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            ...currentMetadata,
            vet_status: status,
            is_approved_vet: status === 'approved'
          }
        }
      );

      if (userError) {
        console.error('Error updating user metadata:', userError);
        // Continue even if this fails, as the profile update is more important
      } else {
        console.log(`Successfully updated user metadata for ${user.id}`);
      }

      // Send notification to the vet (this would normally be an email)
      // For now, we'll just log it
      console.log(`Notification to vet ${vetProfile.id}: Your account has been ${status}${feedback ? ` with feedback: ${feedback}` : ''}`);

      // Refresh the vet profile data to confirm changes
      await fetchUserDetails();

      toast({
        title: `Vet ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `The veterinarian has been ${status} successfully.`,
      });

      if (onUserUpdated) onUserUpdated();

      // Reset rejection form state
      setRejectionFeedback('');
      setShowRejectionForm(false);
    } catch (error: any) {
      console.error('Error updating vet status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update vet status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const openDocument = async (url: string) => {
    if (!url) {
      toast({
        title: "Error",
        description: "Document URL is not available",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Opening document URL:', url);
      
      // Check if this is a Supabase storage URL
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
        
        if (!filePath) {
          // If we couldn't extract the path properly, try opening directly
          window.open(url, '_blank');
          return;
        }
        
        // For Supabase storage URLs, we need to get a signed URL
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
          return;
        }
      }
      
      // If it's not a Supabase URL or we couldn't get a signed URL, try opening directly
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening document:', error);
      toast({
        title: "Error Opening Document",
        description: error instanceof Error ? error.message : "Failed to open the document",
        variant: "destructive",
      });
      
      // Try direct access as a last resort
      window.open(url, '_blank');
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user.full_name || 'Unknown User'}
          </DialogTitle>
          <DialogDescription>
            User ID: {user.id} • Joined: {new Date(user.created_at).toLocaleDateString()}
            {user.user_type === 'vet' && (
              <span className="ml-2 text-blue-600 font-medium">
                • Veterinarian Account
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger
              value="documents"
              className={user.user_type === 'vet' ? '' : 'hidden'}
            >
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="pets"
              className={user.user_type === 'pet_owner' ? '' : 'hidden'}
            >
              Pets
            </TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <strong>Name:</strong> {user.full_name || 'Not provided'}
                </div>
                <div>
                  <strong>User Type:</strong>
                  <Badge className="ml-2" variant={user.user_type === 'vet' ? 'default' : 'secondary'}>
                    {user.user_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <strong>Status:</strong> {getStatusBadge(user.status || 'active')}
                </div>
              </CardContent>
            </Card>

            {user.user_type === 'vet' && vetProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Veterinarian Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <strong>Name:</strong> Dr. {vetProfile.first_name} {vetProfile.last_name}
                  </div>
                  <div>
                    <strong>Specialization:</strong> {vetProfile.specialization || 'General Practice'}
                  </div>
                  <div>
                    <strong>Experience:</strong> {vetProfile.years_experience || 0} years
                  </div>
                  <div>
                    <strong>Consultation Fee:</strong> ${vetProfile.consultation_fee || 0}
                  </div>
                  <div>
                    <strong>Approval Status:</strong> {getStatusBadge(vetProfile.approval_status)}
                  </div>
                  <div>
                    <strong>Location:</strong> {vetProfile.clinic_location || 'Not specified'}
                  </div>
                  {vetProfile.about && (
                    <div>
                      <strong>About:</strong>
                      <p className="mt-1 text-sm text-muted-foreground">{vetProfile.about}</p>
                    </div>
                  )}

                  {vetProfile && vetProfile.approval_status === 'pending' && (
                    <div className="space-y-4 mt-4">
                      {!showRejectionForm ? (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleVetApproval('approved')}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={loading}
                          >
                            <CheckCircleIcon className="mr-2 h-4 w-4" />
                            Approve Vet
                          </Button>
                          <Button
                            onClick={() => setShowRejectionForm(true)}
                            variant="destructive"
                            disabled={loading}
                          >
                            <XCircleIcon className="mr-2 h-4 w-4" />
                            Reject Vet
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 border rounded-md p-4 bg-red-50 border-red-200">
                          <div className="flex items-center text-red-700 mb-2">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <p className="font-medium">Provide rejection feedback</p>
                          </div>

                          <Textarea
                            placeholder="Please provide feedback on why this vet is being rejected..."
                            value={rejectionFeedback}
                            onChange={(e) => setRejectionFeedback(e.target.value)}
                            className="h-24"
                          />

                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleVetApproval('rejected', rejectionFeedback)}
                              variant="destructive"
                              disabled={loading || !rejectionFeedback.trim()}
                            >
                              <XCircleIcon className="mr-2 h-4 w-4" />
                              Confirm Rejection
                            </Button>
                            <Button
                              onClick={() => {
                                setShowRejectionForm(false);
                                setRejectionFeedback('');
                              }}
                              variant="outline"
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {user.user_type === 'vet' && (
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Veterinarian Documents
                  </CardTitle>
                  <CardDescription>
                    Review uploaded licenses and certifications for approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading documents...</span>
                    </div>
                  ) : vetProfile ? (
                    <div className="space-y-6">
                      {/* License Document */}
                      {vetProfile.license_url ? (
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-lg">Veterinary License</h4>
                                <p className="text-sm text-muted-foreground">
                                  Professional veterinary license document
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ Document uploaded
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDocument(vetProfile.license_url)}
                                className="bg-white"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View License
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    if (!vetProfile.license_url) {
                                      toast({
                                        title: "Error",
                                        description: "Document URL is not available",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    
                                    console.log('Downloading document from URL:', vetProfile.license_url);
                                    
                                    // Check if this is a Supabase storage URL
                                    if (vetProfile.license_url.includes('storage.googleapis.com') || 
                                        vetProfile.license_url.includes('supabase.co/storage')) {
                                      // Get the file name from the URL
                                      const fileName = vetProfile.license_url.split('/').pop() || 'license.pdf';
                                      
                                      // For Supabase storage URLs, we need to get a signed URL
                                      const { data, error } = await supabase.storage
                                        .from('vet-documents') // Replace with your actual bucket name
                                        .createSignedUrl(fileName, 60); // 60 seconds expiry
                                      
                                      if (error) {
                                        console.error('Error creating signed URL for download:', error);
                                        throw new Error('Could not access the document for download');
                                      }
                                      
                                      if (data?.signedUrl) {
                                        console.log('Downloading from signed URL:', data.signedUrl);
                                        
                                        // Fetch the file and download it
                                        const response = await fetch(data.signedUrl);
                                        const blob = await response.blob();
                                        const downloadUrl = URL.createObjectURL(blob);
                                        
                                        const link = document.createElement('a');
                                        link.href = downloadUrl;
                                        link.download = `${vetProfile.first_name}_${vetProfile.last_name}_license.pdf`;
                                        link.click();
                                        
                                        // Clean up
                                        URL.revokeObjectURL(downloadUrl);
                                        return;
                                      }
                                    }
                                    
                                    // If it's not a Supabase URL or we couldn't get a signed URL, try downloading directly
                                    const link = document.createElement('a');
                                    link.href = vetProfile.license_url;
                                    link.download = `${vetProfile.first_name}_${vetProfile.last_name}_license.pdf`;
                                    link.click();
                                  } catch (error) {
                                    console.error('Error downloading document:', error);
                                    toast({
                                      title: "Error Downloading Document",
                                      description: error instanceof Error ? error.message : "Failed to download the document",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="bg-white"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border rounded-lg p-4 bg-red-50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-lg text-red-800">No License Uploaded</h4>
                              <p className="text-sm text-red-600">
                                Veterinary license document is required for approval
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Clinic Images */}
                      {vetProfile.clinic_images && vetProfile.clinic_images.length > 0 ? (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Clinic Images ({vetProfile.clinic_images.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {vetProfile.clinic_images.map((imageUrl: string, index: number) => (
                              <div key={index} className="relative group">
                                <img
                                  src={imageUrl}
                                  alt={`Clinic image ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border"
                                  onClick={() => openDocument(imageUrl)}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <FileText className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">No Clinic Images</h4>
                              <p className="text-sm text-gray-600">
                                No clinic images have been uploaded yet
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Approval Status and Actions */}
                      <div className="border rounded-lg p-4 bg-yellow-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-lg">Approval Status</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm">Current Status:</span>
                              {getStatusBadge(vetProfile.approval_status)}
                            </div>
                            {vetProfile.approved_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Approved on {new Date(vetProfile.approved_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {vetProfile.approval_status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleVetApproval('approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve Vet
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleVetApproval('rejected')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No vet profile found for this user.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {user.user_type === 'pet_owner' && (
            <TabsContent value="pets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Registered Pets</CardTitle>
                </CardHeader>
                <CardContent>
                  {pets.length > 0 ? (
                    <div className="space-y-4">
                      {pets.map((pet) => (
                        <div key={pet.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            {pet.photo_url && (
                              <img
                                src={pet.photo_url}
                                alt={pet.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <h4 className="font-medium">{pet.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {pet.breed} • {pet.type} • {pet.age} years old
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {pet.gender} • {pet.weight}kg
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No pets registered yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {new Date(appointment.booking_date).toLocaleDateString()}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.start_time} - {appointment.end_time}
                            </p>
                            <p className="text-sm">
                              {user.user_type === 'vet' 
                                ? `Pet: ${appointment.pets?.name || 'Unknown'}`
                                : `Vet: Dr. ${appointment.vet_profiles?.first_name} ${appointment.vet_profiles?.last_name}`
                              }
                            </p>
                            <p className="text-sm capitalize">{appointment.consultation_type}</p>
                          </div>
                          <Badge className={
                            appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No appointments found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
