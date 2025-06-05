import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  
  // Determine user type (if authenticated)
  const userType = user?.user_metadata?.user_type;
  
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Column 1: Logo and About */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/e8e11fbb-c7e5-4aac-9d0d-e6da3e74dd59.png" 
                alt="FurrChum Logo" 
                className="h-16 w-auto mr-3" 
              />
              <span className="font-semibold text-gray-800 text-lg">FurrChum</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Quality pet healthcare accessible to everyone, anytime and anywhere.
            </p>
            
            {/* Startup India Logo and Recognition */}
            <div className="mt-6">
              <img 
                src="/Startup-India_L.png" 
                alt="Startup India Logo" 
                className="h-12 w-auto mb-2" 
              />
              <p className="text-xs text-gray-600 leading-relaxed">
                Recognized by Department for Promotion of Industry and Internal Trade
              </p>
            </div>
          </div>
          
          {/* Column 2: Main Pages */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Main Pages</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/vets" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Find Vets
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  About Us
                </Link>
              </li>
              {!user && (
                <li>
                  <Link to="/auth" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Sign In / Register
                  </Link>
                </li>
              )}
              <li>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: User Pages - Dynamic based on user type */}
          <div className="col-span-1">
            {!user && (
              <>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/auth" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/auth?tab=register" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Register
                    </Link>
                  </li>
                </ul>
              </>
            )}
            
            {user && userType === 'pet_owner' && (
              <>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Pet Owner Area</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-pets" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      My Pets
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-vets" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      My Vets
                    </Link>
                  </li>
                  <li>
                    <Link to="/appointments" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Appointments
                    </Link>
                  </li>
                  <li>
                    <Link to="/prescriptions" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Prescriptions
                    </Link>
                  </li>
                  <li>
                    <Link to="/payments" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Payments
                    </Link>
                  </li>
                </ul>
              </>
            )}
            
            {user && userType === 'vet' && (
              <>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Vet Area</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/vet-dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/vet-profile" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/vet-appointments" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Appointments
                    </Link>
                  </li>
                  <li>
                    <Link to="/vet-patients" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Patients
                    </Link>
                  </li>
                  <li>
                    <Link to="/vet-prescriptions" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Prescriptions
                    </Link>
                  </li>
                </ul>
              </>
            )}
            
            {user && userType === 'admin' && (
              <>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Admin Area</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/users" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Manage Users
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/vets" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Manage Vets
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/appointments" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Appointments
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/transactions" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Transactions
                    </Link>
                  </li>
                </ul>
              </>
            )}
          </div>
          
          {/* Column 4: Legal Pages */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms-conditions" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-delivery" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/additional-policies" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Additional Policies
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 5: Contact Details */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="block font-medium">Address:</span>
                  <span className="block">DCG04/ 2114-17,</span>
                  <span className="block">DLF Corporate Greens,</span>
                  <span className="block">Sector 74A,</span>
                  <span className="block">Gurgaon - 122004,</span>
                  <span className="block">Haryana, INDIA</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="block font-medium">Phone:</span>
                  <a href="tel:+918700608887" className="text-gray-600 hover:text-gray-900 transition-colors">+91 8700608887</a>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="block font-medium">Email:</span>
                  <a href="mailto:info@furrchum.com" className="text-gray-600 hover:text-gray-900 transition-colors">info@furrchum.com</a>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="block font-medium">For investors:</span>
                  <a href="mailto:investorcare@furrchum.com" className="text-gray-600 hover:text-gray-900 transition-colors">investorcare@furrchum.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright and Social */}
        <div className="border-t border-gray-200 pt-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-4 md:mb-0">
            <p>© 2025, Furrchum Technologies Pvt. Ltd. All Rights Reserved.</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="https://www.instagram.com/furrchum?igsh=eDI1MWtlbHBlN3Iw&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://x.com/furrchum?ref_src=twsrc%5Etfw" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
              <span className="sr-only">X (Twitter)</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
