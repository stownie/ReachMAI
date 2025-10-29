import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import SystemAdminAuth from '../components/SystemAdminAuth';
import AdminDashboard from './AdminDashboard';
import type { AdminProfile } from '../types';

export default function SystemAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('systemAdminAuthenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('systemAdminAuthenticated');
    setIsAuthenticated(false);
    navigate('/');
  };

  // Create a mock system admin profile for the dashboard
  const systemAdminProfile: AdminProfile = {
    id: 'system-admin',
    accountId: 'system-account',
    type: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    preferredName: 'System Admin',
    email: 'system@musicalartsinstitute.org',
    phone: undefined,
    preferredContactMethod: 'email',
    emailVerified: true,
    phoneVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    organizationIds: ['all'] // System admin has access to all organizations
  };

  if (!isAuthenticated) {
    return <SystemAdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* System Admin Header */}
      <div className="bg-red-600 text-white px-4 py-3 border-b border-red-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-semibold">System Administrator Mode</h1>
              <p className="text-sm text-red-100">Full system access and control</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-red-100 hover:text-white transition-colors text-sm"
            >
              Return to Main Site
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-700 hover:bg-red-800 px-3 py-2 rounded-md transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Content */}
      <AdminDashboard currentProfile={systemAdminProfile} />
    </div>
  );
}