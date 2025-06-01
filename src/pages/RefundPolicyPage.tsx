import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const RefundPolicyPage = () => {
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

        <h1 className="text-3xl font-bold mb-6">Refund & Cancellation Policy</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Last Updated: May 28, 2025</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3.1 For Pet Parents</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Full refund if the appointment is canceled 12+ hours in advance.</li>
            <li>50% refund for cancellations between 4–12 hours before the appointment.</li>
            <li>No refund for cancellations made within 4 hours of the scheduled time.</li>
            <li>No refunds if the user fails to attend the appointment (no-show) unless evidence of technical failure is provided.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">3.2 For Veterinarians</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>If a veterinarian cancels any confirmed appointment, the pet parent will receive a 100% refund.</li>
            <li>Repeated cancellations or no-shows by the veterinarian may result in temporary suspension or permanent delisting.</li>
            <li>Veterinarians must notify the platform of emergency cancellations at least 2 hours in advance, where possible.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3.3 Platform-Initiated Cancellations</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>In the event of technical glitches, payment errors, or profile misrepresentations, Furrchum reserves the right to cancel appointments with full refund to the user.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3.4 Processing Time</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Refunds will be initiated within 5–7 business days via the original method of payment.</li>
            <li>Refunds may reflect in the user's account depending on bank processing time (may take up to 10 days total).</li>
            <li>Any delays should be reported to info@furrchum.com.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3.5 Exceptions</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Sudden unavailability due to medical or personal emergencies of the vet may be considered with supporting proof.</li>
            <li>Natural disasters, power outages, or uncontrollable external events will be treated as force majeure.</li>
            <li>In such cases, full refunds will be issued regardless of user or vet involvement.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3.6 Escalations</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Refund disputes must be raised within 3 working days from the scheduled appointment.</li>
            <li>Furrchum's support team will investigate and make a final decision within 7 working days.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions or concerns about this Refund & Cancellation Policy, please contact us at:
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

export default RefundPolicyPage;
