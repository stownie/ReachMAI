import { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  User, 
  Bell,
  Book,
  CreditCard,
  Users,
  Clock,
  Settings,
  Search,
  Plus,
  Menu,
  X
} from 'lucide-react';
import type { MobileNavigation, QuickAction, UserProfileType } from '../types';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentUser?: any;
  userType: UserProfileType;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function MobileLayout({ 
  children, 
  currentUser, 
  userType, 
  currentPage, 
  onNavigate 
}: MobileLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications] = useState(3); // Mock notification count
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigation = getMobileNavigation(userType);
  const quickActions = getQuickActions(userType);

  const handleNavigate = (route: string) => {
    onNavigate(route);
    setIsMenuOpen(false);
  };

  const getIcon = (iconName: string, className: string = "h-6 w-6") => {
    const icons: Record<string, any> = {
      home: Home,
      calendar: Calendar,
      messages: MessageSquare,
      user: User,
      bell: Bell,
      book: Book,
      credit_card: CreditCard,
      users: Users,
      clock: Clock,
      settings: Settings,
      search: Search,
      plus: Plus
    };
    
    const IconComponent = icons[iconName] || Home;
    return <IconComponent className={className} />;
  };

  if (!isMobile) {
    // Return desktop layout for larger screens
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Logo/Title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900">ReachMAI</h1>
          </div>

          {/* Notifications */}
          <button
            onClick={() => handleNavigate('notifications')}
            className="relative p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Bell className="h-6 w-6" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Slide-out Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="mt-4">
              {navigation.primaryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleNavigate(tab.route)}
                  className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${
                    currentPage === tab.route ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600' : 'text-gray-700'
                  }`}
                >
                  {getIcon(tab.icon, "h-5 w-5 mr-3")}
                  <span className="font-medium">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* User Profile Section */}
            {currentUser && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {currentUser.firstName} {currentUser.lastName}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{userType}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Quick Actions FAB */}
      <QuickActionsFAB actions={quickActions} onAction={handleNavigate} />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex">
          {navigation.bottomNavigation.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavigate(tab.route)}
              className={`flex-1 flex flex-col items-center py-2 px-1 ${
                currentPage === tab.route 
                  ? 'text-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                {getIcon(tab.icon, "h-6 w-6")}
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// Quick Actions Floating Action Button
function QuickActionsFAB({ 
  actions, 
  onAction 
}: { 
  actions: QuickAction[]; 
  onAction: (action: string) => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      plus: Plus,
      calendar: Calendar,
      messages: MessageSquare,
      search: Search,
      clock: Clock
    };
    
    const IconComponent = icons[iconName] || Plus;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="fixed bottom-24 right-4 z-30">
      {/* Quick Action Items */}
      {isOpen && (
        <div className="mb-4 space-y-2">
          {actions.filter(action => action.isVisible).map((action) => (
            <button
              key={action.id}
              onClick={() => {
                onAction(action.action);
                setIsOpen(false);
              }}
              className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
              title={action.label}
            >
              {getIcon(action.icon)}
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <Plus className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}

// Navigation configuration based on user type
function getMobileNavigation(userType: UserProfileType): MobileNavigation {
  const baseNavigation = {
    primaryTabs: [
      { id: 'dashboard', label: 'Dashboard', icon: 'home', route: 'dashboard', isEnabled: true, requiresAuth: true },
      { id: 'schedule', label: 'Schedule', icon: 'calendar', route: 'schedule', isEnabled: true, requiresAuth: true },
      { id: 'messages', label: 'Messages', icon: 'messages', route: 'messages', badge: 2, isEnabled: true, requiresAuth: true },
      { id: 'profile', label: 'Profile', icon: 'user', route: 'profile', isEnabled: true, requiresAuth: true },
    ],
    bottomNavigation: [
      { id: 'home', label: 'Home', icon: 'home', route: 'dashboard', isEnabled: true, requiresAuth: true },
      { id: 'schedule', label: 'Schedule', icon: 'calendar', route: 'schedule', isEnabled: true, requiresAuth: true },
      { id: 'messages', label: 'Messages', icon: 'messages', route: 'messages', badge: 2, isEnabled: true, requiresAuth: true },
      { id: 'more', label: 'More', icon: 'user', route: 'profile', isEnabled: true, requiresAuth: true },
    ]
  };

  switch (userType) {
    case 'student':
      return {
        userType,
        ...baseNavigation,
        primaryTabs: [
          ...baseNavigation.primaryTabs,
          { id: 'assignments', label: 'Assignments', icon: 'book', route: 'assignments', badge: 3, isEnabled: true, requiresAuth: true },
          { id: 'attendance', label: 'Attendance', icon: 'clock', route: 'attendance', isEnabled: true, requiresAuth: true },
        ],
        quickActions: [
          { id: 'quick_checkin', label: 'Quick Check-in', icon: 'clock', action: 'checkin', isVisible: true },
          { id: 'new_message', label: 'New Message', icon: 'messages', action: 'messages/new', isVisible: true },
        ]
      };

    case 'parent':
      return {
        userType,
        ...baseNavigation,
        primaryTabs: [
          ...baseNavigation.primaryTabs,
          { id: 'students', label: 'My Students', icon: 'users', route: 'students', isEnabled: true, requiresAuth: true },
          { id: 'billing', label: 'Billing', icon: 'credit_card', route: 'billing', isEnabled: true, requiresAuth: true },
        ],
        quickActions: [
          { id: 'new_message', label: 'Message Teacher', icon: 'messages', action: 'messages/new', isVisible: true },
          { id: 'schedule_view', label: 'Schedule', icon: 'calendar', action: 'schedule', isVisible: true },
        ]
      };

    case 'teacher':
      return {
        userType,
        ...baseNavigation,
        primaryTabs: [
          ...baseNavigation.primaryTabs,
          { id: 'classes', label: 'My Classes', icon: 'users', route: 'classes', isEnabled: true, requiresAuth: true },
          { id: 'attendance', label: 'Attendance', icon: 'clock', route: 'attendance', isEnabled: true, requiresAuth: true },
          { id: 'assignments', label: 'Assignments', icon: 'book', route: 'assignments', isEnabled: true, requiresAuth: true },
        ],
        quickActions: [
          { id: 'quick_attendance', label: 'Take Attendance', icon: 'clock', action: 'attendance/quick', isVisible: true },
          { id: 'new_assignment', label: 'New Assignment', icon: 'book', action: 'assignments/new', isVisible: true },
          { id: 'new_message', label: 'New Message', icon: 'messages', action: 'messages/new', isVisible: true },
        ]
      };

    case 'adult':
      return {
        userType,
        ...baseNavigation,
        primaryTabs: [
          ...baseNavigation.primaryTabs,
          { id: 'programs', label: 'Programs', icon: 'book', route: 'programs', isEnabled: true, requiresAuth: true },
          { id: 'events', label: 'Events', icon: 'calendar', route: 'events', isEnabled: true, requiresAuth: true },
        ],
        quickActions: [
          { id: 'new_message', label: 'New Message', icon: 'messages', action: 'messages/new', isVisible: true },
          { id: 'browse_programs', label: 'Browse Programs', icon: 'search', action: 'programs/browse', isVisible: true },
        ]
      };

    default:
      return {
        userType,
        ...baseNavigation,
        quickActions: [
          { id: 'new_message', label: 'New Message', icon: 'messages', action: 'messages/new', isVisible: true },
        ]
      };
  }
}

function getQuickActions(userType: UserProfileType): QuickAction[] {
  const navigation = getMobileNavigation(userType);
  return navigation.quickActions || [];
}