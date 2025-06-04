import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const SuperAdminAuth = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Simple password check - in production, use proper authentication
  // Updated password for production deployment
  const SUPER_ADMIN_PASSWORD = 'Furrchum@30days121831';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SUPER_ADMIN_PASSWORD) {
      localStorage.setItem('superAdminAuth', 'true');
      navigate('/superadmin/dashboard');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Super Admin Access</CardTitle>
          <CardDescription>
            Enter the super admin password to access the administrative panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter super admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminAuth;
