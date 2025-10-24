import { useState } from 'react';
import { Bell, MessageSquare, Settings, Filter, Check, X, Clock, AlertCircle } from 'lucide-react';
import { getNotificationIcon, getNotificationColor, getRelativeTime } from '../../lib/notifications';
import { getMockNotifications, getMockMessageThreads, getMockAnnouncements, getNotificationStats } from '../../lib/mockNotificationData';
import type { Notification, MessageThread, Announcement } from '../../types';

interface NotificationCenterProps {
  userProfile: any;
}

export default function NotificationCenter({ userProfile }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages' | 'announcements'>('notifications');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Mock data - in real app, this would come from API based on userProfile
  const notifications = getMockNotifications(userProfile?.id, filter === 'unread');
  const messageThreads = getMockMessageThreads(userProfile?.id);
  const announcements = getMockAnnouncements(userProfile?.type);
  const stats = getNotificationStats(userProfile?.id);

  const handleMarkAsRead = (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    // In real app, this would call an API
  };

  const handleMarkAllAsRead = () => {
    console.log('Marking all notifications as read');
    // In real app, this would call an API
  };

  const handleDeleteNotification = (notificationId: string) => {
    console.log('Deleting notification:', notificationId);
    // In real app, this would call an API
  };

  const filteredNotifications = categoryFilter === 'all' 
    ? notifications 
    : notifications.filter(n => n.category === categoryFilter);

  const categories = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'billing', label: 'Billing', count: stats.byCategory.billing },
    { value: 'scheduling', label: 'Schedule', count: stats.byCategory.scheduling },
    { value: 'assignments', label: 'Assignments', count: stats.byCategory.assignments },
    { value: 'messages', label: 'Messages', count: stats.byCategory.messages },
    { value: 'announcements', label: 'Announcements', count: stats.byCategory.announcements }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Center</h1>
            <p className="text-gray-600">
              Stay updated with important messages and announcements
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </button>
            )}
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Message Threads</p>
              <p className="text-2xl font-bold text-gray-900">{messageThreads.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">{stats.byPriority.high + stats.byPriority.urgent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
              {stats.unread > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 py-0.5 px-2 rounded-full text-xs font-medium">
                  {stats.unread}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messages ({messageThreads.length})
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'announcements'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Announcements ({announcements.length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        {activeTab === 'notifications' && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
                    className="block w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All Notifications</option>
                    <option value="unread">Unread Only</option>
                  </select>
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="block w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label} {cat.count > 0 && `(${cat.count})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="divide-y divide-gray-200">
          {activeTab === 'notifications' && (
            <>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                  />
                ))
              ) : (
                <div className="p-12 text-center">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filter === 'unread' ? 'All caught up! No unread notifications.' : 'You have no notifications at this time.'}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'messages' && (
            <>
              {messageThreads.length > 0 ? (
                messageThreads.map((thread) => (
                  <MessageThreadItem key={thread.id} thread={thread} currentUserId={userProfile?.id} />
                ))
              ) : (
                <div className="p-12 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                  <p className="mt-1 text-sm text-gray-500">Start a conversation with teachers or administrators.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'announcements' && (
            <>
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <AnnouncementItem key={announcement.id} announcement={announcement} />
                ))
              ) : (
                <div className="p-12 text-center">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
                  <p className="mt-1 text-sm text-gray-500">No announcements available at this time.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Notification Item Component
function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void; 
  onDelete: (id: string) => void; 
}) {
  const isUnread = notification.status !== 'read';
  
  return (
    <div className={`p-6 hover:bg-gray-50 ${isUnread ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </h4>
              {isUnread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNotificationColor(notification.priority)}`}>
                {notification.priority}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{getRelativeTime(notification.createdAt)}</span>
              <span className="capitalize">{notification.category}</span>
              {notification.actionUrl && (
                <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                  {notification.actionText || 'View'}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {isUnread && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="text-gray-400 hover:text-gray-600"
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="text-gray-400 hover:text-red-600"
            title="Delete notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Message Thread Item Component
function MessageThreadItem({ 
  thread, 
  currentUserId 
}: { 
  thread: MessageThread; 
  currentUserId: string; 
}) {
  const unreadCount = thread.unreadCount[currentUserId] || 0;
  const hasUnread = unreadCount > 0;
  
  return (
    <div className={`p-6 hover:bg-gray-50 cursor-pointer ${hasUnread ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <MessageSquare className="h-5 w-5 text-gray-400 mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`text-sm font-medium ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                {thread.subject}
              </h4>
              {hasUnread && (
                <span className="bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2 truncate">{thread.lastMessagePreview}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{getRelativeTime(thread.lastMessageAt)}</span>
              <span>{thread.participants.length} participants</span>
              <span className="capitalize">{thread.threadType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Announcement Item Component
function AnnouncementItem({ announcement }: { announcement: Announcement }) {
  return (
    <div className="p-6 hover:bg-gray-50">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {announcement.isPinned && (
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-lg font-medium text-gray-900">{announcement.title}</h4>
            {announcement.isPinned && (
              <span className="bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs font-medium">
                Pinned
              </span>
            )}
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNotificationColor(announcement.priority)}`}>
              {announcement.priority}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">{announcement.content}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{announcement.publishedAt ? getRelativeTime(announcement.publishedAt) : 'Draft'}</span>
            <span className="capitalize">{announcement.type}</span>
            {announcement.expiresAt && (
              <span>Expires {getRelativeTime(announcement.expiresAt)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}