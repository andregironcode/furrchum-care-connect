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

        <h1 className="text-3xl font-bold mb-6">Privacy Policy (India Compliant)</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Effective Date: 29/05/2025</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Introduction</h2>
          <p>
            Furrchum ("we", "our", "us") is committed to protecting the privacy of our users — both pet parents and veterinarians — who use our platform to book and manage veterinary services. This Privacy Policy outlines how we collect, use, share, and protect your personal information in compliance with the IT Act, 2000 and relevant data protection rules.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">1.1 Information We Collect</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Personal data: Full name, email ID, mobile number, location</li>
            <li>Pet details: Name, species, breed, age, sex, medical history</li>
            <li>Account data: Username, encrypted password, profile photo</li>
            <li>Booking & payment details: Appointment history, consultation fees, transaction ID, UPI or card info (via third-party gateway)</li>
            <li>Technical data: IP address, device type, browser type, access time, cookies</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">1.2 Purpose of Data Usage</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>To register and manage your user or vet profile</li>
            <li>To facilitate appointment scheduling and confirmations</li>
            <li>To send notifications, reminders, and important updates</li>
            <li>To process payments and generate invoices</li>
            <li>To personalize platform experience based on usage</li>
            <li>For legal compliance, audit, fraud detection, and dispute resolution</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">1.3 Data Sharing and Disclosure</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Shared with veterinarians only when booking is made</li>
            <li>Shared with payment providers (Razorpay, PayU, etc.) for processing</li>
            <li>Never sold or rented to third parties for marketing</li>
            <li>Shared with government authorities only upon legal request</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">1.4 User Rights and Control</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Right to access or update your data via your profile</li>
            <li>Right to delete your data by emailing: info@furrchum.com</li>
            <li>Right to withdraw consent anytime (may impact platform usage)</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">1.5 Data Protection Measures</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>SSL encryption on all personal and transaction data</li>
            <li>Access control with role-based permissions</li>
            <li>Secure cloud storage with daily backup and firewalls</li>
            <li>Internal audits and data handling protocols followed by the team</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">1.6 Cookies and Tracking</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>We use cookies for website functionality, analytics, and personalization</li>
            <li>You can disable or delete cookies from browser settings</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">1.7 Grievance Redressal</h2>
          <p>
            If you believe your data has been misused or you have concerns, email us at info@furrchum.com. Our grievance officer will respond within 7 working days.
          </p>
          
          <p className="mb-8 mt-8">
            Email: info@furrchum.com<br />
            Address: New Delhi, India
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
