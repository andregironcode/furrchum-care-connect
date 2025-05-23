
import Navbar from '@/components/Navbar';
import BookingSection from '@/components/BookingSection';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, PhoneCall, Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      <BookingSection />
      
      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-cream-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-600 mb-4">How Furrchum Works</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
            <p className="text-accent-600/80 max-w-2xl mx-auto text-lg">
              Getting quality vet care for your pet has never been easier. Follow these simple steps:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
              <Card key={index} className="bg-white border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-[100px]"></div>
                <CardHeader>
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <CardTitle className="text-xl">
                    <span className="text-primary font-bold">Step {item.step}:</span> {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-accent-600/80">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Why Choose Furrchum */}
      <section className="py-20 bg-gradient-to-b from-white to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-600 mb-4">Why Pet Owners Choose Furrchum</h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-6 rounded-full"></div>
            <p className="text-accent-600/80 max-w-2xl mx-auto text-lg">
              Join thousands of satisfied pet parents who trust us with their furry family members
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
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
                <div key={index} className="flex items-start space-x-6 group">
                  <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-accent-600 text-xl mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-accent-600/80">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-3xl p-10 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/10 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <span className="text-4xl">🐕</span>
                  </div>
                  <h3 className="text-3xl font-bold text-accent-600 mb-6 text-center">Ready to Get Started?</h3>
                  <p className="text-accent-600/80 mb-8 text-center text-lg">
                    Give your pet the care they deserve with professional veterinary consultations
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-accent hover:bg-accent/90 text-white font-semibold text-lg h-14 group"
                  >
                    Find a Vet Now
                    <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-600 mb-4">What Pet Parents Say</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
            <p className="text-accent-600/80 max-w-2xl mx-auto text-lg">
              Real stories from real pet owners who've experienced the Furrchum difference
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "My cat needed urgent care on a Sunday night. Within 15 minutes, I was speaking with a vet who helped me through the situation.",
                name: "Melissa T.",
                pet: "Cat Owner",
                image: "😺"
              },
              {
                quote: "The follow-up care and detailed health records have made managing my dog's chronic condition so much easier.",
                name: "James R.",
                pet: "Dog Owner",
                image: "🐕"
              },
              {
                quote: "As a first-time pet parent, having access to professional advice at any time gives me such peace of mind.",
                name: "Sarah L.",
                pet: "Rabbit Owner",
                image: "🐇"
              }
            ].map((item, index) => (
              <Card key={index} className="bg-white border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-accent/5 pointer-events-none"></div>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">{item.image}</span>
                  </div>
                  <p className="text-accent-600/80 italic mb-6">"{item.quote}"</p>
                  <p className="font-semibold text-accent-600">{item.name}</p>
                  <p className="text-primary text-sm">{item.pet}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-b from-cream-50 to-cream-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-accent-600 mb-6">Ready to Experience Better Pet Healthcare?</h2>
          <p className="text-accent-600/80 mb-8 text-lg">
            Join thousands of pet parents who've discovered the convenience of veterinary telemedicine
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-lg h-auto"
            >
              Create Free Account
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-accent text-accent hover:bg-accent hover:text-white px-8 py-6 text-lg h-auto"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
