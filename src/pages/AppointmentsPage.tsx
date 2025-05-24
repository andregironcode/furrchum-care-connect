
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CalendarIcon } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from 'sonner';

interface Booking {
  id: string;
  created_at: string;
  updated_at: string;
  vet_id: string;
  pet_id: string;
  pet_owner_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  notes: string | null;
  status: string;
}

interface Pet {
  id: string;
  name: string;
  type: string;
}

const AppointmentsPage = () => {
  const { user, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pets, setPets] = useState<Record<string, Pet>>({});
  const [vets, setVets] = useState<Record<string, {first_name: string, last_name: string}>>({});
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined); // Default to undefined to show all appointments

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, date]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;

      let query = supabase
        .from('bookings')
        .select('*')
        .eq('pet_owner_id', user?.id);

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
  };

  const fetchPetsAndVets = async (bookings: Booking[]) => {
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
        console.error('Error processing pets data:', error);
      }
    }
    
    // Fetch vets
    if (vetIds.length > 0) {
      try {
        const { data: vetsData, error } = await supabase
          .from('vet_profiles')
          .select('id, first_name, last_name')
          .in('id', vetIds);
          
        if (error) {
          console.error('Error fetching vets:', error);
          throw error;
        }
          
        if (vetsData) {
          const vetsRecord: Record<string, {first_name: string, last_name: string}> = {};
          vetsData.forEach(vet => {
            vetsRecord[vet.id] = { first_name: vet.first_name, last_name: vet.last_name };
          });
          console.log('Fetched vets:', vetsRecord);
          setVets(vetsRecord);
        }
      } catch (error) {
        console.error('Error processing vet data:', error);
      }
    }
  };

  const handleCancelAppointment = async (bookingId: string) => {
    try {
      setLoadingBookings(true);
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) {
        console.error('Error cancelling booking:', error);
        throw error;
      }
      
      toast.success('Appointment cancelled successfully');
      fetchBookings(); // Refresh bookings after cancellation
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel appointment');
    } finally {
      setLoadingBookings(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return "secondary";
      case 'pending': return "default";
      case 'completed': return "outline";
      case 'cancelled': return "destructive";
      default: return "default";
    }
  };

  const clearDateFilter = () => {
    setDate(undefined);
  };

  if (isLoading || loadingBookings) {
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
      <div className="min-h-screen bg-background w-full">
        <div className="flex h-full">
          <PetOwnerSidebar />
          <SidebarInset className="lg:pl-0">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold">My Appointments</h1>
                </div>
              </div>
            </header>
            
            <main className="container mx-auto px-4 py-8">
              <div className="flex justify-between mb-4 items-center">
                <div className="flex items-center space-x-4">
                  {date && (
                    <Button 
                      variant="outline" 
                      onClick={clearDateFilter}
                      className="text-sm"
                    >
                      Show all appointments
                    </Button>
                  )}
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[250px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Filter by date (optional)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {bookings.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Appointments</CardTitle>
                    <CardDescription>
                      {date 
                        ? "You have no appointments scheduled for this date." 
                        : "You have no appointments scheduled."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
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
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <div className="flex justify-end pt-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelAppointment(booking.id)}
                            >
                              Cancel Appointment
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppointmentsPage;
