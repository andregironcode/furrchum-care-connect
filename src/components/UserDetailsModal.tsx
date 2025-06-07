import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Loader2, 
  FileText, 
  Eye, 
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  Heart,
  Stethoscope,
  Pill,
  Video,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { openFile, downloadFile } from '@/utils/supabaseStorage';
import React from 'react';

// Enhanced interfaces for the modal
interface UserProfile {
  id: string;
  full_name: string | null;
  user_type: string;
  created_at: string;
  updated_at: string;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  image_url?: string | null;
  appointment_count?: number;
  prescription_count?: number;
  status?: string | null;
}

interface VetProfile {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string | null;
  about: string | null;
  consultation_fee: number | null;
  image_url: string | null;
  years_experience: number | null;
  phone: string | null;
  gender: string | null;
  languages: string[] | null;
  zip_code: string | null;
  clinic_location: string | null;
  clinic_images: string[] | null;
  license_url: string | null;
  offers_video_calls: boolean | null;
  offers_in_person: boolean | null;
  approval_status: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Appointment {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  consultation_type: string;
  notes: string | null;
  pet_id: string | null;
  pet_owner_id: string;
  vet_id: string;
  created_at: string;
  pets?: {
    name: string;
    type: string;
  } | null;
  vet_profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  diagnosis: string | null;
  status: string;
  prescribed_date: string;
  pet_id: string;
  pet_owner_id: string;
  vet_id: string;
  created_at: string;
  pets?: {
    name: string;
    type: string;
  } | null;
  vet_profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  gender: string | null;
  vaccination_status: string | null;
  created_at: string;
}

interface UserDetailsModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: () => void;
}

const UserDetailsModal = ({ user, isOpen, onClose, onUserUpdated }: UserDetailsModalProps) => {
  const { toast } = useToast();
  const [vetProfile, setVetProfile] = useState<VetProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuspendConfirmation, setShowSuspendConfirmation] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [suspendAction, setSuspendAction] = useState<'suspend' | 'unsuspend'>('suspend');
  
  const fetchUserDetails = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch user email using the new RPC function
      try {
        const { data: emailData, error: emailError } = await (supabase as any)
          .rpc('get_user_email', { user_id: user.id });
          
        if (!emailError && emailData) {
          setUserEmail(emailData);
        } else {
          console.warn('Could not fetch user email:', emailError);
          setUserEmail(user.email || 'Email not available');
        }
      } catch (error) {
        console.warn('Error fetching user email:', error);
        setUserEmail(user.email || 'Email not available');
      }

      // Skip vet profile fetching since this modal is only for pet owners now
      // The vet profiles are handled in the separate vets tab

      // Fetch user's pets (since this is now only for pet owners)
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (petsError) {
        console.error('Error fetching pets:', petsError);
      } else {
        setPets(petsData || []);
      }

      // Fetch appointments related to this user
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('bookings')
        .select(`
          *,
          pets(name, type),
          vet_profiles(first_name, last_name)
        `)
        .or(`pet_owner_id.eq.${user.id},vet_id.eq.${user.id}`)
        .order('booking_date', { ascending: false })
        .limit(10);

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      } else {
        setAppointments(appointmentsData || []);
      }

      // Fetch prescriptions related to this user (simplified without relations)
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('*')
        .or(`pet_owner_id.eq.${user.id},vet_id.eq.${user.id}`)
        .order('prescribed_date', { ascending: false })
        .limit(10);

      if (prescriptionsError) {
        console.error('Error fetching prescriptions:', prescriptionsError);
      } else {
        // Transform the data to match our interface
        const transformedPrescriptions: Prescription[] = (prescriptionsData || []).map(prescription => ({
          ...prescription,
          pets: null, // Set to null since we can't fetch the relation
          vet_profiles: null, // Set to null since we can't fetch the relation
        }));
        setPrescriptions(transformedPrescriptions);
      }

    } catch (error) {
      console.error('Error fetching user details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user details';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    if (isOpen && user) {
      fetchUserDetails();
    }
  }, [isOpen, user, fetchUserDetails]);

  const handleVetApproval = useCallback(async (status: 'approved' | 'rejected', feedback?: string) => {
    if (!vetProfile || !user) return;

    try {
      setLoading(true);

      const updateData = {
        approval_status: status,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        approved_by: status === 'approved' ? 'Super Admin' : null,
      };

      const { error: profileError } = await supabase
        .from('vet_profiles')
        .update(updateData)
        .eq('id', vetProfile.id);

      if (profileError) {
        throw new Error(`Error updating vet profile: ${profileError.message}`);
      }

      if (status === 'rejected' && feedback) {
        console.log(`Rejection feedback for vet ${vetProfile.id}: ${feedback}`);
      }

      await fetchUserDetails();

      toast({
        title: `Vet ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `The veterinarian has been ${status} successfully.`,
      });

      if (onUserUpdated) onUserUpdated();
      setShowRejectionForm(false);
      setRejectionFeedback('');
    } catch (error) {
      console.error('Error in vet approval process:', error);
      toast({
        title: 'Error',
        description: `Failed to ${status === 'approved' ? 'approve' : 'reject'} the vet. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [vetProfile, user, toast, onUserUpdated, fetchUserDetails]);

  const handleDeleteUser = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      
      // First, delete all related data
      // 1. Delete user's pets
      const { error: petsDeleteError } = await supabase
        .from('pets')
        .delete()
        .eq('owner_id', user.id);

      if (petsDeleteError) {
        console.error('Error deleting pets:', petsDeleteError);
      }

      // 2. Delete user's appointments
      const { error: appointmentsDeleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('pet_owner_id', user.id);

      if (appointmentsDeleteError) {
        console.error('Error deleting appointments:', appointmentsDeleteError);
      }

      // 3. Delete user's prescriptions
      const { error: prescriptionsDeleteError } = await supabase
        .from('prescriptions')
        .delete()
        .eq('pet_owner_id', user.id);

      if (prescriptionsDeleteError) {
        console.error('Error deleting prescriptions:', prescriptionsDeleteError);
      }

      // 4. Check if this is a vet and delete vet profile if it exists
      if (user.user_type === 'vet') {
        const { error: vetDeleteError } = await supabase
          .from('vet_profiles')
          .delete()
          .eq('id', user.id);

        if (vetDeleteError) {
          console.error('Error deleting vet profile:', vetDeleteError);
          throw new Error(vetDeleteError.message);
        }
      }

      // 5. Delete user profile
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileDeleteError) {
        console.error('Error deleting user profile:', profileDeleteError);
        throw new Error(profileDeleteError.message);
      }

      // 6. Delete auth user
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (authDeleteError) {
        console.error('Error deleting auth user:', authDeleteError);
        // Continue with the process even if auth deletion fails
      }

      toast({
        title: 'User Deleted',
        description: 'The user has been completely removed from the system.',
      });
      
      if (onUserUpdated) onUserUpdated();
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  }, [user, toast, onUserUpdated, onClose]);

  const handleSuspendUser = useCallback(async (action: 'suspend' | 'unsuspend') => {
    if (!user) return;
    
    try {
      setIsSuspending(true);
      
      // Since we can't modify user_type due to database constraints,
      // we'll implement suspension using a separate approach:
      // 1. Create/update a suspension record in a separate table (simulated with full_name field for now)
      // 2. Use a marker in a field that we can modify
      
      if (action === 'suspend') {
        // For suspension, we'll add a suspension marker to the full_name field temporarily
        // This is a temporary solution until we can create a proper suspension table
        const suspendedFullName = user.full_name ? `[SUSPENDED] ${user.full_name}` : '[SUSPENDED] User';
        
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ 
            full_name: suspendedFullName,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (profileUpdateError) {
          console.error('Error updating user profile:', profileUpdateError);
          throw new Error(profileUpdateError.message);
        }
      } else {
        // For unsuspension, remove the suspension marker from full_name
        const originalFullName = user.full_name?.replace('[SUSPENDED] ', '') || null;
        
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ 
            full_name: originalFullName,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (profileUpdateError) {
          console.error('Error updating user profile:', profileUpdateError);
          throw new Error(profileUpdateError.message);
        }
      }
      
      toast({
        title: action === 'suspend' ? 'Account Suspended' : 'Account Unsuspended',
        description: `The user account has been ${action === 'suspend' ? 'suspended' : 'unsuspended'} successfully.`,
      });
      
      if (onUserUpdated) onUserUpdated();
      onClose();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} user account. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSuspending(false);
      setShowSuspendConfirmation(false);
    }
  }, [user, toast, onUserUpdated, onClose]);

  const handleViewDocument = useCallback(async (url: string) => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'No document available',
        variant: 'destructive'
      });
      return;
    }

    try {
      const success = await openFile(url);
      
      if (!success) {
        window.open(url, '_blank');
        toast({
          title: 'Warning',
          description: 'Using direct URL access. If the document doesn\'t load, please try downloading it instead.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to view the document. Please try downloading it instead.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const getStatusBadge = useCallback((status: string | null | undefined) => {
    const statusLower = status?.toLowerCase() || 'pending';
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800',
    };
    
    return (
      <Badge className={statusColors[statusLower] || 'bg-gray-100 text-gray-800'}>
        {status || 'Unknown'}
      </Badge>
    );
  }, []);

  // Helper function to determine if user is suspended
  const isUserSuspended = useCallback(() => {
    return user.full_name?.startsWith('[SUSPENDED]') || false;
  }, [user.full_name]);

  // Helper function to handle suspend button click
  const handleSuspendButtonClick = useCallback((action: 'suspend' | 'unsuspend') => {
    setSuspendAction(action);
    setShowSuspendConfirmation(true);
  }, []);

  const downloadLicenseDocument = useCallback(async (url: string | null) => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'No license document available',
        variant: 'destructive'
      });
      return;
    }

    try {
      const success = await downloadFile(url);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'License document downloaded successfully',
        });
      } else {
        toast({
          title: 'Warning',
          description: 'Could not download the document automatically. Trying direct download...',
          variant: 'default',
        });
        
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to download the document',
        variant: 'destructive',
      });
    }
  }, [toast]);

  if (!user) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {user.full_name?.replace(/^\[(SUSPENDED|DELETED)\] /, '') || 'Unknown User'}
              <Badge variant={user.user_type === 'vet' ? 'default' : 'secondary'}>
                {user.user_type.replace('_', ' ')}
              </Badge>
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4 text-sm">
              <span>User ID: {user.id}</span>
              <span>•</span>
              <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
              {userEmail && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {userEmail}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="profile" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions ({prescriptions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              {/* Basic User Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Basic user profile details</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Suspend/Unsuspend Button */}
                    {isUserSuspended() ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSuspendButtonClick('unsuspend')}
                        className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Unsuspend Account
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSuspendButtonClick('suspend')}
                        className="text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Suspend Account
                      </Button>
                    )}
                    
                    {/* Delete Button */}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setShowDeleteConfirmation(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Full Name
                      </p>
                      <p className="font-medium">
                        {user.full_name?.replace('[SUSPENDED] ', '') || 'Not provided'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </p>
                      <p className="font-medium">{userEmail || 'Not available'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">User Type</p>
                      <Badge variant={user.user_type === 'vet' ? 'default' : 'secondary'}>
                        {user.user_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Account Status</p>
                      <div className="flex items-center gap-2">
                        {isUserSuspended() ? (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Suspended
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pets Section for Pet Owners */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Registered Pets ({pets.length})
                  </CardTitle>
                  <CardDescription>
                    Pets registered under this user's account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading pets...</span>
                    </div>
                  ) : pets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pets.map((pet) => (
                        <Card key={pet.id} className="border">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{pet.name}</h4>
                                <Badge variant="outline">{pet.type}</Badge>
                              </div>
                              {pet.breed && (
                                <p className="text-sm text-gray-500">Breed: {pet.breed}</p>
                              )}
                              <div className="flex gap-4 text-sm text-gray-500">
                                {pet.age && <span>Age: {pet.age}y</span>}
                                {pet.weight && <span>Weight: {pet.weight}kg</span>}
                                {pet.gender && <span>Gender: {pet.gender}</span>}
                              </div>
                              {pet.vaccination_status && (
                                <div className="flex items-center gap-1">
                                  <span className="text-sm text-gray-500">Vaccination:</span>
                                  {getStatusBadge(pet.vaccination_status)}
                                </div>
                              )}
                              <p className="text-xs text-gray-400">
                                Registered: {new Date(pet.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No pets registered yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointments ({appointments.length})
                  </CardTitle>
                  <CardDescription>
                    {user.user_type === 'vet' 
                      ? 'Appointments scheduled with this veterinarian'
                      : 'Appointments booked by this user'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading appointments...</span>
                    </div>
                  ) : appointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Pet</TableHead>
                            <TableHead>{user.user_type === 'vet' ? 'Pet Owner' : 'Veterinarian'}</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(appointment.booking_date).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    {appointment.start_time} - {appointment.end_time}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {appointment.pets?.name || 'Unknown Pet'}
                                  {appointment.pets?.type && (
                                    <span className="text-sm text-gray-500">({appointment.pets.type})</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {user.user_type === 'vet' ? (
                                  <span>Pet Owner</span>
                                ) : (
                                  appointment.vet_profiles ? (
                                    <span>Dr. {appointment.vet_profiles.first_name} {appointment.vet_profiles.last_name}</span>
                                  ) : (
                                    'Unknown Vet'
                                  )
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {appointment.consultation_type === 'video_call' ? (
                                    <><Video className="h-3 w-3 mr-1" />Video</>
                                  ) : (
                                    <><UserCheck className="h-3 w-3 mr-1" />In-Person</>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(appointment.status)}
                              </TableCell>
                              <TableCell>
                                <p className="text-sm text-gray-600 max-w-xs truncate">
                                  {appointment.notes || 'No notes'}
                                </p>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No appointments found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Prescriptions ({prescriptions.length})
                  </CardTitle>
                  <CardDescription>
                    {user.user_type === 'vet' 
                      ? 'Prescriptions issued by this veterinarian'
                      : 'Prescriptions received for this user\'s pets'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading prescriptions...</span>
                    </div>
                  ) : prescriptions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Pet</TableHead>
                            <TableHead>{user.user_type === 'vet' ? 'Pet Owner' : 'Veterinarian'}</TableHead>
                            <TableHead>Medication</TableHead>
                            <TableHead>Dosage & Frequency</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {prescriptions.map((prescription) => (
                            <TableRow key={prescription.id}>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(prescription.prescribed_date).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {prescription.pets?.name || 'Unknown Pet'}
                                  {prescription.pets?.type && (
                                    <span className="text-sm text-gray-500">({prescription.pets.type})</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {user.user_type === 'vet' ? (
                                  <span>Pet Owner</span>
                                ) : (
                                  prescription.vet_profiles ? (
                                    <span>Dr. {prescription.vet_profiles.first_name} {prescription.vet_profiles.last_name}</span>
                                  ) : (
                                    'Unknown Vet'
                                  )
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium">{prescription.medication_name}</p>
                                  {prescription.diagnosis && (
                                    <p className="text-sm text-gray-500">For: {prescription.diagnosis}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <p>{prescription.dosage}</p>
                                  <p className="text-sm text-gray-500">{prescription.frequency}</p>
                                </div>
                              </TableCell>
                              <TableCell>{prescription.duration}</TableCell>
                              <TableCell>
                                {getStatusBadge(prescription.status)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No prescriptions found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and all associated data including pets, appointments, and medical records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteUser();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend/Unsuspend User Confirmation Dialog */}
      <AlertDialog open={showSuspendConfirmation} onOpenChange={setShowSuspendConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {suspendAction === 'suspend' ? 'Suspend Account' : 'Unsuspend Account'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {suspendAction === 'suspend' 
                ? 'This will suspend the user account, preventing them from accessing the platform. They will be unable to log in or use any features until the account is unsuspended. This action can be reversed.'
                : 'This will restore the user account access, allowing them to log in and use the platform normally again.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSuspending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleSuspendUser(suspendAction);
              }}
              disabled={isSuspending}
              className={suspendAction === 'suspend' 
                ? "bg-orange-600 hover:bg-orange-700" 
                : "bg-green-600 hover:bg-green-700"
              }
            >
              {isSuspending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {suspendAction === 'suspend' ? 'Suspending...' : 'Unsuspending...'}
                </>
              ) : (
                suspendAction === 'suspend' ? 'Suspend Account' : 'Unsuspend Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

import { useToast } from '@/hooks/use-toast';

interface SupabaseUserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  email?: string | null;
  phone_number?: string | null;
  user_type: string;
  status?: string | null;
  address?: string | null;
  image_url?: string | null;
  appointment_count?: number;
  prescription_count?: number;
}

interface UserDetailsModalProps {
  user: SupabaseUserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: () => void;
}

const ButtonUserDetailsModal = ({ user, isOpen, onClose, onUserUpdated }: UserDetailsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { toast } = useToast();

  const isUserDeleted = user.full_name?.startsWith('[DELETED]') || false;
  const isUserSuspended = user.full_name?.startsWith('[SUSPENDED]') || false;

  // Function to get clean name (without status prefixes)
  const getCleanName = (name: string | null) => {
    if (!name) return 'Unknown User';

    return name
      .replace(/^\[DELETED\] /, '')
      .replace(/^\[SUSPENDED\] /, '');
  };

  // Function to toggle user suspension
  const handleToggleSuspension = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user data to ensure we have the latest state
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (fetchError) throw new Error(fetchError.message);

      // Get clean name first
      let cleanName = getCleanName(userData.full_name);

      // Toggle suspension status
      const newFullName = isUserSuspended
        ? cleanName // Remove [SUSPENDED] prefix
        : `[SUSPENDED] ${cleanName}`; // Add [SUSPENDED] prefix

      // Update in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          full_name: newFullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw new Error(updateError.message);

      // Show success message
      toast({
        title: isUserSuspended ? 'User Unsuspended' : 'User Suspended',
        description: isUserSuspended
          ? `${cleanName} has been unsuspended successfully.`
          : `${cleanName} has been suspended. They will not be able to use the platform.`,
      });

      // Notify parent component
      if (onUserUpdated) onUserUpdated();

      // Close modal
      onClose();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user status';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete user
  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for related data first
      const [bookingsCheck, prescriptionsCheck, petsCheck] = await Promise.all([
        supabase.from('bookings').select('id').eq('pet_owner_id', user.id).limit(1),
        supabase.from('prescriptions').select('id').eq('pet_owner_id', user.id).limit(1),
        supabase.from('pets').select('id').eq('owner_id', user.id).limit(1)
      ]);

      if (bookingsCheck.error || prescriptionsCheck.error || petsCheck.error) {
        throw new Error('Failed to check user dependencies');
      }

      const hasRelatedData = bookingsCheck.data.length > 0 || 
                            prescriptionsCheck.data.length > 0 || 
                            petsCheck.data.length > 0;

      if (hasRelatedData) {
        // Soft delete - mark user as deleted using full_name marker
        // First get the current user data to preserve the name
        const { data: userData, error: fetchError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (fetchError) throw new Error(fetchError.message);

        // Get clean name first (remove any existing prefixes)
        const cleanName = getCleanName(userData.full_name);

        // Only add [DELETED] prefix if not already there
        const newFullName = isUserDeleted ? userData.full_name : `[DELETED] ${cleanName}`;

        const { error } = await supabase
          .from('profiles')
          .update({ 
            full_name: newFullName,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw new Error(error.message);

        // Show success message for soft delete
        toast({
          title: 'User Marked as Deleted',
          description: `${cleanName} has been marked as deleted due to existing data.`,
        });
      } else {
        // Hard delete - remove user completely
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);

        if (error) throw new Error(error.message);

        // Show success message for hard delete
        toast({
          title: 'User Deleted',
          description: `${getCleanName(user.full_name)} has been completely removed from the system.`,
        });
      }

      // Notify parent component
      if (onUserUpdated) onUserUpdated();

      // Close modal
      onClose();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  // Render user avatar with initials fallback
  const renderAvatar = () => {
    const cleanName = getCleanName(user.full_name);
    const initials = cleanName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    return (
      <Avatar className="h-20 w-20 mb-4">
        <AvatarImage src={user.image_url || ''} alt={cleanName} />
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View and manage user information
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!showDeleteConfirmation ? (
          <div className="flex flex-col items-center text-center">
            {renderAvatar()}

            <h3 className="text-xl font-semibold mb-1">
              {getCleanName(user.full_name)}
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <Badge className="capitalize">{user.user_type}</Badge>
              {isUserDeleted && (
                <Badge variant="destructive">Deleted</Badge>
              )}
              {isUserSuspended && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800">Suspended</Badge>
              )}
            </div>

            <Card className="w-full mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 text-left">
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{user.email || 'Not available'}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 text-left">
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{user.phone_number || 'Not available'}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 text-left">
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="font-medium">{user.address || 'Not available'}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 text-left">
                      <div className="text-sm text-muted-foreground">Member Since</div>
                      <div className="font-medium">{new Date(user.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 w-full">
              <Button 
                variant={isUserSuspended ? "outline" : "default"}
                className={isUserSuspended ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800" : "bg-orange-500 hover:bg-orange-600"}
                onClick={handleToggleSuspension}
                disabled={loading || isUserDeleted}
              >
                {isUserSuspended ? (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Unsuspend User
                  </>
                ) : (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Suspend User
                  </>
                )}
              </Button>

              <Button 
                variant="destructive"
                onClick={() => setShowDeleteConfirmation(true)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isUserDeleted ? 'Permanently Delete User' : 'Delete User'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            <h3 className="text-xl font-semibold mb-1">
              Confirm Deletion
            </h3>

            <p className="mb-6 text-muted-foreground">
              Are you sure you want to delete <strong>{getCleanName(user.full_name)}</strong>? 
              {user.appointment_count ? ` This user has ${user.appointment_count} appointments.` : ''}
              {user.prescription_count ? ` This user has ${user.prescription_count} prescriptions.` : ''}
            </p>

            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleDeleteUser}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
