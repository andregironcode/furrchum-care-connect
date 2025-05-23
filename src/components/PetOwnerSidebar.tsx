
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
      
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path} className="mb-2">
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    tooltip={item.title}
                    className={`
                      flex items-center w-full font-medium text-lg
                      ${item.isActive 
                        ? "bg-white text-orange-600 font-bold" 
                        : "bg-orange-600 text-white hover:bg-orange-400"} 
                      transition-colors p-4 rounded-md
                    `}
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className="h-6 w-6" />
                      <span className="text-base lg:text-lg">{item.title}</span>
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
            className="w-full justify-start bg-orange-600 text-white text-lg border-white hover:bg-orange-400 p-3"
            onClick={signOut}
          >
            <LogOut className="mr-3 h-6 w-6" />
            Log Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default PetOwnerSidebar;
