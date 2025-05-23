
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, Calendar, Clock, VideoIcon } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { format } from 'date-fns';

// Mock data for appointments until the database table is created
const mockAppointments = [
  {
    id: '1',
    vet_name: 'Dr. Sarah Johnson',
    pet_name: 'Max',
    date: new Date(2025, 5, 28, 14, 30),
    status: 'upcoming',
    type: 'check-up',
    notes: 'Regular check-up and vaccinations'
  },
  {
    id: '2',
    vet_name: 'Dr. Michael Chen',
    pet_name: 'Luna',
    date: new Date(2025, 5, 30, 10, 0),
    status: 'upcoming',
    type: 'consultation',
    notes: 'Discuss dietary requirements and weight management'
  },
  {
    id: '3',
    vet_name: 'Dr. Amanda Lopez',
    pet_name: 'Max',
    date: new Date(2025, 4, 15, 11, 30),
    status: 'completed',
    type: 'check-up',
    notes: 'Annual check-up completed. All vaccinations up to date.'
  }
];

const AppointmentsPage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (user) {
          // In a real implementation, we would fetch from Supabase
          // Since the 'appointments' table doesn't exist yet, we'll use mock data
          setAppointments(mockAppointments);
          
          // This comment explains what the real implementation would look like:
          // const { data, error } = await supabase
          //   .from('appointments')
          //   .select('*, vets(*), pets(*)')
          //   .eq('user_id', user.id)
          //   .order('date', { ascending: true });
          //     
          // if (error) throw error;
          // setAppointments(data || []);
        }
      } catch (error: any) {
        console.error('Error fetching appointments:', error);
        setError(error.message || 'Failed to fetch appointments');
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

  const upcomingAppointments = appointments.filter(app => app.status === 'upcoming');
  const pastAppointments = appointments.filter(app => app.status === 'completed' || app.status === 'cancelled');

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
                  <h1 className="text-2xl font-bold">My Appointments</h1>
                </div>
                <Button className="bg-primary hover:bg-primary-600">
                  <Plus className="mr-2 h-4 w-4" /> Schedule Appointment
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
                <TabsList className="w-full bg-primary-100 mb-4 h-12">
                  <TabsTrigger value="upcoming" className="text-lg flex-1">Upcoming</TabsTrigger>
                  <TabsTrigger value="past" className="text-lg flex-1">Past</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  {upcomingAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pastAppointments.map((appointment) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                  ) : (
                    <EmptyAppointmentState type="past" />
                  )}
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
const AppointmentCard = ({ appointment }: { appointment: any }) => {
  const isPast = appointment.status === 'completed' || appointment.status === 'cancelled';
  
  return (
    <Card className={`hover:shadow-lg transition-shadow border-${isPast ? 'gray' : 'primary'}-300`}>
      <CardHeader className={`bg-${isPast ? 'gray' : 'primary'}-50 flex flex-col space-y-2`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{appointment.type}</CardTitle>
          <div className={`px-2 py-1 rounded-md text-xs font-medium 
            ${appointment.status === 'upcoming' ? 'bg-primary-100 text-primary-800' : 
              appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
              'bg-gray-100 text-gray-800'}`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <p>With: {appointment.vet_name}</p>
          <p>For: {appointment.pet_name}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className={`h-5 w-5 ${isPast ? 'text-gray-500' : 'text-primary-500'}`} />
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className={`h-5 w-5 ${isPast ? 'text-gray-500' : 'text-primary-500'}`} />
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">{format(new Date(appointment.date), 'h:mm a')}</p>
          </div>
        </div>
        
        {appointment.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Notes</p>
            <p className="text-sm">{appointment.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {!isPast && (
          <>
            <Button variant="outline" className="border-primary-300 text-primary-600">Reschedule</Button>
            <Button className="bg-primary hover:bg-primary-600">
              <VideoIcon className="mr-2 h-4 w-4" /> Join Call
            </Button>
          </>
        )}
        {isPast && (
          <Button variant="outline" className="border-gray-300 text-gray-600">View Details</Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Empty State Component
const EmptyAppointmentState = ({ type = "upcoming" }: { type: string }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-primary-50 rounded-lg p-12">
      <div className="bg-primary-100 rounded-full p-6 mb-4">
        <Calendar className="h-12 w-12 text-primary-500" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">
        {type === "upcoming" ? "No Upcoming Appointments" : "No Past Appointments"}
      </h3>
      <p className="text-gray-500 mb-4 text-center max-w-md">
        {type === "upcoming" 
          ? "You don't have any scheduled appointments coming up. Schedule a consultation with a veterinarian."
          : "You don't have any past appointments yet. Once you complete appointments, they will appear here."}
      </p>
      {type === "upcoming" && (
        <Button className="bg-primary hover:bg-primary-600">
          <Plus className="mr-2 h-4 w-4" /> Schedule Appointment
        </Button>
      )}
    </div>
  );
};

export default AppointmentsPage;
