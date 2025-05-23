
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
import { Calendar, FileText, Settings, Home, Users, LogOut, Stethoscope } from "lucide-react";

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
      title: "Appointments",
      path: "/vet-appointments",
      icon: Calendar,
      isActive: isActive("/vet-appointments"),
    },
    {
      title: "Patients",
      path: "/patients",
      icon: Users,
      isActive: isActive("/patients"),
    },
    {
      title: "Medical Records",
      path: "/medical-records",
      icon: FileText,
      isActive: isActive("/medical-records"),
    },
    {
      title: "Treatment Plans",
      path: "/treatments",
      icon: Stethoscope,
      isActive: isActive("/treatments"),
    },
    {
      title: "Settings",
      path: "/vet-settings",
      icon: Settings,
      isActive: isActive("/vet-settings"),
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-2">
          <h2 className="text-xl font-bold text-primary">PetCare</h2>
          <p className="text-xs text-muted-foreground">Veterinarian Portal</p>
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
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default VetSidebar;
