import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, BarChart3 } from 'lucide-react';
import SystemAdminAuth from '../components/SystemAdminAuth';
import AdminDashboard from './AdminDashboard';
import UserManagementPage from './UserManagementPage';
import type { AdminProfile } from '../types';

export default function SystemAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const navigate = useNavigate();

  // Debug navigation changes
  useEffect(() => {
    console.log('🔄 SystemAdmin currentPage changed to:', currentPage);
  }, [currentPage]);

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
      <div className="bg-secondary-800 text-white px-4 py-3 border-b border-secondary-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-semibold">System Administrator Mode</h1>
              <p className="text-sm text-secondary-100">Full system access and control</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-secondary-100 hover:text-white transition-colors text-sm"
            >
              Return to Main Site
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-secondary-700 hover:bg-secondary-900 px-3 py-2 rounded-md transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentPage === 'dashboard'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </div>
            </button>
            
            <button
              onClick={() => setCurrentPage('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentPage === 'users'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1">
        {renderCurrentPage()}
      </div>
    </div>
  );

  function renderCurrentPage() {
    switch (currentPage) {
      case 'users':
        return (
          <div className="bg-gray-50 min-h-screen">
            <UserManagementPage currentProfile={systemAdminProfile} />
          </div>
        );
      case 'dashboard':
      default:
        return (
          <AdminDashboard 
            currentProfile={systemAdminProfile} 
            onNavigate={setCurrentPage}
          />
        );
    }
  }
}