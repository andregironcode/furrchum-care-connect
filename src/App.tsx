import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VetDirectory from "./pages/VetDirectory";
import HealthRecords from "./pages/HealthRecords";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";
import { AuthProvider } from "./context/AuthContext";
import PetOwnerDashboard from "./pages/PetOwnerDashboard";
import VetDashboard from "./pages/VetDashboard";
import RouteGuard from "./components/RouteGuard";
import VetAppointmentsPage from "./pages/VetAppointmentsPage";
import VetPrescriptionsPage from "./pages/VetPrescriptionsPage";
import VetProfilePage from "./pages/VetProfilePage";
import VetBillingPage from "./pages/VetBillingPage";
import VetPatientsPage from "./pages/VetPatientsPage";
import MyPetsPage from "./pages/MyPetsPage";
import MyVetsPage from "./pages/MyVetsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import PaymentsPage from "./pages/PaymentsPage";
import ProfilePage from "./pages/ProfilePage";
import BookingPage from "./pages/BookingPage";
import VetDetailsPage from "./pages/VetDetailsPage";
import WherebyTest from "./components/WherebyTest";
import WherebyTestEnhanced from '@/components/WherebyTest.enhanced';
import TestVideoCallPage from "./pages/TestVideoCallPage";
import TestPaymentPage from "./pages/TestPaymentPage";
import SuperAdminAuth from "./pages/SuperAdminAuth";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminGuard from "./components/SuperAdminGuard";
import FAQPage from "./pages/FAQPage";
import ErrorBoundary from "./components/ErrorBoundary";

// Policy Pages
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsConditionsPage from "./pages/TermsConditionsPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import ShippingDeliveryPage from "./pages/ShippingDeliveryPage";
import DisclaimerPage from "./pages/DisclaimerPage";
import AdditionalPoliciesPage from "./pages/AdditionalPoliciesPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogAdminPage from "./pages/BlogAdminPage";

const App = () => {
  // Move queryClient inside the component
  const queryClient = new QueryClient();
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Redirecting root to vets page */}
                <Route path="/" element={<Navigate to="/vets" replace />} />
                <Route path="/vets" element={<VetDirectory />} />
                <Route path="/records" element={<HealthRecords />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/test-whereby" element={<WherebyTest />} />
                <Route path="/vet-details/:vetId" element={<VetDetailsPage />} />
                
                {/* Policy Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-conditions" element={<TermsConditionsPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/shipping-delivery" element={<ShippingDeliveryPage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
                <Route path="/additional-policies" element={<AdditionalPoliciesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPage />} />
                <Route path="/blog/admin" element={<BlogAdminPage />} />
                <Route path="/test-video-call" element={<TestVideoCallPage />} />
                <Route path="/test-payment" element={<TestPaymentPage />} />
                
                {/* Super Admin Routes */}
                <Route path="/superadmin/auth" element={<SuperAdminAuth />} />
                <Route path="/superadmin/dashboard" element={
                  <SuperAdminGuard>
                    <SuperAdminDashboard />
                  </SuperAdminGuard>
                } />
                <Route path="/superadmin/dashboard/" element={
                  <SuperAdminGuard>
                    <SuperAdminDashboard />
                  </SuperAdminGuard>
                } />
                
                {/* Pet Owner Dashboard with vet redirection */}
                <Route path="/dashboard" element={
                  <RouteGuard>
                    {({ profile }) => {
                      if (profile?.user_type === 'vet') {
                        return <Navigate to="/vet-dashboard" replace />;
                      }
                      return <PetOwnerDashboard />;
                    }}
                  </RouteGuard>
                } />
                <Route path="/my-pets" element={
                  <RouteGuard>
                    <MyPetsPage />
                  </RouteGuard>
                } />
                <Route path="/add-pet" element={
                  <RouteGuard>
                    <MyPetsPage />
                  </RouteGuard>
                } />
                <Route path="/my-vets" element={
                  <RouteGuard>
                    <MyVetsPage />
                  </RouteGuard>
                } />
                <Route path="/appointments" element={
                  <RouteGuard>
                    <AppointmentsPage />
                  </RouteGuard>
                } />
                <Route path="/prescriptions" element={
                  <RouteGuard>
                    <PrescriptionsPage />
                  </RouteGuard>
                } />
                <Route path="/payments" element={
                  <RouteGuard>
                    <PaymentsPage />
                  </RouteGuard>
                } />
                <Route path="/faq" element={
                  <RouteGuard>
                    <FAQPage />
                  </RouteGuard>
                } />
                <Route path="/profile" element={
                  <RouteGuard>
                    <ProfilePage />
                  </RouteGuard>
                } />
                
                {/* New Booking and Payment Routes */}
                <Route path="/booking/:vetId" element={
                  <RouteGuard>
                    <BookingPage />
                  </RouteGuard>
                } />
                <Route path="/booking" element={
                  <RouteGuard>
                    <BookingPage />
                  </RouteGuard>
                } />
                
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
                <Route path="/vet-patients" element={
                  <RouteGuard>
                    <VetPatientsPage />
                  </RouteGuard>
                } />
                <Route path="/vet-prescriptions" element={
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
                
                <Route path="/test/whereby" element={
                  <RouteGuard>
                    <WherebyTestEnhanced />
                  </RouteGuard>
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
