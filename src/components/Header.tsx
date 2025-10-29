import React, { useState } from 'react';
import { ChevronDown, LogOut, Settings, Bell, Menu, X } from 'lucide-react';
import type { UserProfile, AuthAccount } from '../types';
import { cn, getInitials } from '../lib/utils';

interface HeaderProps {
  currentAccount?: AuthAccount;
  currentProfile?: UserProfile;
  onProfileSwitch?: (profileId: string) => void;
  onSignOut?: () => void;
  onNavigate?: (page: string) => void;
  onShowAuth?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentAccount,
  currentProfile,
  onProfileSwitch,
  onSignOut,
  onNavigate,
  onShowAuth
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper function to check if user has admin access
  const isSystemAdmin = (profile: UserProfile | null): boolean => {
    if (!profile) return false;
    
    // Check if profile type is admin
    if (profile.type === 'admin') return true;
    
    // Check if user is system owner by email (regardless of profile type)
    const systemOwnerEmails = ['admin@musicalartsinstitute.org', 'stownsend@musicalartsinstitute.org'];
    return Boolean(profile.email && systemOwnerEmails.includes(profile.email.toLowerCase()));
  };

  const getNavItems = () => {
    if (!currentProfile) return [];
    
    const baseItems = [
      { label: 'Dashboard', href: 'dashboard' },
      { label: 'Schedule', href: 'schedule' },
    ];

    // Check if user has admin access (by profile type or system owner email)
    if (isSystemAdmin(currentProfile)) {
      return [
        ...baseItems,
        { label: 'Staff', href: 'staff' },
        { label: 'Users', href: 'users' },
        { label: 'Organizations', href: 'organizations' },
        { label: 'Analytics', href: 'analytics' },
        { label: 'Bulk Comms', href: 'bulk-communications' },
        { label: 'Settings', href: 'admin-settings' },
      ];
    }

    switch (currentProfile.type) {
      case 'student':
        return [
          ...baseItems,
          { label: 'Assignments', href: 'assignments' },
          { label: 'Progress', href: 'progress' },
        ];
      
      case 'parent':
        return [
          ...baseItems,
          { label: 'Students', href: 'students' },
          { label: 'Enrollments', href: 'enrollments' },
          { label: 'Billing', href: 'billing' },
        ];
      
      case 'teacher':
        return [
          ...baseItems,
          { label: 'Classes', href: 'classes' },
          { label: 'Attendance', href: 'attendance' },
          { label: 'Assignments', href: 'assignments' },
          { label: 'Payroll', href: 'payroll' },
          { label: 'Bulk Comms', href: 'bulk-communications' },
        ];
      
      case 'adult':
        return [
          ...baseItems,
          { label: 'Programs', href: 'programs' },
          { label: 'Events', href: 'events' },
        ];
      
      case 'admin':
        return [
          ...baseItems,
          { label: 'Staff', href: 'staff' },
          { label: 'Users', href: 'users' },
          { label: 'Organizations', href: 'organizations' },
          { label: 'Analytics', href: 'analytics' },
          { label: 'Bulk Comms', href: 'bulk-communications' },
          { label: 'Settings', href: 'admin-settings' },
        ];
      
      default:
        return baseItems;
    }
  };

  const getProfileColor = (type: string) => {
    const colors = {
      student: 'bg-primary-400',    // Bright Gold
      parent: 'bg-accent-200',      // Light Cream
      teacher: 'bg-secondary-600',  // Maroon
      adult: 'bg-primary-600',      // Rich Gold
      admin: 'bg-secondary-800',    // Deep Maroon
      manager: 'bg-primary-700',    // Dark Gold
    };
    return colors[type as keyof typeof colors] || 'bg-neutral-500';
  };

  const navItems = getNavItems();

  return (
    <header className="bg-white shadow-brand border-b border-primary-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-3">
            <img 
              src="https://i.imgur.com/ftfheaH_d.png?maxwidth=520&shape=thumb&fidelity=high" 
              alt="ReachMAI Logo" 
              className="h-10 w-auto"
              onError={(e) => {
                // Fallback if image doesn't load
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <h1 
              className="text-2xl font-bold text-primary-700 font-brand"
              style={{ display: 'none' }}
            >
              ReachMAI
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => onNavigate?.(item.href)}
                className="text-neutral-700 hover:text-primary-700 px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary-50 rounded-lg"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {currentProfile && (
              <button className="p-2 text-neutral-600 hover:text-primary-600 transition-all duration-200 hover:bg-primary-50 rounded-lg">
                <Bell className="h-5 w-5" />
              </button>
            )}

            {/* Profile Menu */}
            {currentAccount && currentProfile ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium",
                    getProfileColor(currentProfile.type)
                  )}>
                    {getInitials(currentProfile.firstName, currentProfile.lastName)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {currentProfile.preferredName || currentProfile.firstName}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {currentProfile.type}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {/* Current Profile */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm text-gray-500">Signed in as</div>
                      <div className="font-medium text-gray-900">{currentAccount.email}</div>
                    </div>

                    {/* Profile Switching */}
                    {currentAccount.profiles.length > 1 && (
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Switch Profile
                        </div>
                        {currentAccount.profiles.map((profile) => (
                          <button
                            key={profile.id}
                            onClick={() => {
                              onProfileSwitch?.(profile.id);
                              setIsProfileMenuOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                              profile.id === currentProfile.id && "bg-primary-50 text-primary-600"
                            )}
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium",
                              getProfileColor(profile.type)
                            )}>
                              {getInitials(profile.firstName, profile.lastName)}
                            </div>
                            <div className="text-left">
                              <div className="font-medium">
                                {profile.preferredName || profile.firstName} {profile.lastName}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {profile.type}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Menu Items */}
                    <div className="border-t border-gray-100 py-1">
                      <a
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </a>
                      <button
                        onClick={() => {
                          onSignOut?.();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={onShowAuth}
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={onShowAuth}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-primary-600 transition-all duration-200 hover:bg-primary-50 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-primary-100 py-2 bg-gradient-to-r from-primary-50 to-white">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  onNavigate?.(item.href);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-100 transition-all duration-200 rounded-lg mx-2"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(isProfileMenuOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsProfileMenuOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;