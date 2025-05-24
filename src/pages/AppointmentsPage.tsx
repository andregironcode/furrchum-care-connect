import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Booking {
  id: string;
  created_at: string;
  vet_id: string;
  pet_id: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const VetAppointmentsPage = () => {
  const { user, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

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
        .eq('vet_id', user?.id);

      if (formattedDate) {
        query = query.eq('date', formattedDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      setLoadingBookings(true);
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      fetchBookings(); // Refresh bookings after status update
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  if (isLoading || loadingBookings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-background">
        <VetSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold">Your Appointments</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-8">
              <div className="mb-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) =>
                        date > new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {bookings.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Appointments</CardTitle>
                    <CardDescription>You have no appointments scheduled for this date.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Check back later or select a different date.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardHeader>
                        <CardTitle>Appointment Details</CardTitle>
                        <CardDescription>Details for appointment on {booking.date} at {booking.time}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium">Date</h3>
                            <p className="text-lg">{booking.date}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Time</h3>
                            <p className="text-lg">{booking.time}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Reason</h3>
                          <p className="text-base">{booking.reason}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Status</h3>
                          <Badge variant="secondary">{booking.status}</Badge>
                        </div>
                        <div className="flex justify-end gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                variant="secondary" // Changed from "success"
                                size="sm"
                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              variant="secondary" // Changed from "success"
                              size="sm"
                              onClick={() => handleUpdateStatus(booking.id, 'completed')}
                            >
                              Mark Completed
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VetAppointmentsPage;
