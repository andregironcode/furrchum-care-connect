
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { MapPin, Search } from 'lucide-react';

// Mapping of zip codes to coordinates (latitude, longitude)
// This is a simplified version - in a production app, you'd use a geocoding API
const zipCodeCoordinates: Record<string, {lat: number, lng: number}> = {
  '10001': { lat: 40.750742, lng: -73.997237 }, // NYC - Manhattan
  '10461': { lat: 40.847429, lng: -73.838208 }, // NYC - Bronx
  '11201': { lat: 40.699744, lng: -73.989163 }, // NYC - Brooklyn
  '90210': { lat: 34.103003, lng: -118.416022 }, // Beverly Hills, CA
  '60601': { lat: 41.884941, lng: -87.622965 }, // Chicago, IL
  '75201': { lat: 32.784618, lng: -96.797941 }, // Dallas, TX
  '94102': { lat: 37.780526, lng: -122.415110 }, // San Francisco, CA
  '98101': { lat: 47.608013, lng: -122.335167 }, // Seattle, WA
  '33139': { lat: 25.781033, lng: -80.132988 }, // Miami, FL
  '02108': { lat: 42.358894, lng: -71.057837 }, // Boston, MA
};

interface Coordinate {
  lat: number;
  lng: number;
}

// Calculate distance between two points using Haversine formula
const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  const R = 3958.8; // Earth's radius in miles
  const lat1 = coord1.lat * Math.PI / 180;
  const lat2 = coord2.lat * Math.PI / 180;
  const deltaLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const deltaLng = (coord2.lng - coord1.lng) * Math.PI / 180;

  const a = 
    Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
    Math.cos(lat1) * Math.cos(lat2) * 
    Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in miles
};

const VetDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [zipCode, setZipCode] = useState('');
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initialize zip code from URL params if present
  useState(() => {
    const zipFromUrl = searchParams.get('zip');
    if (zipFromUrl) {
      setZipCode(zipFromUrl);
    }
  });

  // Mock data for vets with location coordinates
  const vets = [{
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialization: 'General Practice',
    experience: 8,
    rating: 4.9,
    fee: 45,
    availability: 'Available Now' as const,
    languages: ['English', 'Spanish'],
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop',
    location: { lat: 40.748817, lng: -73.985428 }, // NYC
    zipCode: '10001'
  }, {
    id: '2',
    name: 'Dr. Michael Chen',
    specialization: 'Emergency Care',
    experience: 12,
    rating: 4.8,
    fee: 65,
    availability: 'Available Soon' as const,
    languages: ['English', 'Mandarin'],
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop',
    location: { lat: 34.052235, lng: -118.243683 }, // LA
    zipCode: '90012'
  }, {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialization: 'Surgery',
    experience: 15,
    rating: 4.9,
    fee: 80,
    availability: 'Scheduled Only' as const,
    languages: ['English', 'Spanish'],
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&auto=format&fit=crop',
    location: { lat: 41.878113, lng: -87.629799 }, // Chicago
    zipCode: '60601'
  }, {
    id: '4',
    name: 'Dr. David Kim',
    specialization: 'Dermatology',
    experience: 10,
    rating: 4.7,
    fee: 55,
    availability: 'Available Now' as const,
    languages: ['English', 'Korean'],
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop',
    location: { lat: 37.773972, lng: -122.431297 }, // San Francisco
    zipCode: '94102'
  }, {
    id: '5',
    name: 'Dr. Lisa Thompson',
    specialization: 'Cardiology',
    experience: 18,
    rating: 4.9,
    fee: 90,
    availability: 'Available Soon' as const,
    languages: ['English'],
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=800&auto=format&fit=crop',
    location: { lat: 47.606209, lng: -122.332069 }, // Seattle
    zipCode: '98101'
  }, {
    id: '6',
    name: 'Dr. James Wilson',
    specialization: 'General Practice',
    experience: 6,
    rating: 4.6,
    fee: 40,
    availability: 'Available Now' as const,
    languages: ['English', 'French'],
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop',
    location: { lat: 25.761681, lng: -80.191788 }, // Miami
    zipCode: '33139'
  }];
  
  const filteredAndSortedVets = useMemo(() => {
    let filtered = vets.filter(vet => {
      const matchesSearch = vet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           vet.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization = specialization === 'all' || vet.specialization === specialization;
      const matchesAvailability = availability === 'all' || vet.availability === availability;
      return matchesSearch && matchesSpecialization && matchesAvailability;
    });
    
    // If zip code is provided, calculate distance and sort by proximity
    if (zipCode && zipCodeCoordinates[zipCode]) {
      const userLocation = zipCodeCoordinates[zipCode];
      
      // Add distance to each vet
      filtered = filtered.map(vet => ({
        ...vet,
        distance: calculateDistance(userLocation, vet.location)
      }));
      
      // Sort by distance
      filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    
    return filtered;
  }, [vets, searchTerm, specialization, availability, zipCode]);
  
  const handleBookNow = (vetId: string) => {
    if (!user) {
      toast.error("Please login to book a consultation", {
        action: {
          label: "Login",
          onClick: () => navigate("/auth")
        }
      });
      return;
    }
    navigate(`/booking/${vetId}`);
  };
  
  return <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Find Your Pet's Perfect Vet</h1>
          <p className="text-slate-600">Connect with certified veterinarians who care about your pet's health</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input placeholder="Search by name or specialization..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full" />
            </div>
            
            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Specializations</SelectItem>
                <SelectItem value="General Practice">General Practice</SelectItem>
                <SelectItem value="Emergency Care">Emergency Care</SelectItem>
                <SelectItem value="Surgery">Surgery</SelectItem>
                <SelectItem value="Dermatology">Dermatology</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="Available Now">Available Now</SelectItem>
                <SelectItem value="Available Soon">Available Soon</SelectItem>
                <SelectItem value="Scheduled Only">Scheduled Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:flex-grow">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input 
                    placeholder="Enter zip code to find nearest vets" 
                    value={zipCode}
                    onChange={e => setZipCode(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                className="text-white bg-orange-500 hover:bg-orange-400"
                onClick={() => setZipCode(zipCode)}
              >
                <Search className="mr-2 h-4 w-4" /> Find Nearest Vet
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-slate-600">
              {filteredAndSortedVets.length} veterinarians found
            </span>
          </div>
        </div>

        {/* Vet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedVets.map(vet => <div key={vet.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img src={vet.image} alt={`Dr. ${vet.name}`} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{vet.name}</h3>
                    <p className="text-emerald-600 text-sm">{vet.specialization}</p>
                  </div>
                  <div className="flex items-center bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-medium">
                    ★ {vet.rating}
                  </div>
                </div>
                
                <div className="flex items-center mb-3 text-sm text-slate-700">
                  <span className="mr-3">{vet.experience} years exp.</span>
                  <span>${vet.fee}/consultation</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {vet.languages.map(lang => <span key={lang} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                      {lang}
                    </span>)}
                </div>
                
                {vet.distance !== undefined && (
                  <div className="mb-3 text-sm text-slate-700">
                    <span className="font-medium text-orange-500">
                      {vet.distance.toFixed(1)} miles away
                    </span>
                    <span className="text-xs text-slate-500 ml-2">({vet.zipCode})</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className={`text-sm font-medium ${vet.availability === 'Available Now' ? 'text-emerald-600' : vet.availability === 'Available Soon' ? 'text-amber-600' : 'text-slate-600'}`}>
                    {vet.availability}
                  </div>
                  <Button onClick={() => handleBookNow(vet.id)} className="text-white bg-orange-500 hover:bg-orange-400">
                    Book Now
                  </Button>
                </div>
              </div>
            </div>)}
        </div>

        {filteredAndSortedVets.length === 0 && <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No veterinarians found matching your criteria.</p>
            <Button className="mt-4 bg-orange-500 hover:bg-orange-400 text-white" onClick={() => {
          setSearchTerm('');
          setSpecialization('all');
          setAvailability('all');
          setZipCode('');
        }}>
              Clear Filters
            </Button>
          </div>}
      </div>
    </div>;
};
export default VetDirectory;
