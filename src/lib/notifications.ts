import { format } from 'date-fns';
import type { 
  Notification, 
  NotificationPreferences, 
  NotificationChannel, 
  NotificationCategory,
  NotificationType,
  CampaignStats 
} from '../types';

// Notification Management Utilities
export function createNotification(params: {
  recipientId: string;
  recipientType: 'user' | 'profile' | 'family' | 'organization';
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionText?: string;
  createdBy: string;
}): Notification {
  const now = new Date();
  
  return {
    id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...params,
    category: getNotificationCategory(params.type),
    channels: params.channels || ['in_app', 'email'],
    priority: params.priority || 'medium',
    status: 'pending',
    createdAt: now,
    updatedAt: now
  };
}

export function getNotificationCategory(type: NotificationType): NotificationCategory {
  const categoryMap: Record<NotificationType, NotificationCategory> = {
    'billing_reminder': 'billing',
    'payment_confirmation': 'billing',
    'payment_failed': 'billing',
    'invoice_generated': 'billing',
    'enrollment_confirmation': 'enrollment',
    'enrollment_reminder': 'enrollment',
    'class_reminder': 'scheduling',
    'class_cancelled': 'scheduling',
    'class_rescheduled': 'scheduling',
    'attendance_alert': 'attendance',
    'assignment_due': 'assignments',
    'assignment_graded': 'assignments',
    'schedule_change': 'scheduling',
    'account_update': 'system',
    'system_maintenance': 'system',
    'emergency_alert': 'announcements',
    'announcement': 'announcements',
    'message_received': 'messages',
    'payroll_ready': 'system'
  };
  
  return categoryMap[type] || 'system';
}

export function shouldSendNotification(
  notification: Notification,
  preferences: NotificationPreferences,
  channel: NotificationChannel
): boolean {
  if (!preferences.isActive) return false;
  
  const channelSettings = preferences.preferences[channel];
  if (!channelSettings.enabled) return false;
  
  // Check category preferences
  const categoryEnabled = channelSettings.categories[notification.category];
  if (categoryEnabled === false) return false;
  
  // Check urgency threshold
  const urgencyLevels = ['low', 'medium', 'high', 'urgent'];
  const notificationUrgency = urgencyLevels.indexOf(notification.priority);
  const thresholdUrgency = urgencyLevels.indexOf(channelSettings.urgencyThreshold);
  
  if (notificationUrgency < thresholdUrgency) return false;
  
  // Check quiet hours
  if (preferences.quietHours?.enabled && channel !== 'push') {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const currentDay = format(now, 'EEEE').toLowerCase() as any;
    
    if (preferences.quietHours.days.includes(currentDay)) {
      const isInQuietHours = isTimeBetween(
        currentTime,
        preferences.quietHours.startTime,
        preferences.quietHours.endTime
      );
      
      if (isInQuietHours && notification.priority !== 'urgent') {
        return false;
      }
    }
  }
  
  return true;
}

function isTimeBetween(time: string, start: string, end: string): boolean {
  const [timeHour, timeMin] = time.split(':').map(Number);
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const timeMinutes = timeHour * 60 + timeMin;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  if (startMinutes <= endMinutes) {
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  } else {
    // Crosses midnight
    return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
  }
}

export function formatNotificationMessage(
  template: string,
  variables: Record<string, any>
): string {
  let message = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    const formattedValue = formatTemplateVariable(value);
    message = message.replace(new RegExp(placeholder, 'g'), formattedValue);
  });
  
  return message;
}

function formatTemplateVariable(value: any): string {
  if (value instanceof Date) {
    return format(value, 'PPP');
  }
  
  if (typeof value === 'number' && value.toString().includes('.')) {
    // Assume currency if decimal
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
  
  return String(value);
}

// Message Management
export function createMessageThread(params: {
  subject: string;
  participants: string[];
  threadType: 'direct' | 'group' | 'announcement';
  createdBy: string;
}): { id: string; subject: string; participants: string[]; threadType: 'direct' | 'group' | 'announcement'; isArchived: boolean; lastMessageAt: Date; lastMessagePreview: string; unreadCount: Record<string, number>; createdBy: string; createdAt: Date; updatedAt: Date } {
  const now = new Date();
  const unreadCount: Record<string, number> = {};
  
  params.participants.forEach(participantId => {
    unreadCount[participantId] = 0;
  });
  
  return {
    id: `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    subject: params.subject,
    participants: params.participants,
    threadType: params.threadType,
    isArchived: false,
    lastMessageAt: now,
    lastMessagePreview: '',
    unreadCount,
    createdBy: params.createdBy,
    createdAt: now,
    updatedAt: now
  };
}

export function calculateCampaignStats(
  deliveryResults: Array<{
    recipientId: string;
    status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced';
  }>
): CampaignStats {
  const stats: CampaignStats = {
    totalRecipients: deliveryResults.length,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    failed: 0,
    unsubscribed: 0,
    bounced: 0
  };
  
  deliveryResults.forEach(result => {
    switch (result.status) {
      case 'sent':
        stats.sent++;
        break;
      case 'delivered':
        stats.delivered++;
        break;
      case 'opened':
        stats.opened++;
        break;
      case 'clicked':
        stats.clicked++;
        break;
      case 'failed':
        stats.failed++;
        break;
      case 'bounced':
        stats.bounced++;
        break;
    }
  });
  
  return stats;
}

// Notification Formatting Helpers
export function getNotificationIcon(type: NotificationType): string {
  const iconMap: Record<NotificationType, string> = {
    'billing_reminder': '💰',
    'payment_confirmation': '✅',
    'payment_failed': '❌',
    'invoice_generated': '📄',
    'enrollment_confirmation': '🎓',
    'enrollment_reminder': '⏰',
    'class_reminder': '📚',
    'class_cancelled': '❌',
    'class_rescheduled': '📅',
    'attendance_alert': '⚠️',
    'assignment_due': '📝',
    'assignment_graded': '✏️',
    'schedule_change': '📅',
    'account_update': '👤',
    'system_maintenance': '🔧',
    'emergency_alert': '🚨',
    'announcement': '📢',
    'message_received': '💬',
    'payroll_ready': '💸'
  };
  
  return iconMap[type] || '📫';
}

export function getNotificationColor(priority: 'low' | 'medium' | 'high' | 'urgent'): string {
  const colorMap = {
    'low': 'text-gray-600 bg-gray-50',
    'medium': 'text-blue-600 bg-blue-50',
    'high': 'text-orange-600 bg-orange-50',
    'urgent': 'text-red-600 bg-red-50'
  };
  
  return colorMap[priority];
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return format(date, 'MMM d');
}

// Default notification preferences
export function createDefaultNotificationPreferences(userId: string, profileId?: string): NotificationPreferences {
  const now = new Date();
  
  return {
    id: `prefs-${userId}-${profileId || 'default'}`,
    userId,
    profileId,
    preferences: {
      email: {
        enabled: true,
        categories: {
          billing: true,
          enrollment: true,
          scheduling: true,
          attendance: true,
          assignments: true,
          system: false,
          messages: true,
          announcements: true
        },
        urgencyThreshold: 'medium'
      },
      sms: {
        enabled: false,
        categories: {
          billing: true,
          enrollment: false,
          scheduling: true,
          attendance: true,
          assignments: false,
          system: false,
          messages: false,
          announcements: false
        },
        urgencyThreshold: 'high'
      },
      push: {
        enabled: true,
        categories: {
          billing: true,
          enrollment: true,
          scheduling: true,
          attendance: true,
          assignments: true,
          system: true,
          messages: true,
          announcements: true
        },
        urgencyThreshold: 'low'
      },
      in_app: {
        enabled: true,
        categories: {
          billing: true,
          enrollment: true,
          scheduling: true,
          attendance: true,
          assignments: true,
          system: true,
          messages: true,
          announcements: true
        },
        urgencyThreshold: 'low'
      }
    },
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'America/New_York',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
}