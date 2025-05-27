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

        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Last Updated: May 27, 2025</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
          <p>
            These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and FurrChum Care Connect ("we," "us" or "our"), concerning your access to and use of our website and telehealth veterinary services.
          </p>
          <p>
            By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Description of Services</h2>
          <p>
            FurrChum Care Connect provides an online platform that connects pet owners with licensed veterinarians for telehealth consultations. Our services include but are not limited to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Video consultations with licensed veterinarians</li>
            <li>Chat-based consultations for non-emergency pet health inquiries</li>
            <li>Digital prescription services where legally permitted</li>
            <li>Pet health record management</li>
            <li>Educational resources on pet health and wellness</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          
          <h3 className="text-lg font-medium mt-6 mb-3">3.1 Account Creation</h3>
          <p>
            To use certain features of our services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-3">3.2 Account Responsibilities</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device. You agree to accept responsibility for all activities that occur under your account or password.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Telehealth Services</h2>
          
          <h3 className="text-lg font-medium mt-6 mb-3">4.1 Not a Substitute for Emergency Care</h3>
          <p>
            Our telehealth services are not intended to replace emergency veterinary care. If your pet is experiencing a medical emergency, please contact your local emergency veterinary clinic immediately.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-3">4.2 Licensed Veterinarians</h3>
          <p>
            All veterinarians providing services through our platform are licensed professionals. However, we do not guarantee the quality of the veterinary advice provided. The veterinarians are independent contractors and not employees of FurrChum Care Connect.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-3">4.3 Limitations of Telehealth</h3>
          <p>
            You acknowledge that telehealth consultations have inherent limitations compared to in-person examinations. Our veterinarians may recommend an in-person visit if they determine that telehealth is not appropriate for your pet's condition.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Payment Terms</h2>
          <p>
            By using our paid services, you agree to pay all fees due at the time of booking a consultation or purchasing a subscription. All payments are processed through secure third-party payment processors. Refunds are subject to our Refund Policy.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. User Content</h2>
          <p>
            You retain all rights to any content you submit, post, or display on or through our services. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content for the purpose of providing our services.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. Prohibited Uses</h2>
          <p>
            You agree not to use our services for any purpose that is unlawful or prohibited by these Terms. Prohibited activities include but are not limited to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Using the service for illegal purposes</li>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Harassing or abusing veterinarians or other users</li>
            <li>Submitting false or misleading information</li>
            <li>Using our platform for human medical advice</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are and will remain the exclusive property of FurrChum Care Connect and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, FurrChum Care Connect shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your access to or use of or inability to access or use the services.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">10. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless FurrChum Care Connect and its licensors, service providers, employees, agents, officers, and directors from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the services.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any legal action or proceeding relating to your access to or use of the services shall be instituted in the federal or state courts located in San Francisco County, California.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">12. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">13. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mb-8">
            Email: legal@furrchum.com<br />
            Address: 1234 Pet Avenue, San Francisco, CA 94107
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditionsPage;
