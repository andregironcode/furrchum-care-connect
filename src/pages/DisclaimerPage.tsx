import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DisclaimerPage = () => {
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

        <h1 className="text-3xl font-bold mb-6">Disclaimer</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Last Updated: May 27, 2025</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Nature of Services</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Furrchum provides a digital platform for pet parents to discover, compare, and book licensed veterinary professionals.</li>
            <li>We act solely as an intermediary and do not own, manage, employ, or control any veterinarian listed on the platform.</li>
            <li>We do not offer medical advice, treatment, or prescriptions.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. No Medical Guarantee</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Furrchum does not guarantee the quality, effectiveness, or success of any consultation or treatment provided by veterinarians.</li>
            <li>All health decisions should be made between the vet and the pet parent.</li>
            <li>Furrchum shall not be held responsible for injury, misdiagnosis, or complications arising from services provided by listed professionals.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. Third-Party Vet Verification</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>All vets are listed based on KYC checks, licenses, or self-declared profiles.</li>
            <li>Furrchum is not liable for false, outdated, or inaccurate information uploaded by vets.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Content Disclaimer</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Any blogs, health tips, or articles on the site are for informational purposes only and should not be treated as medical guidance.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Liability Waiver</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Furrchum, its founders, employees, and affiliates shall not be liable for indirect, incidental, or consequential damages arising from the use of the platform.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. User Conduct Policy</h2>
          <h3 className="text-lg font-medium mt-6 mb-3">6.1 Acceptable Use</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Users must provide accurate information during registration and while booking appointments.</li>
            <li>Any use of misleading, false, or fraudulent information is strictly prohibited.</li>
            <li>Users must interact respectfully with veterinarians and Furrchum support staff.</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-6 mb-3">6.2 Prohibited Conduct</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>No impersonation of other users, vets, or team members.</li>
            <li>No offensive language, harassment, spam, or threats.</li>
            <li>No posting of irrelevant, promotional, or misleading reviews.</li>
            <li>Any misuse of appointment slots or referral systems will result in immediate action.</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-6 mb-3">6.3 Enforcement</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Users found violating conduct policies may face temporary suspension, permanent ban, or legal action, depending on the severity.</li>
            <li>Furrchum reserves the right to monitor and remove content that violates these rules.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. Children & Minor Use Policy</h2>
          <h3 className="text-lg font-medium mt-6 mb-3">7.1 Age Restriction</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Users must be 18 years or older to create an account and book appointments on Furrchum.</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-6 mb-3">7.2 Parental Supervision</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Bookings made on behalf of a minor or by a minor (under 18) must be done under supervision of a parent or legal guardian.</li>
            <li>The supervising adult assumes full responsibility for the appointment and any resulting treatment decisions.</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-6 mb-3">7.3 Compliance</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>If we become aware that a user is under 18 and using the platform independently, we may suspend or delete the account until verification is provided.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Legal Jurisdiction</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>All legal matters are subject to the jurisdiction of New Delhi.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">9. Changes to This Disclaimer</h2>
          <p>
            We may update this Disclaimer from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated Disclaimer on this page with a new effective date.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">10. Contact Us</h2>
          <p>
            If you have any questions about this Disclaimer, please contact us at:
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

export default DisclaimerPage;
