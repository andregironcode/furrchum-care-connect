
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import VetSidebar from '@/components/VetSidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from '@/components/Footer';
import { useState } from 'react';

const VetProfilePage = () => {
  const [activeTab, setActiveTab] = useState("account");
  
  // Sample form data
  const [formData, setFormData] = useState({
    firstName: "Dr sarah",
    lastName: "khan",
    price: "650",
    gender: "Female",
    specialist: "Veterinary Physician",
    email: "drsarah@gmail.com",
    phone: "7890654321"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process form submission here
    console.log("Form submitted:", formData);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-cream-50">
        <VetSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold text-accent-600">Profile</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
                <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5 mb-8">
                    <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                      Account Information
                    </TabsTrigger>
                    <TabsTrigger value="professional" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                      Professional Details
                    </TabsTrigger>
                    <TabsTrigger value="clinic" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                      Clinic Information
                    </TabsTrigger>
                    <TabsTrigger value="banking" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                      Banking Details
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                      Documents
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="account">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium">
                            First Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium">
                            Last Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-sm font-medium">
                            Price <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-sm font-medium">
                            Gender <span className="text-red-500">*</span>
                          </Label>
                          <select 
                            id="gender" 
                            name="gender"
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md"
                          >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="specialist" className="text-sm font-medium">
                            Specialist <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="specialist"
                            name="specialist"
                            value={formData.specialist}
                            onChange={handleChange}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">
                            Email Address <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium">
                            Phone Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </form>
                    
                    <div className="flex gap-4 mt-8">
                      <Button className="bg-primary hover:bg-primary/90 text-white">Account Info</Button>
                      <Button className="bg-primary hover:bg-primary/90 text-white">Professional Info</Button>
                      <Button className="bg-primary hover:bg-primary/90 text-white">Clinic Info</Button>
                      <Button className="bg-primary hover:bg-primary/90 text-white">Banking Info</Button>
                      <Button className="bg-primary hover:bg-primary/90 text-white">Documents</Button>
                      <Button className="bg-primary hover:bg-primary/90 text-white">Reset Password</Button>
                      <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">Cancel</Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="professional">
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">Professional details will be shown here.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="clinic">
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">Clinic information will be shown here.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="banking">
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">Banking details will be shown here.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents">
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">Documents will be shown here.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VetProfilePage;
