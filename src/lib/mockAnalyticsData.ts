import type {
  StudentPerformanceAnalytics,
  FinancialMetrics,
  PaymentAnalytics,
  BudgetForecast,
  OperationalMetrics,
  CommunicationMetrics,
  CustomReport,
  AnalyticsDashboard,
  DashboardWidget
} from '../types';

// Mock Student Performance Analytics
export const mockStudentPerformanceAnalytics: StudentPerformanceAnalytics[] = [
  {
    studentId: 'student-1',
    overallGPA: 3.7,
    attendanceRate: 94.5,
    assignmentCompletionRate: 89.2,
    subjectPerformance: [
      {
        subjectId: 'piano-1',
        subjectName: 'Piano - Intermediate',
        currentGrade: 88,
        averageGrade: 85,
        attendanceRate: 96,
        assignmentCount: 12,
        completedAssignments: 11,
        upcomingAssignments: 3,
        trend: 'improving',
        lastAssessment: new Date('2025-10-20')
      },
      {
        subjectId: 'theory-1',
        subjectName: 'Music Theory',
        currentGrade: 91,
        averageGrade: 87,
        attendanceRate: 93,
        assignmentCount: 8,
        completedAssignments: 7,
        upcomingAssignments: 2,
        trend: 'stable',
        lastAssessment: new Date('2025-10-18')
      }
    ],
    trends: [
      { period: 'September 2025', gpa: 3.5, attendanceRate: 92, assignmentCompletion: 85, date: new Date('2025-09-30') },
      { period: 'October 2025', gpa: 3.7, attendanceRate: 94.5, assignmentCompletion: 89.2, date: new Date('2025-10-24') }
    ],
    riskLevel: 'low',
    recommendations: [
      'Continue current study pattern',
      'Focus on consistent practice schedule',
      'Consider advanced theory topics'
    ],
    lastUpdated: new Date('2025-10-24')
  },
  {
    studentId: 'student-2',
    overallGPA: 2.8,
    attendanceRate: 78.3,
    assignmentCompletionRate: 65.4,
    subjectPerformance: [
      {
        subjectId: 'violin-1',
        subjectName: 'Violin - Beginner',
        currentGrade: 72,
        averageGrade: 75,
        attendanceRate: 75,
        assignmentCount: 10,
        completedAssignments: 6,
        upcomingAssignments: 4,
        trend: 'declining',
        lastAssessment: new Date('2025-10-15')
      }
    ],
    trends: [
      { period: 'September 2025', gpa: 3.0, attendanceRate: 85, assignmentCompletion: 72, date: new Date('2025-09-30') },
      { period: 'October 2025', gpa: 2.8, attendanceRate: 78.3, assignmentCompletion: 65.4, date: new Date('2025-10-24') }
    ],
    riskLevel: 'high',
    recommendations: [
      'Schedule additional practice sessions',
      'Consider reducing class load temporarily',
      'Arrange one-on-one tutoring',
      'Improve attendance consistency'
    ],
    lastUpdated: new Date('2025-10-24')
  }
];

// Mock Financial Metrics
export const mockFinancialMetrics: FinancialMetrics = {
  id: 'metrics-2025-10',
  organizationId: 'org-1',
  period: 'monthly',
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-10-31'),
  totalRevenue: 45800,
  totalExpenses: 32100,
  netProfit: 13700,
  enrollmentRevenue: 38500,
  materialRevenue: 4200,
  eventRevenue: 2800,
  otherRevenue: 300,
  teacherPayroll: 18500,
  facilityExpenses: 8200,
  materialExpenses: 3100,
  operationalExpenses: 2300,
  averageClassSize: 8.5,
  utilizationRate: 78.3,
  revenuePerStudent: 290,
  churnRate: 12.5,
  newEnrollments: 24,
  activeStudents: 158
};

export const mockPaymentAnalytics: PaymentAnalytics = {
  totalCollected: 42300,
  totalPending: 8900,
  totalOverdue: 2600,
  averagePaymentTime: 5.2,
  paymentMethodBreakdown: {
    'Credit Card': 28500,
    'Bank Transfer': 12800,
    'Cash': 800,
    'Check': 200
  },
  monthlyRecurring: 38500,
  oneTimePayments: 7300,
  refundsIssued: 450,
  collectionRate: 94.2
};

export const mockBudgetForecast: BudgetForecast = {
  id: 'budget-2025',
  organizationId: 'org-1',
  name: 'FY 2025 Budget',
  fiscalYear: 2025,
  categories: [
    {
      name: 'Teacher Salaries',
      budgetedAmount: 220000,
      spentAmount: 165000,
      committedAmount: 45000,
      variance: -10000,
      status: 'on_budget'
    },
    {
      name: 'Facility Costs',
      budgetedAmount: 96000,
      spentAmount: 82000,
      committedAmount: 18000,
      variance: 4000,
      status: 'under_budget'
    },
    {
      name: 'Materials & Supplies',
      budgetedAmount: 35000,
      spentAmount: 31000,
      committedAmount: 8000,
      variance: -4000,
      status: 'over_budget'
    },
    {
      name: 'Marketing',
      budgetedAmount: 15000,
      spentAmount: 8500,
      committedAmount: 3000,
      variance: 3500,
      status: 'under_budget'
    }
  ],
  totalBudget: 366000,
  totalSpent: 286500,
  totalCommitted: 74000,
  remainingBudget: 5500,
  forecastAccuracy: 92.3,
  lastUpdated: new Date('2025-10-24')
};

// Mock Operational Metrics
export const mockOperationalMetrics: OperationalMetrics = {
  id: 'ops-2025-10',
  organizationId: 'org-1',
  period: new Date('2025-10-01'),
  classUtilization: [
    {
      classId: 'class-1',
      className: 'Piano - Intermediate',
      capacity: 12,
      averageAttendance: 9.5,
      utilizationRate: 79.2,
      cancelledSessions: 1,
      makeupSessions: 2,
      waitlistLength: 3
    },
    {
      classId: 'class-2',
      className: 'Violin - Beginner',
      capacity: 8,
      averageAttendance: 6.8,
      utilizationRate: 85.0,
      cancelledSessions: 0,
      makeupSessions: 1,
      waitlistLength: 5
    },
    {
      classId: 'class-3',
      className: 'Guitar - Advanced',
      capacity: 10,
      averageAttendance: 7.2,
      utilizationRate: 72.0,
      cancelledSessions: 2,
      makeupSessions: 3,
      waitlistLength: 1
    }
  ],
  teacherWorkload: [
    {
      teacherId: 'teacher-1',
      teacherName: 'Sarah Johnson',
      totalHours: 32,
      teachingHours: 28,
      adminHours: 4,
      averageClassSize: 8.5,
      totalStudents: 34,
      satisfactionRating: 4.8,
      absenceRate: 5.2
    },
    {
      teacherId: 'teacher-2',
      teacherName: 'Michael Chen',
      totalHours: 25,
      teachingHours: 23,
      adminHours: 2,
      averageClassSize: 7.2,
      totalStudents: 25,
      satisfactionRating: 4.6,
      absenceRate: 8.1
    }
  ],
  facilityUsage: [
    {
      facilityId: 'room-1',
      facilityName: 'Practice Room A',
      totalHours: 168,
      bookedHours: 142,
      utilizationRate: 84.5,
      peakHours: ['10:00-12:00', '15:00-17:00'],
      maintenanceHours: 8
    },
    {
      facilityId: 'room-2',
      facilityName: 'Group Studio',
      totalHours: 168,
      bookedHours: 126,
      utilizationRate: 75.0,
      peakHours: ['14:00-16:00', '18:00-20:00'],
      maintenanceHours: 4
    }
  ],
  enrollmentTrends: [
    {
      period: new Date('2025-09-01'),
      newEnrollments: 18,
      renewals: 142,
      cancellations: 9,
      transfers: 3,
      netGrowth: 12,
      retentionRate: 94.0
    },
    {
      period: new Date('2025-10-01'),
      newEnrollments: 24,
      renewals: 134,
      cancellations: 12,
      transfers: 5,
      netGrowth: 17,
      retentionRate: 91.8
    }
  ],
  attendancePatterns: [
    {
      dayOfWeek: 'Monday',
      timeSlot: '16:00-17:00',
      averageAttendance: 85.2,
      noShowRate: 12.8,
      lateArrivalRate: 8.5,
      earlyDepartureRate: 3.2
    },
    {
      dayOfWeek: 'Wednesday',
      timeSlot: '18:00-19:00',
      averageAttendance: 91.5,
      noShowRate: 6.8,
      lateArrivalRate: 5.2,
      earlyDepartureRate: 2.1
    },
    {
      dayOfWeek: 'Saturday',
      timeSlot: '10:00-11:00',
      averageAttendance: 78.9,
      noShowRate: 18.5,
      lateArrivalRate: 12.8,
      earlyDepartureRate: 8.9
    }
  ],
  averageClassSize: 8.1,
  cancelledClasses: 3,
  makeupClasses: 6,
  waitlistLength: 23
};

// Mock Communication Metrics
export const mockCommunicationMetrics: CommunicationMetrics = {
  id: 'comm-2025-10',
  organizationId: 'org-1',
  period: new Date('2025-10-01'),
  totalMessages: 1248,
  emailsSent: 856,
  emailsOpened: 694,
  emailsClicked: 234,
  smsSent: 245,
  smsDelivered: 238,
  pushNotificationsSent: 89,
  pushNotificationsOpened: 67,
  inAppNotifications: 58,
  inAppNotificationsRead: 51,
  campaignPerformance: [
    {
      campaignId: 'camp-1',
      campaignName: 'October Newsletter',
      campaignType: 'newsletter',
      sentDate: new Date('2025-10-01'),
      recipientCount: 156,
      deliveredCount: 152,
      openedCount: 124,
      clickedCount: 43,
      unsubscribedCount: 2,
      deliveryRate: 97.4,
      openRate: 81.6,
      clickRate: 34.7,
      engagementScore: 78.5
    },
    {
      campaignId: 'camp-2',
      campaignName: 'Recital Reminder',
      campaignType: 'reminder',
      sentDate: new Date('2025-10-15'),
      recipientCount: 89,
      deliveredCount: 87,
      openedCount: 78,
      clickedCount: 65,
      unsubscribedCount: 0,
      deliveryRate: 97.8,
      openRate: 89.7,
      clickRate: 83.3,
      engagementScore: 89.2
    }
  ],
  channelEffectiveness: [
    {
      channel: 'email',
      messagesCount: 856,
      deliveryRate: 96.8,
      engagementRate: 81.1,
      responseTime: 45,
      userPreference: 78.5,
      costPerMessage: 0.05,
      roi: 12.8
    },
    {
      channel: 'sms',
      messagesCount: 245,
      deliveryRate: 97.1,
      engagementRate: 67.3,
      responseTime: 8,
      userPreference: 42.1,
      costPerMessage: 0.12,
      roi: 8.9
    },
    {
      channel: 'push',
      messagesCount: 89,
      deliveryRate: 92.1,
      engagementRate: 75.3,
      responseTime: 12,
      userPreference: 65.8,
      costPerMessage: 0.02,
      roi: 15.2
    },
    {
      channel: 'in_app',
      messagesCount: 58,
      deliveryRate: 100.0,
      engagementRate: 87.9,
      responseTime: 5,
      userPreference: 89.2,
      costPerMessage: 0.01,
      roi: 24.5
    }
  ],
  userEngagement: [
    {
      userId: 'parent-1',
      userType: 'parent',
      messagesReceived: 24,
      messagesOpened: 22,
      messagesResponded: 8,
      averageResponseTime: 120,
      preferredChannel: 'email',
      engagementScore: 85.2,
      lastActiveDate: new Date('2025-10-23')
    },
    {
      userId: 'teacher-1',
      userType: 'teacher',
      messagesReceived: 45,
      messagesOpened: 43,
      messagesResponded: 38,
      averageResponseTime: 15,
      preferredChannel: 'in_app',
      engagementScore: 94.8,
      lastActiveDate: new Date('2025-10-24')
    }
  ]
};

// Mock Dashboard Widgets
export const mockDashboardWidgets: DashboardWidget[] = [
  {
    id: 'widget-1',
    type: 'kpi',
    title: 'Active Students',
    position: { x: 0, y: 0, width: 3, height: 2 },
    data: { value: 158, change: +12, trend: 'up' },
    config: { format: 'number', color: 'blue' },
    refreshInterval: 30,
    lastUpdated: new Date('2025-10-24T10:30:00')
  },
  {
    id: 'widget-2',
    type: 'kpi',
    title: 'Monthly Revenue',
    position: { x: 3, y: 0, width: 3, height: 2 },
    data: { value: 45800, change: +8.5, trend: 'up' },
    config: { format: 'currency', color: 'green' },
    refreshInterval: 60,
    lastUpdated: new Date('2025-10-24T10:00:00')
  },
  {
    id: 'widget-3',
    type: 'chart',
    title: 'Enrollment Trends',
    position: { x: 0, y: 2, width: 6, height: 4 },
    data: {
      labels: ['Aug', 'Sep', 'Oct'],
      datasets: [
        {
          label: 'New Enrollments',
          data: [15, 18, 24],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }
      ]
    },
    config: { type: 'line', showLegend: true },
    refreshInterval: 1440,
    lastUpdated: new Date('2025-10-24T08:00:00')
  },
  {
    id: 'widget-4',
    type: 'table',
    title: 'Top Performing Classes',
    position: { x: 6, y: 0, width: 6, height: 6 },
    data: {
      headers: ['Class', 'Utilization', 'Satisfaction', 'Waitlist'],
      rows: [
        ['Piano - Intermediate', '79.2%', '4.8/5', '3'],
        ['Violin - Beginner', '85.0%', '4.6/5', '5'],
        ['Guitar - Advanced', '72.0%', '4.7/5', '1']
      ]
    },
    config: { sortable: true, pagination: false },
    refreshInterval: 60,
    lastUpdated: new Date('2025-10-24T10:15:00')
  }
];

// Mock Analytics Dashboards
export const mockAnalyticsDashboards: AnalyticsDashboard[] = [
  {
    id: 'dashboard-1',
    name: 'Executive Overview',
    description: 'High-level metrics for organizational leadership',
    userType: 'admin',
    isDefault: true,
    widgets: mockDashboardWidgets,
    layout: 'grid',
    theme: 'light',
    autoRefresh: true,
    refreshInterval: 30,
    createdBy: 'admin-1',
    organizationId: 'org-1',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-24')
  },
  {
    id: 'dashboard-2',
    name: 'Teacher Performance',
    description: 'Analytics dashboard for teachers to track their classes and students',
    userType: 'teacher',
    isDefault: true,
    widgets: mockDashboardWidgets.slice(0, 2),
    layout: 'grid',
    theme: 'light',
    autoRefresh: true,
    refreshInterval: 60,
    createdBy: 'teacher-1',
    organizationId: 'org-1',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-24')
  }
];

// Mock Custom Reports
export const mockCustomReports: CustomReport[] = [
  {
    id: 'report-1',
    name: 'Monthly Financial Summary',
    description: 'Comprehensive financial report with revenue, expenses, and forecasting',
    type: 'financial',
    createdBy: 'admin-1',
    organizationId: 'org-1',
    isPublic: true,
    widgets: [],
    filters: [
      {
        field: 'date',
        operator: 'between',
        value: [new Date('2025-10-01'), new Date('2025-10-31')],
        label: 'Current Month'
      }
    ],
    schedule: {
      frequency: 'monthly',
      time: '09:00',
      dayOfMonth: 1,
      recipients: ['admin@reachmai.org', 'finance@reachmai.org'],
      format: 'pdf'
    },
    exportFormats: ['pdf', 'excel', 'csv'],
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-24'),
    lastGenerated: new Date('2025-10-24T09:00:00')
  },
  {
    id: 'report-2',
    name: 'Student Progress Report',
    description: 'Individual student performance analytics with recommendations',
    type: 'performance',
    createdBy: 'teacher-1',
    organizationId: 'org-1',
    isPublic: false,
    widgets: [],
    filters: [
      {
        field: 'studentId',
        operator: 'in',
        value: ['student-1', 'student-2'],
        label: 'Selected Students'
      }
    ],
    exportFormats: ['pdf', 'excel'],
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-24')
  }
];

// Utility functions for analytics data
export function getStudentAnalytics(studentId: string): StudentPerformanceAnalytics | undefined {
  return mockStudentPerformanceAnalytics.find(analytics => analytics.studentId === studentId);
}

export function getFinancialMetricsForPeriod(_startDate: Date, _endDate: Date): FinancialMetrics {
  // In a real app, this would filter by date range
  return mockFinancialMetrics;
}

export function getDashboardForUser(userType: string): AnalyticsDashboard | undefined {
  return mockAnalyticsDashboards.find(dashboard => dashboard.userType === userType || dashboard.userType === 'all');
}

export function getReportsForUser(userId: string): CustomReport[] {
  return mockCustomReports.filter(report => report.createdBy === userId || report.isPublic);
}