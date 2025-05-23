
import { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MoreVertical, PawPrint, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for prescriptions
const mockPrescriptions = [
  { id: 1, petName: 'Bravo', breed: 'Neutering', date: '19/05/2025', condition: 'cc', reasonOfVisit: 'Neutering' },
  { id: 2, petName: 'Bravo', breed: 'Neutering', date: '19/05/2025', condition: 'er', reasonOfVisit: 'Neutering' },
  { id: 3, petName: 'Bravo', breed: 'Neutering', date: '19/05/2025', condition: 'df', reasonOfVisit: 'Neutering' },
  { id: 4, petName: 'Bruno', breed: 'Neutering', date: '19/05/2025', condition: 'ss', reasonOfVisit: 'health problem' },
  { id: 5, petName: 'Golu', breed: 'Labrador Retriever', date: '15/05/2025', condition: 'd', reasonOfVisit: 'Skin anergyd' },
  { id: 6, petName: 'Golu', breed: 'Labrador Retriever', date: '09/05/2025', condition: 'rfg', reasonOfVisit: 'Skin anergy' },
  { id: 7, petName: 'Golu', breed: 'Labrador Retriever', date: '09/05/2025', condition: 'skin allergy', reasonOfVisit: 'Skin anergy' },
];

const VetPrescriptionsPage = () => {
  const [prescriptions] = useState(mockPrescriptions);

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
                  <h1 className="text-2xl font-bold text-accent-600">Recent Prescriptions</h1>
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
                          <PawPrint className="h-4 w-4 mr-2" /> Pet Name
                        </TableHead>
                        <TableHead className="text-white font-medium">Breed</TableHead>
                        <TableHead className="text-white font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2" /> Date
                        </TableHead>
                        <TableHead className="text-white font-medium">Condition</TableHead>
                        <TableHead className="text-white font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2" /> Reason Of Visit
                        </TableHead>
                        <TableHead className="text-white font-medium">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions.map((prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell>{prescription.petName}</TableCell>
                          <TableCell>{prescription.breed}</TableCell>
                          <TableCell>{prescription.date}</TableCell>
                          <TableCell>{prescription.condition}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                              {prescription.reasonOfVisit}
                            </Badge>
                          </TableCell>
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
                                <DropdownMenuItem>Edit Prescription</DropdownMenuItem>
                                <DropdownMenuItem>Print Prescription</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VetPrescriptionsPage;
