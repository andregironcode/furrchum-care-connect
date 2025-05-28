
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Clock, Users, Award, CheckCircle, Eye, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "Pets are family. We build with heart, for every heartbeat."
    },
    {
      icon: Shield,
      title: "Trust",
      description: "Only certified, vetted professionals. Zero compromise."
    },
    {
      icon: Clock,
      title: "Convenience",
      description: "From bookings to health records, everything in one intuitive flow."
    },
    {
      icon: Eye,
      title: "Innovation",
      description: "Technology that solves real-world problems, not just adds features."
    },
    {
      icon: Users,
      title: "Community",
      description: "A growing network of pet lovers, professionals, and changemakers."
    },
    {
      icon: CheckCircle,
      title: "Ownership",
      description: "Every pet. Every consult. Every life touched — we take it personally."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-accent-600 mb-6">
              Furrchum – Built for Pets. Engineered for Impact.
            </h1>
            <p className="text-xl text-accent-600/80 max-w-3xl mx-auto leading-relaxed mb-8">
              Your pet's digital best friend. And your family's new peace of mind.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3 text-lg">
              Join the movement
            </Button>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-accent-600 mb-6">🐾 Our Story</h2>
              <p className="text-lg text-accent-600/80 mb-6 leading-relaxed">
                One evening, we saw a grandmother struggle to find a vet for her dog. Her family was at work, clinics were closed, and she had no way to get help.
              </p>
              <p className="text-lg text-accent-600/80 mb-6 leading-relaxed">
                That moment sparked a mission.
              </p>
              <p className="text-lg text-accent-600/80 mb-6 leading-relaxed">
                Furrchum was born to bridge the gap between pet parents and professional care — instantly, intelligently, and with love.
              </p>
              <p className="text-lg text-accent-600/80 mb-6 leading-relaxed">
                In today's fast-paced world, appointments get delayed, clinics stay out of reach, and the people who spend the most time with pets — parents, homemakers, caregivers — often feel powerless in emergencies.
              </p>
              <p className="text-lg text-accent-600/80 mb-6 leading-relaxed">
                We're fixing that.
              </p>
              <p className="text-lg text-accent-600/80 leading-relaxed">
                Furrchum puts licensed, nearby vets in your pocket — through seamless video consultations, smart scheduling, and digital records — so care never has to wait.
              </p>
            </div>
            <div className="relative">
              <img 
                src="/lovable-uploads/42e2d7bd-3440-457d-8a1e-fcd08a2d4014.png" 
                alt="Veterinarian examining a husky with pet owner" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-cream-50 to-tan-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-600 mb-6 text-center">🎯 Our Mission</h2>
            <p className="text-xl text-accent-600/80 max-w-3xl mx-auto mb-6">
              To make veterinary care accessible, intuitive, and real-time for every pet and every family — across every corner of India.
            </p>
            <p className="text-xl text-accent-600/80 max-w-3xl mx-auto mb-6">
              Our platform empowers:
            </p>
            <ul className="text-xl text-accent-600/80 max-w-3xl mx-auto mb-6 list-disc pl-8">
              <li>Pet parents to get trusted advice anytime, from anywhere</li>
              <li>Vets to grow their reach and revenue with digital-first tools</li>
              <li>Clinics and partners to offer modern, data-driven pet care experiences</li>
            </ul>
            <p className="text-xl text-accent-600/80 max-w-3xl mx-auto">
              We're not just digitizing bookings — we're reshaping how pet care is delivered in India and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-600 mb-6">Our Values</h2>
            <p className="text-xl text-accent-600/80 max-w-3xl mx-auto">
              💛 The principles that guide everything we do:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* Vision Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <img 
                src="/lovable-uploads/d90a72b9-e0fd-4086-9692-b3c0a15463a7.png" 
                alt="Professional veterinary team members" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-accent-600 mb-6">🚀 Our Vision</h2>
              <p className="text-lg text-accent-600/80 mb-6 leading-relaxed">
                To build India's most trusted digital pet-care ecosystem — from cities to small towns, from first-time pet parents to multi-clinic vets.
              </p>
              <p className="text-lg text-accent-600/80 mb-6 leading-relaxed">
                We envision a future where:
              </p>
              <ul className="text-lg text-accent-600/80 mb-6 leading-relaxed space-y-2">
                <li>• No pet suffers because help was too far or too late</li>
                <li>• A family in Lucknow can consult a vet in Delhi with a tap</li>
                <li>• A vet in a Tier 2 town earns 10x visibility and income through us</li>
                <li>• Every pet lives a longer, healthier, happier life — no matter where they live</li>
              </ul>
              <p className="text-lg text-accent-600/80 mb-6 leading-relaxed">
                Furrchum is not just a platform. It's a shift.
              </p>
              <blockquote className="text-lg text-accent-600/80 italic border-l-4 border-primary pl-4 mb-6">
                "We are transforming a fragmented, outdated vet care system into a single, accessible, intelligent network — where every paw, every meow, and every wag matters."
              </blockquote>
              <h3 className="text-2xl font-semibold text-accent-600 mb-4">🧠 Built for Scale</h3>
              <ul className="text-lg text-accent-600/80 mb-6 leading-relaxed space-y-2">
                <li>• 1,000+ vets in the pipeline</li>
                <li>• 1M+ pet parents to onboard</li>
                <li>• Expansion into training, boarding, and wellness</li>
                <li>• One app. One mission. One pet revolution.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
