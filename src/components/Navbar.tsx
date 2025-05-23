import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-[#4e2a14] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/e8e11fbb-c7e5-4aac-9d0d-e6da3e74dd59.png" 
              alt="Furrchum Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-[#4e2a14] hover:text-[#f39bae] transition-colors">Home</a>
            <a href="/vets" className="text-[#4e2a14] hover:text-[#f39bae] transition-colors">Find Vets</a>
            <a href="/records" className="text-[#4e2a14] hover:text-[#f39bae] transition-colors">Health Records</a>
          </div>

          <div className="flex items-center space-x-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-[#f39bae] text-[#f39bae] hover:bg-[#f39bae] hover:text-white">
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Welcome to Furrchum</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" />
                    </div>
                    <Button className="w-full bg-[#f39bae] hover:bg-[#f39bae]/90">Sign In</Button>
                  </TabsContent>
                  <TabsContent value="signup" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signup">Email</Label>
                      <Input id="email-signup" type="email" placeholder="your@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">Password</Label>
                      <Input id="password-signup" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">I am a:</Label>
                      <select id="role" className="w-full p-2 border rounded-md">
                        <option value="pet-owner">Pet Owner</option>
                        <option value="vet">Veterinarian</option>
                      </select>
                    </div>
                    <Button className="w-full bg-[#f39bae] hover:bg-[#f39bae]/90">Create Account</Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            
            <Button 
              className="bg-[#4b90a6] hover:bg-[#4b90a6]/90 text-white font-medium"
            >
              Emergency Consult
            </Button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#4e2a14] hover:text-[#f39bae]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <a href="/" className="text-[#4e2a14] hover:text-[#f39bae] py-2">Home</a>
              <a href="/vets" className="text-[#4e2a14] hover:text-[#f39bae] py-2">Find Vets</a>
              <a href="/records" className="text-[#4e2a14] hover:text-[#f39bae] py-2">Health Records</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
