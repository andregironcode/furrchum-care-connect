
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
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default PetOwnerSidebar;
