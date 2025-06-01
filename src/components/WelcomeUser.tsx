
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardButton from "./DashboardButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Profile } from "@/types/supabase";

const WelcomeUser = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setProfile(data);
        }
      }
    };
    
    fetchProfile();
  }, [user]);
  
  if (!user || !profile) return null;
  
  return (
    <Card className="w-full my-6 bg-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle>Welcome, {profile.full_name || 'Pet Lover'}!</CardTitle>
        <CardDescription>
          {profile.user_type === 'vet' 
            ? "Access your veterinarian dashboard to manage appointments and patient records."
            : "Access your pet owner dashboard to manage your pets' health records and appointments."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          {profile.user_type === 'vet'
            ? "As a veterinarian, you can view your appointment schedule, manage patient records, and communicate with pet owners."
            : "As a pet owner, you can schedule veterinary appointments, track your pets' health records, and communicate with your veterinarian."
          }
        </p>
      </CardContent>
      <CardFooter>
        <DashboardButton />
      </CardFooter>
    </Card>
  );
};

export default WelcomeUser;
