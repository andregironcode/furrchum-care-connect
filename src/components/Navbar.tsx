
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#4e2a14]/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/e8e11fbb-c7e5-4aac-9d0d-e6da3e74dd59.png" 
              alt="Furrchum Logo" 
              className="h-12 w-auto" 
            />
            <span className="font-bold text-[#4e2a14] text-xl hidden sm:inline-block">Furrchum</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-[#4e2a14] hover:text-primary font-medium transition-colors">Home</a>
            <a href="/vets" className="text-[#4e2a14] hover:text-primary font-medium transition-colors">Find Vets</a>
            <a href="/records" className="text-[#4e2a14] hover:text-primary font-medium transition-colors">Health Records</a>
          </div>

          <div className="flex items-center space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white font-medium">
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl text-[#4e2a14]">Welcome to Furrchum</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
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
                    <Button className="w-full bg-primary hover:bg-primary/90">Sign In</Button>
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
                    <Button className="w-full bg-primary hover:bg-primary/90">Create Account</Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            
            <Button className="bg-accent hover:bg-accent/90 text-white font-medium">
              Vet Portal
            </Button>
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-[#4e2a14] hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? 
                <X className="w-6 h-6" /> : 
                <Menu className="w-6 h-6" />
              }
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-[#4e2a14]/10 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <a href="/" className="text-[#4e2a14] hover:text-primary py-2 font-medium">Home</a>
              <a href="/vets" className="text-[#4e2a14] hover:text-primary py-2 font-medium">Find Vets</a>
              <a href="/records" className="text-[#4e2a14] hover:text-primary py-2 font-medium">Health Records</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
