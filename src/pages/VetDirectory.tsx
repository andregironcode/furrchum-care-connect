import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { MapPin, Search, Loader2, Video, Users, FileText, Images } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

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

// Define interface for Vet
interface Vet {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  fee: number;
  availability: string;
  languages: string[];
  image: string;
  location?: Coordinate;
  zipCode?: string;
  distance?: number;
  about?: string;
  phone?: string;
  clinic_location?: string;
  offers_video_calls?: boolean;
  offers_in_person?: boolean;
  license_url?: string;
  clinic_images?: string[];
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
  const [vets, setVets] = useState<Vet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initialize zip code from URL params if present
  useEffect(() => {
    const zipFromUrl = searchParams.get('zip');
    if (zipFromUrl) {
      setZipCode(zipFromUrl);
    }
  }, [searchParams]);

  // Fetch vets from database
  useEffect(() => {
    const fetchVets = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('vet_profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          // Transform the database data to match our Vet interface
          const transformedVets: Vet[] = data.map(vet => {
            // Get location from zip code if available
            let location: Coordinate | undefined;
            if (vet.zip_code && zipCodeCoordinates[vet.zip_code]) {
              location = zipCodeCoordinates[vet.zip_code];
            }
            
            return {
              id: vet.id,
              name: `Dr. ${vet.first_name} ${vet.last_name}`,
              specialization: vet.specialization || 'General Practice',
              experience: vet.years_experience || 0,
              rating: vet.rating || 4.5,
              fee: vet.consultation_fee || 50,
              availability: vet.availability || 'Available Soon',
              languages: vet.languages || ['English'],
              image: vet.image_url || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop',
              zipCode: vet.zip_code,
              location,
              about: vet.about,
              phone: vet.phone,
              clinic_location: vet.clinic_location,
              offers_video_calls: vet.offers_video_calls,
              offers_in_person: vet.offers_in_person,
              license_url: vet.license_url,
              clinic_images: vet.clinic_images
            };
          });
          
          setVets(transformedVets);
        }
      } catch (error) {
        console.error('Error fetching vet profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVets();
  }, []);
  
  const filteredAndSortedVets = useMemo(() => {
    if (vets.length === 0) return [];
    
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
      filtered = filtered.map(vet => {
        // If vet has location coordinates, calculate distance
        if (vet.location) {
          return {
            ...vet,
            distance: calculateDistance(userLocation, vet.location)
          };
        }
        return vet;
      });
      
      // Sort by distance (only for vets with location data)
      filtered.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        if (a.distance !== undefined) return -1;
        if (b.distance !== undefined) return 1;
        return 0;
      });
    }
    
    return filtered;
  }, [vets, searchTerm, specialization, availability, zipCode]);
  
  const handleBookNow = async (vetId: string) => {
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
      setIsSaving(true);
      navigate(`/booking/${vetId}`);
    } catch (error) {
      console.error('Error navigating to booking:', error);
      toast.error('Failed to start booking process');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Get unique specializations from actual vets data
  const specializations = useMemo(() => {
    const specialSet = new Set<string>();
    vets.forEach(vet => {
      if (vet.specialization) {
        specialSet.add(vet.specialization);
      }
    });
    return Array.from(specialSet);
  }, [vets]);

  return (
    <div className="min-h-screen bg-neutral-50">
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
              <Input 
                placeholder="Search by name or specialization..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full" 
              />
            </div>
            
            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
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
              {isLoading ? "Loading veterinarians..." : `${filteredAndSortedVets.length} veterinarians found`}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {/* Vet Cards Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedVets.map(vet => (
              <div key={vet.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img src={vet.image} alt={vet.name} className="w-full h-full object-cover" />
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
                  
                  {vet.about && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{vet.about}</p>
                  )}
                  
                  <div className="flex items-center mb-3 text-sm text-slate-700">
                    <span className="mr-3">{vet.experience} years exp.</span>
                    <span>${vet.fee}/consultation</span>
                  </div>
                  
                  {/* Consultation Types */}
                  <div className="flex gap-2 mb-3">
                    {vet.offers_video_calls && (
                      <Badge variant="outline" className="text-xs">
                        <Video className="w-3 h-3 mr-1" />
                        Video Calls
                      </Badge>
                    )}
                    {vet.offers_in_person && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        In-Person
                      </Badge>
                    )}
                  </div>
                  
                  {/* License and Clinic Images */}
                  <div className="flex gap-2 mb-3">
                    {vet.license_url && (
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        Licensed
                      </Badge>
                    )}
                    {vet.clinic_images && vet.clinic_images.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <Images className="w-3 h-3 mr-1" />
                        {vet.clinic_images.length} Photos
                      </Badge>
                    )}
                  </div>
                  
                  {/* Clinic Location */}
                  {vet.clinic_location && (
                    <div className="mb-3 text-sm text-slate-700">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      <span className="text-xs">{vet.clinic_location}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vet.languages.map(lang => (
                      <span key={lang} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                        {lang}
                      </span>
                    ))}
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
                    <div className={`text-sm font-medium ${
                      vet.availability === 'Available Now' ? 'text-emerald-600' : 
                      vet.availability === 'Available Soon' ? 'text-amber-600' : 
                      'text-slate-600'
                    }`}>
                      {vet.availability}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/vet-details/${vet.id}`)}
                        className="text-xs"
                      >
                        View Profile
                      </Button>
                      <Button 
                        onClick={() => handleBookNow(vet.id)} 
                        size="sm"
                        className="text-white bg-orange-500 hover:bg-orange-400 text-xs"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredAndSortedVets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No veterinarians found matching your criteria.</p>
            <Button 
              className="mt-4 bg-orange-500 hover:bg-orange-400 text-white" 
              onClick={() => {
                setSearchTerm('');
                setSpecialization('all');
                setAvailability('all');
                setZipCode('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VetDirectory;
