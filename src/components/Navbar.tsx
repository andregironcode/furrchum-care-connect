import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserWithAppMetadata extends User {
  user_metadata: {
    user_type?: 'pet_owner' | 'vet';
    full_name?: string;
    [key: string]: any; // Allow other metadata properties
  };
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Safely get user type from user_metadata
  const getUserType = () => {
    if (!user) return 'pet_owner';
    const userWithMeta = user as UserWithAppMetadata;
    return userWithMeta.user_metadata?.user_type || 'pet_owner';
  };
  
  const userType = getUserType();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };
  
  return (
    <TooltipProvider>
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-28">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <img 
                  src="/lovable-uploads/e8e11fbb-c7e5-4aac-9d0d-e6da3e74dd59.png" 
                  alt="Furrchum Logo" 
                  className="h-20 w-auto" 
                />
              </Link>
              <span className="font-bold text-accent-600 text-2xl hidden sm:inline-block">Furrchum</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/vets" className="text-accent-600 hover:text-primary font-medium transition-colors">Find Vets</Link>
              <Link to="/blog" className="text-accent-600 hover:text-primary font-medium transition-colors">Blog</Link>
              <Link to="/about" className="text-accent-600 hover:text-primary font-medium transition-colors">About Us</Link>
              <Link to="/contact" className="text-accent-600 hover:text-primary font-medium transition-colors">Contact Us</Link>
            </div>

            {/* Desktop User Account Dropdown - Only for authenticated users */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white font-medium">
                      <UserCircle className="w-5 h-5 mr-2" />
                      My Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link 
                        to={userType === 'vet' ? '/vet-dashboard' : '/dashboard'} 
                        className="flex items-center w-full"
                        onClick={() => setIsOpen(false)}
                      >
                        <UserCircle className="w-4 h-4 mr-2" /> 
                        {userType === 'vet' ? 'Vet Dashboard' : 'Dashboard'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  {/* Login Button */}
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary hover:text-white font-medium"
                    onClick={() => handleNavigate('/auth?tab=signin')}
                  >
                    Sign In
                  </Button>
                  
                  {/* Register Button */}
                  <Button 
                    className="bg-accent hover:bg-accent/90 text-white font-medium"
                    onClick={() => handleNavigate('/auth?tab=signup')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            <div className="md:hidden">
              {!user ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => setIsOpen(!isOpen)} 
                      className="text-accent-600 hover:text-primary transition-colors"
                      aria-label="Toggle menu"
                    >
                      {isOpen ? 
                        <X className="w-6 h-6" /> : 
                        <Menu className="w-6 h-6" />
                      }
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="bg-primary text-white p-3 max-w-xs">
                    <div className="text-center">
                      <p className="font-medium mb-1">👋 New to Furrchum?</p>
                      <p className="text-sm">Sign up here to book vet appointments for your furry friends!</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button 
                  onClick={() => setIsOpen(!isOpen)} 
                  className="text-accent-600 hover:text-primary transition-colors"
                  aria-label="Toggle menu"
                >
                  {isOpen ? 
                    <X className="w-6 h-6" /> : 
                    <Menu className="w-6 h-6" />
                  }
                </button>
              )}
            </div>
          </div>

          {isOpen && (
            <div className="md:hidden py-4 border-t border-primary/10 animate-fade-in">
              <div className="flex flex-col space-y-4">
                {/* Navigation Links */}
                <Link 
                  to="/vets" 
                  className="text-accent-600 hover:text-primary py-2 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Find Vets
                </Link>
                <Link 
                  to="/blog" 
                  className="text-accent-600 hover:text-primary py-2 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  to="/about" 
                  className="text-accent-600 hover:text-primary py-2 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  About Us
                </Link>
                <Link 
                  to="/contact" 
                  className="text-accent-600 hover:text-primary py-2 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Contact Us
                </Link>
                
                {/* User-specific actions */}
                {user ? (
                  <>
                    {/* Dashboard Link */}
                    <button
                      onClick={() => handleNavigate(userType === 'vet' ? '/vet-dashboard' : '/dashboard')}
                      className="flex items-center text-accent-600 hover:text-primary py-2 font-medium"
                    >
                      <UserCircle className="w-4 h-4 mr-2" />
                      {userType === 'vet' ? 'Vet Dashboard' : 'Dashboard'}
                    </button>
                    
                    {/* Sign Out */}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center text-accent-600 hover:text-primary py-2 font-medium"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> 
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    {/* Login Button */}
                    <Button 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary hover:text-white font-medium w-full justify-start"
                      onClick={() => handleNavigate('/auth?tab=signin')}
                    >
                      Sign In
                    </Button>
                    
                    {/* Register Button */}
                    <Button 
                      className="bg-accent hover:bg-accent/90 text-white font-medium w-full justify-start"
                      onClick={() => handleNavigate('/auth?tab=signup')}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </TooltipProvider>
  );
};

export default Navbar;
