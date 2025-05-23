
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, User, Mail, Phone, Home, Lock, Bell } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

const ProfilePage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          setProfile(data);
          setFormData({
            full_name: data?.full_name || '',
            email: user.email || '',
            phone: data?.phone || '',
            address: data?.address || '',
            city: data?.city || '',
            state: data?.state || '',
            zip_code: data?.zip_code || '',
          });
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchProfile();
    }
  }, [user, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic here
    alert('Profile update functionality would go here');
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PetOwnerSidebar />
        <SidebarInset className="lg:pl-0">
          <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 bg-background border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold">My Profile</h1>
                </div>
              </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-8">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="w-full bg-orange-100 mb-6 h-12">
                  <TabsTrigger value="personal" className="text-lg flex-1">Personal Information</TabsTrigger>
                  <TabsTrigger value="security" className="text-lg flex-1">Security</TabsTrigger>
                  <TabsTrigger value="notifications" className="text-lg flex-1">Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal">
                  <Card className="border-orange-200">
                    <CardHeader className="bg-orange-50">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <User className="h-5 w-5 text-orange-500" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="flex justify-center mb-6">
                          <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 font-bold text-3xl">
                              {formData.full_name.charAt(0) || user.email?.charAt(0) || 'U'}
                            </div>
                            <Button 
                              size="sm" 
                              className="absolute bottom-0 right-0 rounded-full bg-orange-500 hover:bg-orange-600"
                            >
                              Edit
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Full Name */}
                          <div className="space-y-2">
                            <label htmlFor="full_name" className="text-sm font-medium flex items-center gap-2">
                              <User className="h-4 w-4 text-orange-500" />
                              Full Name
                            </label>
                            <Input
                              id="full_name"
                              name="full_name"
                              value={formData.full_name}
                              onChange={handleInputChange}
                              className="border-orange-200 focus-visible:ring-orange-500"
                            />
                          </div>

                          {/* Email */}
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                              <Mail className="h-4 w-4 text-orange-500" />
                              Email
                            </label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="border-orange-200 focus-visible:ring-orange-500"
                              disabled
                            />
                            <p className="text-xs text-gray-500">Contact support to change email address</p>
                          </div>

                          {/* Phone */}
                          <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                              <Phone className="h-4 w-4 text-orange-500" />
                              Phone Number
                            </label>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="border-orange-200 focus-visible:ring-orange-500"
                            />
                          </div>

                          {/* Address */}
                          <div className="space-y-2">
                            <label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                              <Home className="h-4 w-4 text-orange-500" />
                              Address
                            </label>
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="border-orange-200 focus-visible:ring-orange-500"
                            />
                          </div>

                          {/* City */}
                          <div className="space-y-2">
                            <label htmlFor="city" className="text-sm font-medium">
                              City
                            </label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="border-orange-200 focus-visible:ring-orange-500"
                            />
                          </div>

                          {/* State */}
                          <div className="space-y-2">
                            <label htmlFor="state" className="text-sm font-medium">
                              State
                            </label>
                            <Input
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="border-orange-200 focus-visible:ring-orange-500"
                            />
                          </div>

                          {/* Zip Code */}
                          <div className="space-y-2">
                            <label htmlFor="zip_code" className="text-sm font-medium">
                              Zip Code
                            </label>
                            <Input
                              id="zip_code"
                              name="zip_code"
                              value={formData.zip_code}
                              onChange={handleInputChange}
                              className="border-orange-200 focus-visible:ring-orange-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <Card className="border-orange-200">
                    <CardHeader className="bg-orange-50">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Lock className="h-5 w-5 text-orange-500" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Change Password</h3>
                          <p className="text-sm text-gray-500">
                            Update your password to keep your account secure
                          </p>
                          <div className="pt-2">
                            <Button className="bg-orange-500 hover:bg-orange-600">
                              Change Password
                            </Button>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Add an extra layer of security to your account by requiring both your password and a code from your mobile device
                          </p>
                          <Button className="bg-orange-500 hover:bg-orange-600">
                            Enable 2FA
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <Card className="border-orange-200">
                    <CardHeader className="bg-orange-50">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-500" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <NotificationSetting 
                          title="Appointment Reminders" 
                          description="Receive notifications about upcoming appointments"
                          defaultChecked={true}
                        />
                        
                        <NotificationSetting 
                          title="Medication Reminders" 
                          description="Get alerts when it's time for your pet's medication"
                          defaultChecked={true}
                        />
                        
                        <NotificationSetting 
                          title="Prescription Refills" 
                          description="Be notified when prescriptions are ready for refill"
                          defaultChecked={true}
                        />
                        
                        <NotificationSetting 
                          title="Payment Confirmations" 
                          description="Receive confirmations when payments are processed"
                          defaultChecked={true}
                        />
                        
                        <NotificationSetting 
                          title="Special Offers" 
                          description="Get updates about special offers and promotions"
                          defaultChecked={false}
                        />
                        
                        <NotificationSetting 
                          title="Newsletter" 
                          description="Receive our monthly pet care newsletter"
                          defaultChecked={false}
                        />
                        
                        <div className="flex justify-end pt-4">
                          <Button className="bg-orange-500 hover:bg-orange-600">
                            Save Preferences
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Notification Setting Component
const NotificationSetting = ({ 
  title, 
  description, 
  defaultChecked 
}: { 
  title: string; 
  description: string; 
  defaultChecked: boolean;
}) => {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => setChecked(!checked)}
          className="sr-only"
          id={`toggle-${title.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <label
          htmlFor={`toggle-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className={`block w-14 h-7 rounded-full transition cursor-pointer ${
            checked ? 'bg-orange-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`block w-5 h-5 mt-1 ml-1 bg-white rounded-full transition-transform ${
              checked ? 'transform translate-x-7' : ''
            }`}
          />
        </label>
      </div>
    </div>
  );
};

export default ProfilePage;
