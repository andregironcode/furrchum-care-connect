
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import WelcomeUser from "./WelcomeUser";

const IndexPageDashboardLink = () => {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Use useEffect to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted || isLoading) return null;
  
  if (!user) return null;
  
  return <WelcomeUser />;
};

export default IndexPageDashboardLink;
