
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, FileText, CheckCircle, XCircle, Download, Eye } from 'lucide-react';

interface UserDetailsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

const UserDetailsModal = ({ user, isOpen, onClose, onUserUpdated }: UserDetailsModalProps) => {
  const [vetProfile, setVetProfile] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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
        }
      }

      // Fetch pets if user is a pet owner
      if (user.user_type === 'pet_owner') {
        const { data: petsData, error: petsError } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user.id);

        if (petsError) {
          console.error('Error fetching pets:', petsError);
        } else {
          setPets(petsData || []);
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

  const handleVetApproval = async (status: 'approved' | 'rejected') => {
    if (!vetProfile) return;

    try {
      const { error } = await supabase
        .from('vet_profiles')
        .update({
          approval_status: status,
          approved_at: new Date().toISOString(),
          approved_by: 'Super Admin'
        })
        .eq('id', vetProfile.id);

      if (error) throw error;

      toast({
        title: `Vet ${status}`,
        description: `The veterinarian has been ${status} successfully.`,
      });

      setVetProfile({ ...vetProfile, approval_status: status });
      onUserUpdated();
    } catch (error: any) {
      console.error('Error updating vet status:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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

  const openDocument = (url: string) => {
    window.open(url, '_blank');
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
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {user.user_type === 'vet' && <TabsTrigger value="documents">Documents</TabsTrigger>}
            {user.user_type === 'pet_owner' && <TabsTrigger value="pets">Pets</TabsTrigger>}
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

                  {vetProfile.approval_status === 'pending' && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleVetApproval('approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
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
                    Review uploaded licenses and certifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vetProfile?.license_url ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Veterinary License</h4>
                            <p className="text-sm text-muted-foreground">
                              Professional veterinary license document
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDocument(vetProfile.license_url)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = vetProfile.license_url;
                                link.download = 'veterinary_license.pdf';
                                link.click();
                              }}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>

                      {vetProfile.clinic_images && vetProfile.clinic_images.length > 0 && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-3">Clinic Images</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {vetProfile.clinic_images.map((imageUrl: string, index: number) => (
                              <div key={index} className="relative">
                                <img
                                  src={imageUrl}
                                  alt={`Clinic image ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                  onClick={() => openDocument(imageUrl)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No documents uploaded yet.</p>
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
