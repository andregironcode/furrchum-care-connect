import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Clock, Users, Award, CheckCircle, Eye, Target, ArrowRight, Star, Zap, Globe, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBeginJourney = () => {
    if (user) {
      // User is logged in, navigate to home page
      navigate('/');
    } else {
      // User is not logged in, navigate to authentication
      navigate('/auth');
    }
  };

  const handlePartnerWithUs = () => {
    navigate('/contact');
  };

  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "Pets are family. We build with heart, for every heartbeat.",
      color: "from-red-400 to-pink-500",
      bgColor: "bg-red-50"
    },
    {
      icon: Shield,
      title: "Trust",
      description: "Only certified, vetted professionals. Zero compromise.",
      color: "from-orange-400 to-red-500",
      bgColor: "bg-orange-50"
    },
    {
      icon: Clock,
      title: "Convenience",
      description: "From bookings to health records, everything in one intuitive flow.",
      color: "from-amber-400 to-orange-500",
      bgColor: "bg-amber-50"
    },
    {
      icon: Eye,
      title: "Innovation",
      description: "Technology that solves real-world problems, not just adds features.",
      color: "from-yellow-400 to-amber-500",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Users,
      title: "Community",
      description: "A growing network of pet lovers, professionals, and changemakers.",
      color: "from-orange-400 to-amber-500",
      bgColor: "bg-orange-50"
    },
    {
      icon: CheckCircle,
      title: "Ownership",
      description: "Every pet. Every consult. Every life touched — we take it personally.",
      color: "from-amber-400 to-yellow-500",
      bgColor: "bg-amber-50"
    }
  ];

  const stats = [
    { icon: Users, number: "10,000+", label: "Happy Pet Parents", color: "text-orange-600" },
    { icon: Shield, number: "500+", label: "Verified Vets", color: "text-amber-600" },
    { icon: Star, number: "4.9/5", label: "Average Rating", color: "text-yellow-600" },
    { icon: Globe, number: "50+", label: "Cities Covered", color: "text-red-600" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      {/* Enhanced Hero Section - Orange Theme */}
      <section 
        ref={heroRef}
        className="relative h-[80vh] flex items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-amber-900 overflow-hidden"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      >
        {/* Subtle Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-64 h-64 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse delay-2000"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationName: 'float',
                animationDuration: `${3 + Math.random() * 4}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div 
            className="transform transition-all duration-1000 ease-out"
            style={{
              transform: `translateY(${Math.max(0, scrollY * 0.2 - 50)}px)`,
              opacity: Math.max(0, 1 - scrollY * 0.002)
            }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                Furrchum
              </span>
              <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl mt-2 text-white/90">
                Where Love Meets Care
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed mb-10 font-light px-4">
              Revolutionizing pet healthcare with 
              <span className="text-orange-300 font-medium"> cutting-edge technology</span> and 
              <span className="text-amber-300 font-medium"> boundless compassion</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Button 
                onClick={handleBeginJourney}
                className="bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white font-bold px-6 sm:px-10 py-3 text-base sm:text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-xl w-full sm:w-auto"
              >
                Begin the Journey
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button className="bg-white/10 border border-white/30 text-white hover:bg-white/20 font-medium px-6 sm:px-8 py-3 text-base sm:text-lg rounded-full backdrop-blur-sm transition-all duration-300 w-full sm:w-auto">
                Watch Our Story
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center transform hover:scale-105 transition-all duration-300"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <stat.icon className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 ${stat.color}`} />
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-gray-600 font-medium text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section with Parallax - Orange Theme */}
      <section 
        ref={storyRef}
        className="py-16 sm:py-24 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-500/5 to-amber-500/5 transform rotate-12 scale-150"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div 
              className="transform transition-all duration-700"
              style={{
                transform: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `translateX(${Math.max(-50, scrollY * 0.05 - 100)}px)` : 'none',
                opacity: typeof window !== 'undefined' && window.innerWidth >= 1024 ? Math.max(0, Math.min(1, (scrollY - 300) / 300)) : 1
              }}
            >
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-full text-sm font-medium mb-6">
                🐾 Our Beginning
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Born from a&nbsp;
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">moment of need</span>
              </h2>
              <div className="space-y-4">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  One evening, we witnessed a grandmother's desperate search for veterinary help for her beloved companion. 
                  <span className="font-semibold text-orange-600"> That moment changed everything.</span>
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  We realized that in our digital age, pet healthcare remained frustratingly analog. 
                  <span className="font-semibold text-red-600">Distance, time, and accessibility</span> were barriers between love and care.
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Furrchum was born to eliminate these barriers forever — creating an ecosystem where 
                  <span className="font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">professional veterinary care is just a touch away.</span>
                </p>
              </div>
            </div>
            <div 
              className="relative transform transition-all duration-700 mt-8 lg:mt-0"
              style={{
                transform: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `translateX(${Math.min(50, -(scrollY * 0.05 - 100))}px)` : 'none',
                opacity: typeof window !== 'undefined' && window.innerWidth >= 1024 ? Math.max(0, Math.min(1, (scrollY - 300) / 300)) : 1
              }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-2xl blur-lg"></div>
                <img 
                  src="/lovable-uploads/20250512_2150_Virtual Vet Consultation_simple_compose_01jv2mnymhe24argzr54vv0ya0.png" 
                  alt="Virtual Vet Consultation" 
                  className="relative rounded-2xl shadow-xl w-full h-64 sm:h-72 object-contain transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section - Orange Theme */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-orange-900 via-red-900 to-amber-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-red-600/10 to-amber-600/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-full text-base sm:text-lg font-bold mb-6">
              🎯 Our Mission
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Transforming 
              <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent"> Pet Healthcare</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
              Making veterinary care accessible, intelligent, and instantaneous for every pet family across India and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: "Pet Parents",
                description: "Trusted advice anytime, anywhere",
                color: "from-red-500 to-pink-600"
              },
              {
                icon: TrendingUp,
                title: "Veterinarians",
                description: "Grow reach and revenue digitally",
                color: "from-orange-500 to-red-600"
              },
              {
                icon: Zap,
                title: "Healthcare",
                description: "Modern, data-driven experiences",
                color: "from-amber-500 to-orange-600"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="text-center p-4 sm:p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/70 text-sm sm:text-base">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Mission Visual */}
          <div className="mt-16 flex justify-center">
            <div className="relative max-w-2xl">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-2xl blur-lg"></div>
              <img 
                src="/lovable-uploads/20250529_2323_Tech-Savvy Pet Care_simple_compose_01jwejr4z1fahspey6bw5kctvm.png" 
                alt="Tech-Savvy Pet Care" 
                className="relative rounded-2xl shadow-xl w-full h-64 sm:h-72 object-contain transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section with Scroll Animations */}
      <section 
        ref={valuesRef}
        className="py-16 sm:py-24 bg-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-full text-base sm:text-lg font-bold mb-6">
              💛 Our Values
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              What Drives 
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> Everything We Do</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className={`group relative p-4 sm:p-6 rounded-2xl ${value.bgColor} hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1`}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="relative z-10">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 mb-4 rounded-xl bg-gradient-to-r ${value.color} flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300`}>
                    <value.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{value.description}</p>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-r ${value.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section - Orange Theme */}
      <section 
        ref={visionRef}
        className="py-16 sm:py-24 bg-gradient-to-br from-orange-900 via-red-900 to-amber-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-600/5 to-red-600/5 transform -rotate-12 scale-150"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-2xl blur-lg"></div>
                <img 
                  src="/lovable-uploads/20250522_1312_Sunny Balcony Hug_simple_compose_01jvvf2jcffmhsv7cy9j1pb64z.png" 
                  alt="Sunny Balcony Hug - Pet Care" 
                  className="relative rounded-2xl shadow-xl w-full h-64 sm:h-72 object-contain transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-full text-base sm:text-lg font-bold mb-6">
                🚀 Our Vision
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                Building India's 
                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Pet Care Revolution
                </span>
              </h2>
              
              <div className="space-y-4 mb-6">
                <p className="text-base sm:text-lg text-white/90 leading-relaxed">
                  Creating a future where geographical boundaries don't limit access to quality veterinary care.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "1,000+ Partner Vets",
                    "1M+ Pet Families",
                    "100% Digital Records",
                    "24/7 Care Access"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                      <span className="text-white/80 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <blockquote className="text-base sm:text-lg italic text-orange-200 border-l-4 border-orange-400 pl-4 mb-6">
                "Transforming a fragmented system into an intelligent, accessible network where every pet matters."
              </blockquote>

              <Button 
                onClick={handleBeginJourney}
                className="bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white font-bold px-6 py-3 rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg w-full sm:w-auto"
              >
                Join Our Mission
                <Star className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Orange Theme */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-orange-600 via-red-700 to-amber-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to Transform Pet Care?</h2>
          <p className="text-base sm:text-lg mb-6 opacity-90">Join thousands of pet families who trust Furrchum for their companions' health</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleBeginJourney}
              className="bg-white text-orange-700 hover:bg-gray-100 font-bold px-6 py-3 rounded-full transition-all duration-300 w-full sm:w-auto"
            >
              Start Your Journey
            </Button>
            <Button className="bg-orange-800/50 border border-white/30 text-white hover:bg-orange-800/70 font-medium px-6 py-3 rounded-full backdrop-blur-sm transition-all duration-300 w-full sm:w-auto" onClick={handlePartnerWithUs}>
              Partner With Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
