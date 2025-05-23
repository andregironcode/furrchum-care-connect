
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const HealthRecords = () => {
  const [selectedPet, setSelectedPet] = useState('bella');

  // Mock data
  const pets = [
    { id: 'bella', name: 'Bella', type: 'Dog', breed: 'Golden Retriever', age: 3 },
    { id: 'whiskers', name: 'Whiskers', type: 'Cat', breed: 'Persian', age: 2 },
  ];

  const consultations = [
    {
      id: '1',
      date: '2024-01-15',
      vetName: 'Dr. Sarah Johnson',
      reason: 'Regular Checkup',
      diagnosis: 'Healthy - All vitals normal',
      prescription: 'Multivitamin supplement',
      followUp: 'Annual checkup in 12 months',
      status: 'Completed',
    },
    {
      id: '2',
      date: '2024-01-10',
      vetName: 'Dr. Michael Chen',
      reason: 'Skin irritation',
      diagnosis: 'Mild allergic reaction',
      prescription: 'Antihistamine cream',
      followUp: 'Follow-up in 2 weeks if symptoms persist',
      status: 'Completed',
    },
    {
      id: '3',
      date: '2024-01-05',
      vetName: 'Dr. Emily Rodriguez',
      reason: 'Vaccination',
      diagnosis: 'Routine vaccination administered',
      prescription: 'None',
      followUp: 'Next vaccination due in 6 months',
      status: 'Completed',
    },
  ];

  const favoriteVets = [
    { id: '1', name: 'Dr. Sarah Johnson', specialization: 'General Practice', lastVisit: '2024-01-15' },
    { id: '2', name: 'Dr. Michael Chen', specialization: 'Emergency Care', lastVisit: '2024-01-10' },
    { id: '3', name: 'Dr. Emily Rodriguez', specialization: 'Surgery', lastVisit: '2024-01-05' },
  ];

  const currentPet = pets.find(pet => pet.id === selectedPet);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pet Health Records</h1>
          <p className="text-gray-600">Track your pet's health journey and manage their care</p>
        </div>

        {/* Pet Selector */}
        <Card className="mb-8 bg-white border-tan-200">
          <CardHeader>
            <CardTitle>Select Pet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {pets.map((pet) => (
                <Button
                  key={pet.id}
                  variant={selectedPet === pet.id ? "default" : "outline"}
                  onClick={() => setSelectedPet(pet.id)}
                  className={selectedPet === pet.id ? 
                    "bg-primary hover:bg-primary/90" : 
                    "border-primary text-primary hover:bg-primary hover:text-white"
                  }
                >
                  {pet.name} ({pet.type})
                </Button>
              ))}
            </div>
            
            {currentPet && (
              <div className="mt-4 p-4 bg-tan-100 rounded-lg">
                <h3 className="font-semibold text-gray-900">{currentPet.name}</h3>
                <p className="text-gray-600">{currentPet.breed} • {currentPet.age} years old</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="consultations" className="space-y-6">
          <TabsList className="bg-white border border-tan-200">
            <TabsTrigger value="consultations">Consultation History</TabsTrigger>
            <TabsTrigger value="favorites">Favorite Vets</TabsTrigger>
          </TabsList>

          <TabsContent value="consultations" className="space-y-6">
            <div className="space-y-4">
              {consultations.map((consultation) => (
                <Card key={consultation.id} className="bg-white border-tan-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{consultation.reason}</CardTitle>
                        <p className="text-gray-600">
                          {new Date(consultation.date).toLocaleDateString()} • {consultation.vetName}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {consultation.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Diagnosis</h4>
                      <p className="text-gray-600">{consultation.diagnosis}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Prescription</h4>
                      <p className="text-gray-600">{consultation.prescription}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Follow-up Notes</h4>
                      <p className="text-gray-600">{consultation.followUp}</p>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                        📄 Download Report
                      </Button>
                      <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                        🔄 Book Follow-up
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteVets.map((vet) => (
                <Card key={vet.id} className="bg-white border-tan-200">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {vet.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{vet.name}</CardTitle>
                        <p className="text-gray-600">{vet.specialization}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Last visit: {new Date(vet.lastVisit).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                        Book Again
                      </Button>
                      <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                        ❤️
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthRecords;
