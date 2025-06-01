import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, ChevronDown, ChevronRight, Search } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const FAQPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [openFaqItems, setOpenFaqItems] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaqItem = (index: number) => {
    const newOpenItems = new Set(openFaqItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenFaqItems(newOpenItems);
  };

  const faqItems = [
    {
      question: "How to book a vet online with Furrchum?",
      answer: "Booking a vet on Furrchum is super simple. Just open our website or app, search for vets by location, and filter by type (video or in-clinic). Pick a time slot that works for you, fill your pet's details, and confirm your appointment. You'll receive a confirmation by email and SMS.",
      category: "Booking"
    },
    {
      question: "How to find the most affordable vet services near me?",
      answer: "Furrchum allows you to sort and filter vets by consultation fee. View basic to premium options based on services, experience, and pet type. Fees are clearly listed, and you can choose video or in-clinic consultations.",
      category: "Pricing"
    },
    {
      question: "How to find the best vets near me?",
      answer: "Furrchum shows top-rated vets based on real reviews. Filter by specialization, experience, availability, and languages. Whether you're in a metro or Tier-2 town, we'll connect you to the right vet.",
      category: "Finding Vets"
    },
    {
      question: "Where can I find ongoing offers or discounts?",
      answer: "Watch for banners or badges that say 'Special Offer' or 'INR Off'. Follow us on Instagram @furrchum to see the latest pet care deals, video consult discounts, and seasonal offers.",
      category: "Offers"
    },
    {
      question: "Can I consult a vet online through Furrchum?",
      answer: "Yes! Choose 'Video Consultation' while booking. You'll receive a secure video call link. It's convenient for basic checkups, follow-ups, and minor issues.",
      category: "Video Consultation"
    },
    {
      question: "What kind of pets does Furrchum support?",
      answer: "Furrchum currently supports dogs and cats. We are expanding into more pet types soon, including birds and exotic pets based on vet availability.",
      category: "Pet Types"
    },
    {
      question: "Is Furrchum available in my city?",
      answer: "We're live in major cities like Delhi, Mumbai, Bangalore, Pune, Noida, and many Tier-2 cities. Enter your location to see available vets near you.",
      category: "Availability"
    },
    {
      question: "Is my pet's data secure with Furrchum?",
      answer: "Absolutely. All data is encrypted and stored securely. Medical records are only shared with the vet you book. We're committed to pet parent privacy.",
      category: "Security"
    },
    {
      question: "How do I cancel or reschedule an appointment?",
      answer: "You can cancel or reschedule appointments through your dashboard up to 2 hours before the scheduled time. Go to 'My Appointments', find your booking, and click 'Reschedule' or 'Cancel'.",
      category: "Booking"
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets. All payments are processed securely through our encrypted payment gateway.",
      category: "Payment"
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer: "Yes, we offer refunds based on our refund policy. If you're not satisfied with the consultation, please contact our support team within 24 hours of the appointment.",
      category: "Refunds"
    },
    {
      question: "How do I add multiple pets to my account?",
      answer: "Go to 'My Pets' in your dashboard and click 'Add New Pet'. You can add unlimited pets to your account and manage their individual health records and appointments.",
      category: "Account"
    }
  ];

  const filteredFaqItems = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PetOwnerSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-xl sm:text-2xl font-bold">Furrchum FAQ</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
              <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-primary mr-3" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      Pet Parent Support
                    </h2>
                  </div>
                  <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                    Find answers to frequently asked questions about Furrchum's services, 
                    booking process, and pet care support.
                  </p>
                </div>

                {/* Search Section */}
                <Card className="mb-8">
                  <CardContent className="p-4 sm:p-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search FAQ questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ Items */}
                <div className="space-y-4">
                  {filteredFaqItems.length > 0 ? (
                    filteredFaqItems.map((item, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <Collapsible open={openFaqItems.has(index)} onOpenChange={() => toggleFaqItem(index)}>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors p-4 sm:p-6">
                              <div className="flex items-center justify-between w-full">
                                <div className="text-left flex-1 mr-4">
                                  <div className="flex items-start gap-3">
                                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full mt-1 flex-shrink-0">
                                      {item.category}
                                    </span>
                                    <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                                      {item.question}
                                    </CardTitle>
                                  </div>
                                </div>
                                {openFaqItems.has(index) ? (
                                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                )}
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                              <div className="ml-0 sm:ml-16">
                                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                  {item.answer}
                                </p>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                        <p className="text-gray-600">
                          Try searching with different keywords or browse all questions above.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Contact Support Section */}
                <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Still have questions?
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Can't find what you're looking for? Our support team is here to help!
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                      onClick={() => navigate('/contact')}
                    >
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default FAQPage; 