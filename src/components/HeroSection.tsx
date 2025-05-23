import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
const HeroSection = () => {
  return <div className="relative overflow-hidden bg-[#f39bae] py-16 sm:py-24">
      <div className="absolute inset-0 opacity-40" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F39BAE' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#4e2a14] mb-6">
            Quality Vet Care for Your
            <span className="text-white"> Furry Friends</span>
          </h1>
          
          <p className="text-xl text-[#4e2a14] mb-8 max-w-3xl mx-auto">
            Connect with certified veterinarians instantly. Get professional care for your pets from the comfort of your home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-[#4b90a6] hover:bg-[#4b90a6]/90 text-white font-semibold px-8 py-4 text-lg">
              🩺 Book Vet Consultation
            </Button>
            
            <Button size="lg" variant="outline" className="border-2 border-[#4e2a14] text-[#4e2a14] hover:bg-[#4e2a14] hover:text-white px-8 py-4 text-lg font-semibold">🚨Contact Us</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-white/80 backdrop-blur-sm border-[#4e2a14] hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#4b90a6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-[#4e2a14] mb-2">Instant Access</h3>
                <p className="text-[#4e2a14]">Connect with available vets in under 5 minutes, 24/7</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-[#4e2a14] hover:shadow-lg transition-all duration-300 animate-fade-in" style={{
            animationDelay: '0.1s'
          }}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#f39bae] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <h3 className="text-lg font-semibold text-[#4e2a14] mb-2">Certified Vets</h3>
                <p className="text-[#4e2a14]">Licensed professionals with years of experience</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-[#4e2a14] hover:shadow-lg transition-all duration-300 animate-fade-in" style={{
            animationDelay: '0.2s'
          }}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#f5c75f] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg font-semibold text-[#4e2a14] mb-2">Affordable Care</h3>
                <p className="text-[#4e2a14]">Quality veterinary care at transparent, fair prices</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default HeroSection;