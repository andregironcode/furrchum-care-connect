import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage = () => {
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

        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Last Updated: May 27, 2025</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>
            FurrChum Care Connect ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our telehealth services for veterinary care.
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by all the terms outlined in this Privacy Policy.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <h3 className="text-lg font-medium mt-6 mb-3">2.1 Personal Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Contact information (name, email address, phone number)</li>
            <li>Account credentials (username, password)</li>
            <li>Billing and payment information</li>
            <li>Pet information (name, breed, age, medical history)</li>
            <li>Veterinarian information (for vet users)</li>
            <li>Profile pictures and other content you choose to upload</li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-3">2.2 Usage Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Log data (pages visited, time spent on pages, referring URLs)</li>
            <li>Location data (if permitted by your device settings)</li>
            <li>Telehealth session information</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <p>We may use the information we collect for various purposes, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Providing and maintaining our services</li>
            <li>Processing payments and transactions</li>
            <li>Connecting pet owners with veterinarians</li>
            <li>Sending service-related communications</li>
            <li>Improving and personalizing our services</li>
            <li>Analyzing usage patterns and trends</li>
            <li>Protecting against fraudulent or unauthorized activity</li>
            <li>Complying with legal obligations</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Sharing Your Information</h2>
          <p>We may share your information with:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Veterinarians and healthcare providers as part of our telehealth services</li>
            <li>Service providers who help us operate our platform</li>
            <li>Payment processors to complete transactions</li>
            <li>Legal authorities when required by law</li>
            <li>Business partners with your consent</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Request deletion of your personal information</li>
            <li>Restrict or object to certain processing activities</li>
            <li>Request the transfer of your information to another service</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated Privacy Policy on this page with a new effective date.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
          </p>
          <p className="mb-8">
            Email: privacy@furrchum.com<br />
            Address: 1234 Pet Avenue, San Francisco, CA 94107
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
