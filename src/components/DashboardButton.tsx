
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { LayoutDashboard } from "lucide-react";

const DashboardButton = () => {
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
    <Link to={dashboardPath}>
      <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
        <LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard
      </Button>
    </Link>
  );
};

export default DashboardButton;
