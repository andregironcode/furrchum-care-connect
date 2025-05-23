
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VetCardProps {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  fee: number;
  availability: 'Available Now' | 'Available Soon' | 'Scheduled Only';
  languages: string[];
  image?: string;
}

const VetCard = ({ 
  name, 
  specialization, 
  experience, 
  rating, 
  fee, 
  availability, 
  languages,
  image 
}: VetCardProps) => {
  const availabilityColor = {
    'Available Now': 'bg-green-500',
    'Available Soon': 'bg-yellow-500',
    'Scheduled Only': 'bg-gray-500'
  };

  return (
    <Card className="bg-white border-tan-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {image ? (
                  <img src={image} alt={name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  name.split(' ').map(n => n[0]).join('')
                )}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-accent-600">{name}</h3>
              <p className="text-sm text-accent-400">{specialization}</p>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${availabilityColor[availability]}`}></div>
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
          >
            Book Now
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-accent text-accent hover:bg-accent hover:text-white"
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VetCard;
