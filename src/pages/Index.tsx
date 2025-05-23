
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <HeroSection />
      
      {/* How It Works Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Furrchum Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting quality vet care for your pet has never been easier. Follow these simple steps:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Choose Your Vet",
                description: "Browse our directory of certified veterinarians or get auto-matched",
                icon: "🔍"
              },
              {
                step: "2",
                title: "Book Consultation",
                description: "Schedule an appointment or start an emergency consultation instantly",
                icon: "📅"
              },
              {
                step: "3",
                title: "Connect & Consult",
                description: "Join a secure video call with your chosen veterinarian",
                icon: "💻"
              },
              {
                step: "4",
                title: "Get Care Plan",
                description: "Receive diagnosis, prescription, and follow-up recommendations",
                icon: "📋"
              }
            ].map((item, index) => (
              <Card key={index} className="bg-white border-tan-200 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-bl-3xl"></div>
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <CardTitle className="text-lg">
                    <span className="text-primary font-bold">Step {item.step}:</span> {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Why Choose Furrchum */}
      <section className="py-16 bg-gradient-to-br from-tan-100 to-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Pet Owners Choose Furrchum</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied pet parents who trust us with their furry family members
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                {
                  title: "24/7 Emergency Support",
                  description: "Critical care when your pet needs it most, any time of day or night",
                  icon: "🚨"
                },
                {
                  title: "Comprehensive Health Records",
                  description: "All consultations, prescriptions, and health data in one secure place",
                  icon: "📊"
                },
                {
                  title: "Affordable Transparent Pricing",
                  description: "Know exactly what you'll pay upfront, with no hidden fees or surprises",
                  icon: "💰"
                },
                {
                  title: "Licensed Professionals Only",
                  description: "Every veterinarian is thoroughly vetted, certified, and experienced",
                  icon: "✅"
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-tan-200">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🐕</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                  <p className="text-gray-600 mb-6">
                    Give your pet the care they deserve with professional veterinary consultations
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold"
                  >
                    Find a Vet Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
