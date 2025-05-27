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

        <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Last Updated: May 27, 2025</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>
            This Refund Policy outlines the terms and conditions for refunds on services provided by FurrChum Care Connect. We strive to ensure your satisfaction with our telehealth veterinary services, and this policy is designed to be fair and transparent.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Consultation Refunds</h2>
          
          <h3 className="text-lg font-medium mt-6 mb-3">2.1 Cancellation Before Consultation</h3>
          <p>
            If you cancel a scheduled consultation at least 24 hours before the appointment time, you will receive a full refund of the consultation fee.
          </p>
          <p>
            Cancellations made less than 24 hours before the scheduled appointment time may be eligible for a partial refund of 50% of the consultation fee, subject to review.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-3">2.2 Technical Issues</h3>
          <p>
            If a consultation cannot be completed due to technical issues on our platform, you will be offered either:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>A full refund of the consultation fee, or</li>
            <li>Rescheduling of the consultation at no additional cost</li>
          </ul>
          <p>
            Technical issues must be reported to our customer support team within 2 hours of the scheduled consultation time to be eligible for a refund.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-3">2.3 Veterinarian No-Show</h3>
          <p>
            If a veterinarian fails to attend a scheduled consultation without prior notice, you will receive a full refund of the consultation fee and may be offered a discount on your next booking as compensation for the inconvenience.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-3">2.4 Unsatisfactory Service</h3>
          <p>
            If you are dissatisfied with the quality of a consultation, you may request a refund by contacting our customer support team within 48 hours of the completed consultation. Each request will be evaluated on a case-by-case basis.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. Subscription Refunds</h2>
          
          <h3 className="text-lg font-medium mt-6 mb-3">3.1 Cancellation of Subscription</h3>
          <p>
            If you cancel a subscription plan, refunds will be processed as follows:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Cancellation within 7 days of purchase: Full refund if no services have been used</li>
            <li>Cancellation after 7 days: Prorated refund based on the unused portion of the subscription period</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-6 mb-3">3.2 Automatic Renewals</h3>
          <p>
            For subscription plans with automatic renewal, you may request a refund within 7 days of an automatic renewal if you did not intend to continue the subscription. After 7 days, refunds for automatic renewals will be subject to the standard cancellation policy.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Refund Process</h2>
          <p>
            To request a refund, please contact our customer support team through one of the following methods:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Email: support@furrchum.com</li>
            <li>Phone: +1 (123) 456-7890</li>
            <li>In-app chat support</li>
          </ul>
          <p>
            Please include the following information in your refund request:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your full name and email address associated with your account</li>
            <li>Date and time of the consultation or subscription purchase</li>
            <li>Reason for requesting a refund</li>
            <li>Any relevant details or documentation supporting your request</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-6 mb-3">4.1 Processing Time</h3>
          <p>
            Refund requests are typically processed within 3-5 business days. Once approved, the refund will be issued to the original payment method used for the purchase. Depending on your payment provider, it may take an additional 5-10 business days for the refunded amount to appear in your account.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Exceptions</h2>
          <p>
            FurrChum Care Connect reserves the right to deny refund requests that do not comply with this policy or in cases of suspected fraudulent activity. We may also make exceptions to this policy at our discretion in extenuating circumstances.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Changes to This Refund Policy</h2>
          <p>
            We may update this Refund Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated Refund Policy on this page with a new effective date.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Refund Policy, please contact us at:
          </p>
          <p className="mb-8">
            Email: billing@furrchum.com<br />
            Address: 1234 Pet Avenue, San Francisco, CA 94107
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicyPage;
