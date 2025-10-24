import { useState, useEffect } from 'react';
import Header from './components/Header'
import Hero from './components/Hero'
import SchedulePage from './pages/SchedulePage'
import AttendancePage from './pages/AttendancePage'
import AssignmentPage from './pages/AssignmentPage'
import BillingPage from './pages/BillingPage'
import PayrollPage from './pages/PayrollPage'
import NotificationsPage from './pages/NotificationsPage'
import MessagesPage from './pages/MessagesPage'
import BulkCommunicationsPage from './pages/BulkCommunicationsPage'
import { MobileDashboard } from './pages/MobileDashboard'
import type { AuthAccount, UserProfile } from './types';
import { mockScenarios, getMockAccountByScenario } from './lib/mockData';
import { Calendar, Users, BookOpen, Clock, DollarSign, Bell } from 'lucide-react';

function App() {
  // Demo state - in real app this would come from auth context
  const [currentAccount, setCurrentAccount] = useState<AuthAccount | undefined>(
    getMockAccountByScenario('complexFamily')
  );
  const [currentProfile, setCurrentProfile] = useState<UserProfile | undefined>(
    currentAccount?.profiles[0]
  );
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleProfileSwitch = (profileId: string) => {
    const profile = currentAccount?.profiles.find(p => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
    }
  };

  const handleSignOut = () => {
    setCurrentAccount(undefined);
    setCurrentProfile(undefined);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const getDashboardCards = () => {
    if (!currentProfile) return [];

    const baseCards = [
      {
        title: 'Schedule',
        description: 'View your upcoming classes and events',
        icon: Calendar,
        color: 'bg-blue-500',
        href: '/schedule'
      },
      {
        title: 'Notifications',
        description: 'View messages and important updates',
        icon: Bell,
        color: 'bg-purple-500',
        href: '/notifications'
      },
      {
        title: 'Messages',
        description: 'Chat with teachers and administrators',
        icon: Users,
        color: 'bg-pink-500',
        href: '/messages'
      },
    ];

    switch (currentProfile.type) {
      case 'student':
        return [
          ...baseCards,
          {
            title: 'Assignments',
            description: 'Check your homework and projects',
            icon: BookOpen,
            color: 'bg-green-500',
            href: '/assignments'
          },
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
            color: 'bg-yellow-500',
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
            color: 'bg-purple-500',
            href: '/classes'
          },
          {
            title: 'Attendance',
            description: 'Track student attendance',
            icon: Clock,
            color: 'bg-orange-500',
            href: '/attendance'
          },
          {
            title: 'Payroll',
            description: 'View your payroll and earnings',
            icon: DollarSign,
            color: 'bg-green-500',
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
            color: 'bg-orange-500',
            href: '/programs'
          },
          {
            title: 'Events',
            description: 'Discover upcoming events',
            icon: Bell,
            color: 'bg-pink-500',
            href: '/events'
          },
        ];
      
      default:
        return baseCards;
    }
  };

  const dashboardCards = getDashboardCards();

  const renderCurrentPage = () => {
    switch (currentPage) {
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
        return (
          <>
            <Hero currentProfile={currentProfile} />
            <main className="container mx-auto px-4 py-12">
              {currentProfile ? (
                // Authenticated Dashboard
                <div>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Your Dashboard
                    </h2>
                    <p className="text-gray-600">
                      Welcome back, {currentProfile.preferredName || currentProfile.firstName}! 
                      Here's what's happening in your MAI experience.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {dashboardCards.map((card) => {
                      const IconComponent = card.icon;
                      return (
                        <div 
                          key={card.title}
                          onClick={() => handleNavigate(card.href.replace('/', ''))}
                          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                        >
                          <div className="p-6">
                            <div className="flex items-center mb-4">
                              <div className={`p-3 rounded-lg ${card.color} text-white`}>
                                <IconComponent className="h-6 w-6" />
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
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
                  <div className="bg-white rounded-lg shadow-md p-6">
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
                </div>
              ) : (
                // Public Landing Page
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

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {Object.entries(mockScenarios).map(([key, scenario]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setCurrentAccount(scenario);
                          setCurrentProfile(scenario.profiles[0]);
                        }}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 text-left"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {scenario.profiles.length} profile(s)
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {scenario.profiles.map((profile, index) => (
                            <span 
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full capitalize"
                            >
                              {profile.type}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Multi-User Profiles</h3>
                      <p className="text-gray-600">
                        Support for students, parents, teachers, and adult learners with role-based access and profile switching.
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
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
              )}
            </main>
          </>
        );
    }
  };

  // Mobile-first rendering for authenticated users
  if (isMobile && currentProfile && currentPage === 'dashboard') {
    return <MobileDashboard userProfile={currentProfile} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentAccount={currentAccount}
        currentProfile={currentProfile}
        onProfileSwitch={handleProfileSwitch}
        onSignOut={handleSignOut}
        onNavigate={handleNavigate}
      />
      
      {renderCurrentPage()}
    </div>
  );
}

export default App
