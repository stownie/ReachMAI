import { format, startOfMonth, endOfMonth } from 'date-fns';
import type { TeacherPayroll, SimplePayrollPeriod, Meeting } from '../types';

// Payroll calculation utilities
export function calculateTeacherPayroll(
  teacherId: string, 
  period: SimplePayrollPeriod,
  meetings: Meeting[]
): TeacherPayroll {
  const teacherMeetings = meetings.filter(meeting => 
    meeting.teacherIds?.includes(teacherId) &&
    meeting.startTime >= period.startDate &&
    meeting.startTime <= period.endDate
  );

  let regularHours = 0;
  let substituteHours = 0;
  let regularRate = 45; // Default regular rate
  let substituteRate = 50; // Default substitute rate

  teacherMeetings.forEach(meeting => {
    const duration = (meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60 * 60);
    
    // For now, assume all hours are regular (we'd need additional data to determine substitutes)
    regularHours += duration;
  });

  const regularPay = regularHours * regularRate;
  const substitutePay = substituteHours * substituteRate;
  const grossPay = regularPay + substitutePay;

  // Simple tax calculation (in real system, this would be more complex)
  const federalTax = grossPay * 0.22;
  const stateTax = grossPay * 0.06;
  const socialSecurity = grossPay * 0.062;
  const medicare = grossPay * 0.0145;
  const totalDeductions = federalTax + stateTax + socialSecurity + medicare;
  const netPay = grossPay - totalDeductions;

  return {
    id: `payroll-${teacherId}-${format(period.startDate, 'yyyy-MM')}`,
    teacherId,
    periodId: period.id,
    period,
    regularHours,
    substituteHours,
    totalHours: regularHours + substituteHours,
    regularRate,
    substituteRate,
    regularPay,
    substitutePay,
    grossPay,
    deductions: {
      federalTax,
      stateTax,
      socialSecurity,
      medicare,
      total: totalDeductions
    },
    netPay,
    status: 'pending',
    generatedDate: new Date(),
    paidDate: undefined,
    meetings: teacherMeetings.map(meeting => ({
      meetingId: meeting.id,
      date: meeting.startTime,
      duration: (meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60 * 60),
      rate: regularRate, // Using regular rate for all meetings in this simplified version
      isSubstitute: false // Simplified - no substitute tracking for now
    }))
  };
}

export function generatePayrollPeriods(year: number): SimplePayrollPeriod[] {
  const periods: SimplePayrollPeriod[] = [];
  
  for (let month = 0; month < 12; month++) {
    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(new Date(year, month));
    
    periods.push({
      id: `period-${year}-${month + 1}`,
      startDate,
      endDate,
      name: format(startDate, 'MMMM yyyy'),
      status: month < new Date().getMonth() ? 'paid' : 'open'
    });
  }
  
  return periods;
}

export function calculatePayrollStats(payrolls: TeacherPayroll[]) {
  const totalGrossPay = payrolls.reduce((sum, p) => sum + p.grossPay, 0);
  const totalNetPay = payrolls.reduce((sum, p) => sum + p.netPay, 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + p.deductions.total, 0);
  const totalHours = payrolls.reduce((sum, p) => sum + p.totalHours, 0);
  const regularHours = payrolls.reduce((sum, p) => sum + p.regularHours, 0);
  const substituteHours = payrolls.reduce((sum, p) => sum + p.substituteHours, 0);

  return {
    totalPayrolls: payrolls.length,
    totalGrossPay,
    totalNetPay,
    totalDeductions,
    totalHours,
    regularHours,
    substituteHours,
    averageGrossPay: payrolls.length > 0 ? totalGrossPay / payrolls.length : 0,
    averageHoursPerPayroll: payrolls.length > 0 ? totalHours / payrolls.length : 0,
    pendingPayrolls: payrolls.filter(p => p.status === 'pending').length,
    paidPayrolls: payrolls.filter(p => p.status === 'paid').length
  };
}

export function formatHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h ${minutes}m`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function getPayrollStatusColor(status: TeacherPayroll['status']): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'approved':
      return 'text-blue-600 bg-blue-50';
    case 'paid':
      return 'text-green-600 bg-green-50';
    case 'rejected':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function exportPayrollToCsv(payrolls: TeacherPayroll[]): string {
  const headers = [
    'Teacher ID',
    'Period',
    'Regular Hours',
    'Substitute Hours',
    'Total Hours',
    'Regular Rate',
    'Substitute Rate',
    'Regular Pay',
    'Substitute Pay',
    'Gross Pay',
    'Federal Tax',
    'State Tax',
    'Social Security',
    'Medicare',
    'Total Deductions',
    'Net Pay',
    'Status',
    'Generated Date',
    'Paid Date'
  ];

  const rows = payrolls.map(payroll => [
    payroll.teacherId,
    payroll.period.name,
    payroll.regularHours.toFixed(2),
    payroll.substituteHours.toFixed(2),
    payroll.totalHours.toFixed(2),
    payroll.regularRate.toFixed(2),
    payroll.substituteRate.toFixed(2),
    payroll.regularPay.toFixed(2),
    payroll.substitutePay.toFixed(2),
    payroll.grossPay.toFixed(2),
    payroll.deductions.federalTax.toFixed(2),
    payroll.deductions.stateTax.toFixed(2),
    payroll.deductions.socialSecurity.toFixed(2),
    payroll.deductions.medicare.toFixed(2),
    payroll.deductions.total.toFixed(2),
    payroll.netPay.toFixed(2),
    payroll.status,
    format(payroll.generatedDate, 'yyyy-MM-dd'),
    payroll.paidDate ? format(payroll.paidDate, 'yyyy-MM-dd') : ''
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}