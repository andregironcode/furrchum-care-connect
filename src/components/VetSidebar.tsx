
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
        <div className="p-2">
          <Link to="/" className="block">
            <h2 className="text-2xl font-bold text-primary">PetCare</h2>
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
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
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
            className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default VetSidebar;
