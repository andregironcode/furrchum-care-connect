
import { useState } from 'react';
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
  Search
} from 'lucide-react';
import Footer from '@/components/Footer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-amber-500 hover:bg-amber-600">{status}</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Function to filter appointments based on search query and status filter
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appointment.recommendation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                          appointment.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

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
                        placeholder="Search pet or issue..."
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
                            <UserCircle className="h-4 w-4 mr-2" /> Pet Name
                          </div>
                        </TableHead>
                        <TableHead className="text-white font-medium">
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-2" /> Recommendation
                          </div>
                        </TableHead>
                        <TableHead className="text-white font-medium">Status</TableHead>
                        <TableHead className="text-white font-medium">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((appointment) => (
                          <TableRow key={appointment.id} className="hover:bg-slate-50">
                            <TableCell>{appointment.date}</TableCell>
                            <TableCell>{appointment.time}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={appointment.type === 'Video' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-purple-100 text-purple-800 border-purple-200'}>
                                {appointment.type}
                              </Badge>
                            </TableCell>
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
                                  <DropdownMenuItem className="text-red-500">Cancel Appointment</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No appointments found matching your filters.
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
