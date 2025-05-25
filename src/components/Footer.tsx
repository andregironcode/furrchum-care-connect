
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-primary-600 to-accent-600 text-cream-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/lovable-uploads/e8e11fbb-c7e5-4aac-9d0d-e6da3e74dd59.png" 
                alt="Furrchum Logo" 
                className="h-12 w-auto bg-white rounded-md p-1" 
              />
              <span className="font-bold text-white text-2xl">Furrchum</span>
            </div>
            <p className="text-cream-50/80 mb-8 max-w-md">
              Providing online veterinary care for your furry friends, anytime and anywhere. 
              Quality pet healthcare accessible to everyone.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-cream-50/80 hover:text-primary-300 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-cream-50/80 hover:text-primary-300 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-cream-50/80 hover:text-primary-300 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-cream-50/80 hover:text-primary-300 transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="/vets" className="text-cream-50/80 hover:text-primary-300 transition-colors">Find Vets</a></li>
              <li><a href="/about" className="text-cream-50/80 hover:text-primary-300 transition-colors">About Us</a></li>
              <li><a href="#" className="text-cream-50/80 hover:text-primary-300 transition-colors">Contact</a></li>
              <li><a href="#" className="text-cream-50/80 hover:text-primary-300 transition-colors">Careers</a></li>
              <li><a href="#" className="text-cream-50/80 hover:text-primary-300 transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Contact Us</h3>
            <address className="not-italic">
              <p className="text-cream-50/80 mb-3">1234 Pet Avenue</p>
              <p className="text-cream-50/80 mb-3">San Francisco, CA 94107</p>
              <p className="text-cream-50/80 mb-3">
                <a href="mailto:info@furrchum.com" className="hover:text-primary-300 transition-colors">
                  info@furrchum.com
                </a>
              </p>
              <p className="text-cream-50/80 mb-3">
                <a href="tel:+11234567890" className="hover:text-primary-300 transition-colors">
                  +1 (123) 456-7890
                </a>
              </p>
            </address>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-cream-50/20 text-center text-cream-50/60 text-sm">
          <p>© {new Date().getFullYear()} Furrchum. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-primary-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
