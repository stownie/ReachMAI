import { addDays, subDays, subHours } from 'date-fns';
import type { 
  Notification, 
  NotificationPreferences, 
  Message, 
  MessageThread, 
  Campaign, 
  Announcement,
  NotificationTemplate
} from '../types';

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    recipientId: 'parent-1',
    recipientType: 'profile',
    type: 'billing_reminder',
    category: 'billing',
    title: 'Payment Reminder',
    message: 'Your November tuition payment of $180.00 is due in 3 days.',
    data: { invoiceId: 'inv-2024-11-001', amount: 180.00 },
    channels: ['email', 'in_app'],
    priority: 'medium',
    status: 'delivered',
    sentAt: subHours(new Date(), 2),
    actionUrl: '/billing',
    actionText: 'View Invoice',
    createdBy: 'system',
    createdAt: subHours(new Date(), 2),
    updatedAt: subHours(new Date(), 2)
  },
  {
    id: 'notif-2',
    recipientId: 'student-1',
    recipientType: 'profile',
    type: 'assignment_due',
    category: 'assignments',
    title: 'Assignment Due Tomorrow',
    message: 'Your Music Theory worksheet is due tomorrow at 5:00 PM.',
    data: { assignmentId: 'assign-1', dueDate: addDays(new Date(), 1) },
    channels: ['in_app', 'email'],
    priority: 'high',
    status: 'sent',
    sentAt: subHours(new Date(), 1),
    actionUrl: '/assignments',
    actionText: 'View Assignment',
    createdBy: 'teacher-1',
    createdAt: subHours(new Date(), 1),
    updatedAt: subHours(new Date(), 1)
  },
  {
    id: 'notif-3',
    recipientId: 'teacher-1',
    recipientType: 'profile',
    type: 'class_cancelled',
    category: 'scheduling',
    title: 'Class Cancelled',
    message: 'Your 3:00 PM Piano Lesson with Emma has been cancelled due to illness.',
    data: { meetingId: 'meeting-123', studentName: 'Emma' },
    channels: ['sms', 'in_app', 'email'],
    priority: 'high',
    status: 'delivered',
    sentAt: subHours(new Date(), 4),
    actionUrl: '/schedule',
    actionText: 'View Schedule',
    createdBy: 'parent-2',
    createdAt: subHours(new Date(), 4),
    updatedAt: subHours(new Date(), 4)
  },
  {
    id: 'notif-4',
    recipientId: 'parent-1',
    recipientType: 'profile',
    type: 'enrollment_confirmation',
    category: 'enrollment',
    title: 'Enrollment Confirmed',
    message: 'Sophie has been successfully enrolled in Advanced Piano for the Spring 2025 term.',
    data: { sectionId: 'section-piano-adv', studentName: 'Sophie', term: 'Spring 2025' },
    channels: ['email', 'in_app'],
    priority: 'medium',
    status: 'read',
    sentAt: subDays(new Date(), 1),
    readAt: subHours(new Date(), 8),
    actionUrl: '/enrollment',
    actionText: 'View Enrollment',
    createdBy: 'admin-1',
    createdAt: subDays(new Date(), 1),
    updatedAt: subHours(new Date(), 8)
  },
  {
    id: 'notif-5',
    recipientId: 'teacher-1',
    recipientType: 'profile',
    type: 'payroll_ready',
    category: 'system',
    title: 'Payroll Available',
    message: 'Your November payroll statement is ready for review.',
    data: { payrollId: 'payroll-teacher-1-nov-2024', amount: 1134.16 },
    channels: ['email', 'in_app'],
    priority: 'medium',
    status: 'delivered',
    sentAt: subDays(new Date(), 2),
    actionUrl: '/payroll',
    actionText: 'View Payroll',
    createdBy: 'system',
    createdAt: subDays(new Date(), 2),
    updatedAt: subDays(new Date(), 2)
  }
];

// Mock Message Threads
export const mockMessageThreads: MessageThread[] = [
  {
    id: 'thread-1',
    subject: 'Piano Lesson Schedule Question',
    participants: ['parent-1', 'teacher-1'],
    threadType: 'direct',
    isArchived: false,
    lastMessageAt: subHours(new Date(), 3),
    lastMessagePreview: 'Thank you for clarifying the makeup lesson policy...',
    unreadCount: {
      'parent-1': 0,
      'teacher-1': 1
    },
    createdBy: 'parent-1',
    createdAt: subDays(new Date(), 2),
    updatedAt: subHours(new Date(), 3)
  },
  {
    id: 'thread-2',
    subject: 'Spring Recital Planning',
    participants: ['teacher-1', 'teacher-2', 'admin-1'],
    threadType: 'group',
    isArchived: false,
    lastMessageAt: subHours(new Date(), 1),
    lastMessagePreview: 'I think we should schedule the dress rehearsal for...',
    unreadCount: {
      'teacher-1': 2,
      'teacher-2': 0,
      'admin-1': 2
    },
    createdBy: 'admin-1',
    createdAt: subDays(new Date(), 5),
    updatedAt: subHours(new Date(), 1)
  }
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    senderId: 'parent-1',
    recipientIds: ['teacher-1'],
    subject: 'Piano Lesson Schedule Question',
    content: 'Hi Ms. Johnson, I wanted to ask about the makeup lesson policy for when my daughter Sophie is sick. Can we reschedule within the same week?',
    messageType: 'direct',
    priority: 'normal',
    status: 'read',
    attachments: [],
    sentAt: subDays(new Date(), 2),
    readAt: subDays(new Date(), 2),
    createdAt: subDays(new Date(), 2),
    updatedAt: subDays(new Date(), 2)
  },
  {
    id: 'msg-2',
    threadId: 'thread-1',
    senderId: 'teacher-1',
    recipientIds: ['parent-1'],
    content: 'Hi Sarah, absolutely! We can reschedule within the same week as long as I have an available slot. I typically have flexibility on weekday afternoons. Just let me know as soon as possible when Sophie is feeling unwell.',
    messageType: 'direct',
    priority: 'normal',
    status: 'read',
    attachments: [],
    replyToId: 'msg-1',
    sentAt: subDays(new Date(), 1),
    readAt: subDays(new Date(), 1),
    createdAt: subDays(new Date(), 1),
    updatedAt: subDays(new Date(), 1)
  },
  {
    id: 'msg-3',
    threadId: 'thread-1',
    senderId: 'parent-1',
    recipientIds: ['teacher-1'],
    content: 'Thank you for clarifying the makeup lesson policy. That flexibility really helps with our busy schedule!',
    messageType: 'direct',
    priority: 'normal',
    status: 'sent',
    attachments: [],
    replyToId: 'msg-2',
    sentAt: subHours(new Date(), 3),
    createdAt: subHours(new Date(), 3),
    updatedAt: subHours(new Date(), 3)
  }
];

// Mock Notification Preferences
export const mockNotificationPreferences: NotificationPreferences[] = [
  {
    id: 'prefs-parent-1',
    userId: 'user-1',
    profileId: 'parent-1',
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
        enabled: true,
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
      endTime: '07:00',
      timezone: 'America/New_York',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    isActive: true,
    createdAt: subDays(new Date(), 30),
    updatedAt: subDays(new Date(), 5)
  }
];

// Mock Campaigns
export const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    organizationId: 'org-mai',
    name: 'November Billing Reminders',
    description: 'Monthly billing reminder campaign for all families',
    type: 'reminder',
    status: 'sent',
    content: {
      subject: 'Your November Tuition Payment is Due',
      htmlContent: '<h1>Payment Reminder</h1><p>Dear {{parentName}}, your tuition payment of {{amount}} is due on {{dueDate}}.</p>',
      textContent: 'Dear {{parentName}}, your tuition payment of {{amount}} is due on {{dueDate}}.',
      attachments: []
    },
    audienceFilter: {
      userTypes: ['parent'],
      enrollmentStatus: ['enrolled']
    },
    channels: ['email', 'in_app'],
    sentAt: subDays(new Date(), 3),
    stats: {
      totalRecipients: 45,
      sent: 45,
      delivered: 43,
      opened: 38,
      clicked: 12,
      failed: 2,
      unsubscribed: 0,
      bounced: 0
    },
    createdBy: 'admin-1',
    createdAt: subDays(new Date(), 5),
    updatedAt: subDays(new Date(), 3)
  }
];

// Mock Announcements
export const mockAnnouncements: Announcement[] = [
  {
    id: 'announce-1',
    organizationId: 'org-mai',
    title: 'Holiday Schedule Changes',
    content: 'Please note that MAI will be closed from December 23rd through January 2nd for the winter holiday break. All classes will resume on January 3rd, 2025. Make-up lessons for missed classes will be scheduled during the first week of January.',
    type: 'general',
    priority: 'medium',
    targetAudience: {
      userTypes: ['parent', 'student', 'teacher', 'adult']
    },
    isPublished: true,
    publishedAt: subDays(new Date(), 7),
    expiresAt: addDays(new Date(), 30),
    isPinned: true,
    allowComments: false,
    attachments: [],
    readBy: ['parent-1', 'student-1'],
    createdBy: 'admin-1',
    createdAt: subDays(new Date(), 7),
    updatedAt: subDays(new Date(), 7)
  },
  {
    id: 'announce-2',
    organizationId: 'org-mai',
    title: 'Spring Recital Auditions',
    content: 'Auditions for the Spring 2025 Recital will be held on February 15th and 16th. Students who wish to participate should sign up with their teachers by February 1st. This is a wonderful opportunity to showcase your progress and perform for family and friends.',
    type: 'event',
    priority: 'high',
    targetAudience: {
      userTypes: ['student', 'parent', 'teacher']
    },
    isPublished: true,
    publishedAt: subDays(new Date(), 3),
    expiresAt: new Date(2025, 1, 20), // February 20, 2025
    isPinned: false,
    allowComments: true,
    attachments: [],
    readBy: [],
    createdBy: 'admin-1',
    createdAt: subDays(new Date(), 3),
    updatedAt: subDays(new Date(), 3)
  }
];

// Mock Notification Templates
export const mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'template-billing-reminder',
    organizationId: 'org-mai',
    name: 'Billing Reminder',
    type: 'billing_reminder',
    category: 'billing',
    channels: ['email', 'in_app'],
    subject: 'Payment Reminder - {{invoiceNumber}}',
    htmlContent: `
      <h2>Payment Reminder</h2>
      <p>Dear {{parentName}},</p>
      <p>This is a friendly reminder that your tuition payment of <strong>{{amount}}</strong> is due on <strong>{{dueDate}}</strong>.</p>
      <p><strong>Invoice Details:</strong></p>
      <ul>
        <li>Invoice Number: {{invoiceNumber}}</li>
        <li>Student(s): {{studentNames}}</li>
        <li>Amount Due: {{amount}}</li>
        <li>Due Date: {{dueDate}}</li>
      </ul>
      <p>You can make your payment online through your family portal or contact our office for other payment options.</p>
      <p>Thank you for your prompt attention to this matter.</p>
      <p>Best regards,<br>MAI Administration</p>
    `,
    textContent: `Payment Reminder - {{invoiceNumber}}

Dear {{parentName}},

This is a friendly reminder that your tuition payment of {{amount}} is due on {{dueDate}}.

Invoice Details:
- Invoice Number: {{invoiceNumber}}
- Student(s): {{studentNames}}
- Amount Due: {{amount}}
- Due Date: {{dueDate}}

You can make your payment online through your family portal or contact our office for other payment options.

Thank you for your prompt attention to this matter.

Best regards,
MAI Administration`,
    variables: [
      { name: 'parentName', description: 'Parent or guardian name', type: 'string', required: true, example: 'Sarah Johnson' },
      { name: 'amount', description: 'Payment amount', type: 'currency', required: true, example: '$180.00' },
      { name: 'dueDate', description: 'Payment due date', type: 'date', required: true, example: 'December 1, 2024' },
      { name: 'invoiceNumber', description: 'Invoice number', type: 'string', required: true, example: 'INV-2024-11-001' },
      { name: 'studentNames', description: 'Comma-separated student names', type: 'string', required: true, example: 'Sophie Johnson, Emma Johnson' }
    ],
    isActive: true,
    isSystem: true,
    createdAt: subDays(new Date(), 90),
    updatedAt: subDays(new Date(), 30)
  }
];

// Helper functions for mock data
export function getMockNotifications(recipientId?: string, unreadOnly?: boolean): Notification[] {
  let notifications = mockNotifications;
  
  if (recipientId) {
    notifications = notifications.filter(n => n.recipientId === recipientId);
  }
  
  if (unreadOnly) {
    notifications = notifications.filter(n => n.status !== 'read');
  }
  
  return notifications.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
}

export function getMockMessageThreads(participantId?: string): MessageThread[] {
  let threads = mockMessageThreads;
  
  if (participantId) {
    threads = threads.filter(t => t.participants.includes(participantId));
  }
  
  return threads.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}

export function getMockMessages(threadId: string): Message[] {
  return mockMessages
    .filter(m => m.threadId === threadId)
    .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
}

export function getMockAnnouncements(userType?: string): Announcement[] {
  let announcements = mockAnnouncements.filter(a => a.isPublished);
  
  if (userType) {
    announcements = announcements.filter(a => 
      a.targetAudience.userTypes.includes(userType as any)
    );
  }
  
  return announcements.sort((a, b) => {
    // Pinned announcements first, then by date
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0);
  });
}

export function getNotificationStats(recipientId?: string) {
  const notifications = getMockNotifications(recipientId);
  
  return {
    total: notifications.length,
    unread: notifications.filter(n => n.status !== 'read').length,
    byCategory: {
      billing: notifications.filter(n => n.category === 'billing').length,
      scheduling: notifications.filter(n => n.category === 'scheduling').length,
      assignments: notifications.filter(n => n.category === 'assignments').length,
      enrollment: notifications.filter(n => n.category === 'enrollment').length,
      system: notifications.filter(n => n.category === 'system').length,
      messages: notifications.filter(n => n.category === 'messages').length,
      announcements: notifications.filter(n => n.category === 'announcements').length,
      attendance: notifications.filter(n => n.category === 'attendance').length
    },
    byPriority: {
      low: notifications.filter(n => n.priority === 'low').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      high: notifications.filter(n => n.priority === 'high').length,
      urgent: notifications.filter(n => n.priority === 'urgent').length
    }
  };
}