
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import VetCard from '@/components/VetCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VetDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('all');
  const [availability, setAvailability] = useState('all');

  // Mock data for vets
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
    },
  ];

  const filteredVets = vets.filter(vet => {
    const matchesSearch = vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vet.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = specialization === 'all' || vet.specialization === specialization;
    const matchesAvailability = availability === 'all' || vet.availability === availability;
    
    return matchesSearch && matchesSpecialization && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Veterinarian</h1>
          <p className="text-gray-600">Connect with certified vets who care about your pet's health</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-tan-200 p-6 mb-8">
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
              <SelectContent className="bg-white border border-tan-200">
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
              <SelectContent className="bg-white border border-tan-200">
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="Available Now">Available Now</SelectItem>
                <SelectItem value="Available Soon">Available Soon</SelectItem>
                <SelectItem value="Scheduled Only">Scheduled Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <Button 
              className="bg-accent hover:bg-accent/90 text-white"
            >
              🤖 Auto-Match First Available
            </Button>
            <span className="text-sm text-gray-600">
              {filteredVets.length} veterinarians found
            </span>
          </div>
        </div>

        {/* Vet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVets.map((vet) => (
            <VetCard key={vet.id} {...vet} />
          ))}
        </div>

        {filteredVets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No veterinarians found matching your criteria.</p>
            <Button 
              className="mt-4 bg-primary hover:bg-primary/90"
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
