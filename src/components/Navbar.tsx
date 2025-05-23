
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <img 
                src="/lovable-uploads/e8e11fbb-c7e5-4aac-9d0d-e6da3e74dd59.png" 
                alt="Furrchum Logo" 
                className="h-12 w-auto" 
              />
            </Link>
            <span className="font-bold text-accent-600 text-xl hidden sm:inline-block">Furrchum</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-accent-600 hover:text-primary font-medium transition-colors">Home</Link>
            <Link to="/vets" className="text-accent-600 hover:text-primary font-medium transition-colors">Find Vets</Link>
            <Link to="/records" className="text-accent-600 hover:text-primary font-medium transition-colors">Health Records</Link>
          </div>

          <div className="flex items-center space-x-4">
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
                    <Link to="/dashboard" className="flex items-center w-full">
                      <UserCircle className="w-4 h-4 mr-2" /> Dashboard
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
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white font-medium"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                
                <Button 
                  className="bg-accent hover:bg-accent/90 text-white font-medium"
                  onClick={() => {
                    navigate('/auth');
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
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
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-primary/10 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-accent-600 hover:text-primary py-2 font-medium">Home</Link>
              <Link to="/vets" className="text-accent-600 hover:text-primary py-2 font-medium">Find Vets</Link>
              <Link to="/records" className="text-accent-600 hover:text-primary py-2 font-medium">Health Records</Link>
              {user && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-accent-600 hover:text-primary py-2 font-medium"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
