import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AdditionalPoliciesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6 text-slate-900">Additional Policies</h1>
          
          <div className="prose max-w-none text-slate-700">
            <p className="font-medium text-lg">Last Updated: May 26, 2025</p>
            
            <section className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Cookie Policy</h2>
              <p>
                FurrChum Care Connect uses cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. By using our website, you consent to our use of cookies in accordance with this policy.
              </p>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">What Are Cookies</h3>
              <p>
                Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">How We Use Cookies</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly and cannot be switched off in our systems.
                </li>
                <li>
                  <strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.
                </li>
                <li>
                  <strong>Functional Cookies:</strong> These cookies enable enhanced functionality and personalization, such as remembering your preferences.
                </li>
                <li>
                  <strong>Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners to build a profile of your interests.
                </li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">Managing Cookies</h3>
              <p>
                Most web browsers allow you to control cookies through their settings. You can typically find these settings in the "Options" or "Preferences" menu of your browser. To understand these settings, the following links may be helpful:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Cookie settings in Chrome</li>
                <li>Cookie settings in Firefox</li>
                <li>Cookie settings in Safari</li>
                <li>Cookie settings in Edge</li>
              </ul>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Appointment Scheduling Policy</h2>
              <p>
                FurrChum Care Connect aims to facilitate convenient and efficient appointments between pet owners and veterinarians. Our appointment scheduling policy is designed to ensure a smooth experience for all parties.
              </p>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">Scheduling Appointments</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Appointments can be scheduled up to 30 days in advance.</li>
                <li>Pet owners should provide accurate information about their pet's condition to help veterinarians prepare for the consultation.</li>
                <li>Emergency consultations are subject to veterinarian availability and may incur additional fees.</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">Rescheduling</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Appointments can be rescheduled up to 4 hours before the scheduled time without penalty.</li>
                <li>Rescheduling is subject to veterinarian availability.</li>
              </ul>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Veterinarian Verification Policy</h2>
              <p>
                To ensure the quality and safety of services provided through our platform, all veterinarians on FurrChum Care Connect undergo a thorough verification process.
              </p>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">Verification Requirements</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Valid veterinary license issued by the appropriate regulatory body</li>
                <li>Proof of professional liability insurance</li>
                <li>Verification of professional credentials and education</li>
                <li>Background check</li>
                <li>Professional references</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">Ongoing Verification</h3>
              <p>
                Veterinarians on our platform must maintain their credentials and provide updated information as required. We conduct periodic reviews to ensure compliance with our standards.
              </p>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Pet Owner Conduct Policy</h2>
              <p>
                To maintain a respectful and productive environment, we expect pet owners using our platform to adhere to certain standards of conduct.
              </p>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">Expected Conduct</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Provide accurate and complete information about your pet's health condition.</li>
                <li>Treat veterinarians and staff with respect and courtesy.</li>
                <li>Attend scheduled appointments on time or provide timely notice of cancellation.</li>
                <li>Follow payment policies and fulfill financial obligations promptly.</li>
                <li>Adhere to the platform's terms of service and other policies.</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">Prohibited Conduct</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Harassment, abuse, or disrespectful treatment of veterinarians or staff.</li>
                <li>Provision of false or misleading information.</li>
                <li>Attempt to use the platform for purposes other than pet healthcare.</li>
                <li>Sharing of account credentials or allowing unauthorized access to your account.</li>
              </ul>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Data Retention Policy</h2>
              <p>
                FurrChum Care Connect retains pet health records and consultation data to provide ongoing care and maintain regulatory compliance.
              </p>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">Retention Periods</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Pet Health Records:</strong> Retained for 7 years from the last consultation.</li>
                <li><strong>Account Information:</strong> Retained as long as the account is active and for a period of 2 years after account closure.</li>
                <li><strong>Payment Information:</strong> Retained for 7 years to comply with financial regulations.</li>
                <li><strong>Communication Records:</strong> Retained for 3 years from the date of communication.</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">Data Access and Deletion</h3>
              <p>
                Pet owners can request access to their data or deletion of their account by contacting our support team. Please note that certain data may be retained as required by law even after account deletion.
              </p>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Modifications to These Policies</h2>
              <p>
                FurrChum Care Connect reserves the right to modify these Additional Policies at any time. Changes will be effective immediately upon posting to our website. It is your responsibility to review these policies periodically for changes.
              </p>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Contact Us</h2>
              <p>
                If you have questions about any of these Additional Policies, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Phone:</strong> +91 8700 608 887<br />
                <strong>Email:</strong> support@furrchum.com
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdditionalPoliciesPage;
