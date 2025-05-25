
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface SuperAdminGuardProps {
  children: React.ReactNode;
}

const SuperAdminGuard = ({ children }: SuperAdminGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('superAdminAuth');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/superadmin/auth" replace />;
  }

  return <>{children}</>;
};

export default SuperAdminGuard;
