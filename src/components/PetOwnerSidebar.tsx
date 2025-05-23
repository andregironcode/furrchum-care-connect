
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
import { Home, PawPrint, User, Calendar, FileText, CreditCard, LogOut } from "lucide-react";

const PetOwnerSidebar = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: Home,
      isActive: isActive("/dashboard"),
    },
    {
      title: "My Pet",
      path: "/my-pets",
      icon: PawPrint,
      isActive: isActive("/my-pets"),
    },
    {
      title: "My Vet",
      path: "/my-vets",
      icon: User,
      isActive: isActive("/my-vets"),
    },
    {
      title: "Appointment",
      path: "/appointments",
      icon: Calendar,
      isActive: isActive("/appointments"),
    },
    {
      title: "Prescription",
      path: "/prescriptions",
      icon: FileText,
      isActive: isActive("/prescriptions"),
    },
    {
      title: "Payment",
      path: "/payments",
      icon: CreditCard,
      isActive: isActive("/payments"),
    },
    {
      title: "Profile",
      path: "/profile",
      icon: User,
      isActive: isActive("/profile"),
    },
  ];

  return (
    <Sidebar className="bg-orange-500">
      <SidebarHeader>
        <div className="p-4">
          <Link to="/" className="flex justify-center">
            <img 
              src="/lovable-uploads/020d6fdc-02f4-4190-acb2-59288e109f8d.png" 
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
                    size="lg"
                    className={`
                      ${item.isActive 
                        ? "bg-white text-orange-600 font-bold" 
                        : "bg-orange-600 text-white font-medium hover:bg-orange-400"} 
                      transition-colors
                      px-4 py-2
                    `}
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
            className="w-full justify-start bg-orange-600 text-white border-white hover:bg-orange-400"
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
