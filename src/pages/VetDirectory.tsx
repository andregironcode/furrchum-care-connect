
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import VetCard from '@/components/VetCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const VetDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('all');
  const [availability, setAvailability] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data for vets with placeholder images
  const vets = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialization: 'General Practice',
      experience: 8,
      rating: 4.9,
      fee: 45,
      availability: 'Available Now' as const,
      languages: ['English', 'Spanish'],
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialization: 'Emergency Care',
      experience: 12,
      rating: 4.8,
      fee: 65,
      availability: 'Available Soon' as const,
      languages: ['English', 'Mandarin'],
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialization: 'Surgery',
      experience: 15,
      rating: 4.9,
      fee: 80,
      availability: 'Scheduled Only' as const,
      languages: ['English', 'Spanish'],
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&auto=format&fit=crop'
    },
    {
      id: '4',
      name: 'Dr. David Kim',
      specialization: 'Dermatology',
      experience: 10,
      rating: 4.7,
      fee: 55,
      availability: 'Available Now' as const,
      languages: ['English', 'Korean'],
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop'
    },
    {
      id: '5',
      name: 'Dr. Lisa Thompson',
      specialization: 'Cardiology',
      experience: 18,
      rating: 4.9,
      fee: 90,
      availability: 'Available Soon' as const,
      languages: ['English'],
      image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=800&auto=format&fit=crop'
    },
    {
      id: '6',
      name: 'Dr. James Wilson',
      specialization: 'General Practice',
      experience: 6,
      rating: 4.6,
      fee: 40,
      availability: 'Available Now' as const,
      languages: ['English', 'French'],
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop'
    },
  ];

  const filteredVets = vets.filter(vet => {
    const matchesSearch = vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vet.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = specialization === 'all' || vet.specialization === specialization;
    const matchesAvailability = availability === 'all' || vet.availability === availability;
    
    return matchesSearch && matchesSpecialization && matchesAvailability;
  });

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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
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
          
          <div className="mt-4 flex justify-between items-center">
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              🔍 Find Nearest Vet
            </Button>
            <span className="text-sm text-slate-600">
              {filteredVets.length} veterinarians found
            </span>
          </div>
        </div>

        {/* Vet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVets.map((vet) => (
            <div key={vet.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src={vet.image} 
                  alt={`Dr. ${vet.name}`} 
                  className="w-full h-full object-cover"
                />
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
                  {vet.languages.map((lang) => (
                    <span key={lang} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                      {lang}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className={`text-sm font-medium ${
                    vet.availability === 'Available Now' ? 'text-emerald-600' : 
                    vet.availability === 'Available Soon' ? 'text-amber-600' : 
                    'text-slate-600'
                  }`}>
                    {vet.availability}
                  </div>
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => handleBookNow(vet.id)}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No veterinarians found matching your criteria.</p>
            <Button 
              className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                setSearchTerm('');
                setSpecialization('all');
                setAvailability('all');
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
