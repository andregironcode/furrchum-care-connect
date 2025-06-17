import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { MapPin, Search, Loader2, Video, Users, FileText, Images, Download, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { openFile, downloadFile } from '@/utils/supabaseStorage';

interface Coordinate {
  latitude: number;
  longitude: number;
}

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
  zipCode?: string | null;
  distance?: number | null; // Changed to allow null for unknown distances
  about?: string | null;
  phone?: string | null;
  clinic_location?: string | null;
  offers_video_calls?: boolean | null;
  offers_in_person?: boolean | null;
  license_url?: string | null;
  clinic_images?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
}

const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
    (1 - Math.cos(dLon)) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
};

const VetDirectory = (): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [zipCode, setZipCode] = useState('');
  const [searchParams] = useSearchParams();
  const [vets, setVets] = useState<Vet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [zipSearchError, setZipSearchError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVets = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('vet_profiles')
          .select('*')
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          console.log('Fetched vet data from database:', data);
        
          // Transform the database data to match our Vet interface
          const transformedVets: Vet[] = data.map(vet => {
            // Initialize location as undefined since we don't have coordinates
            let location: Coordinate | undefined;
            
            // Debug latitude and longitude values
            const lat = (vet as any).latitude;
            const lng = (vet as any).longitude;
            console.log(`Vet ${vet.first_name} ${vet.last_name} coordinates:`, {
              latitude: lat,
              longitude: lng,
              type_lat: typeof lat,
              type_long: typeof lng,
              hasCoordinates: lat !== null && lng !== null
            });
            
            // Get any potential coordinates from the vet profile
            const rawLatitude = (vet as any).latitude;
            const rawLongitude = (vet as any).longitude;
            
            console.log(`Raw coordinates values for ${vet.first_name}:`, {
              rawLatitude,
              rawLongitude,
              rawLatType: typeof rawLatitude,
              rawLngType: typeof rawLongitude
            });
            
            // Create the vet object with coordinates if available
            return {
              id: vet.id,
              name: `Dr. ${vet.first_name} ${vet.last_name}`,
              specialization: vet.specialization || 'General Practice',
              experience: vet.years_experience || 0,
              rating: vet.rating || 4.5,
              fee: (vet.consultation_fee || 50) + 121, // Include 121 rupee service fee
              availability: vet.approval_status === 'approved' ? (vet.availability || 'Available Now') : 'Available Soon',
              languages: vet.languages || ['English'],
              image: vet.image_url || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop',
              zipCode: vet.zip_code,
              location,
              // Include latitude and longitude if available
              latitude: rawLatitude !== null && rawLatitude !== undefined ? Number(rawLatitude) : undefined,
              longitude: rawLongitude !== null && rawLongitude !== undefined ? Number(rawLongitude) : undefined,
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

  const fetchCoordinatesForPinCode = async (pinCodeToSearch: string) => {
    if (pinCodeToSearch.length !== 6 || !/^[0-9]+$/.test(pinCodeToSearch)) {
      setZipSearchError('Please enter a valid 6-digit PIN code.');
      setUserLocation(null);
      return null;
    }
    setZipSearchError(null);
    setIsLoading(true);
    try {
      // Use the same Nominatim OpenStreetMap API that's used in VetProfilePage
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pinCodeToSearch)}&country=in&format=json`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('OpenStreetMap API response for PIN code:', data);
      
      if (data && data.length > 0 && data[0].lat && data[0].lon) {
        const coords: Coordinate = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
        console.log('Found coordinates for PIN code:', coords);
        setUserLocation(coords);
        return coords;
      } else {
        throw new Error('No location found for this PIN code. Try another PIN code or search term.');
      }
    } catch (err: any) {
      console.error('Error fetching coordinates:', err);
      setZipSearchError(err.message || 'Could not fetch location for the PIN code.');
      setUserLocation(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipCodeSearch = async () => {
    if (zipCode) {
      // Get coordinates from the PIN code
      const coords = await fetchCoordinatesForPinCode(zipCode);
      
      // If we got valid coordinates, refetch vets to update them with distances
      if (coords) {
        // No need to filter by ZIP code text, we'll use coordinates for distance calculation
        setUserLocation(coords);
      }
    }
  };

  const filteredAndSortedVets = useMemo(() => {
    if (!vets) return [];
    
    let filtered = [...vets];
    
    // Apply filters
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(vet => 
        vet.name.toLowerCase().includes(term) || 
        vet.specialization.toLowerCase().includes(term) ||
        (vet.about?.toLowerCase().includes(term) || false)
      );
    }
    
    if (specialization && specialization !== 'all') {
      filtered = filtered.filter(vet => 
        vet.specialization === specialization
      );
    }
    
    if (availability && availability !== 'all') {
      filtered = filtered.filter(vet => 
        vet.availability.toLowerCase().includes(availability)
      );
    }
    
    // If searching by ZIP code, don't filter by text matching anymore
    // We'll rely on the distance calculation from coordinates instead
    // This allows showing results for all vets, sorted by distance
    
    // Calculate distances if we have user location
    if (userLocation) {
      console.log('User location for distance calculation:', userLocation);
      
      const userCoord: Coordinate = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
      
      // Add distance to each vet
      filtered = filtered.map(vet => {
        console.log('Calculating distance for vet:', vet.name, {
          latitude: vet.latitude,
          longitude: vet.longitude,
          hasValidLat: vet.latitude !== undefined && vet.latitude !== null && !isNaN(vet.latitude),
          hasValidLong: vet.longitude !== undefined && vet.longitude !== null && !isNaN(vet.longitude)
        });
        
        // Only calculate distance if we have both vet location and user location
        if (vet.latitude !== undefined && vet.latitude !== null && 
            vet.longitude !== undefined && vet.longitude !== null && 
            !isNaN(vet.latitude) && !isNaN(vet.longitude)) {
          const vetCoord: Coordinate = {
            latitude: vet.latitude,
            longitude: vet.longitude,
          };
          
          console.log('Valid coordinates found, calculating distance between:', {
            userCoord,
            vetCoord
          });
          
          const distance = calculateDistance(userCoord, vetCoord);
          console.log(`Distance calculated for ${vet.name}: ${distance.toFixed(2)} km`);
          
          return {
            ...vet,
            distance: distance // Store the exact distance for sorting
          };
        }
        
        console.log(`No valid coordinates for ${vet.name}, skipping distance calculation`);
        // If no location data, don't set a distance
        return vet;
      });
      
      // Sort by distance if available, otherwise by name
      filtered.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return (a.distance || 0) - (b.distance || 0);
        }
        return a.name.localeCompare(b.name);
      });
    }
    
    return filtered;
  }, [vets, searchTerm, specialization, availability, zipCode, userLocation]);

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
                    placeholder="Enter PIN code to find nearest vets" 
                    value={zipCode}
                    onChange={e => setZipCode(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                className="text-white bg-orange-500 hover:bg-orange-400"
                onClick={handleZipCodeSearch}
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
                    <span>₹{vet.fee}/consultation</span>
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
                  
                  {vet.distance !== undefined && vet.distance !== null && (
                    <div className="mb-3 text-sm text-slate-700">
                      <span className="font-medium text-orange-500">
                        {typeof vet.distance === 'number' ? vet.distance.toFixed(1) : '?'} km away
                      </span>
                      {vet.zipCode && (
                        <span className="text-xs text-slate-500 ml-2">({vet.zipCode})</span>
                      )}
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
      <Footer />
    </div>
  );
};

export default VetDirectory;
