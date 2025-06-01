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
import { Home, Calendar, FileText, User, Wallet, LogOut, Users } from "lucide-react";

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
      title: "Patients",
      path: "/vet-patients",
      icon: Users,
      isActive: isActive("/vet-patients"),
    },
    {
      title: "Prescription",
      path: "/vet-prescriptions",
      icon: FileText,
      isActive: isActive("/vet-prescriptions"),
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
    <Sidebar className="bg-white border-r shadow-sm">
      <SidebarHeader>
        <div className="p-4">
          <Link to="/" className="flex justify-center">
            <img 
              src="/lovable-uploads/e8e11fbb-c7e5-4aac-9d0d-e6da3e74dd59.png" 
              alt="Furrchum Logo" 
              className="h-32 w-32" 
            />
          </Link>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path} className="mb-2">
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    tooltip={item.title}
                    className={`
                      flex items-center w-full font-medium
                      ${item.isActive 
                        ? "bg-primary/10 text-primary font-bold" 
                        : "text-gray-700 hover:bg-gray-100"} 
                      transition-colors p-4 rounded-md
                    `}
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${item.isActive ? "text-primary" : "text-gray-500"}`} />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 p-3"
            onClick={signOut}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Log Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default VetSidebar;
