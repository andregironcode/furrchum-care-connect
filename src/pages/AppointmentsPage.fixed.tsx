import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CalendarIcon, Eye } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import Badge from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from 'sonner';
import AppointmentDetailsModal from '@/components/AppointmentDetailsModal';
import { Booking, Pet } from '@/types/supabase';

// Local interface for Vet data with simplified structure
interface Vet {
  id: string;
  first_name: string;
  last_name: string;
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
  const [date, setDate] = useState<Date | undefined>(undefined); // Default to undefined to show all appointments
  const [selectedAppointment, setSelectedAppointment] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Define fetchPetsAndVets with useCallback first
  const fetchPetsAndVets = useCallback(async (bookings: Booking[]) => {
    // Get unique pet IDs and vet IDs
    const petIds = [...new Set(bookings.map(booking => booking.pet_id))];
    const vetIds = [...new Set(bookings.map(booking => booking.vet_id))];
    
    // Fetch pets
    if (petIds.length > 0) {
      try {
        const { data: petsData, error } = await supabase
          .from('pets')
          .select('id, name, type')
          .in('id', petIds);
          
        if (error) {
          console.error('Error fetching pets:', error);
          throw error;
        }
          
        if (petsData) {
          const petsRecord: Record<string, Pet> = {};
          petsData.forEach(pet => {
            petsRecord[pet.id] = pet;
          });
          console.log('Fetched pets:', petsRecord);
          setPets(petsRecord);
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
        toast.error('Failed to load pet information');
      }
    }
    
    // Fetch vets
    if (vetIds.length > 0) {
      try {
        const { data: vetsData, error } = await supabase
          .from('vet_profiles')
          .select('id, first_name, last_name, specialization, phone, zip_code, about')
          .in('id', vetIds);
          
        if (error) {
          console.error('Error fetching vets:', error);
          throw error;
        }
          
        if (vetsData) {
          const vetsRecord: Record<string, Vet> = {};
          vetsData.forEach(vet => {
            vetsRecord[vet.id] = vet as Vet;
          });
          console.log('Fetched vets:', vetsRecord);
          setVets(vetsRecord);
        }
      } catch (error) {
        console.error('Error fetching vets:', error);
        toast.error('Failed to load veterinarian information');
      }
    }
  }, []);

  // Define fetchBookings with useCallback
  const fetchBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;

      let query = supabase
        .from('bookings')
        .select('*')
        .eq('pet_owner_id', user?.id || '');

      // Only filter by date if a date is selected
      if (formattedDate) {
        query = query.eq('booking_date', formattedDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Fetched bookings:', data);
        setBookings(data as Booking[]);
        await fetchPetsAndVets(data as Booking[]);
      } else {
        console.log('No bookings found' + (formattedDate ? ' for date: ' + formattedDate : ''));
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoadingBookings(false);
    }
  }, [user, date, fetchPetsAndVets]);

  // Use useEffect with the proper dependencies
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  const handleCancelAppointment = useCallback(async (bookingId: string) => {
    try {
      setLoadingBookings(true);
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) {
        console.error('Error cancelling appointment:', error);
        toast.error('Failed to cancel appointment');
        throw error;
      }

      toast.success('Appointment cancelled successfully');
      
      // Refresh bookings
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    } finally {
      setLoadingBookings(false);
      // Close modal if open
      setIsDetailsModalOpen(false);
    }
  }, [fetchBookings]);

  const openAppointmentDetails = useCallback((booking: Booking) => {
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
      <div className="grid lg:grid-cols-[240px_1fr] h-screen">
        <SidebarTrigger className="absolute left-4 top-4 z-40 lg:hidden">
          <Button variant="outline" size="icon" className="rounded-full">
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </SidebarTrigger>

        <PetOwnerSidebar />

        <div className="flex-1 flex flex-col">
          <SidebarInset className="p-4 md:p-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
                <p className="text-muted-foreground">
                  View and manage your veterinary appointments
                </p>
              </div>

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
            </header>

            <main>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="h-full">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>
                              {pets[booking.pet_id]?.name || "Pet"} - {pets[booking.pet_id]?.type || "Unknown"}
                            </CardTitle>
                            <CardDescription>
                              With Dr. {vets[booking.vet_id]?.first_name || ""} {vets[booking.vet_id]?.last_name || ""}
                            </CardDescription>
                          </div>
                          <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium">Date</h3>
                            <p className="text-lg">{booking.booking_date}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Time</h3>
                            <p className="text-lg">{booking.start_time.slice(0, 5)}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Type</h3>
                          <p className="text-base capitalize">{booking.consultation_type}</p>
                        </div>
                        {booking.notes && (
                          <div>
                            <h3 className="text-sm font-medium">Notes</h3>
                            <p className="text-base">{booking.notes}</p>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openAppointmentDetails(booking)}
                            className="flex items-center gap-1 w-full"
                          >
                            <Eye className="h-4 w-4" /> View Details
                          </Button>
                          
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelAppointment(booking.id)}
                              className="ml-2"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </SidebarInset>
        </div>

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <AppointmentDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            appointment={selectedAppointment}
            pet={pets[selectedAppointment.pet_id]}
            vet={vets[selectedAppointment.vet_id]}
            onCancelAppointment={handleCancelAppointment}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default AppointmentsPage;
