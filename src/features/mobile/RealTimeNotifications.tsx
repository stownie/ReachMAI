import { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  Calendar,
  CreditCard,
  X
} from 'lucide-react';
import type { RealTimeEvent, PushNotification, WebSocketConnection } from '../../types';

interface RealTimeNotificationSystemProps {
  userId: string;
  deviceId: string;
  onNotificationReceived?: (notification: PushNotification) => void;
  onEventReceived?: (event: RealTimeEvent) => void;
}

export default function RealTimeNotificationSystem({
  userId,
  deviceId,
  onNotificationReceived,
  onEventReceived
}: RealTimeNotificationSystemProps) {
  const [, setConnection] = useState<WebSocketConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // WebSocket connection management
  useEffect(() => {
    let reconnectTimeout: number;

    const connect = () => {
      try {
        // In a real app, this would connect to your WebSocket server
        // ws = new WebSocket(`ws://localhost:3001/ws?userId=${userId}&deviceId=${deviceId}`);
        
        // For demo purposes, we'll simulate WebSocket behavior
        simulateWebSocketConnection();
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        scheduleReconnect();
      }
    };

    const simulateWebSocketConnection = () => {
      setIsConnected(true);
      setConnection({
        id: `conn-${Date.now()}`,
        userId,
        deviceId,
        status: 'connected',
        connectedAt: new Date(),
        lastActivity: new Date(),
        subscriptions: ['schedule_updates', 'messages', 'announcements', 'payments']
      });

      // Simulate receiving real-time events
      const eventInterval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance every 5 seconds
          simulateRealTimeEvent();
        }
      }, 5000);

      // Simulate push notifications
      const notificationInterval = setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance every 10 seconds
          simulatePushNotification();
        }
      }, 10000);

      return () => {
        clearInterval(eventInterval);
        clearInterval(notificationInterval);
      };
    };

    const scheduleReconnect = () => {
      setIsConnected(false);
      setConnection(prev => prev ? { ...prev, status: 'reconnecting' } : null);
      
      reconnectTimeout = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 3000) as unknown as number;
    };



    // Initial connection
    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [userId, deviceId]);

  const simulateRealTimeEvent = useCallback(() => {
    const eventTypes = ['schedule_change', 'message_received', 'payment_due', 'announcement'];
    const priorities = ['low', 'medium', 'high'] as const;
    
    const event: RealTimeEvent = {
      id: `event-${Date.now()}`,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)] as any,
      targetUsers: [userId],
      data: {
        title: 'Schedule Update',
        message: 'Your piano lesson has been moved to 3:00 PM',
        classId: 'class-1',
        timestamp: new Date().toISOString()
      },
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      createdAt: new Date(),
      deliveredTo: [],
      readBy: []
    };

    setEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
    onEventReceived?.(event);
  }, [userId, onEventReceived]);

  const simulatePushNotification = useCallback(() => {
    const titles = [
      'Class Reminder',
      'New Message',
      'Payment Due',
      'Schedule Change',
      'Assignment Due'
    ];
    
    const bodies = [
      'Your piano lesson starts in 30 minutes',
      'You have a new message from your teacher',
      'Payment is due in 3 days',
      'Your class has been rescheduled',
      'Assignment due tomorrow'
    ];

    const notification: PushNotification = {
      id: `notif-${Date.now()}`,
      deviceId,
      userId,
      title: titles[Math.floor(Math.random() * titles.length)],
      body: bodies[Math.floor(Math.random() * bodies.length)],
      priority: 'normal',
      status: 'delivered',
      badge: notifications.length + 1,
      createdAt: new Date(),
      deliveredAt: new Date()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep last 20 notifications
    onNotificationReceived?.(notification);

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }, [deviceId, userId, notifications.length, onNotificationReceived]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, clickedAt: new Date() }
          : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'schedule_change':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'message_received':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'payment_due':
        return <CreditCard className="h-5 w-5 text-red-500" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };



  const unreadCount = notifications.filter(n => !n.clickedAt).length;

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>Connecting...</span>
            </>
          )}
        </div>
      </div>

      {/* Notification Bell */}
      <button
        onClick={() => setShowNotificationPanel(!showNotificationPanel)}
        className="fixed top-4 left-4 z-50 relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showNotificationPanel && (
        <div className="fixed top-16 left-4 right-4 max-w-md z-40 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowNotificationPanel(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markNotificationAsRead(notification.id)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.clickedAt ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon('announcement')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.body}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {notification.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.clickedAt && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Event Toasts */}
      <div className="fixed top-20 right-4 z-30 space-y-2">
        {events.slice(0, 3).map((event) => (
          <RealTimeEventToast
            key={event.id}
            event={event}
            onDismiss={() => setEvents(prev => prev.filter(e => e.id !== event.id))}
          />
        ))}
      </div>
    </>
  );
}

// Real-time Event Toast Component
function RealTimeEventToast({ 
  event, 
  onDismiss 
}: { 
  event: RealTimeEvent; 
  onDismiss: () => void; 
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'schedule_change':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'message_received':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'payment_due':
        return <CreditCard className="h-5 w-5 text-red-500" />;
      case 'emergency':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'high':
        return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      default:
        return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  return (
    <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 border-l-4 ${getPriorityStyles(event.priority)}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getEventIcon(event.type)}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {event.data.title || 'Real-time Update'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {event.data.message || 'You have a new update'}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onDismiss}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}