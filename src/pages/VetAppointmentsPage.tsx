
import { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, MoreVertical, ThumbsUp, UserCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for appointments
const mockAppointments = [
  { id: 1, date: '21/05/2025', time: '12:18', type: 'Visit', petName: 'Nobita Nobita', recommendation: 'Health problem', status: 'Pending' },
  { id: 2, date: '19/05/2025', time: '17:55', type: 'Visit', petName: 'Bravo Bravo', recommendation: 'Neutering', status: 'Pending' },
  { id: 3, date: '19/05/2025', time: '11:02', type: 'Video', petName: 'my pet222 my pet222', recommendation: 'test22', status: 'Cancelled' },
  { id: 4, date: '18/05/2025', time: '14:55', type: 'Video', petName: 'Bruno Bruno', recommendation: 'health problem', status: 'Confirmed' },
  { id: 5, date: '17/05/2025', time: '17:59', type: 'Visit', petName: 'Bravo Bravo', recommendation: 'Skin anergy', status: 'Pending' },
  { id: 6, date: '16/05/2025', time: '11:31', type: 'Video', petName: 'Bravo Bravo', recommendation: 'Ear Infections', status: 'Pending' },
  { id: 7, date: '16/05/2025', time: '09:35', type: 'Visit', petName: 'my pet my pet', recommendation: 'test', status: 'Pending' },
  { id: 8, date: '16/05/2025', time: '16:45', type: 'Video', petName: 'Bravo Bravo', recommendation: 'Neutering', status: 'Pending' },
  { id: 9, date: '16/05/2025', time: '15:47', type: 'Video', petName: 'Rocky Rocky', recommendation: 'May cause coughing', status: 'Cancelled' },
  { id: 10, date: '16/05/2025', time: '15:27', type: 'Video', petName: 'tommy tommy', recommendation: 'Skin anergy', status: 'Pending' },
];

const VetAppointmentsPage = () => {
  const [appointments] = useState(mockAppointments);

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-cream-50">
        <VetSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold text-accent-600">Total Appointments</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-primary">
                      <TableRow>
                        <TableHead className="text-white font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2" /> Date
                        </TableHead>
                        <TableHead className="text-white font-medium flex items-center">
                          <Clock className="h-4 w-4 mr-2" /> Time
                        </TableHead>
                        <TableHead className="text-white font-medium">Type</TableHead>
                        <TableHead className="text-white font-medium flex items-center">
                          <UserCircle className="h-4 w-4 mr-2" /> Pet Name
                        </TableHead>
                        <TableHead className="text-white font-medium flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-2" /> Recommendation
                        </TableHead>
                        <TableHead className="text-white font-medium">Status</TableHead>
                        <TableHead className="text-white font-medium">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.date}</TableCell>
                          <TableCell>{appointment.time}</TableCell>
                          <TableCell>{appointment.type}</TableCell>
                          <TableCell>{appointment.petName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                              {appointment.recommendation}
                            </Badge>
                          </TableCell>
                          <TableCell>{renderStatusBadge(appointment.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Appointment</DropdownMenuItem>
                                <DropdownMenuItem>Cancel Appointment</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-end p-4 border-t">
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>
                      &lt;
                    </Button>
                    <Button variant="outline" size="sm" className="bg-primary text-white hover:bg-primary/90">
                      1
                    </Button>
                    <Button variant="outline" size="sm">2</Button>
                    <Button variant="outline" size="sm">3</Button>
                    <Button variant="outline" size="sm">&gt;</Button>
                  </div>
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VetAppointmentsPage;
