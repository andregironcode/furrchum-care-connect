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
            <p className="font-medium text-lg">Last Updated: May 28, 2025</p>
            
            <section className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">5. User Conduct Policy</h2>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">5.1 Acceptable Use</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Users must provide accurate information during registration and while booking appointments.</li>
                <li>Any use of misleading, false, or fraudulent information is strictly prohibited.</li>
                <li>Users must interact respectfully with veterinarians and Furrchum support staff.</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">5.2 Prohibited Conduct</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>No impersonation of other users, vets, or team members.</li>
                <li>No offensive language, harassment, spam, or threats.</li>
                <li>No posting of irrelevant, promotional, or misleading reviews.</li>
                <li>Any misuse of appointment slots or referral systems will result in immediate action.</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">5.3 Enforcement</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Users found violating conduct policies may face temporary suspension, permanent ban, or legal action, depending on the severity.</li>
                <li>Furrchum reserves the right to monitor and remove content that violates these rules.</li>
              </ul>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">6. Children & Minor Use Policy</h2>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">6.1 Age Restriction</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Users must be 18 years or older to create an account and book appointments on Furrchum.</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">6.2 Parental Supervision</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Bookings made on behalf of a minor or by a minor (under 18) must be done under supervision of a parent or legal guardian.</li>
                <li>The supervising adult assumes full responsibility for the appointment and any resulting treatment decisions.</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">6.3 Compliance</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>If we become aware that a user is under 18 and using the platform independently, we may suspend or delete the account until verification is provided.</li>
              </ul>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">7. Platform Downtime & Service Modification Policy</h2>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">7.1 Scheduled Maintenance</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Furrchum may conduct scheduled maintenance, during which parts of the platform may be temporarily unavailable.</li>
                <li>Such updates will be communicated in advance wherever possible.</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">7.2 Emergency Downtime</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>The platform may experience emergency or unscheduled downtime due to technical issues.</li>
                <li>In such cases, Furrchum is not liable for missed appointments or delays caused by internet outages, server failure, or force majeure.</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">7.3 Service Changes</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>We reserve the right to modify features, interface, or tools to improve performance or user experience.</li>
              </ul>
            </section>

            <section className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">8. Anti-Fraud & Security Disclosure Policy</h2>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">8.1 Reporting Fraud</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Users and vets are encouraged to report suspicious activity to info@furrchum.com with relevant details.</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">8.2 Zero Tolerance</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Referral abuse, fake bookings, or fee manipulation will result in instant suspension of the user or vet account.</li>
                <li>Furrchum reserves the right to investigate and withhold payouts during fraud review.</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">8.3 Investigation & Resolution</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Fraud reports are acknowledged within 24 hours and investigated within 5–7 business days.</li>
                <li>Final resolution may involve refund, delisting, or permanent account removal.</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-800">8.4 Security Commitments</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>We follow secure encryption, token-based authentication, and data minimization to prevent data breaches.</li>
                <li>All sensitive activity is monitored to detect threats in real-time.</li>
              </ul>
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
