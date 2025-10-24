import { subDays, isBefore, isAfter, differenceInDays } from 'date-fns';
import { createNotification } from './notifications';
import type { 
  AlertRule, 
  AlertCondition, 
  AlertLog, 
  AlertActionResult,
  Notification,
  Invoice,
  Enrollment,
  AttendanceRecord,
  Assignment,
  Meeting,
  TeacherPayroll
} from '../types';

// Automated Alert Engine
export class AlertEngine {
  private rules: AlertRule[] = [];
  private logs: AlertLog[] = [];

  constructor(rules: AlertRule[]) {
    this.rules = rules.filter(rule => rule.isActive);
  }

  // Process all active alert rules
  async processAlerts(data: AlertProcessingData): Promise<AlertLog[]> {
    const processedLogs: AlertLog[] = [];

    for (const rule of this.rules) {
      try {
        const shouldTrigger = await this.evaluateRule(rule, data);
        
        if (shouldTrigger) {
          const log = await this.executeRule(rule, data);
          processedLogs.push(log);
          this.logs.push(log);
        }
      } catch (error) {
        console.error(`Error processing alert rule ${rule.id}:`, error);
      }
    }

    return processedLogs;
  }

  // Evaluate if a rule should trigger
  private async evaluateRule(rule: AlertRule, data: AlertProcessingData): Promise<boolean> {
    // Check frequency constraints
    if (!this.checkFrequencyConstraints(rule)) {
      return false;
    }

    // Evaluate conditions based on trigger type
    switch (rule.triggerType) {
      case 'payment_overdue':
        return this.evaluatePaymentOverdueConditions(rule.conditions, data.invoices || []);
      
      case 'attendance_missed':
        return this.evaluateAttendanceMissedConditions(rule.conditions, data.attendanceRecords || []);
      
      case 'enrollment_deadline':
        return this.evaluateEnrollmentDeadlineConditions(rule.conditions, data.enrollments || []);
      
      case 'assignment_overdue':
        return this.evaluateAssignmentOverdueConditions(rule.conditions, data.assignments || []);
      
      case 'schedule_change':
        return this.evaluateScheduleChangeConditions(rule.conditions, data.meetings || []);
      
      case 'payroll_ready':
        return this.evaluatePayrollReadyConditions(rule.conditions, data.payrolls || []);
      
      case 'low_balance':
        return this.evaluateLowBalanceConditions(rule.conditions, data);
      
      case 'repeated_absence':
        return this.evaluateRepeatedAbsenceConditions(rule.conditions, data.attendanceRecords || []);
      
      default:
        return false;
    }
  }

  // Execute rule actions
  private async executeRule(rule: AlertRule, data: AlertProcessingData): Promise<AlertLog> {
    const log: AlertLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      triggeredAt: new Date(),
      conditions: this.extractConditionData(rule, data),
      actionsExecuted: [],
      status: 'success'
    };

    for (const action of rule.actions) {
      try {
        const result = await this.executeAction(action, rule);
        log.actionsExecuted.push(result);
        
        if (result.status === 'failure') {
          log.status = log.status === 'success' ? 'partial_failure' : 'failure';
        }
      } catch (error) {
        log.actionsExecuted.push({
          action,
          status: 'failure',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          executedAt: new Date()
        });
        log.status = 'failure';
      }
    }

    return log;
  }

  // Execute individual action
  private async executeAction(action: any, rule: AlertRule): Promise<AlertActionResult> {
    const result: AlertActionResult = {
      action,
      status: 'success',
      executedAt: new Date()
    };

    switch (action.type) {
      case 'send_notification':
        result.result = await this.sendNotificationAction(action, rule);
        break;
      
      case 'send_email':
        result.result = await this.sendEmailAction(action, rule);
        break;
      
      case 'send_sms':
        result.result = await this.sendSmsAction(action, rule);
        break;
      
      case 'create_task':
        result.result = await this.createTaskAction(action, rule);
        break;
      
      case 'update_status':
        result.result = await this.updateStatusAction(action, rule);
        break;
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    return result;
  }

  // Condition evaluation methods
  private evaluatePaymentOverdueConditions(conditions: AlertCondition[], invoices: Invoice[]): boolean {
    const overdueInvoices = invoices.filter(invoice => 
      invoice.status !== 'paid' && 
      isBefore(invoice.dueDate, new Date()) &&
      invoice.amountDue > 0
    );

    return this.evaluateConditions(conditions, { overdueInvoices, count: overdueInvoices.length });
  }

  private evaluateAttendanceMissedConditions(conditions: AlertCondition[], records: AttendanceRecord[]): boolean {
    const missedAttendance = records.filter(record => 
      record.status === 'absent'
    );

    return this.evaluateConditions(conditions, { missedAttendance, count: missedAttendance.length });
  }

  private evaluateEnrollmentDeadlineConditions(conditions: AlertCondition[], enrollments: Enrollment[]): boolean {
    const now = new Date();
    const upcomingDeadlines = enrollments.filter(enrollment => {
      if (!enrollment.enrolledAt) return false;
      const daysUntilDeadline = differenceInDays(enrollment.enrolledAt, now);
      return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
    });

    return this.evaluateConditions(conditions, { upcomingDeadlines, count: upcomingDeadlines.length });
  }

  private evaluateAssignmentOverdueConditions(conditions: AlertCondition[], assignments: Assignment[]): boolean {
    const overdueAssignments = assignments.filter(assignment => 
      assignment.dueDate && 
      isBefore(assignment.dueDate, new Date())
    );

    return this.evaluateConditions(conditions, { overdueAssignments, count: overdueAssignments.length });
  }

  private evaluateScheduleChangeConditions(conditions: AlertCondition[], meetings: Meeting[]): boolean {
    const recentChanges = meetings.filter(meeting => 
      meeting.updatedAt && 
      isAfter(meeting.updatedAt, subDays(new Date(), 1))
    );

    return this.evaluateConditions(conditions, { recentChanges, count: recentChanges.length });
  }

  private evaluatePayrollReadyConditions(conditions: AlertCondition[], payrolls: TeacherPayroll[]): boolean {
    const readyPayrolls = payrolls.filter(payroll => 
      payroll.status === 'approved' && 
      !payroll.paidDate
    );

    return this.evaluateConditions(conditions, { readyPayrolls, count: readyPayrolls.length });
  }

  private evaluateLowBalanceConditions(conditions: AlertCondition[], data: AlertProcessingData): boolean {
    // This would check family account balances
    const lowBalanceAccounts = data.familyAccounts?.filter(account => 
      account.currentBalance < -100 // $100 negative balance threshold
    ) || [];

    return this.evaluateConditions(conditions, { lowBalanceAccounts, count: lowBalanceAccounts.length });
  }

  private evaluateRepeatedAbsenceConditions(conditions: AlertCondition[], records: AttendanceRecord[]): boolean {
    // Group by student and check for consecutive absences
    const studentAbsences = records.reduce((acc, record) => {
      if (record.status === 'absent') {
        if (!acc[record.studentId]) acc[record.studentId] = [];
        acc[record.studentId].push(record);
      }
      return acc;
    }, {} as Record<string, AttendanceRecord[]>);

    const studentsWithRepeatedAbsences = Object.values(studentAbsences).filter(absences => 
      absences.length >= 3 // 3 or more absences
    );

    return this.evaluateConditions(conditions, { 
      studentsWithRepeatedAbsences, 
      count: studentsWithRepeatedAbsences.length 
    });
  }

  // Generic condition evaluation
  private evaluateConditions(conditions: AlertCondition[], data: any): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let currentLogicalOperator: 'AND' | 'OR' = 'AND';

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateSingleCondition(condition, data);

      if (i === 0) {
        result = conditionResult;
      } else {
        if (currentLogicalOperator === 'AND') {
          result = result && conditionResult;
        } else {
          result = result || conditionResult;
        }
      }

      // Set logical operator for next iteration
      if (condition.logicalOperator) {
        currentLogicalOperator = condition.logicalOperator;
      }
    }

    return result;
  }

  private evaluateSingleCondition(condition: AlertCondition, data: any): boolean {
    const fieldValue = this.getFieldValue(condition.field, data);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'days_before':
        if (fieldValue instanceof Date) {
          return differenceInDays(fieldValue, new Date()) <= Number(condition.value);
        }
        return false;
      case 'days_after':
        if (fieldValue instanceof Date) {
          return differenceInDays(new Date(), fieldValue) >= Number(condition.value);
        }
        return false;
      default:
        return false;
    }
  }

  private getFieldValue(field: string, data: any): any {
    return field.split('.').reduce((obj, key) => obj?.[key], data);
  }

  // Action execution methods
  private async sendNotificationAction(action: any, rule: AlertRule): Promise<Notification[]> {
    const notifications: Notification[] = [];
    const recipients = action.config.recipients || [];

    for (const recipientId of recipients) {
      const notification = createNotification({
        recipientId,
        recipientType: 'profile',
        type: this.getNotificationTypeFromTrigger(rule.triggerType),
        title: rule.name,
        message: action.config.customMessage || `Alert: ${rule.description}`,
        channels: action.config.channels || ['in_app', 'email'],
        priority: action.config.priority || 'medium',
        createdBy: 'system'
      });

      notifications.push(notification);
    }

    return notifications;
  }

  private async sendEmailAction(action: any, rule: AlertRule): Promise<any> {
    // Email sending implementation would go here
    console.log('Sending email for alert:', rule.name);
    return { sent: true, recipients: action.config.recipients };
  }

  private async sendSmsAction(action: any, rule: AlertRule): Promise<any> {
    // SMS sending implementation would go here
    console.log('Sending SMS for alert:', rule.name);
    return { sent: true, recipients: action.config.recipients };
  }

  private async createTaskAction(action: any, rule: AlertRule): Promise<any> {
    // Task creation implementation would go here
    console.log('Creating task for alert:', rule.name);
    return { taskId: `task-${Date.now()}`, assignee: action.config.taskAssignee };
  }

  private async updateStatusAction(action: any, rule: AlertRule): Promise<any> {
    // Status update implementation would go here
    console.log('Updating status for alert:', rule.name);
    return { updated: true, newStatus: action.config.statusUpdate };
  }

  // Helper methods
  private checkFrequencyConstraints(rule: AlertRule): boolean {
    if (!rule.lastTriggered) return true;

    const now = new Date();
    const daysSinceLastTrigger = differenceInDays(now, rule.lastTriggered);

    switch (rule.frequency) {
      case 'immediate':
        return true;
      case 'daily_digest':
        return daysSinceLastTrigger >= 1;
      case 'weekly_digest':
        return daysSinceLastTrigger >= 7;
      case 'once_per_condition':
        return false; // Would need more complex logic to track condition states
      case 'recurring_until_resolved':
        return daysSinceLastTrigger >= 1; // Daily until resolved
      default:
        return true;
    }
  }

  private getNotificationTypeFromTrigger(triggerType: string): any {
    const typeMap: Record<string, string> = {
      'payment_overdue': 'billing_reminder',
      'attendance_missed': 'attendance_alert',
      'enrollment_deadline': 'enrollment_reminder',
      'assignment_overdue': 'assignment_due',
      'schedule_change': 'schedule_change',
      'payroll_ready': 'payroll_ready',
      'low_balance': 'billing_reminder',
      'repeated_absence': 'attendance_alert',
      'class_cancellation': 'class_cancelled',
      'system_maintenance': 'system_maintenance'
    };

    return typeMap[triggerType] || 'announcement';
  }

  private extractConditionData(rule: AlertRule, data: AlertProcessingData): Record<string, any> {
    // Extract relevant data that triggered the rule
    return {
      triggerType: rule.triggerType,
      triggeredAt: new Date(),
      dataSnapshot: {
        invoiceCount: data.invoices?.length || 0,
        attendanceCount: data.attendanceRecords?.length || 0,
        enrollmentCount: data.enrollments?.length || 0,
        assignmentCount: data.assignments?.length || 0
      }
    };
  }

  // Public methods for managing rules and logs
  public addRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  public removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  public getLogs(ruleId?: string): AlertLog[] {
    return ruleId 
      ? this.logs.filter(log => log.ruleId === ruleId)
      : this.logs;
  }

  public getActiveRules(): AlertRule[] {
    return this.rules.filter(rule => rule.isActive);
  }
}

// Data interface for alert processing
export interface AlertProcessingData {
  invoices?: Invoice[];
  attendanceRecords?: AttendanceRecord[];
  enrollments?: Enrollment[];
  assignments?: Assignment[];
  meetings?: Meeting[];
  payrolls?: TeacherPayroll[];
  familyAccounts?: any[];
}

// Utility functions for creating common alert rules
export function createPaymentReminderRule(organizationId: string): AlertRule {
  return {
    id: `rule-payment-reminder-${Date.now()}`,
    organizationId,
    name: 'Payment Reminder',
    description: 'Send reminders for overdue payments',
    isActive: true,
    triggerType: 'payment_overdue',
    conditions: [
      {
        field: 'count',
        operator: 'greater_than',
        value: 0
      }
    ],
    actions: [
      {
        type: 'send_notification',
        config: {
          channels: ['email', 'in_app'],
          priority: 'high',
          customMessage: 'You have overdue payments that require attention.'
        }
      }
    ],
    frequency: 'daily_digest',
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function createAttendanceAlertRule(organizationId: string): AlertRule {
  return {
    id: `rule-attendance-alert-${Date.now()}`,
    organizationId,
    name: 'Attendance Alert',
    description: 'Alert for missed attendance',
    isActive: true,
    triggerType: 'attendance_missed',
    conditions: [
      {
        field: 'count',
        operator: 'greater_than',
        value: 0
      }
    ],
    actions: [
      {
        type: 'send_notification',
        config: {
          channels: ['in_app', 'email'],
          priority: 'medium',
          customMessage: 'Student attendance requires attention.'
        }
      }
    ],
    frequency: 'immediate',
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}