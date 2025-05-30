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
import { format } from 'date-fns';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  notes: string | null;
  status: string;
  pet_id: string | null;
  vet_id: string;
  pet_owner_id: string;
  created_at: string;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string | null;
  age?: number | null;
  weight?: number | null;
  gender?: string | null;
  color?: string | null;
  medical_history?: string | null;
  allergies?: string | null;
  medication?: string | null;
}

interface PetOwner {
  id: string;
  full_name?: string | null;
  phone_number?: string | null;
  address?: string | null;
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
      
      if (!user?.id) {
        console.error('No user ID available');
        return;
      }
      
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('vet_id', user.id)
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
    const petIds = [...new Set(bookings.map(booking => booking.pet_id).filter((id): id is string => id !== null))];
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
              if (petId) {
                emptyPetsRecord[petId] = {
                  id: petId,
                  name: 'Pet not found',
                  type: 'Unknown'
                };
              }
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
          .select('id, full_name, phone_number, address')
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
    console.log('Pet data available:', appointment.pet_id ? pets[appointment.pet_id] : null);
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
    const pet = appointment.pet_id ? pets[appointment.pet_id] : null;
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
              {/* Search and Filter */}
              <Card className="mb-6">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search by pet name or owner..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-48">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="rescheduled">Rescheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointments List */}
              {loadingAppointments ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-gray-600">Loading appointments...</p>
                  </CardContent>
                </Card>
              ) : filteredAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-600">
                      {appointments.length === 0 
                        ? "You don't have any appointments yet." 
                        : "No appointments match your search criteria."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <UserCircle className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-sm">
                                  {petOwners[appointment.pet_owner_id]?.full_name || 'Loading...'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium">
                                  {appointment.pet_id && pets[appointment.pet_id] ? 
                                    `${pets[appointment.pet_id].name} (${pets[appointment.pet_id].type})` : 
                                    'Pet not found'}
                                </span>
                              </div>
                            </div>
                            {renderStatusBadge(appointment.status)}
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{format(new Date(appointment.booking_date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.start_time} - {appointment.end_time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FileText className="h-4 w-4" />
                              <span className="capitalize">{appointment.consultation_type.replace('_', ' ')}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAppointmentDetails(appointment)}
                              className="flex-1 min-w-0"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              <span className="text-xs">View</span>
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="px-2">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleStatusUpdate(appointment.id, 'completed')}>
                                  <ThumbsUp className="mr-2 h-4 w-4" />
                                  Mark Complete
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}>
                                  Cancel Appointment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <Card className="hidden lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pet Owner</TableHead>
                          <TableHead>Pet</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">
                              {petOwners[appointment.pet_owner_id]?.full_name || 'Loading...'}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {appointment.pet_id && pets[appointment.pet_id] ? pets[appointment.pet_id].name : 'Pet not found'}
                                </span>
                                <span className="text-sm text-gray-500 capitalize">
                                  {appointment.pet_id && pets[appointment.pet_id] ? pets[appointment.pet_id].type : 'Unknown'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{format(new Date(appointment.booking_date), 'MMM dd, yyyy')}</span>
                                <span className="text-sm text-gray-500">{appointment.start_time} - {appointment.end_time}</span>
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">
                              {appointment.consultation_type.replace('_', ' ')}
                            </TableCell>
                            <TableCell>
                              {renderStatusBadge(appointment.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openAppointmentDetails(appointment)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(appointment.id, 'completed')}>
                                      <ThumbsUp className="mr-2 h-4 w-4" />
                                      Mark Complete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}>
                                      Cancel Appointment
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>

      {/* Appointment Details Modal */}
      <VetAppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeAppointmentDetails}
        appointment={selectedAppointment}
        pet={selectedAppointment?.pet_id ? pets[selectedAppointment.pet_id] : null}
        petOwner={selectedAppointment ? petOwners[selectedAppointment.pet_owner_id] : null}
        onReschedule={handleRescheduleAppointment}
        onStatusUpdate={handleStatusUpdate}
      />
    </SidebarProvider>
  );
};

export default VetAppointmentsPage;
