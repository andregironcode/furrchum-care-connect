
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Clock, Users, Award, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "We believe every pet deserves loving, professional veterinary care that puts their wellbeing first."
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Your pet's safety is our priority. All our veterinarians are licensed professionals with verified credentials."
    },
    {
      icon: Clock,
      title: "Convenient Access",
      description: "Get quality veterinary care anytime, anywhere through our innovative telemedicine platform."
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "We're building a community where pet owners and veterinarians connect to ensure the best care for every furry friend."
    }
  ];

  const achievements = [
    "10,000+ Happy Pet Parents",
    "500+ Licensed Veterinarians",
    "24/7 Emergency Support",
    "99.9% Platform Uptime",
    "Average 5-minute Response Time",
    "Serving 50+ States"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-accent-600 mb-6">
              About Furrchum
            </h1>
            <p className="text-xl text-accent-600/80 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing veterinary care by making it more accessible, convenient, and affordable for pet owners everywhere. Our mission is to ensure every pet receives the quality care they deserve.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-accent-600 mb-6">Our Mission</h2>
              <p className="text-lg text-accent-600/80 mb-6 leading-relaxed">
                At Furrchum, we believe that distance shouldn't be a barrier to quality veterinary care. Our platform connects pet owners with licensed veterinarians through innovative telemedicine technology, making professional pet healthcare accessible 24/7.
              </p>
              <p className="text-lg text-accent-600/80 leading-relaxed">
                Whether it's a routine check-up, emergency consultation, or ongoing treatment management, we're here to support you and your furry family members every step of the way.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1582562124811-c09040d0a901?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Happy pet with owner" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-cream-50 to-tan-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-600 mb-6">Our Values</h2>
            <p className="text-xl text-accent-600/80 max-w-3xl mx-auto">
              Everything we do is guided by our core values that put pets and their families first.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <value.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-accent-600 mb-3">{value.title}</h3>
                  <p className="text-accent-600/70">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Veterinarian caring for pet" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-accent-600 mb-6">Our Story</h2>
              <p className="text-lg text-accent-600/80 mb-6 leading-relaxed">
                Founded by a team of veterinarians and tech innovators who experienced firsthand the challenges of accessing quality pet care, Furrchum was born from a simple idea: every pet deserves excellent healthcare, regardless of location or time constraints.
              </p>
              <p className="text-lg text-accent-600/80 mb-6 leading-relaxed">
                After witnessing too many pets suffer from delayed care due to geographical barriers or busy schedules, our founders combined their expertise in veterinary medicine and technology to create a platform that brings professional pet healthcare directly to your home.
              </p>
              <p className="text-lg text-accent-600/80 leading-relaxed">
                Today, we're proud to serve thousands of pet families across the country, providing peace of mind and exceptional care when it matters most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-600 mb-6">Our Impact</h2>
            <p className="text-xl text-accent-600/80 max-w-3xl mx-auto">
              We're proud of the difference we've made in the lives of pets and their families.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="text-accent-600 font-medium">{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-600 mb-6">Why Choose Furrchum?</h2>
            <p className="text-xl text-accent-600/80 max-w-3xl mx-auto">
              We're not just another telemedicine platform. We're pet lovers, just like you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <Award className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-accent-600 mb-4">Expert Veterinarians</h3>
                <p className="text-accent-600/70">
                  All our veterinarians are licensed, experienced professionals who are passionate about animal care and committed to providing the best treatment for your pets.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <Clock className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-accent-600 mb-4">24/7 Availability</h3>
                <p className="text-accent-600/70">
                  Pet emergencies don't wait for business hours. Our platform provides round-the-clock access to veterinary care when your furry friend needs it most.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <Heart className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-accent-600 mb-4">Personalized Care</h3>
                <p className="text-accent-600/70">
                  Every pet is unique, and so is our approach to their care. We provide personalized treatment plans tailored to your pet's specific needs and health history.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
