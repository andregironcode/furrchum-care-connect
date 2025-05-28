import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TermsConditionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Terms & Conditions (T&C)</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Last Updated: May 28, 2025</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2.1 Scope & Agreement</h2>
          <p>
            By using the Furrchum website, mobile app, or services, you agree to abide by these terms, which apply to all users (pet parents, veterinarians, and guests).
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2.2 Platform Responsibilities</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Furrchum acts as an intermediary connecting users and service providers</li>
            <li>We do not provide or guarantee medical advice, diagnosis, or outcomes</li>
            <li>We ensure only verified veterinarians are listed through a review process</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">2.3 Pet Parent Obligations</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide true and complete pet and contact information</li>
            <li>Arrive on time for appointments or reschedule responsibly</li>
            <li>Use platform for personal, non-commercial purposes</li>
            <li>Avoid misuse, abuse, or fake bookings</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2.4 Veterinarian Responsibilities</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Accept and fulfill booked appointments timely</li>
            <li>Maintain updated clinic hours, availability, and fees</li>
            <li>Provide honest, ethical, and professional service</li>
            <li>Handle post-appointment follow-ups if committed</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">2.5 Cancellations, No-Shows & Delays</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Repetitive cancellations by vets may reduce their visibility</li>
            <li>No-shows by users may lead to account warnings</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">2.6 Intellectual Property</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Furrchum branding, logos, app UI, content, and technology are owned by Furrchum Technologies Pvt. Ltd.</li>
            <li>You may not duplicate, rebrand, or resell any part of our platform</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">2.7 Limitation of Liability</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>We are not responsible for vet behavior, medical decisions, or outcomes</li>
            <li>In case of disputes, Furrchum will assist as a neutral mediator</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">2.8 Modification of Terms</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Terms may be updated anytime; continued use implies acceptance</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions or concerns about these Terms & Conditions, please contact us at:
          </p>
          <p className="mb-8">
            Email: info@furrchum.com<br />
            Address: New Delhi, India
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditionsPage;
