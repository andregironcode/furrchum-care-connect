
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  FileText, 
  MoreVertical, 
  ThumbsUp, 
  UserCircle,
  CalendarPlus,
  Filter,
  Search,
  Eye,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import VetAppointmentDetailsModal from '@/components/VetAppointmentDetailsModal';

interface Booking {
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
  created_at: string;
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

const VetAppointmentsPage = () => {
  const { user, isLoading } = useAuth();
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [pets, setPets] = useState<Record<string, Pet>>({});
  const [petOwners, setPetOwners] = useState<Record<string, PetOwner>>({});
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      console.log('Fetching appointments for vet:', user?.id);
      
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('vet_id', user?.id)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
        return;
      }
      
      console.log('Fetched bookings:', bookingsData);
      
      if (bookingsData && bookingsData.length > 0) {
        setAppointments(bookingsData);
        await fetchPetsAndOwners(bookingsData);
      } else {
        setAppointments([]);
        console.log('No appointments found for this vet');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchPetsAndOwners = async (bookings: Booking[]) => {
    const petIds = [...new Set(bookings.map(booking => booking.pet_id).filter(Boolean))];
    const ownerIds = [...new Set(bookings.map(booking => booking.pet_owner_id).filter(Boolean))];
    
    console.log('Fetching pets for IDs:', petIds);
    console.log('Fetching owners for IDs:', ownerIds);
    
    // Fetch pets with better error handling
    if (petIds.length > 0) {
      try {
        // First, let's check if we can access the pets table at all
        const { data: petsData, error: petsError } = await supabase
          .from('pets')
          .select('*')
          .in('id', petIds);
          
        if (petsError) {
          console.error('Error fetching pets:', petsError);
          console.log('Pets error details:', {
            message: petsError.message,
            code: petsError.code,
            details: petsError.details,
            hint: petsError.hint
          });
        } else {
          console.log('Fetched pets:', petsData);
          if (petsData && petsData.length > 0) {
            const petsRecord: Record<string, Pet> = {};
            petsData.forEach(pet => {
              petsRecord[pet.id] = pet;
            });
            setPets(petsRecord);
          } else {
            console.log('No pets found for the given IDs. This might be due to RLS policies or missing data.');
            // Set empty pets with pet IDs as keys so we can show "Pet not found" instead of "Loading"
            const emptyPetsRecord: Record<string, Pet> = {};
            petIds.forEach(petId => {
              emptyPetsRecord[petId] = {
                id: petId,
                name: 'Pet not found',
                type: 'Unknown'
              };
            });
            setPets(emptyPetsRecord);
          }
        }
      } catch (error) {
        console.error('Error processing pets data:', error);
      }
    }
    
    // Fetch pet owners with better error handling
    if (ownerIds.length > 0) {
      try {
        const { data: ownersData, error: ownersError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ownerIds);
          
        if (ownersError) {
          console.error('Error fetching pet owners:', ownersError);
          console.log('Owners error details:', {
            message: ownersError.message,
            code: ownersError.code,
            details: ownersError.details,
            hint: ownersError.hint
          });
        } else {
          console.log('Fetched owners:', ownersData);
          if (ownersData && ownersData.length > 0) {
            const ownersRecord: Record<string, PetOwner> = {};
            ownersData.forEach(owner => {
              ownersRecord[owner.id] = owner;
            });
            setPetOwners(ownersRecord);
          } else {
            console.log('No owners found for the given IDs. This might be due to RLS policies or missing data.');
            // Set empty owners with owner IDs as keys so we can show "Owner not found" instead of "Loading"
            const emptyOwnersRecord: Record<string, PetOwner> = {};
            ownerIds.forEach(ownerId => {
              emptyOwnersRecord[ownerId] = {
                id: ownerId,
                full_name: 'Owner not found'
              };
            });
            setPetOwners(emptyOwnersRecord);
          }
        }
      } catch (error) {
        console.error('Error processing pet owners data:', error);
      }
    }
  };

  const openAppointmentDetails = (appointment: Booking) => {
    console.log('Opening appointment details for:', appointment.id);
    console.log('Pet data available:', pets[appointment.pet_id]);
    console.log('Owner data available:', petOwners[appointment.pet_owner_id]);
    
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const closeAppointmentDetails = () => {
    console.log('Closing appointment details modal');
    setSelectedAppointment(null);
    setIsDetailsModalOpen(false);
  };

  const handleRescheduleAppointment = async (appointmentId: string, newDate: string, newStartTime: string, newEndTime: string) => {
    try {
      console.log('Rescheduling appointment:', appointmentId, newDate, newStartTime, newEndTime);
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          booking_date: newDate, 
          start_time: newStartTime,
          end_time: newEndTime 
        })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error rescheduling appointment:', error);
        toast.error('Failed to reschedule appointment');
        return;
      }
      
      toast.success('Appointment rescheduled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error('Failed to reschedule appointment');
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      console.log('Updating appointment status:', appointmentId, newStatus);
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error updating appointment status:', error);
        toast.error('Failed to update appointment status');
        return;
      }
      
      toast.success('Appointment status updated successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-amber-500 hover:bg-amber-600">{status}</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const pet = pets[appointment.pet_id];
    const owner = petOwners[appointment.pet_owner_id];
    
    const matchesSearch = searchQuery === "" || 
                          pet?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appointment.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          owner?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                          appointment.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading || loadingAppointments) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex items-center justify-center bg-background w-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarProvider>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <VetSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-white border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold text-primary">Appointments</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-6">
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Appointment Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search pet, owner, or notes..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        New Appointment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-primary">
                      <TableRow>
                        <TableHead className="text-white font-medium">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2" /> Date
                          </div>
                        </TableHead>
                        <TableHead className="text-white font-medium">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" /> Time
                          </div>
                        </TableHead>
                        <TableHead className="text-white font-medium">Type</TableHead>
                        <TableHead className="text-white font-medium">
                          <div className="flex items-center">
                            <UserCircle className="h-4 w-4 mr-2" /> Pet & Owner
                          </div>
                        </TableHead>
                        <TableHead className="text-white font-medium">
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-2" /> Notes
                          </div>
                        </TableHead>
                        <TableHead className="text-white font-medium">Status</TableHead>
                        <TableHead className="text-white font-medium">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((appointment) => {
                          const pet = pets[appointment.pet_id];
                          const owner = petOwners[appointment.pet_owner_id];
                          
                          return (
                            <TableRow key={appointment.id} className="hover:bg-slate-50">
                              <TableCell>{appointment.booking_date}</TableCell>
                              <TableCell>{appointment.start_time.slice(0, 5)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={appointment.consultation_type === 'video' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-purple-100 text-purple-800 border-purple-200'}>
                                  {appointment.consultation_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{pet?.name || 'Pet not found'}</div>
                                  <div className="text-sm text-gray-500">{owner?.full_name || 'Owner not found'}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs truncate">
                                  {appointment.notes || 'No notes'}
                                </div>
                              </TableCell>
                              <TableCell>{renderStatusBadge(appointment.status)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openAppointmentDetails(appointment)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}>
                                        Mark as Confirmed
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStatusUpdate(appointment.id, 'completed')}>
                                        Mark as Completed
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-500" onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}>
                                        Cancel Appointment
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {loadingAppointments ? 'Loading appointments...' : 'No appointments found matching your filters.'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-between items-center p-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredAppointments.length} of {appointments.length} appointments
                  </div>
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>

      {/* Appointment Details Modal */}
      <VetAppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeAppointmentDetails}
        appointment={selectedAppointment}
        pet={selectedAppointment ? pets[selectedAppointment.pet_id] : null}
        petOwner={selectedAppointment ? petOwners[selectedAppointment.pet_owner_id] : null}
        onReschedule={handleRescheduleAppointment}
        onStatusUpdate={handleStatusUpdate}
      />
    </SidebarProvider>
  );
};

export default VetAppointmentsPage;
