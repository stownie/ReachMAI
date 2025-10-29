import { useState, useEffect } from 'react';
import { Users, Building2, BarChart3, MessageSquare, Settings, Activity, DollarSign } from 'lucide-react';
import type { AdminProfile } from '../types';

interface AdminDashboardProps {
  currentProfile: AdminProfile;
  onNavigate?: (page: string) => void;
}

interface AdminStats {
  totalUsers: number;
  totalOrganizations: number;
  totalEnrollments: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  systemAlerts: number;
}

export default function AdminDashboard({ currentProfile, onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOrganizations: 0,
    totalEnrollments: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    systemAlerts: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from API
    // For now, using mock data
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        totalOrganizations: 15,
        totalEnrollments: 892,
        monthlyRevenue: 45680.50,
        pendingApprovals: 23,
        systemAlerts: 3
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'blue',
      trend: '+12%',
    },
    {
      title: 'Organizations',
      value: stats.totalOrganizations.toString(),
      icon: Building2,
      color: 'green',
      trend: '+2%',
    },
    {
      title: 'Active Enrollments',
      value: stats.totalEnrollments.toLocaleString(),
      icon: Activity,
      color: 'purple',
      trend: '+8%',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'yellow',
      trend: '+15%',
    },
  ];

  const alertCards = [
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals.toString(),
      icon: Settings,
      color: 'orange',
      urgent: stats.pendingApprovals > 20,
    },
    {
      title: 'System Alerts',
      value: stats.systemAlerts.toString(),
      icon: Activity,
      color: 'red',
      urgent: stats.systemAlerts > 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentProfile.preferredName || currentProfile.firstName}
          </h1>
          <p className="text-gray-600 mt-2">
            System administration dashboard for ReachMAI platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium mt-1">{stat.trend} from last month</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {alertCards.map((alert, index) => (
            <div key={index} className={`bg-white rounded-lg shadow-md p-6 ${alert.urgent ? 'border-l-4 border-red-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{alert.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${alert.urgent ? 'text-red-600' : 'text-gray-900'}`}>
                    {alert.value}
                  </p>
                  {alert.urgent && (
                    <p className="text-sm text-red-600 font-medium mt-1">Requires attention</p>
                  )}
                </div>
                <div className={`p-3 rounded-full bg-${alert.color}-100`}>
                  <alert.icon className={`h-6 w-6 text-${alert.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => onNavigate?.('users')}
              className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Manage Users</span>
            </button>
            
            <button 
              onClick={() => onNavigate?.('staff')}
              className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Staff Management</span>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Building2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Organizations</span>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <MessageSquare className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Send Announcements</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent System Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New organization registered</p>
                <p className="text-xs text-gray-500">Central High Academy - 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Bulk enrollment processed</p>
                <p className="text-xs text-gray-500">45 students enrolled - 4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payment gateway update</p>
                <p className="text-xs text-gray-500">System maintenance completed - 6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}