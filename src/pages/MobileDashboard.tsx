import { useState, useEffect } from 'react';
import { Bell, Calendar, MessageSquare, CreditCard, Clock, Users, Book, MapPin, Wifi, WifiOff } from 'lucide-react';
import MobileLayout from '../components/MobileLayout';
import MobileCheckIn from '../features/mobile/MobileCheckIn';
import RealTimeNotifications from '../features/mobile/RealTimeNotifications';
import { OfflineDataManager, useOfflineData } from '../features/mobile/OfflineDataManager';
import type { UserProfile, PushNotification, RealTimeEvent } from '../types';

interface MobileDashboardProps {
  userProfile: UserProfile;
}

export function MobileDashboard({ userProfile }: MobileDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const { isOffline, saveForOffline, getOfflineData } = useOfflineData(userProfile.id);

  useEffect(() => {
    loadDashboardData();
  }, [userProfile]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Try to load from offline storage first
      const cachedData = getOfflineData('dashboard');
      if (cachedData && isOffline) {
        setUpcomingEvents(cachedData.upcomingEvents || []);
        setRecentActivity(cachedData.recentActivity || []);
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockEvents = generateMockEvents();
        const mockActivity = generateMockActivity();
        
        setUpcomingEvents(mockEvents);
        setRecentActivity(mockActivity);
        
        // Save to offline storage
        saveForOffline({
          upcomingEvents: mockEvents,
          recentActivity: mockActivity
        }, 'dashboard');
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockEvents = () => {
    const now = new Date();
    const events = [];
    
    // Generate next few events based on user type
    if (userProfile.type === 'student') {
      events.push(
        {
          id: '1',
          title: 'Piano Lesson',
          time: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
          location: 'Room 101',
          teacher: 'Ms. Johnson',
          type: 'lesson'
        },
        {
          id: '2',
          title: 'Theory Class',
          time: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
          location: 'Room 203',
          teacher: 'Mr. Smith',
          type: 'class'
        }
      );
    } else if (userProfile.type === 'teacher') {
      events.push(
        {
          id: '1',
          title: 'Advanced Piano - Sarah',
          time: new Date(now.getTime() + 30 * 60 * 1000), // 30 mins from now
          location: 'Room 101',
          student: 'Sarah Wilson',
          type: 'lesson'
        },
        {
          id: '2',
          title: 'Group Theory Class',
          time: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
          location: 'Room 203',
          students: 8,
          type: 'class'
        }
      );
    } else if (userProfile.type === 'parent') {
      events.push(
        {
          id: '1',
          title: 'Emma - Piano Lesson',
          time: new Date(now.getTime() + 2 * 60 * 60 * 1000),
          location: 'Room 101',
          teacher: 'Ms. Johnson',
          child: 'Emma',
          type: 'lesson'
        },
        {
          id: '2',
          title: 'Jake - Guitar Class',
          time: new Date(now.getTime() + 4 * 60 * 60 * 1000),
          location: 'Room 105',
          teacher: 'Mr. Davis',
          child: 'Jake',
          type: 'class'
        }
      );
    }
    
    return events;
  };

  const generateMockActivity = () => {
    const activities = [];
    
    if (userProfile.type === 'student') {
      activities.push(
        { id: '1', type: 'assignment', title: 'Practice scales completed', time: '2 hours ago', icon: Book },
        { id: '2', type: 'message', title: 'New message from Ms. Johnson', time: '4 hours ago', icon: MessageSquare },
        { id: '3', type: 'payment', title: 'Monthly tuition payment confirmed', time: '1 day ago', icon: CreditCard }
      );
    } else if (userProfile.type === 'teacher') {
      activities.push(
        { id: '1', type: 'attendance', title: 'Marked attendance for 8 students', time: '1 hour ago', icon: Users },
        { id: '2', type: 'message', title: 'Sent practice reminder to parents', time: '3 hours ago', icon: MessageSquare },
        { id: '3', type: 'schedule', title: 'Updated lesson schedule', time: '5 hours ago', icon: Calendar }
      );
    } else if (userProfile.type === 'parent') {
      activities.push(
        { id: '1', type: 'payment', title: 'Paid Emma\'s piano lesson fee', time: '2 hours ago', icon: CreditCard },
        { id: '2', type: 'message', title: 'Received progress report for Jake', time: '1 day ago', icon: MessageSquare },
        { id: '3', type: 'schedule', title: 'Rescheduled Emma\'s lesson', time: '2 days ago', icon: Calendar }
      );
    }
    
    return activities;
  };

  const formatEventTime = (time: Date) => {
    const now = new Date();
    const diffMs = time.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 0) return 'Past';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return time.toLocaleDateString();
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-100 text-blue-800';
      case 'class': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <MobileLayout 
        userType={userProfile.type} 
        currentPage="dashboard" 
        onNavigate={(page) => console.log('Navigate to:', page)}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <>
      <MobileLayout 
        userType={userProfile.type} 
        currentPage="dashboard" 
        onNavigate={(page) => console.log('Navigate to:', page)}
      >
        <div className="min-h-screen bg-gray-50 pb-20">
          {/* Header with offline indicator */}
          <div className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome back, {userProfile.preferredName || userProfile.firstName}
                </h1>
                <p className="text-sm text-gray-500 capitalize">
                  {userProfile.type} Dashboard
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {isOffline ? (
                  <div className="flex items-center text-amber-600">
                    <WifiOff className="h-4 w-4 mr-1" />
                    <span className="text-xs">Offline</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <Wifi className="h-4 w-4 mr-1" />
                    <span className="text-xs">Online</span>
                  </div>
                )}
                <div className="relative">
                  <Bell className="h-6 w-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-4 bg-white border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => setShowCheckIn(true)}
                className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <MapPin className="h-6 w-6 text-blue-600 mb-1" />
                <span className="text-xs text-blue-800 font-medium">Check In</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Calendar className="h-6 w-6 text-green-600 mb-1" />
                <span className="text-xs text-green-800 font-medium">Schedule</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <MessageSquare className="h-6 w-6 text-purple-600 mb-1" />
                <span className="text-xs text-purple-800 font-medium">Messages</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <CreditCard className="h-6 w-6 text-orange-600 mb-1" />
                <span className="text-xs text-orange-800 font-medium">Billing</span>
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="px-4 py-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Upcoming</h2>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatEventTime(event.time)} • {event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{event.location}</span>
                      {event.teacher && <span className="ml-2">• {event.teacher}</span>}
                      {event.student && <span className="ml-2">• {event.student}</span>}
                      {event.child && <span className="ml-2">• {event.child}</span>}
                      {event.students && <span className="ml-2">• {event.students} students</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming events</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="px-4 py-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <Icon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </MobileLayout>

      {/* Mobile Check-In Modal */}
      {showCheckIn && (
        <MobileCheckIn
          userId={userProfile.id}
          classId="demo-class-1"
          onCheckIn={(checkIn) => {
            console.log('Check-in completed:', checkIn);
            setShowCheckIn(false);
          }}
          onCheckOut={(checkInId) => {
            console.log('Check-out:', checkInId);
            setShowCheckIn(false);
          }}
        />
      )}

      {/* Real-Time Notifications */}
      <RealTimeNotifications
        userId={userProfile.id}
        deviceId="mobile-web-app"
        onNotificationReceived={(notification: PushNotification) => {
          console.log('Notification received:', notification);
          if (notification.category === 'messages') {
            setUnreadCount(prev => prev + 1);
          }
        }}
        onEventReceived={(event: RealTimeEvent) => {
          console.log('Real-time event received:', event);
          // Refresh dashboard data on certain events
          if (['schedule_change', 'payment_due'].includes(event.type)) {
            loadDashboardData();
          }
        }}
      />

      {/* Offline Data Manager */}
      <OfflineDataManager
        userId={userProfile.id}
        onDataSync={(status) => {
          console.log('Sync status changed:', status);
          if (status === 'success') {
            loadDashboardData();
          }
        }}
        onOfflineStatusChange={(offline) => {
          console.log('Offline status changed:', offline);
        }}
      />
    </>
  );
}