
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode | ((props: { profile: any }) => React.ReactNode);
  allowedUserTypes?: ('pet_owner' | 'vet')[];
}

const RouteGuard = ({ children, allowedUserTypes }: RouteGuardProps) => {
  const { user, isLoading, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [isCheckingUserType, setIsCheckingUserType] = useState(true);

  useEffect(() => {
    // Wait until auth state is determined
    if (!isLoading) {
      setIsReady(true);
      
      // If we have a user but no profile yet, wait a bit more
      if (user && !profile) {
        const timer = setTimeout(() => {
          setIsCheckingUserType(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
      
      setIsCheckingUserType(false);
    }
  }, [isLoading, user, profile]);

  // Redirect to appropriate dashboard if user is logged in but on wrong dashboard
  useEffect(() => {
    if (isReady && user && profile && allowedUserTypes) {
      const currentPath = location.pathname;
      const isVetRoute = currentPath.startsWith('/vet-');
      const isPetOwnerRoute = !isVetRoute && 
        (currentPath.startsWith('/dashboard') || 
         currentPath.startsWith('/my-') || 
         currentPath === '/appointments' || 
         currentPath === '/prescriptions' ||
         currentPath === '/payments' ||
         currentPath === '/profile' ||
         currentPath.startsWith('/booking/'));
      
      const isVet = profile.user_type === 'vet';
      
      if (isVet && isPetOwnerRoute) {
        navigate('/vet-dashboard', { replace: true });
      } else if (!isVet && isVetRoute) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isReady, user, profile, location.pathname, allowedUserTypes, navigate]);

  if (!isReady || isCheckingUserType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the location they were trying to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user type is allowed for this route
  if (allowedUserTypes && profile && !allowedUserTypes.includes(profile.user_type as 'pet_owner' | 'vet')) {
    // Redirect to appropriate dashboard based on user type
    return <Navigate to={profile.user_type === 'vet' ? '/vet-dashboard' : '/dashboard'} replace />;
  }

  // If children is a function, call it with profile
  if (typeof children === 'function') {
    return <>{children({ profile })}</>;
  }

  return <>{children}</>;
};

export default RouteGuard;
