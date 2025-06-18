import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, MapPin, Phone, Mail, Star, Video, User, FileText, Download, Eye, ArrowLeft, CheckCircle, Loader2, Images } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import { downloadFile, openFile } from '@/utils/supabaseStorage';

interface VetProfile {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  about: string;
  consultation_fee: number;
  image_url: string;
  years_experience: number;
  languages: string[];
  rating: number;
  availability: string;
  zip_code: string;
  phone: string;
  gender: string;
  clinic_location: string;
  clinic_images: string[];
  license_url: string;
  license_document_url?: string;
  offers_video_calls: boolean;
  offers_in_person: boolean;
}

interface VetAvailability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatTime = (time: string) => {
  // Convert "HH:MM:SS" to "HH:MM AM/PM"
  if (!time) return "";
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

const VetDetailsPage = () => {
  const { vetId } = useParams<{ vetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vet, setVet] = useState<VetProfile | null>(null);
  const [availability, setAvailability] = useState<VetAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVetDetails = useCallback(async () => {
    try {
      setLoading(true);
      if (!vetId) return;
      
      const { data, error } = await supabase
        .from('vet_profiles')
        .select('*')
        .eq('id', vetId)
        .single();

      if (error) throw error;
      
      if (data) {
        const vetProfile: VetProfile = {
          id: data.id || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          specialization: data.specialization || '',
          about: data.about || '',
          consultation_fee: data.consultation_fee || 0,
          image_url: data.image_url || '',
          years_experience: data.years_experience || 0,
          phone: data.phone || '',
          gender: data.gender || '',
          languages: Array.isArray(data.languages) ? data.languages : [],
          zip_code: data.zip_code || '',
          clinic_location: data.clinic_location || '',
          clinic_images: Array.isArray(data.clinic_images) ? data.clinic_images : [],
          license_url: data.license_url || '',
          rating: typeof data.rating === 'number' ? data.rating : 5,
          availability: data.availability || 'Available',
          offers_video_calls: Boolean(data.offers_video_calls),
          offers_in_person: Boolean(data.offers_in_person)
        };
        setVet(vetProfile);
      }
    } catch (error) {
      console.error('Error fetching vet details:', error);
      setError('Failed to load veterinarian details');
    } finally {
      setLoading(false);
    }
  }, [vetId]);

  const fetchVetAvailability = useCallback(async () => {
    try {
      if (!vetId) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vet_availability')
        .select('*')
        .eq('vet_id', vetId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching vet availability:', error);
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, [vetId]);

  const handleBookNow = useCallback(async (id: string) => {
    if (!user) {
      toast.error("Please login to book a consultation", {
        action: {
          label: "Login",
          onClick: () => navigate("/auth")
        }
      });
      return;
    }

    try {
      // Check user type before allowing booking
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        toast.error("Failed to verify user access. Please try again.");
        return;
      }

      if (profile?.user_type === 'vet') {
        toast.error("Veterinarians cannot book appointments with other vets. Please contact them directly if needed.", {
          duration: 6000,
        });
        return;
      }

      // If user is a pet owner, proceed to booking
      navigate(`/booking/${id}`);
    } catch (error) {
      console.error('Error checking user access:', error);
      toast.error("Failed to verify user access. Please try again.");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (vetId) {
      fetchVetDetails();
      fetchVetAvailability();
    }
  }, [vetId, fetchVetDetails, fetchVetAvailability]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !vet) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertDescription>{error || "Veterinarian not found"}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => navigate('/vets')}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Veterinarians
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/vets')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Veterinarians
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Vet Info */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-primary/10">
                    {vet.image_url ? (
                      <img src={vet.image_url} alt={`${vet.first_name} ${vet.last_name}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {vet.first_name.charAt(0)}{vet.last_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Dr. {vet.first_name} {vet.last_name}</CardTitle>
                    <CardDescription className="text-lg">{vet.specialization || "Veterinarian"}</CardDescription>
                    
                    <div className="flex items-center mt-2">
                      <div className="flex items-center text-yellow-500 mr-4">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(vet.rating) ? "text-yellow-500" : "text-gray-300"}>
                            ★
                          </span>
                        ))}
                        <span className="ml-1 text-gray-700">{vet.rating}</span>
                      </div>
                      
                      <Badge variant={vet.availability === 'Available Now' ? 'secondary' : 
                              vet.availability === 'Available Soon' ? 'outline' : 'default'}>
                        {vet.availability || "Scheduled Only"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="py-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About</h3>
                    <p className="text-gray-700">
                      {vet.about || `Dr. ${vet.first_name} ${vet.last_name} is an experienced veterinarian with ${vet.years_experience || 'several'} years of experience in animal healthcare.`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>{vet.years_experience || 5} years experience</span>
                    </div>
                    
                    {/* Phone number removed for privacy */}
                    
                    {vet.zip_code && (
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-red-500 mr-2" />
                        <span>Zip Code: {vet.zip_code}</span>
                      </div>
                    )}


                    
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-purple-500 mr-2" />
                      <span>Contact through platform</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Services Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {vet.offers_video_calls && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Video Consultations
                        </Badge>
                      )}
                      {vet.offers_in_person && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          In-Person Visits
                        </Badge>
                      )}
                      {!vet.offers_video_calls && !vet.offers_in_person && (
                        <span className="text-gray-500">Contact for service details</span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {vet.clinic_location && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <MapPin className="h-5 w-5 mr-2" />
                          Clinic Location
                        </h3>
                        <p className="text-gray-700">{vet.clinic_location}</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {vet.languages && vet.languages.length > 0 ? (
                        vet.languages.map((lang, index) => (
                          <Badge key={index} variant="outline">{lang}</Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">English</span>
                      )}
                    </div>
                  </div>
                  



                  {vet.clinic_images && vet.clinic_images.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Images className="h-5 w-5 mr-2" />
                          Clinic Images
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {vet.clinic_images.map((imageUrl, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                              <img 
                                src={imageUrl} 
                                alt={`Clinic image ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => window.open(imageUrl, '_blank')}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Availability Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Availability Schedule
                </CardTitle>
                <CardDescription>Weekly availability for in-person consultations</CardDescription>
              </CardHeader>
              
              <CardContent>
                {availability.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availability.map((slot) => (
                      <div 
                        key={slot.id} 
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-md border"
                      >
                        <div className="font-medium">{dayNames[slot.day_of_week]}</div>
                        <div className="text-gray-600">{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No availability information provided. Please contact the clinic directly.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Booking */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Book a Consultation</CardTitle>
                <CardDescription>Schedule an in-person visit</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">

                
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-semibold text-lg">₹{(vet.consultation_fee || 171).toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Duration</span>
                  <span>30 minutes</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Today's Date</span>
                  <span>{format(new Date(), "MMM dd, yyyy")}</span>
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-white mt-4"
                  onClick={() => vetId && handleBookNow(vetId)}
                >
                  Book Now
                </Button>
                
                <div className="text-center text-sm text-gray-500 mt-2">
                  Select a date and time on the next screen
                </div>
              </CardContent>
            </Card>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetDetailsPage;
