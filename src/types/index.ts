// Core MAI Platform Types

// Authentication & Users
export interface AuthAccount {
  id: string;
  email: string;
  phone?: string;
  profiles: UserProfile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  type: 'adult' | 'student' | 'parent' | 'teacher' | 'admin';
  firstName: string;
  lastName: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  preferredContactMethod: 'email' | 'phone';
  emailVerified: boolean;
  phoneVerified: boolean;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface StudentProfile extends UserProfile {
  type: 'student';
  dateOfBirth: Date;
  school?: string;
  schoolCatalog?: string;
  parentIds: string[];
}

export interface ParentProfile extends UserProfile {
  type: 'parent';
  studentIds: string[];
}

export interface TeacherProfile extends UserProfile {
  type: 'teacher';
  clearances: TeacherClearance[];
}

export interface AdminProfile extends UserProfile {
  type: 'admin';
  adminRole?: AdminRole;
  organizationIds: string[];
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  level: number; // 1=System Owner, 2=Super Admin, 3=Office Admin
  permissions: AdminPermission[];
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

// Staff Management
export interface StaffInvitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'office_admin';
  adminRole?: string; // For admin roles: 'system_owner', 'super_admin', 'office_admin'
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedBy: string; // Admin user ID who sent the invitation
  invitedAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  token: string; // Unique token for invitation link
}

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'office_admin';
  adminRole?: AdminRole;
  status: 'active' | 'inactive' | 'pending';
  invitedBy?: string;
  invitedAt?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Organizations
export interface Organization {
  id: string;
  name: string;
  campuses: Campus[];
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Campus {
  id: string;
  organizationId: string;
  name: string;
  address?: string;
  rooms: Room[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Room {
  id: string;
  campusId: string;
  name: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Term {
  id: string;
  organizationId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  enrollmentWindowStart?: Date;
  enrollmentWindowEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Programs & Scheduling
export interface Program {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: ProgramType;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ProgramType {
  id: string;
  name: string;
  category: 'private-lessons' | 'group' | 'professional-development' | 'volunteer';
  allowSelfEnroll: boolean;
  visibleToRoles: string[];
  selfEnrollRoles: string[];
  requiresApproval: boolean;
}

export interface Section {
  id: string;
  programId: string;
  termId: string;
  name: string;
  roomId?: string;
  teacherIds: string[];
  capacity: number;
  enrollments: Enrollment[];
  meetings: Meeting[];
  payRates?: PayRate[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Meeting {
  id: string;
  sectionId: string;
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  recurrenceRule?: string; // RRULE format
  exceptions?: Date[];
  roomId?: string;
  teacherIds: string[];
  attendance: AttendanceRecord[];
  createdAt: Date;
  updatedAt: Date;
}

// Enrollment
export interface Enrollment {
  id: string;
  sectionId: string;
  studentId: string;
  status: 'enrolled' | 'waitlisted' | 'cancelled' | 'completed';
  enrolledAt: Date;
  cancelledAt?: Date;
  cancellationType?: 'one-time' | 'permanent';
  override?: EnrollmentOverride;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollmentOverride {
  id: string;
  reason: string;
  overriddenBy: string;
  overriddenAt: Date;
}

// RBAC
export interface Role {
  id: string;
  organizationId: string;
  name: string;
  permissions: Permission[];
  scopes: RoleScope[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface RoleScope {
  type: 'organization' | 'campus' | 'program' | 'section';
  resourceId: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  scopes: RoleScope[];
  assignedBy: string;
  assignedAt: Date;
}

// Attendance
export interface AttendanceRecord {
  id: string;
  meetingInstanceId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  markedBy: string; // Teacher/admin who marked attendance
  markedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacilityCheckIn {
  id: string;
  personId: string; // Can be student, teacher, or staff
  personType: 'student' | 'teacher' | 'staff' | 'parent' | 'visitor';
  campusId: string;
  roomId?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  purpose: 'class' | 'lesson' | 'event' | 'meeting' | 'pickup' | 'other';
  notes?: string;
  checkedInBy?: string; // Staff member who checked them in
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceSession {
  id: string;
  meetingInstanceId: string;
  teacherId: string;
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'completed';
  studentsPresent: number;
  studentsAbsent: number;
  studentsLate: number;
  studentsExcused: number;
  notes?: string;
}

// Teacher Management
export interface TeacherClearance {
  id: string;
  teacherId: string;
  campusId: string;
  type: string;
  status: 'active' | 'expired' | 'pending' | 'revoked';
  expiryDate?: Date;
  documentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubstituteCoverage {
  id: string;
  meetingId: string;
  originalTeacherId: string;
  substituteTeacherId?: string;
  status: 'requested' | 'filled' | 'cancelled';
  requestedBy: string;
  requestedAt: Date;
  filledAt?: Date;
  notes?: string;
}

// Academic
export interface Assignment {
  id: string;
  sectionId: string;
  teacherId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  submissions: Submission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string;
  attachments?: string[];
  submittedAt: Date;
  evaluation?: Evaluation;
}

export interface Evaluation {
  id: string;
  submissionId: string;
  teacherId: string;
  score?: number;
  feedback?: string;
  evaluatedAt: Date;
}

// Progress & Skills
export interface ProgressReport {
  id: string;
  studentId: string;
  sectionId: string;
  termId: string;
  teacherId: string;
  skills: SkillAssessment[];
  overallGrade?: string;
  comments?: string;
  parentFeedback?: string;
  status: 'draft' | 'published' | 'acknowledged';
  publishedAt?: Date;
  acknowledgedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillAssessment {
  skillId: string;
  skillName: string;
  category: string;
  level: 'beginning' | 'developing' | 'proficient' | 'advanced' | 'mastery';
  description?: string;
  notes?: string;
  evidenceIds?: string[]; // References to assignments, recordings, etc.
}

export interface Skill {
  id: string;
  programId: string;
  name: string;
  category: string;
  description: string;
  level: number; // 1-5 progression level
  prerequisites?: string[]; // Other skill IDs
  milestones: SkillMilestone[];
}

export interface SkillMilestone {
  id: string;
  name: string;
  description: string;
  level: 'beginning' | 'developing' | 'proficient' | 'advanced' | 'mastery';
  criteria: string[];
}

export interface StudentProgress {
  id: string;
  studentId: string;
  sectionId: string;
  skillAssessments: SkillAssessment[];
  assignments: Assignment[];
  attendanceRate: number;
  practiceHours?: number;
  lastUpdated: Date;
}

// Financial & Payroll
export interface PayRate {
  id: string;
  teacherId: string;
  type: 'default' | 'program' | 'section';
  programId?: string;
  sectionId?: string;
  hourlyRate: number;
  effectiveDate: Date;
  endDate?: Date;
}

export interface WorkEntry {
  id: string;
  teacherId: string;
  type: 'meeting' | 'check-in' | 'manual';
  meetingId?: string;
  hours: number;
  date: Date;
  payRate: number;
  payrollPeriodId?: string;
  notes?: string;
  createdAt: Date;
}

export interface PayrollPeriod {
  id: string;
  organizationId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  dueDate: Date;
  status: 'open' | 'locked' | 'paid';
  snapshots: PayrollSnapshot[];
  createdAt: Date;
}

export interface PayrollSnapshot {
  id: string;
  payrollPeriodId: string;
  teacherId: string;
  totalHours: number;
  totalPay: number;
  workEntries: WorkEntry[];
  missingAttendance: string[];
  createdAt: Date;
}

// Billing & Tuition
export interface TuitionRate {
  id: string;
  programId: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'per-lesson' | 'per-term' | 'annual';
  description?: string;
  effectiveDate: Date;
  endDate?: Date;
}

export interface FamilyAccount {
  id: string;
  accountId: string; // Links to AuthAccount
  parentIds: string[];
  studentIds: string[];
  billingAddress: Address;
  paymentMethods: PaymentMethod[];
  currentBalance: number;
  creditBalance: number;
  autoPayEnabled: boolean;
  billingPreferences: BillingPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account' | 'paypal';
  isDefault: boolean;
  lastFour: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  cardBrand?: string;
  isActive: boolean;
}

export interface BillingPreferences {
  billingCycle: 'monthly' | 'weekly' | 'per-lesson';
  billingDate: number; // Day of month for monthly billing
  emailNotifications: boolean;
  smsNotifications: boolean;
  paperStatements: boolean;
  autoPayEnabled: boolean;
}

export interface Invoice {
  id: string;
  familyAccountId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  sentAt?: Date;
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  studentId?: string;
  sectionId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'tuition' | 'fee' | 'material' | 'event' | 'penalty' | 'credit' | 'discount';
}

export interface Payment {
  id: string;
  familyAccountId: string;
  invoiceId?: string;
  amount: number;
  paymentMethodId: string;
  paymentDate: Date;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  processorResponse?: string;
  refundAmount?: number;
  refundDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Fee {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  amount: number;
  type: 'registration' | 'material' | 'recital' | 'late' | 'returned_check' | 'other';
  isRequired: boolean;
  applicablePrograms: string[]; // Program IDs
  effectiveDate: Date;
  endDate?: Date;
}

export interface Discount {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number; // Percentage (0-100) or fixed dollar amount
  applicableTo: 'tuition' | 'fees' | 'all';
  requirements: DiscountRequirement[];
  maxUsesPerFamily?: number;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
}

export interface DiscountRequirement {
  type: 'sibling_count' | 'program_enrollment' | 'family_income' | 'referral' | 'early_payment';
  value: string | number;
  comparison?: 'greater_than' | 'less_than' | 'equal_to' | 'greater_equal' | 'less_equal';
}

export interface BillingStatement {
  id: string;
  familyAccountId: string;
  statementDate: Date;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  previousBalance: number;
  newCharges: number;
  paymentsTotal: number;
  adjustments: number;
  currentBalance: number;
  invoiceIds: string[]; // Invoice IDs
  paymentIds: string[]; // Payment IDs
}

// Simplified Payroll Types for Teacher Payroll System
export interface SimplePayrollPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  name: string;
  status: 'open' | 'locked' | 'paid';
}

export interface TeacherPayroll {
  id: string;
  teacherId: string;
  periodId: string;
  period: SimplePayrollPeriod;
  regularHours: number;
  substituteHours: number;
  totalHours: number;
  regularRate: number;
  substituteRate: number;
  regularPay: number;
  substitutePay: number;
  grossPay: number;
  deductions: PayrollDeductions;
  netPay: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  generatedDate: Date;
  paidDate?: Date;
  meetings: PayrollMeeting[];
  notes?: string;
}

export interface PayrollDeductions {
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  total: number;
}

export interface PayrollMeeting {
  meetingId: string;
  date: Date;
  duration: number; // hours
  rate: number;
  isSubstitute: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface ProfileSwitchForm {
  profileId: string;
}

// Dashboard Types
export interface DashboardStats {
  totalStudents: number;
  totalEnrollments: number;
  upcomingMeetings: number;
  pendingRSVPs: number;
}

/********************************************************
 * PHASE 5: NOTIFICATIONS & COMMUNICATIONS
 ********************************************************/

// Notification System
export interface Notification {
  id: string;
  recipientId: string;
  recipientType: 'user' | 'profile' | 'family' | 'organization';
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  data?: Record<string, any>; // Additional data for the notification
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  scheduledFor?: Date;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionText?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType = 
  | 'billing_reminder'
  | 'payment_confirmation'
  | 'payment_failed'
  | 'invoice_generated'
  | 'enrollment_confirmation'
  | 'enrollment_reminder'
  | 'class_reminder'
  | 'class_cancelled'
  | 'class_rescheduled'
  | 'attendance_alert'
  | 'assignment_due'
  | 'assignment_graded'
  | 'schedule_change'
  | 'account_update'
  | 'system_maintenance'
  | 'emergency_alert'
  | 'announcement'
  | 'message_received'
  | 'payroll_ready';

export type NotificationCategory =
  | 'billing'
  | 'enrollment'
  | 'scheduling'
  | 'attendance'
  | 'assignments'
  | 'system'
  | 'messages'
  | 'announcements';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

// User Notification Preferences
export interface NotificationPreferences {
  id: string;
  userId: string;
  profileId?: string;
  preferences: NotificationChannelPreferences;
  quietHours?: QuietHours;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationChannelPreferences {
  email: ChannelSettings;
  sms: ChannelSettings;
  push: ChannelSettings;
  in_app: ChannelSettings;
}

export interface ChannelSettings {
  enabled: boolean;
  categories: Partial<Record<NotificationCategory, boolean>>;
  urgencyThreshold: 'low' | 'medium' | 'high' | 'urgent';
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // Format: "HH:mm"
  endTime: string;   // Format: "HH:mm"
  timezone: string;
  days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
}

// Messaging System
export interface Message {
  id: string;
  threadId: string;
  senderId: string; // UserProfile ID
  recipientIds: string[]; // UserProfile IDs
  subject?: string;
  content: string;
  messageType: 'direct' | 'group' | 'announcement' | 'system';
  priority: 'normal' | 'high' | 'urgent';
  status: 'draft' | 'sent' | 'delivered' | 'read';
  attachments: MessageAttachment[];
  replyToId?: string;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: string[]; // UserProfile IDs
  threadType: 'direct' | 'group' | 'announcement';
  isArchived: boolean;
  lastMessageAt: Date;
  lastMessagePreview: string;
  unreadCount: Record<string, number>; // participantId -> unread count
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number; // bytes
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Bulk Communications
export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: 'announcement' | 'newsletter' | 'reminder' | 'emergency' | 'marketing';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  content: CampaignContent;
  audienceFilter: AudienceFilter;
  channels: NotificationChannel[];
  scheduledFor?: Date;
  sentAt?: Date;
  stats: CampaignStats;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignContent {
  subject: string;
  htmlContent: string;
  textContent: string;
  smsContent?: string;
  attachments: MessageAttachment[];
  actionUrl?: string;
  actionText?: string;
}

export interface AudienceFilter {
  userTypes: UserProfileType[];
  organizationIds?: string[];
  programIds?: string[];
  sectionIds?: string[];
  locations?: string[];
  ageRange?: {
    min?: number;
    max?: number;
  };
  enrollmentStatus?: EnrollmentStatus[];
  customFilters?: Record<string, any>;
  excludeUserIds?: string[];
}

export interface CampaignStats {
  totalRecipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  unsubscribed: number;
  bounced: number;
}

// Communication Templates
export interface NotificationTemplate {
  id: string;
  organizationId: string;
  name: string;
  type: NotificationType;
  category: NotificationCategory;
  channels: NotificationChannel[];
  subject: string;
  htmlContent: string;
  textContent: string;
  smsContent?: string;
  variables: TemplateVariable[];
  isActive: boolean;
  isSystem: boolean; // System templates cannot be deleted
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  required: boolean;
  defaultValue?: string;
  example?: string;
}

// System Announcements
export interface Announcement {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  type: 'general' | 'emergency' | 'maintenance' | 'policy' | 'event';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: AudienceFilter;
  isPublished: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  isPinned: boolean;
  allowComments: boolean;
  attachments: MessageAttachment[];
  readBy: string[]; // UserProfile IDs who have read this
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Automated Alert System
export interface AlertRule {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  isActive: boolean;
  triggerType: AlertTriggerType;
  conditions: AlertCondition[];
  actions: AlertAction[];
  frequency: AlertFrequency;
  lastTriggered?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AlertTriggerType = 
  | 'attendance_missed'
  | 'payment_overdue' 
  | 'enrollment_deadline'
  | 'schedule_change'
  | 'assignment_overdue'
  | 'low_balance'
  | 'repeated_absence'
  | 'class_cancellation'
  | 'payroll_ready'
  | 'system_maintenance';

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'days_before' | 'days_after';
  value: string | number | boolean | Date;
  logicalOperator?: 'AND' | 'OR';
}

export interface AlertAction {
  type: 'send_notification' | 'send_email' | 'send_sms' | 'create_task' | 'update_status';
  config: AlertActionConfig;
}

export interface AlertActionConfig {
  templateId?: string;
  recipients?: string[];
  channels?: NotificationChannel[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  customMessage?: string;
  taskAssignee?: string;
  statusUpdate?: string;
}

export type AlertFrequency = 
  | 'immediate'
  | 'daily_digest'
  | 'weekly_digest'
  | 'once_per_condition'
  | 'recurring_until_resolved';

export interface AlertLog {
  id: string;
  ruleId: string;
  triggeredAt: Date;
  conditions: Record<string, any>;
  actionsExecuted: AlertActionResult[];
  status: 'success' | 'partial_failure' | 'failure';
  errorMessage?: string;
}

export interface AlertActionResult {
  action: AlertAction;
  status: 'success' | 'failure';
  result?: any;
  errorMessage?: string;
  executedAt: Date;
}

// Communication Preferences
export interface UserCommunicationPreferences {
  id: string;
  userId: string;
  profileId?: string;
  emailPreferences: EmailPreferences;
  smsPreferences: SmsPreferences;
  pushPreferences: PushPreferences;
  digestSettings: DigestSettings;
  quietHours: QuietHours;
  emergencyContacts: EmergencyContact[];
  languagePreference: string;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailPreferences {
  enabled: boolean;
  emailAddress: string;
  categories: Record<NotificationCategory, boolean>;
  format: 'html' | 'text';
  frequency: 'immediate' | 'hourly_digest' | 'daily_digest';
  unsubscribeAll: boolean;
}

export interface SmsPreferences {
  enabled: boolean;
  phoneNumber: string;
  categories: Record<NotificationCategory, boolean>;
  urgencyThreshold: 'medium' | 'high' | 'urgent';
  carrierOptIn: boolean;
}

export interface PushPreferences {
  enabled: boolean;
  deviceTokens: string[];
  categories: Record<NotificationCategory, boolean>;
  soundEnabled: boolean;
  badgeEnabled: boolean;
}

export interface DigestSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  deliveryTime: string; // HH:mm format
  deliveryDay?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  includeCategories: NotificationCategory[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  emailAddress?: string;
  isPrimary: boolean;
  receiveAlerts: boolean;
}

// ==========================================
// PHASE 6: ANALYTICS & REPORTING TYPES
// ==========================================

// Student Performance Analytics
export interface PerformanceMetric {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  metricType: 'grade' | 'attendance' | 'participation' | 'homework_completion' | 'test_score';
  value: number; // Percentage or score
  maxValue: number; // Maximum possible value
  date: Date;
  gradingPeriod: string;
  teacherId: string;
  notes?: string;
}

export interface StudentPerformanceAnalytics {
  studentId: string;
  overallGPA: number;
  attendanceRate: number;
  assignmentCompletionRate: number;
  subjectPerformance: SubjectPerformance[];
  trends: PerformanceTrend[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  lastUpdated: Date;
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  currentGrade: number;
  averageGrade: number;
  attendanceRate: number;
  assignmentCount: number;
  completedAssignments: number;
  upcomingAssignments: number;
  trend: 'improving' | 'stable' | 'declining';
  lastAssessment: Date;
}

export interface PerformanceTrend {
  period: string;
  gpa: number;
  attendanceRate: number;
  assignmentCompletion: number;
  date: Date;
}

// Financial Analytics
export interface FinancialMetrics {
  id: string;
  organizationId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  enrollmentRevenue: number;
  materialRevenue: number;
  eventRevenue: number;
  otherRevenue: number;
  teacherPayroll: number;
  facilityExpenses: number;
  materialExpenses: number;
  operationalExpenses: number;
  averageClassSize: number;
  utilizationRate: number; // Percentage of capacity used
  revenuePerStudent: number;
  churnRate: number; // Percentage of students who left
  newEnrollments: number;
  activeStudents: number;
}

export interface PaymentAnalytics {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  averagePaymentTime: number; // Days
  paymentMethodBreakdown: Record<string, number>;
  monthlyRecurring: number;
  oneTimePayments: number;
  refundsIssued: number;
  collectionRate: number; // Percentage
}

export interface BudgetForecast {
  id: string;
  organizationId: string;
  name: string;
  fiscalYear: number;
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
  totalCommitted: number;
  remainingBudget: number;
  forecastAccuracy: number; // Percentage
  lastUpdated: Date;
}

export interface BudgetCategory {
  name: string;
  budgetedAmount: number;
  spentAmount: number;
  committedAmount: number;
  variance: number;
  status: 'under_budget' | 'on_budget' | 'over_budget';
}

// Operational Analytics
export interface OperationalMetrics {
  id: string;
  organizationId: string;
  period: Date;
  classUtilization: ClassUtilizationMetric[];
  teacherWorkload: TeacherWorkloadMetric[];
  facilityUsage: FacilityUsageMetric[];
  enrollmentTrends: EnrollmentTrendMetric[];
  attendancePatterns: AttendancePatternMetric[];
  averageClassSize: number;
  cancelledClasses: number;
  makeupClasses: number;
  waitlistLength: number;
}

export interface ClassUtilizationMetric {
  classId: string;
  className: string;
  capacity: number;
  averageAttendance: number;
  utilizationRate: number;
  cancelledSessions: number;
  makeupSessions: number;
  waitlistLength: number;
}

export interface TeacherWorkloadMetric {
  teacherId: string;
  teacherName: string;
  totalHours: number;
  teachingHours: number;
  adminHours: number;
  averageClassSize: number;
  totalStudents: number;
  satisfactionRating: number;
  absenceRate: number;
}

export interface FacilityUsageMetric {
  facilityId: string;
  facilityName: string;
  totalHours: number;
  bookedHours: number;
  utilizationRate: number;
  peakHours: string[];
  maintenanceHours: number;
}

export interface EnrollmentTrendMetric {
  period: Date;
  newEnrollments: number;
  renewals: number;
  cancellations: number;
  transfers: number;
  netGrowth: number;
  retentionRate: number;
}

export interface AttendancePatternMetric {
  dayOfWeek: string;
  timeSlot: string;
  averageAttendance: number;
  noShowRate: number;
  lateArrivalRate: number;
  earlyDepartureRate: number;
}

// Communication Analytics
export interface CommunicationMetrics {
  id: string;
  organizationId: string;
  period: Date;
  totalMessages: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  smsSent: number;
  smsDelivered: number;
  pushNotificationsSent: number;
  pushNotificationsOpened: number;
  inAppNotifications: number;
  inAppNotificationsRead: number;
  campaignPerformance: CampaignPerformanceMetric[];
  channelEffectiveness: ChannelEffectivenessMetric[];
  userEngagement: UserEngagementMetric[];
}

export interface CampaignPerformanceMetric {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  sentDate: Date;
  recipientCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  unsubscribedCount: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  engagementScore: number;
}

export interface ChannelEffectivenessMetric {
  channel: NotificationChannel;
  messagesCount: number;
  deliveryRate: number;
  engagementRate: number;
  responseTime: number; // Average response time in minutes
  userPreference: number; // Percentage of users who prefer this channel
  costPerMessage: number;
  roi: number; // Return on investment
}

export interface UserEngagementMetric {
  userId: string;
  userType: UserProfileType;
  messagesReceived: number;
  messagesOpened: number;
  messagesResponded: number;
  averageResponseTime: number;
  preferredChannel: NotificationChannel;
  engagementScore: number;
  lastActiveDate: Date;
}

// Report Builder & Dashboard
export interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'financial' | 'operational' | 'communication' | 'custom';
  createdBy: string;
  organizationId: string;
  isPublic: boolean;
  widgets: ReportWidget[];
  filters: ReportFilter[];
  schedule?: ReportSchedule;
  exportFormats: ('pdf' | 'excel' | 'csv' | 'json')[];
  createdAt: Date;
  updatedAt: Date;
  lastGenerated?: Date;
}

export interface ReportWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'gauge' | 'map' | 'text';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  dataSource: DataSource;
  visualization: VisualizationConfig;
  filters: ReportFilter[];
}

export interface DataSource {
  type: 'students' | 'finances' | 'attendance' | 'enrollment' | 'communications' | 'custom';
  entity: string;
  fields: string[];
  aggregations: DataAggregation[];
  timeRange: TimeRange;
}

export interface DataAggregation {
  field: string;
  operation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'distinct';
  groupBy?: string[];
}

export interface VisualizationConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'histogram';
  xAxis?: string;
  yAxis?: string;
  colorBy?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  animations?: boolean;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater' | 'less' | 'between' | 'contains' | 'in';
  value: any;
  label: string;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6, Sunday = 0
  dayOfMonth?: number; // 1-31
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}

export interface TimeRange {
  start: Date;
  end: Date;
  period: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'calendar' | 'activity' | 'alert';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  data: any;
  config: any;
  refreshInterval?: number; // Minutes
  lastUpdated: Date;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  userType: UserProfileType | 'admin' | 'all';
  isDefault: boolean;
  widgets: DashboardWidget[];
  layout: 'grid' | 'free';
  theme: 'light' | 'dark' | 'auto';
  autoRefresh: boolean;
  refreshInterval: number; // Minutes
  createdBy: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// PHASE 7: MOBILE APP & REAL-TIME TYPES
// ==========================================

// Mobile Device & App Management
export interface MobileDevice {
  id: string;
  userId: string;
  deviceType: 'ios' | 'android' | 'web';
  deviceToken: string; // For push notifications
  deviceName: string;
  osVersion: string;
  appVersion: string;
  isActive: boolean;
  lastSeen: Date;
  pushEnabled: boolean;
  biometricEnabled: boolean;
  location?: DeviceLocation;
  preferences: MobilePreferences;
  registeredAt: Date;
  updatedAt: Date;
}

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}

export interface MobilePreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  pushNotifications: {
    enabled: boolean;
    quiet_hours: { start: string; end: string };
    categories: Record<string, boolean>;
  };
  biometric: {
    enabled: boolean;
    type: 'fingerprint' | 'face' | 'passcode';
  };
  autoSync: boolean;
  dataUsage: 'wifi_only' | 'cellular_allowed' | 'unlimited';
}

// Real-Time Features
export interface WebSocketConnection {
  id: string;
  userId: string;
  deviceId: string;
  status: 'connected' | 'disconnected' | 'reconnecting';
  connectedAt: Date;
  lastActivity: Date;
  subscriptions: string[]; // Channel subscriptions
}

export interface RealTimeEvent {
  id: string;
  type: 'schedule_change' | 'attendance_update' | 'message_received' | 'payment_due' | 'announcement' | 'emergency';
  targetUsers: string[];
  data: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  expiresAt?: Date;
  deliveredTo: string[];
  readBy: string[];
}

export interface PushNotification {
  id: string;
  deviceId: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  category?: string;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  clickedAt?: Date;
  createdAt: Date;
}

// Offline & Sync Management
export interface OfflineData {
  id: string;
  userId: string;
  deviceId?: string;
  type: string; // Data type for categorization
  dataType?: 'schedule' | 'attendance' | 'messages' | 'assignments' | 'payments';
  data: any;
  version?: number;
  timestamp: Date;
  expiresAt: Date;
  lastSyncAt?: Date;
  isDirty?: boolean; // Has local changes
  conflictResolved?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface DataSyncManager {
  sync: () => Promise<void>;
  queue: OfflineQueue[];
  status: SyncStatus;
}

export interface OfflineQueue {
  id: string;
  operation: string;
  entity: string;
  data: any;
  timestamp: Date;
  userId: string;
  retryCount: number;
  lastAttempt?: Date;
  errorMessage?: string;
}

export interface SyncOperation {
  id: string;
  userId: string;
  deviceId: string;
  operation: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  data: any;
  status: 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict';
  attempts: number;
  lastAttempt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

export interface ConflictResolution {
  id: string;
  syncOperationId: string;
  localData: any;
  serverData: any;
  resolution: 'use_local' | 'use_server' | 'merge' | 'manual';
  resolvedBy?: string;
  resolvedAt?: Date;
  mergedData?: any;
}

// Mobile Check-In System
export interface CheckInLocation {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number; // Meters for geofence
  qrCode: string;
  isActive: boolean;
  checkInSettings: CheckInSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckInSettings {
  allowEarlyCheckIn: boolean;
  earlyCheckInMinutes: number;
  allowLateCheckIn: boolean;
  lateCheckInMinutes: number;
  requireLocation: boolean;
  requireQRCode: boolean;
  allowSelfCheckOut: boolean;
  requirePhoto: boolean;
  requireSignature: boolean;
}

export interface MobileCheckIn {
  id: string;
  userId: string;
  classId: string;
  locationId: string;
  checkInMethod: 'qr_code' | 'geolocation' | 'manual' | 'nfc';
  checkInTime: Date;
  checkOutTime?: Date;
  location?: DeviceLocation;
  photo?: string;
  signature?: string;
  notes?: string;
  status: 'checked_in' | 'checked_out' | 'late' | 'absent';
  verifiedBy?: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mobile Navigation & UI
export interface MobileNavigation {
  userType: UserProfileType;
  primaryTabs: MobileTab[];
  bottomNavigation: MobileTab[];
  quickActions: QuickAction[];
}

export interface MobileTab {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  isEnabled: boolean;
  requiresAuth: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  params?: Record<string, any>;
  isVisible: boolean;
  requiresPermission?: string;
}

// Mobile-Specific Features
export interface MobileScheduleView {
  userId: string;
  viewType: 'day' | 'week' | 'agenda';
  showConflicts: boolean;
  showTravelTime: boolean;
  autoRefresh: boolean;
  lastUpdated: Date;
}

export interface MobileAttendanceEntry {
  id: string;
  classId: string;
  studentId: string;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  location?: DeviceLocation;
  method: 'manual' | 'qr_scan' | 'geo_fence' | 'biometric';
  deviceId: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  createdAt: Date;
}

export interface MobileMessage {
  id: string;
  threadId: string;
  senderId: string;
  recipientIds: string[];
  subject: string;
  content: string;
  attachments: MobileAttachment[];
  priority: 'low' | 'normal' | 'high';
  isRead: boolean;
  isSynced: boolean;
  sentAt: Date;
  readAt?: Date;
  deliveredAt?: Date;
}

export interface MobileAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  localPath?: string; // For offline access
  cloudUrl?: string;
  isDownloaded: boolean;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
}

// Mobile Analytics & Performance
export interface MobileAnalytics {
  deviceId: string;
  userId: string;
  sessionId: string;
  events: MobileEvent[];
  performance: MobilePerformanceMetrics;
  crashReports: CrashReport[];
  featureUsage: Record<string, number>;
  networkUsage: NetworkUsageMetrics;
  batteryUsage: BatteryUsageMetrics;
}

export interface MobileEvent {
  id: string;
  type: 'screen_view' | 'button_click' | 'feature_use' | 'error' | 'performance';
  screen?: string;
  action?: string;
  category?: string;
  value?: number;
  properties: Record<string, any>;
  timestamp: Date;
}

export interface MobilePerformanceMetrics {
  appLaunchTime: number;
  screenLoadTimes: Record<string, number>;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  apiResponseTimes: Record<string, number>;
}

export interface CrashReport {
  id: string;
  error: string;
  stackTrace: string;
  deviceInfo: any;
  appVersion: string;
  osVersion: string;
  timestamp: Date;
  userId?: string;
  reproducible: boolean;
  resolved: boolean;
}

export interface NetworkUsageMetrics {
  totalBytes: number;
  wifiBytes: number;
  cellularBytes: number;
  requestCount: number;
  failedRequests: number;
  averageLatency: number;
}

export interface BatteryUsageMetrics {
  batteryLevel: number;
  isCharging: boolean;
  powerSaveMode: boolean;
  backgroundTime: number;
  foregroundTime: number;
  energyUsage: number;
}

// Export common types
export type UserProfileType = UserProfile['type'];
export type EnrollmentStatus = Enrollment['status'];
export type AttendanceStatus = AttendanceRecord['status'];