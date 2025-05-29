import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, PawPrint, User, Calendar, FileText, CreditCard, LogOut, HelpCircle } from "lucide-react";

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
      title: "My Pets",
      path: "/my-pets",
      icon: PawPrint,
      isActive: isActive("/my-pets"),
    },
    {
      title: "My Vets",
      path: "/my-vets",
      icon: User,
      isActive: isActive("/my-vets"),
    },
    {
      title: "Appointments",
      path: "/appointments",
      icon: Calendar,
      isActive: isActive("/appointments"),
    },
    {
      title: "Prescriptions",
      path: "/prescriptions",
      icon: FileText,
      isActive: isActive("/prescriptions"),
    },
    {
      title: "Payments",
      path: "/payments",
      icon: CreditCard,
      isActive: isActive("/payments"),
    },
    {
      title: "FAQ",
      path: "/faq",
      icon: HelpCircle,
      isActive: isActive("/faq"),
    },
    {
      title: "Profile",
      path: "/profile",
      icon: User,
      isActive: isActive("/profile"),
    },
  ];

  return (
    <Sidebar className="bg-white border-r shadow-sm">
      <SidebarHeader>
        <div className="p-4">
          <Link to="/" className="flex justify-center">
            <img 
              src="/lovable-uploads/020d6fdc-02f4-4190-acb2-59288e109f8d.png" 
              alt="Furrchum Logo" 
              className="h-32 w-32" 
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
                      flex items-center w-full font-medium
                      ${item.isActive 
                        ? "bg-primary/10 text-primary font-bold" 
                        : "text-gray-700 hover:bg-gray-100"} 
                      transition-colors p-4 rounded-md
                    `}
                  >
                    <Link to={item.path} className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
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

export default PetOwnerSidebar; 