
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingSection = () => {
  const [zipCode, setZipCode] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.trim()) {
      navigate(`/vets?zip=${zipCode.trim()}`);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-primary to-primary-400 py-20">
      <div className="absolute inset-0 bg-pattern opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Find Vet Care Near You
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Connect with certified veterinarians in your area. Get professional care for your furry friends.
          </p>
        </div>
        
        <Card className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm border-none shadow-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-grow">
                  <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Your Zip Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      id="zipcode"
                      type="text" 
                      placeholder="Enter zip code to find vets near you" 
                      className="pl-10 h-12" 
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-4 md:mt-6">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto bg-accent hover:bg-accent/90 text-white font-semibold px-8 h-12 text-lg"
                  >
                    Find Vets <Search className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Options</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/5 justify-start h-auto py-3"
                  onClick={() => navigate('/appointments')}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Appointment
                </Button>
                <Button 
                  variant="outline" 
                  className="border-accent text-accent hover:bg-accent/5 justify-start h-auto py-3"
                  onClick={() => navigate('/vets')}
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Browse All Veterinarians
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingSection;
