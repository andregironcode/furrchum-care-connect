
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, parseISO, isToday, isFuture, isPast } from 'date-fns';
import { Loader2, AlertCircle, Calendar, Clock, MapPin, Check, X, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AppointmentType {
  id: string;
  vet_id: string;
  pet_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  status: string;
  notes: string | null;
  created_at: string;
  vet_profiles: {
    first_name: string;
    last_name: string;
    specialization: string;
    image_url: string | null;
  };
  pets: {
    name: string;
    type: string;
    breed: string | null;
  };
}

const AppointmentsPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vet_profiles(first_name, last_name, specialization, image_url),
          pets(name, type, breed)
        `)
        .eq('pet_owner_id', user?.id);

      if (error) throw error;
      
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'canceled' })
        .eq('id', appointmentId)
        .eq('pet_owner_id', user?.id); // Security check

      if (error) throw error;
      
      // Update the local state
      setAppointments(appointments.map(app => 
        app.id === appointmentId ? { ...app, status: 'canceled' } : app
      ));
      
      toast.success("Appointment canceled successfully");
    } catch (error) {
      console.error("Error canceling appointment:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = parseISO(`${appointment.booking_date}T${appointment.start_time}`);
    
    if (activeTab === 'upcoming') {
      return (isFuture(appointmentDate) || isToday(appointmentDate)) && appointment.status !== 'canceled';
    } else if (activeTab === 'past') {
      return isPast(appointmentDate) && !isToday(appointmentDate) && appointment.status !== 'canceled';
    } else if (activeTab === 'canceled') {
      return appointment.status === 'canceled';
    }
    
    return true;
  });

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
                <Button 
                  className="bg-primary hover:bg-primary/90" 
                  onClick={() => navigate("/vets")}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Book New Appointment
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
              
              <Tabs 
                defaultValue="upcoming" 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                  <TabsTrigger value="canceled">Canceled</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab}>
                  {filteredAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredAppointments.map((appointment) => (
                        <AppointmentCard 
                          key={appointment.id} 
                          appointment={appointment} 
                          onCancel={() => cancelAppointment(appointment.id)}
                          showCancelButton={activeTab === 'upcoming'}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState activeTab={activeTab} />
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

const AppointmentCard = ({ 
  appointment, 
  onCancel,
  showCancelButton
}: { 
  appointment: AppointmentType; 
  onCancel: () => void;
  showCancelButton: boolean;
}) => {
  const appointmentDate = new Date(`${appointment.booking_date}T${appointment.start_time}`);
  const formattedDate = format(appointmentDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = `${format(parseISO(`2000-01-01T${appointment.start_time}`), 'h:mm a')} - ${format(parseISO(`2000-01-01T${appointment.end_time}`), 'h:mm a')}`;
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'canceled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const isToday = new Date().toDateString() === appointmentDate.toDateString();
  const isUpcoming = appointmentDate > new Date();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-2 ${getStatusColor(appointment.status)}`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Dr. {appointment.vet_profiles.first_name} {appointment.vet_profiles.last_name}</CardTitle>
            <div className="text-sm text-muted-foreground">{appointment.vet_profiles.specialization}</div>
          </div>
          <Badge variant={
            appointment.status === 'confirmed' ? 'success' :
            appointment.status === 'pending' ? 'warning' :
            appointment.status === 'canceled' ? 'destructive' :
            'default'
          }>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span>{formattedDate} {isToday && <Badge variant="outline">Today</Badge>}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span>In-Person Consultation</span>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <div className="font-medium mb-1">Pet:</div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{appointment.pets.name}</span>
            <span className="text-sm text-muted-foreground">
              {appointment.pets.breed ? `${appointment.pets.breed} ${appointment.pets.type}` : appointment.pets.type}
            </span>
          </div>
        </div>
        
        {appointment.notes && (
          <div className="pt-2 border-t">
            <div className="font-medium mb-1">Notes:</div>
            <p className="text-sm">{appointment.notes}</p>
          </div>
        )}
      </CardContent>
      
      {showCancelButton && appointment.status !== 'canceled' && (
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-2" /> Cancel Appointment
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

const EmptyState = ({ activeTab }: { activeTab: string }) => {
  const navigate = useNavigate();
  
  const getEmptyStateMessage = () => {
    switch(activeTab) {
      case 'upcoming':
        return {
          title: "No Upcoming Appointments",
          description: "You don't have any upcoming appointments scheduled. Book a consultation with one of our veterinarians.",
          buttonText: "Book Appointment",
          icon: <Calendar className="h-12 w-12" />
        };
      case 'past':
        return {
          title: "No Past Appointments",
          description: "You haven't had any appointments yet. Book your first consultation with one of our veterinarians.",
          buttonText: "Book Your First Appointment",
          icon: <Clock className="h-12 w-12" />
        };
      case 'canceled':
        return {
          title: "No Canceled Appointments",
          description: "You don't have any canceled appointments.",
          buttonText: "Book New Appointment",
          icon: <X className="h-12 w-12" />
        };
      default:
        return {
          title: "No Appointments Found",
          description: "You don't have any appointments yet.",
          buttonText: "Book Appointment",
          icon: <AlertCircle className="h-12 w-12" />
        };
    }
  };
  
  const { title, description, buttonText, icon } = getEmptyStateMessage();
  
  return (
    <div className="flex flex-col items-center justify-center bg-primary-50 rounded-lg p-12 text-center">
      <div className="bg-primary-100 rounded-full p-6 mb-4 text-primary-600">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {description}
      </p>
      <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('/vets')}>
        <PlusCircle className="mr-2 h-4 w-4" /> {buttonText}
      </Button>
    </div>
  );
};

export default AppointmentsPage;
