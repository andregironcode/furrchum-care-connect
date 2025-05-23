
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, User, Mail, Save, Key } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import PetOwnerSidebar from '@/components/PetOwnerSidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
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
          setFormData(prev => ({
            ...prev,
            full_name: data.full_name || '',
            email: user.email || ''
          }));
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setError(error.message || 'Failed to load profile data');
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update profile name
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: formData.full_name })
        .eq('id', user?.id);

      if (updateError) throw updateError;
      
      // If password fields are filled, update password
      if (formData.password) {
        if (formData.password !== formData.confirm_password) {
          throw new Error("Passwords don't match");
        }
        
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password
        });
        
        if (passwordError) throw passwordError;
        
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          password: '',
          confirm_password: ''
        }));
      }

      // Success message or action could be added here
      alert("Profile updated successfully!");
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
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
              <div className="container flex h-16 items-center">
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

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Summary Card */}
                <Card className="lg:col-span-1">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="" alt={profile?.full_name} />
                        <AvatarFallback className="bg-primary text-white text-3xl">
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-xl">{profile?.full_name}</CardTitle>
                    <div className="text-sm text-gray-500">{profile?.user_type === 'pet_owner' ? 'Pet Owner' : 'Veterinarian'}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{user?.email}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Tabs */}
                <div className="lg:col-span-3">
                  <Tabs defaultValue="personal">
                    <TabsList className="w-full bg-gray-100 mb-6 h-12">
                      <TabsTrigger value="personal" className="text-lg flex-1">Personal Info</TabsTrigger>
                      <TabsTrigger value="security" className="text-lg flex-1">Security</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="personal">
                      <Card>
                        <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={updateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input 
                                  id="full_name" 
                                  name="full_name"
                                  placeholder="Your name"
                                  value={formData.full_name}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input 
                                  id="email" 
                                  name="email"
                                  type="email"
                                  value={formData.email}
                                  disabled
                                  className="bg-gray-50"
                                />
                                <p className="text-xs text-gray-500">Contact support to change email</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <Button 
                                type="submit" 
                                className="bg-primary"
                                disabled={saving}
                              >
                                {saving ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="mr-2 h-4 w-4" />
                                )}
                                Save Changes
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="security">
                      <Card>
                        <CardHeader>
                          <CardTitle>Password & Security</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={updateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input 
                                  id="password" 
                                  name="password"
                                  type="password"
                                  placeholder="••••••••"
                                  value={formData.password}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="confirm_password">Confirm Password</Label>
                                <Input 
                                  id="confirm_password" 
                                  name="confirm_password"
                                  type="password"
                                  placeholder="••••••••"
                                  value={formData.confirm_password}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <Button 
                                type="submit" 
                                className="bg-primary"
                                disabled={saving}
                              >
                                {saving ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Key className="mr-2 h-4 w-4" />
                                )}
                                Update Password
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ProfilePage;
