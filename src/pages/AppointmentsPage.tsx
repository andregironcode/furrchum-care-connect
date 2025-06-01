import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CalendarIcon, Eye } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from 'sonner';
import AppointmentDetailsModal from '@/components/AppointmentDetailsModal';
import { Booking } from '@/types/supabase';

// Local interfaces for data structures
interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  owner_id: string;
  date_of_birth?: string | null;
  age?: number | null;
  weight?: number | null;
  image_url?: string | null;
  color?: string | null;
  gender?: string | null;
  chip_number?: string | null;
  notes?: string | null;
  type?: string;
}

interface Vet {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  specialization?: string | null;
  phone?: string | null;
  zip_code?: string | null;
  about?: string | null;
}

const AppointmentsPage = () => {
  const { user, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pets, setPets] = useState<Record<string, Pet>>({});
  const [vets, setVets] = useState<Record<string, Vet>>({});
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedAppointment, setSelectedAppointment] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Define fetchPetsAndVets with useCallback first
  const fetchPetsAndVets = useCallback(async (bookings: Booking[]) => {
    // Get unique pet IDs and vet IDs
    const petIds = [...new Set(bookings.map(booking => booking.pet_id).filter(id => id))];
    const vetIds = [...new Set(bookings.map(booking => booking.vet_id).filter(id => id))];
    
    // Fetch pets
    if (petIds.length > 0) {
      try {
        const { data: petsData, error } = await supabase
          .from('pets')
          .select('id, name, type, breed, owner_id')
          .in('id', petIds);
          
        if (error) {
          console.error('Error fetching pets:', error);
          throw error;
        }
          
        if (petsData) {
          const petsRecord: Record<string, Pet> = {};
          petsData.forEach(pet => {
            // Convert the pet data to match our local interface
            petsRecord[pet.id] = {
              id: pet.id,
              name: pet.name,
              species: pet.type || 'Pet', // Map type to species for compatibility
              breed: pet.breed,
              owner_id: pet.owner_id
            };
          });
          setPets(petsRecord);
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
        toast.error('Failed to load pet information');
      }
    }
    
    // Fetch vets with a retry mechanism
    if (vetIds.length > 0) {
      let retries = 0;
      const maxRetries = 2;
      
      const fetchVetData = async () => {
        try {
          const { data: vetsData, error } = await supabase
            .from('vet_profiles')
            .select('id, first_name, last_name, specialization')
            .in('id', vetIds);
            
          if (error) {
            console.error('Error fetching vets:', error);
            throw error;
          }
            
          if (vetsData) {
            const vetsRecord: Record<string, Vet> = {};
            vetsData.forEach(vet => {
              vetsRecord[vet.id] = vet;
            });
            setVets(vetsRecord);
          }
        } catch (error) {
          console.error('Error fetching vets:', error);
          if (retries < maxRetries) {
            retries++;
            console.log(`Retrying vet data fetch (${retries}/${maxRetries})...`);
            await fetchVetData(); // Retry
          } else {
            toast.error('Failed to load veterinarian information');
          }
        }
      };
      
      await fetchVetData();
    }
  }, []);

  // Fetch bookings and filter by date
  useEffect(() => {
    if (!isLoading && user) {
      const fetchBookings = async () => {
        setLoadingBookings(true);
        try {
          let query = supabase
            .from('bookings')
            .select('*')
            .eq('pet_owner_id', user.id)
            .order('booking_date', { ascending: false })
            .order('start_time', { ascending: true });
          
          // If a date filter is applied, filter by that date
          if (date) {
            const formattedDate = format(date, 'yyyy-MM-dd');
            query = query.eq('booking_date', formattedDate);
          }
          
          const { data, error } = await query;
          
          if (error) throw error;
          
          const bookingsData = data as Booking[];
          setBookings(bookingsData);
          
          // Fetch associated pets and vets
          await fetchPetsAndVets(bookingsData);
        } catch (error: any) {
          console.error('Error fetching bookings:', error);
          toast.error('Failed to load your appointments');
        } finally {
          setLoadingBookings(false);
        }
      };
      
      fetchBookings();
    }
  }, [isLoading, user, date, fetchPetsAndVets]);
  
  // Handle appointment cancellation
  const handleCancelAppointment = useCallback(async (appointmentId: string) => {
    if (!user || !appointmentId) return;
    
    try {
      // Update the booking status to 'cancelled'
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .eq('pet_owner_id', user.id); // Ensure the booking belongs to this user
      
      if (error) throw error;
      
      // Update the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === appointmentId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
      
      // Close the details modal if it's open
      if (isDetailsModalOpen && selectedAppointment?.id === appointmentId) {
        setIsDetailsModalOpen(false);
      }
      
      toast.success('Appointment cancelled successfully');
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  }, [user, isDetailsModalOpen, selectedAppointment]);
  
  // Handle appointment rescheduling
  const handleRescheduleAppointment = useCallback(async (appointmentId: string, newDate: string, newStartTime: string, newEndTime: string) => {
    if (!user || !appointmentId) return;
    
    try {
      // Update the booking with new date and time
      const { error } = await supabase
        .from('bookings')
        .update({ 
          booking_date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .eq('pet_owner_id', user.id); // Ensure the booking belongs to this user
      
      if (error) throw error;
      
      // Update the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === appointmentId 
            ? { 
                ...booking, 
                booking_date: newDate,
                start_time: newStartTime,
                end_time: newEndTime
              } 
            : booking
        )
      );
      
      // Close the details modal if it's open
      if (isDetailsModalOpen && selectedAppointment?.id === appointmentId) {
        setIsDetailsModalOpen(false);
      }
      
      toast.success('Appointment rescheduled successfully');
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error);
      toast.error('Failed to reschedule appointment');
    }
  }, [user, isDetailsModalOpen, selectedAppointment]);
  
  // Handle opening the appointment details modal
  const openAppointmentDetails = useCallback((booking: Booking) => {
    if (!booking) return;
    
    setSelectedAppointment(booking);
    setIsDetailsModalOpen(true);
  }, []);

  const getStatusBadgeVariant = useCallback((status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'destructive';
      case 'completed': return 'secondary';
      default: return 'default';
    }
  }, []);

  const clearDateFilter = useCallback(() => {
    setDate(undefined);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PetOwnerSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-xl font-semibold">My Appointments</h1>
                </div>
                
                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Filter by date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {date && (
                    <Button variant="ghost" onClick={clearDateFilter} size="sm">
                      Clear filter
                    </Button>
                  )}
                </div>
              </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
              <div className="mb-4">
                <p className="text-muted-foreground">
                  View and manage your veterinary appointments for your pets
                </p>
              </div>
              
              {loadingBookings ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : bookings.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No appointments found</CardTitle>
                    <CardDescription>
                      {date 
                        ? "You don't have any appointments on this date." 
                        : "You don't have any upcoming appointments."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {date 
                        ? "Check back later or select a different date." 
                        : "Book an appointment with one of our veterinarians."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-white border rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-muted/20 border-b">
                    <div className="grid grid-cols-12 gap-4 items-center py-3 px-6 text-sm font-medium hidden md:grid">
                      <div className="col-span-2">Pet</div>
                      <div className="col-span-2">Veterinarian</div>
                      <div className="col-span-2">Date & Time</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                  </div>
                  
                  {/* Table Body */}
                  <div>
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border-b last:border-0">
                        {/* Desktop View */}
                        <div className="hidden md:grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-muted/10 transition-colors">
                          <div className="col-span-2">
                            <div className="font-medium">
                              {pets[booking.pet_id] ? pets[booking.pet_id].name : "Your Pet"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {pets[booking.pet_id] ? (pets[booking.pet_id].species || pets[booking.pet_id].type || 'Pet') : ''}
                            </div>
                          </div>
                          
                          <div className="col-span-2">
                            <div>
                              Dr. {vets[booking.vet_id] ? 
                                (vets[booking.vet_id].full_name ? 
                                  vets[booking.vet_id].full_name : 
                                  `${vets[booking.vet_id].first_name || ''} ${vets[booking.vet_id].last_name || ''}`.trim()) : 
                                "Your Veterinarian"}
                            </div>
                          </div>
                          
                          <div className="col-span-2">
                            <div>{booking.booking_date}</div>
                            <div className="text-sm text-muted-foreground">{booking.start_time.slice(0, 5)}</div>
                          </div>
                          
                          <div className="col-span-2 capitalize">
                            {booking.consultation_type.replace('_', ' ')}
                          </div>
                          
                          <div className="col-span-2">
                            <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">
                              {booking.status}
                            </Badge>
                          </div>
                          
                          <div className="col-span-2 flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openAppointmentDetails(booking)}
                              className="flex items-center gap-1 text-white"
                            >
                              <Eye className="h-4 w-4" /> Details
                            </Button>
                            
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelAppointment(booking.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Mobile View */}
                        <div className="md:hidden p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {pets[booking.pet_id] ? pets[booking.pet_id].name : "Your Pet"}
                                <span className="text-muted-foreground text-sm ml-1">
                                  ({pets[booking.pet_id] ? (pets[booking.pet_id].species || pets[booking.pet_id].type || 'Pet') : ''})
                                </span>
                              </div>
                              <div className="text-sm">
                                Dr. {vets[booking.vet_id] ? 
                                  (vets[booking.vet_id].full_name ? 
                                    vets[booking.vet_id].full_name : 
                                    `${vets[booking.vet_id].first_name || ''} ${vets[booking.vet_id].last_name || ''}`.trim()) : 
                                  "Your Veterinarian"}
                              </div>
                            </div>
                            <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">
                              {booking.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Date</div>
                              <div>{booking.booking_date}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Time</div>
                              <div>{booking.start_time.slice(0, 5)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Type</div>
                              <div className="capitalize">{booking.consultation_type.replace('_', ' ')}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openAppointmentDetails(booking)}
                              className="flex items-center gap-1 flex-1 text-white"
                            >
                              <Eye className="h-4 w-4" /> Details
                            </Button>
                            
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelAppointment(booking.id)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          appointment={{
            id: selectedAppointment.id,
            booking_date: selectedAppointment.booking_date,
            start_time: selectedAppointment.start_time,
            end_time: selectedAppointment.end_time,
            consultation_type: selectedAppointment.consultation_type,
            notes: selectedAppointment.notes || null, // Convert undefined to null for compatibility
            status: selectedAppointment.status,
            pet_id: selectedAppointment.pet_id,
            vet_id: selectedAppointment.vet_id,
            meeting_id: selectedAppointment.meeting_id,
            meeting_url: selectedAppointment.meeting_url,
            host_meeting_url: selectedAppointment.host_meeting_url
          }}
          pet={pets[selectedAppointment.pet_id] || {
            id: selectedAppointment.pet_id,
            name: 'Your Pet',
            species: 'Pet',
            breed: null,
            owner_id: user?.id || ''
          }}
          vet={vets[selectedAppointment.vet_id] || {
            id: selectedAppointment.vet_id,
            full_name: 'Your Veterinarian'
          }}
          onCancelAppointment={handleCancelAppointment}
          onRescheduleAppointment={handleRescheduleAppointment}
        />
      )}
    </SidebarProvider>
  );
};

export default AppointmentsPage;
