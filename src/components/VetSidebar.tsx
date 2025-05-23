
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Calendar, FileText, User, Wallet, LogOut } from "lucide-react";

const VetSidebar = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    {
      title: "Dashboard",
      path: "/vet-dashboard",
      icon: Home,
      isActive: isActive("/vet-dashboard"),
    },
    {
      title: "Appointment",
      path: "/vet-appointments",
      icon: Calendar,
      isActive: isActive("/vet-appointments"),
    },
    {
      title: "Prescription",
      path: "/prescriptions",
      icon: FileText,
      isActive: isActive("/prescriptions"),
    },
    {
      title: "Profile",
      path: "/vet-profile",
      icon: User,
      isActive: isActive("/vet-profile"),
    },
    {
      title: "Billing",
      path: "/vet-billing",
      icon: Wallet,
      isActive: isActive("/vet-billing"),
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <Link to="/" className="flex justify-center">
            <img 
              src="/lovable-uploads/e8e11fbb-c7e5-4aac-9d0d-e6da3e74dd59.png" 
              alt="Furrchum Logo" 
              className="h-28 w-28" 
            />
          </Link>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    tooltip={item.title}
                    className="text-accent hover:text-primary"
                  >
                    <Link to={item.path}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-2">
          <Button 
            variant="outline" 
            className="w-full justify-start text-white bg-accent hover:bg-accent/80"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Log Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default VetSidebar;
