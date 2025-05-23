
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Plus, Calendar, MapPin, Clock, Dog, Cat } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const AppointmentsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (user) {
          const { data, error } = await supabase
            .from('appointments')
            .select('*, vet:vets(*), pet:pets(*)')
            .eq('user_id', user.id);
            
          if (error) throw error;
          setAppointments(data || []);
        }
      } catch (error: any) {
        console.error('Error fetching appointments:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchAppointments();
    }
  }, [user, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Filter appointments by status
  const upcomingAppointments = appointments.filter(appt => new Date(appt.date) > new Date());
  const pastAppointments = appointments.filter(appt => new Date(appt.date) <= new Date());

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PetOwnerSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold">Appointments</h1>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="mr-2 h-4 w-4" /> New Appointment
                </Button>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-8">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="w-full bg-orange-100 mb-4 h-12">
                  <TabsTrigger value="upcoming" className="text-lg flex-1">Upcoming</TabsTrigger>
                  <TabsTrigger value="past" className="text-lg flex-1">Past</TabsTrigger>
                  <TabsTrigger value="canceled" className="text-lg flex-1">Canceled</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  {upcomingAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {upcomingAppointments.map((appointment) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                  ) : (
                    <EmptyAppointmentState type="upcoming" />
                  )}
                </TabsContent>
                
                <TabsContent value="past">
                  {pastAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {pastAppointments.map((appointment) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} isPast={true} />
                      ))}
                    </div>
                  ) : (
                    <EmptyAppointmentState type="past" />
                  )}
                </TabsContent>
                
                <TabsContent value="canceled">
                  <EmptyAppointmentState type="canceled" />
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Appointment Card Component
const AppointmentCard = ({ appointment, isPast = false }: { appointment: any, isPast?: boolean }) => {
  const appointmentDate = new Date(appointment.date);
  const formattedDate = format(appointmentDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(appointmentDate, 'h:mm a');
  
  let statusBadge;
  switch(appointment.status) {
    case 'confirmed':
      statusBadge = <Badge className="bg-green-500">Confirmed</Badge>;
      break;
    case 'pending':
      statusBadge = <Badge className="bg-yellow-500">Pending</Badge>;
      break;
    case 'completed':
      statusBadge = <Badge className="bg-blue-500">Completed</Badge>;
      break;
    case 'canceled':
      statusBadge = <Badge className="bg-red-500">Canceled</Badge>;
      break;
    default:
      statusBadge = <Badge className="bg-gray-500">Unknown</Badge>;
  }

  return (
    <Card className="hover:shadow-lg transition-shadow border-orange-300">
      <CardHeader className="bg-orange-50 flex flex-row items-start gap-4 p-4">
        <div className="bg-orange-100 rounded-md p-3 text-orange-500">
          <Calendar className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{appointment.type || 'Check-up'}</CardTitle>
            {statusBadge}
          </div>
          <div className="flex items-center mt-2">
            <div className="text-sm font-medium text-gray-700">{formattedDate}</div>
            <div className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md">{formattedTime}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Pet Information */}
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="bg-orange-100 rounded-full p-1.5">
              {appointment.pet?.type === 'cat' ? (
                <Cat className="h-4 w-4 text-orange-500" />
              ) : (
                <Dog className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <span className="font-medium">{appointment.pet?.name || 'Pet'}</span>
            <span className="text-sm text-gray-500">({appointment.pet?.breed || appointment.pet?.type || 'Unknown'})</span>
          </div>
          
          {/* Vet Information */}
          <div className="flex items-start gap-2">
            <div className="shrink-0 mt-0.5">
              <div className="h-6 w-6 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 font-bold text-xs">
                {appointment.vet?.name?.charAt(0) || 'V'}
              </div>
            </div>
            <div>
              <div className="font-medium">{appointment.vet?.name || 'Veterinarian'}</div>
              <div className="text-sm text-gray-500">{appointment.vet?.specialty || 'General Practitioner'}</div>
            </div>
          </div>
          
          {/* Location */}
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <span className="text-sm">{appointment.vet?.address || appointment.location || 'Clinic Location'}</span>
          </div>
          
          {/* Notes */}
          {appointment.notes && (
            <div className="bg-orange-50 p-2 rounded-md text-sm text-gray-700">
              <span className="font-medium">Notes: </span>{appointment.notes}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        {isPast ? (
          <>
            <Button variant="outline" className="border-orange-300 text-orange-600">View Details</Button>
            <Button className="bg-orange-500 hover:bg-orange-600">Book Follow-up</Button>
          </>
        ) : (
          <>
            <Button variant="outline" className="border-orange-300 text-orange-600">Reschedule</Button>
            <Button variant="destructive">Cancel</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

// Empty State Component
const EmptyAppointmentState = ({ type = "upcoming" }: { type?: string }) => {
  let message = '';
  let description = '';
  
  switch (type) {
    case 'upcoming':
      message = "No upcoming appointments";
      description = "Schedule an appointment with a veterinarian for your pet's health needs.";
      break;
    case 'past':
      message = "No past appointments";
      description = "Your previous vet appointments will appear here after completed visits.";
      break;
    case 'canceled':
      message = "No canceled appointments";
      description = "Any canceled appointments will be shown here.";
      break;
    default:
      message = "No appointments found";
      description = "Schedule an appointment with a veterinarian for your pet's health needs.";
  }
  
  return (
    <div className="flex flex-col items-center justify-center bg-orange-50 rounded-lg p-12">
      <div className="bg-orange-100 rounded-full p-6 mb-4">
        <Calendar className="h-12 w-12 text-orange-300" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">{message}</h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        {description}
      </p>
      {type === 'upcoming' && (
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="mr-2 h-4 w-4" /> Schedule Appointment
        </Button>
      )}
    </div>
  );
};

export default AppointmentsPage;
