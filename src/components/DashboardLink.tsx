
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { NavigationMenuLink } from "./ui/navigation-menu";

const DashboardLink = () => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserType = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setUserType(data.user_type);
        }
      }
    };
    
    fetchUserType();
  }, [user]);
  
  if (!user) return null;
  
  const dashboardPath = userType === 'vet' ? '/vet-dashboard' : '/dashboard';
  
  return (
    <NavigationMenuLink asChild>
      <Link to={dashboardPath}>
        <Button variant="ghost" className="text-sm font-medium">
          Dashboard
        </Button>
      </Link>
    </NavigationMenuLink>
  );
};

export default DashboardLink;
