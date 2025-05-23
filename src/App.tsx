
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VetDirectory from "./pages/VetDirectory";
import HealthRecords from "./pages/HealthRecords";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import PetOwnerDashboard from "./pages/PetOwnerDashboard";
import VetDashboard from "./pages/VetDashboard";
import RouteGuard from "./components/RouteGuard";
import VetAppointmentsPage from "./pages/VetAppointmentsPage";
import VetPrescriptionsPage from "./pages/VetPrescriptionsPage";
import VetProfilePage from "./pages/VetProfilePage";
import VetBillingPage from "./pages/VetBillingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vets" element={<VetDirectory />} />
            <Route path="/records" element={<HealthRecords />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Pet Owner Routes */}
            <Route path="/dashboard" element={
              <RouteGuard>
                <PetOwnerDashboard />
              </RouteGuard>
            } />
            <Route path="/my-pets" element={<RouteGuard><NotFound /></RouteGuard>} />
            <Route path="/appointments" element={<RouteGuard><NotFound /></RouteGuard>} />
            <Route path="/settings" element={<RouteGuard><NotFound /></RouteGuard>} />
            
            {/* Vet Routes */}
            <Route path="/vet-dashboard" element={
              <RouteGuard>
                <VetDashboard />
              </RouteGuard>
            } />
            <Route path="/vet-appointments" element={
              <RouteGuard>
                <VetAppointmentsPage />
              </RouteGuard>
            } />
            <Route path="/prescriptions" element={
              <RouteGuard>
                <VetPrescriptionsPage />
              </RouteGuard>
            } />
            <Route path="/vet-profile" element={
              <RouteGuard>
                <VetProfilePage />
              </RouteGuard>
            } />
            <Route path="/vet-billing" element={
              <RouteGuard>
                <VetBillingPage />
              </RouteGuard>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
