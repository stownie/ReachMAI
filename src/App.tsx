import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import AuthModal from './components/AuthModal';
import SchedulePage from './pages/SchedulePage';
import AttendancePage from './pages/AttendancePage';
import AssignmentPage from './pages/AssignmentPage';
import BillingPage from './pages/BillingPage';
import PayrollPage from './pages/PayrollPage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import BulkCommunicationsPage from './pages/BulkCommunicationsPage';
import AdminDashboard from './pages/AdminDashboard';
import UserManagementPage from './pages/UserManagementPage';
import OrganizationManagementPage from './pages/OrganizationManagementPage';
import TeacherClearanceManagementPage from './pages/TeacherClearanceManagementPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SystemAdminPage from './pages/SystemAdminPage';
import { MobileDashboard } from './pages/MobileDashboard';
import type { UserProfile } from './types';
import { Calendar, Users, BookOpen, Clock, DollarSign, Bell, BarChart3, Settings, Building, Shield } from 'lucide-react';

function AppContent() {
  const { currentProfile, account, isAuthenticated, logout, switchProfile, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Mobile detection - MUST come before any early returns
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper function to check if user has system admin access (for system admin page only)
  const isSystemAdmin = (profile: UserProfile | null): boolean => {
    if (!profile) return false;
    
    // Check if profile type is admin
    if (profile.type === 'admin') return true;
    
    // Check if user is system owner by email (regardless of profile type)
    const systemOwnerEmails = ['admin@musicalartsinstitute.org', 'stownsend@musicalartsinstitute.org'];
    return Boolean(profile.email && systemOwnerEmails.includes(profile.email.toLowerCase()));
  };

  // Show loading spinner while initializing - AFTER all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Temporary debug - remove after fixing
  console.log('🔍 Auth State Check:', {
    isAuthenticated,
    hasAccount: !!account,
    hasCurrentProfile: !!currentProfile,
    profileType: currentProfile?.type,
    profileEmail: currentProfile?.email
  });

  const handleProfileSwitch = (profileId: string) => {
    switchProfile(profileId);
  };

  const handleSignOut = () => {
    logout();
    setCurrentPage('dashboard');
  };

  const handleShowAuth = () => {
    setShowAuthModal(true);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const getDashboardCards = () => {
    if (!currentProfile) return [];

    const baseCards = [
      {
        title: 'Schedule',
        description: 'View and manage your calendar',
        icon: Calendar,
        color: 'bg-primary',
        href: '/schedule'
      },
      {
        title: 'Assignments',
        description: 'Track assignments and progress',
        icon: BookOpen,
        color: 'bg-secondary',
        href: '/assignments'
      },
      {
        title: 'Notifications',
        description: 'Stay updated with important messages',
        icon: Bell,
        color: 'bg-yellow-600',
        href: '/notifications'
      },
    ];

    // Check if user has admin access (by profile type or system owner email)
    if (isSystemAdmin(currentProfile)) {
      return [
        {
          title: 'Users',
          description: 'Manage all platform users',
          icon: Users,
          color: 'bg-blue-600',
          href: '/users'
        },
        {
          title: 'Organizations',
          description: 'Manage organizations and campuses',
          icon: Building,
          color: 'bg-emerald-600',
          href: '/organizations'
        },
        {
          title: 'Teacher Clearances',
          description: 'Manage teacher certifications and clearances',
          icon: Shield,
          color: 'bg-purple-600',
          href: '/teacher-clearances'
        },
        {
          title: 'Schedule',
          description: 'View and manage schedules',
          icon: Calendar,
          color: 'bg-primary',
          href: '/schedule'
        },
        {
          title: 'Analytics',
          description: 'View reports and insights',
          icon: BarChart3,
          color: 'bg-green-600',
          href: '/analytics'
        },
        {
          title: 'Settings',
          description: 'Manage system settings',
          icon: Settings,
          color: 'bg-gray-600',
          href: '/admin-settings'
        },
        {
          title: 'Billing',
          description: 'Manage billing and payments',
          icon: DollarSign,
          color: 'bg-yellow-500',
          href: '/admin-billing'
        },
        {
          title: 'Communications',
          description: 'Send bulk communications',
          icon: Bell,
          color: 'bg-purple-600',
          href: '/bulk-communications'
        },
      ];
    }

    switch (currentProfile.type) {
      case 'student':
        return [
          ...baseCards,
          {
            title: 'Progress',
            description: 'Track your learning progress',
            icon: Clock,
            color: 'bg-purple-500',
            href: '/progress'
          },
        ];
      
      case 'parent':
        return [
          ...baseCards,
          {
            title: 'Students',
            description: 'Manage your children\'s profiles',
            icon: Users,
            color: 'bg-green-500',
            href: '/students'
          },
          {
            title: 'Billing',
            description: 'View invoices and payments',
            icon: DollarSign,
            color: 'bg-blue-500',
            href: '/billing'
          },
        ];
      
      case 'teacher':
        return [
          ...baseCards,
          {
            title: 'Classes',
            description: 'Manage your teaching schedule',
            icon: Users,
            color: 'bg-secondary',
            href: '/classes'
          },
          {
            title: 'Attendance',
            description: 'Track student attendance',
            icon: Clock,
            color: 'bg-primary',
            href: '/attendance'
          },
          {
            title: 'Payroll',
            description: 'View your payroll and earnings',
            icon: DollarSign,
            color: 'bg-green-600',
            href: '/payroll'
          },
        ];
      
      case 'adult':
        return [
          ...baseCards,
          {
            title: 'Programs',
            description: 'Explore available programs',
            icon: BookOpen,
            color: 'bg-primary',
            href: '/programs'
          },
          {
            title: 'Events',
            description: 'Discover upcoming events',
            icon: Bell,
            color: 'bg-secondary',
            href: '/events'
          },
        ];

      case 'admin':
        return [
          {
            title: 'Users',
            description: 'Manage all platform users',
            icon: Users,
            color: 'bg-blue-600',
            href: '/users'
          },
          {
            title: 'Organizations',
            description: 'Manage organizations and campuses',
            icon: Building,
            color: 'bg-emerald-600',
            href: '/organizations'
          },
          {
            title: 'Teacher Clearances',
            description: 'Manage teacher certifications and clearances',
            icon: Shield,
            color: 'bg-purple-600',
            href: '/teacher-clearances'
          },
          {
            title: 'Schedule',
            description: 'View and manage schedules',
            icon: Calendar,
            color: 'bg-primary',
            href: '/schedule'
          },
          {
            title: 'Analytics',
            description: 'View reports and insights',
            icon: BarChart3,
            color: 'bg-green-600',
            href: '/analytics'
          },
          {
            title: 'Billing',
            description: 'Manage billing and payments',
            icon: DollarSign,
            color: 'bg-yellow-500',
            href: '/billing'
          },
          {
            title: 'Communications',
            description: 'Send bulk communications',
            icon: Bell,
            color: 'bg-purple-600',
            href: '/bulk-communications'
          },
        ];

      case 'manager':
        return [
          {
            title: 'Staff',
            description: 'Manage staff members and invitations',
            icon: Users,
            color: 'bg-purple-600',
            href: '/staff'
          },
          {
            title: 'Schedule',
            description: 'View and manage schedules',
            icon: Calendar,
            color: 'bg-primary',
            href: '/schedule'
          },
          {
            title: 'Analytics',
            description: 'View operational insights',
            icon: BarChart3,
            color: 'bg-green-600',
            href: '/analytics'
          },
          {
            title: 'Communications',
            description: 'Send communications',
            icon: Bell,
            color: 'bg-orange-600',
            href: '/bulk-communications'
          },
        ];
      
      default:
        return baseCards;
    }
  };

  const dashboardCards = getDashboardCards();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'users':
      case 'staff':
        return currentProfile ? <UserManagementPage currentProfile={currentProfile as any} /> : null;
      case 'organizations':
        return <OrganizationManagementPage />;
      case 'teacher-clearances':
        return <TeacherClearanceManagementPage />;
      case 'schedule':
        return currentProfile ? <SchedulePage currentProfile={currentProfile} /> : null;
      case 'attendance':
        return <AttendancePage />;
      case 'assignments':
        return <AssignmentPage />;
      case 'billing':
        return <BillingPage />;
      case 'payroll':
        return <PayrollPage />;
      case 'notifications':
        return <NotificationsPage currentProfile={currentProfile} />;
      case 'messages':
        return <MessagesPage currentProfile={currentProfile} />;
      case 'bulk-communications':
        return <BulkCommunicationsPage />;
      case 'dashboard':
      default:
        return isAuthenticated && currentProfile ? (
          // Authenticated User Dashboard Content
          <div className="px-4 py-8">
            <div className="container mx-auto">
              {(currentProfile.type === 'admin' || currentProfile.type === 'manager') ? (
                <AdminDashboard 
                  currentProfile={currentProfile as any} 
                  onNavigate={setCurrentPage}
                />
              ) : (
                // Regular Authenticated Dashboard
                <>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Welcome back, {currentProfile.preferredName || currentProfile.firstName}!
                    </h1>
                    <p className="text-gray-600 text-lg">
                      Here's your personalized MAI dashboard.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {dashboardCards.map((card) => {
                      const IconComponent = card.icon;
                      return (
                        <div 
                          key={card.title}
                          onClick={() => handleNavigate(card.href.replace('/', ''))}
                          className="bg-white rounded-lg shadow-brand hover:shadow-brand-lg transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 border border-gray-200"
                        >
                          <div className="p-6">
                            <div className="flex items-center mb-4">
                              <div className={`p-3 rounded-lg ${card.color} text-white shadow-md`}>
                                <IconComponent className="h-6 w-6" />
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                              {card.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {card.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recent Activity Section */}
                  <div className="bg-white rounded-lg shadow-brand p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Schedule updated</p>
                          <p className="text-xs text-gray-500">New class added to your schedule</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Assignment submitted</p>
                          <p className="text-xs text-gray-500">Math homework completed successfully</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Payment reminder</p>
                          <p className="text-xs text-gray-500">Invoice due in 3 days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          // Public Landing Page with Hero
          <>
            <Hero currentProfile={undefined} onShowAuth={handleShowAuth} />
            <main className="container mx-auto px-4 py-12">
              <div>
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Comprehensive MAI Platform
                  </h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Experience our demo with different user profiles to see how ReachMAI serves 
                    students, parents, teachers, and adult learners.
                  </p>
                </div>

                {/* Call to Action */}
                <div className="text-center mb-12">
                  <button
                    onClick={handleShowAuth}
                    className="bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Get Started Today
                  </button>
                  <p className="text-gray-600 mt-4">
                    Already have an account?{' '}
                    <button
                      onClick={handleShowAuth}
                      className="text-amber-700 hover:text-amber-800 font-medium underline"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>



                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-brand border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Multi-User Profiles</h3>
                    <p className="text-gray-600">
                      Support for students, parents, teachers, and adult learners with role-based access and profile switching.
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-brand border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Comprehensive Features</h3>
                    <p className="text-gray-600">
                      Scheduling, enrollment, attendance, billing, payroll, and communication tools all in one platform.
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Modern Architecture</h3>
                    <p className="text-gray-600">
                      Built with React, TypeScript, and modern web standards for performance and scalability.
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </>
        );
    }
  };

  // Mobile-first rendering for authenticated users
  if (isMobile && currentProfile && currentPage === 'dashboard') {
    return <MobileDashboard userProfile={currentProfile} />;
  }

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent">
      <Header 
        currentAccount={account || undefined}
        currentProfile={currentProfile || undefined}
        onProfileSwitch={handleProfileSwitch}
        onSignOut={handleSignOut}
        onShowAuth={handleShowAuth}
        onNavigate={handleNavigate}
      />
      
      {renderCurrentPage()}
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

// Main App component with Auth Provider
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/systemadmin" element={<SystemAdminPage />} />
        <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
        <Route path="/setup-profile" element={<ProfileSetupPage />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;