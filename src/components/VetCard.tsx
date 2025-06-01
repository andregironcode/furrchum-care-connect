import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Video, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VetCardProps {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  fee: number;
  availability: string;
  languages: string[];
  image?: string;
  distance?: number;
  zipCode?: string;
  about?: string;
}

const VetCard = ({ 
  id,
  name, 
  specialization, 
  experience, 
  rating, 
  fee, 
  availability, 
  languages,
  image,
  distance,
  zipCode,
  about
}: VetCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const availabilityColor = {
    'Available Now': 'bg-green-500',
    'Available Soon': 'bg-yellow-500',
    'Scheduled Only': 'bg-gray-500'
  };
  
  const handleBookNow = async () => {
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
  };

  const handleViewProfile = () => {
    navigate(`/vet-details/${id}`);
  };

  return (
    <Card className="bg-white border-tan-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center overflow-hidden">
              {image ? (
                <img src={image} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-accent-600">{name}</h3>
              <p className="text-sm text-accent-400">{specialization}</p>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            availability === 'Available Now' ? 'bg-green-500' : 
            availability === 'Available Soon' ? 'bg-yellow-500' : 
            'bg-gray-500'
          }`}></div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-accent-400">Experience</span>
          <span className="font-medium text-accent-600">{experience} years</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-accent-400">Rating</span>
          <div className="flex items-center space-x-1">
            <span className="font-medium text-accent-600">{rating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-primary' : 'text-gray-300'}`}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-accent-400">Consultation Fee</span>
          <span className="font-semibold text-primary">${fee}</span>
        </div>
        
        {distance !== undefined && zipCode && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-accent-400">Distance</span>
            <span className="font-medium text-accent-600">
              {distance.toFixed(1)} miles ({zipCode})
            </span>
          </div>
        )}
        
        {about && (
          <div className="text-sm text-accent-500 line-clamp-2">
            {about}
          </div>
        )}
        
        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            {availability}
          </Badge>
          <div className="flex flex-wrap gap-1">
            {languages.map((lang) => (
              <Badge key={lang} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
            size="sm"
            onClick={handleBookNow}
          >
            Book Now
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-accent text-accent hover:bg-accent hover:text-white"
            onClick={handleViewProfile}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VetCard;
