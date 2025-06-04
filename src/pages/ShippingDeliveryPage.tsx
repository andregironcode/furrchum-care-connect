import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ShippingDeliveryPage = () => {
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

        <h1 className="text-3xl font-bold mb-6">Shipping & Delivery Policy</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">Last Updated: 28th May 2025</p>
          
          <p className="mb-6">
            At Furrchum Technologies Pvt Ltd, we provide digital veterinary consulting services via online video consultations and in-person appointment bookings between pet parents and certified veterinarians. We do not sell, stock, or deliver any physical goods, including medicines, pet products, or equipment.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Delivery of Prescribed Medicines</h2>
          <p className="mb-4">
            In some cases, after a video consultation, a veterinarian may choose to deliver prescribed medicines directly to the pet parent using their own courier or local delivery methods.
          </p>
          
          <p className="mb-4 font-semibold">Please note:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Any such delivery is entirely managed by the consulting veterinarian or their clinic.</li>
            <li>Furrchum is not involved in the sale, packaging, shipping, or delivery of any medicines or physical products.</li>
            <li>Furrchum does not charge any shipping fees and does not receive any commission related to medicine delivery.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Disclaimer</h2>
          <p className="mb-4 font-semibold">Furrchum Technologies Pvt Ltd shall not be responsible for:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Delays, losses, or damages arising from third-party deliveries arranged by veterinarians</li>
            <li>The authenticity, effectiveness, or quality of medicines delivered</li>
            <li>Any payments, refunds, or disputes related to physical goods delivered by the vet or their representatives</li>
          </ul>

          <p className="mb-8 mt-8 font-medium">
            For queries related to medicine delivery, please contact your consulting veterinarian directly.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingDeliveryPage; 