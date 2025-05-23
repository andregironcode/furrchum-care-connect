
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
import { PawPrint, Calendar, FileText, Settings, Home, LogOut } from "lucide-react";

const PetOwnerSidebar = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    {
      title: "Home",
      path: "/dashboard",
      icon: Home,
      isActive: isActive("/dashboard"),
    },
    {
      title: "My Pets",
      path: "/my-pets",
      icon: PawPrint,
      isActive: isActive("/my-pets"),
    },
    {
      title: "Appointments",
      path: "/appointments",
      icon: Calendar,
      isActive: isActive("/appointments"),
    },
    {
      title: "Health Records",
      path: "/records",
      icon: FileText,
      isActive: isActive("/records"),
    },
    {
      title: "Settings",
      path: "/settings",
      icon: Settings,
      isActive: isActive("/settings"),
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
                  >
                    <Link to={item.path} className="text-accent hover:text-primary">
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

export default PetOwnerSidebar;
