import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PhoneCall, Calendar, Shield } from 'lucide-react';
const HeroSection = () => {
  return <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-400 py-24 sm:py-32">
      <div className="absolute inset-0 bg-pattern opacity-10"></div>
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent"></div>
      
      <div className="absolute -right-20 top-40 w-80 h-80 bg-primary-400/40 rounded-full blur-3xl"></div>
      <div className="absolute -left-20 bottom-20 w-80 h-80 bg-accent/30 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-accent-600 mb-6">
            Quality Vet Care for Your
            <span className="text-white block sm:inline"> Furry Friends</span>
          </h1>
          
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Connect with certified veterinarians instantly. Get professional care for your pets from the comfort of your home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-6 text-lg h-auto">
              <PhoneCall className="w-5 h-5 mr-2" /> Book Vet Consultation
            </Button>
            
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:border-white px-8 py-6 text-lg h-auto font-semibold bg-white/[0.28]">
              <Shield className="w-5 h-5 mr-2" /> Emergency Care
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in group overflow-hidden">
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-400/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-accent-600 mb-3">Instant Access</h3>
                  <p className="text-accent-600/80">Connect with available vets in under 5 minutes, 24/7</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in group overflow-hidden" style={{
            animationDelay: '0.1s'
          }}>
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-accent-600 mb-3">Certified Vets</h3>
                  <p className="text-accent-600/80">Licensed professionals with years of experience</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in group overflow-hidden" style={{
            animationDelay: '0.2s'
          }}>
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold text-accent-600 mb-3">Affordable Care</h3>
                  <p className="text-accent-600/80">Quality veterinary care at transparent, fair prices</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default HeroSection;