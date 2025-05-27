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
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. General Information</h2>
          <p>
            The information provided on FurrChum Care Connect is for general informational and educational purposes only. It is not intended to be a substitute for professional veterinary advice, diagnosis, or treatment. Always seek the advice of a qualified veterinarian with any questions you may have regarding your pet's health condition.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Not Emergency Care</h2>
          <p>
            FurrChum Care Connect is not designed to address emergency or urgent veterinary care needs. If your pet is experiencing a medical emergency, please contact your local emergency veterinary clinic immediately or call your regular veterinarian. Signs of a potential emergency include but are not limited to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Difficulty breathing or choking</li>
            <li>Severe bleeding or trauma</li>
            <li>Inability to urinate or defecate</li>
            <li>Ingestion of toxic substances</li>
            <li>Seizures or collapse</li>
            <li>Severe pain or distress</li>
            <li>Persistent vomiting or diarrhea</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. Telehealth Limitations</h2>
          <p>
            Telehealth consultations have inherent limitations compared to in-person veterinary examinations. Our platform enables communication between pet owners and licensed veterinarians, but:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Veterinarians cannot perform physical examinations through telehealth</li>
            <li>Certain conditions cannot be diagnosed or treated without in-person testing</li>
            <li>The quality of the consultation may be affected by technical issues or the quality of information provided</li>
          </ul>
          <p>
            Our veterinarians will advise when an in-person visit is necessary for proper diagnosis and treatment.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. No Veterinarian-Client-Patient Relationship</h2>
          <p>
            In some jurisdictions, a valid Veterinarian-Client-Patient Relationship (VCPR) may be required for certain veterinary services, including prescribing medications. The establishment of a VCPR may require an in-person examination. FurrChum Care Connect does not guarantee that a VCPR will be established through our telehealth services, and this may limit the services that can be provided in your jurisdiction.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Accuracy of Information</h2>
          <p>
            While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on our platform for any purpose.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Third-Party Content</h2>
          <p>
            Our platform may contain links to third-party websites or content. These links are provided for your convenience only. We have no control over the content of those sites or resources and accept no responsibility for them or for any loss or damage that may arise from your use of them.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. Professional Judgment</h2>
          <p>
            The veterinarians providing services through FurrChum Care Connect exercise their own professional judgment when providing advice. The opinions expressed by our veterinarians do not represent the views of FurrChum Care Connect as an organization.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, FurrChum Care Connect and its affiliates, officers, employees, agents, partners, and licensors will not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the services.
          </p>

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
