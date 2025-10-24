import type { TeacherPayroll, SimplePayrollPeriod } from '../types';

// Mock Payroll Periods
export const mockPayrollPeriods: SimplePayrollPeriod[] = [
  {
    id: 'period-2024-09',
    startDate: new Date(2024, 8, 1), // September 2024
    endDate: new Date(2024, 8, 30),
    name: 'September 2024',
    status: 'paid'
  },
  {
    id: 'period-2024-10',
    startDate: new Date(2024, 9, 1), // October 2024
    endDate: new Date(2024, 9, 31),
    name: 'October 2024',
    status: 'paid'
  },
  {
    id: 'period-2024-11',
    startDate: new Date(2024, 10, 1), // November 2024
    endDate: new Date(2024, 10, 30),
    name: 'November 2024',
    status: 'locked'
  },
  {
    id: 'period-2024-12',
    startDate: new Date(2024, 11, 1), // December 2024
    endDate: new Date(2024, 11, 31),
    name: 'December 2024',
    status: 'open'
  }
];

// Mock Teacher Payroll Records
export const mockTeacherPayrolls: TeacherPayroll[] = [
  {
    id: 'payroll-teacher-1-nov-2024',
    teacherId: 'teacher-1',
    periodId: 'period-2024-11',
    period: mockPayrollPeriods[2],
    regularHours: 32.5,
    substituteHours: 6.0,
    totalHours: 38.5,
    regularRate: 45.00,
    substituteRate: 50.00,
    regularPay: 1462.50,
    substitutePay: 300.00,
    grossPay: 1762.50,
    deductions: {
      federalTax: 387.75,
      stateTax: 105.75,
      socialSecurity: 109.28,
      medicare: 25.56,
      total: 628.34
    },
    netPay: 1134.16,
    status: 'approved',
    generatedDate: new Date(2024, 10, 25),
    paidDate: undefined,
    meetings: [
      {
        meetingId: 'meeting-1',
        date: new Date(2024, 10, 1),
        duration: 1.5,
        rate: 45.00,
        isSubstitute: false
      },
      {
        meetingId: 'meeting-2',
        date: new Date(2024, 10, 3),
        duration: 2.0,
        rate: 50.00,
        isSubstitute: true
      }
      // ... more meetings would be listed here
    ],
    notes: 'Includes substitute coverage on 11/3 and 11/15'
  },
  {
    id: 'payroll-teacher-2-nov-2024',
    teacherId: 'teacher-2',
    periodId: 'period-2024-11',
    period: mockPayrollPeriods[2],
    regularHours: 28.0,
    substituteHours: 0,
    totalHours: 28.0,
    regularRate: 48.00,
    substituteRate: 52.00,
    regularPay: 1344.00,
    substitutePay: 0,
    grossPay: 1344.00,
    deductions: {
      federalTax: 295.68,
      stateTax: 80.64,
      socialSecurity: 83.33,
      medicare: 19.49,
      total: 479.14
    },
    netPay: 864.86,
    status: 'pending',
    generatedDate: new Date(2024, 10, 25),
    meetings: [
      {
        meetingId: 'meeting-10',
        date: new Date(2024, 10, 2),
        duration: 2.0,
        rate: 48.00,
        isSubstitute: false
      },
      {
        meetingId: 'meeting-11',
        date: new Date(2024, 10, 4),
        duration: 1.5,
        rate: 48.00,
        isSubstitute: false
      }
      // ... more meetings
    ]
  },
  {
    id: 'payroll-teacher-3-nov-2024',
    teacherId: 'teacher-3',
    periodId: 'period-2024-11',
    period: mockPayrollPeriods[2],
    regularHours: 42.0,
    substituteHours: 3.0,
    totalHours: 45.0,
    regularRate: 50.00,
    substituteRate: 55.00,
    regularPay: 2100.00,
    substitutePay: 165.00,
    grossPay: 2265.00,
    deductions: {
      federalTax: 498.30,
      stateTax: 135.90,
      socialSecurity: 140.43,
      medicare: 32.84,
      total: 807.47
    },
    netPay: 1457.53,
    status: 'paid',
    generatedDate: new Date(2024, 10, 25),
    paidDate: new Date(2024, 10, 28),
    meetings: [
      {
        meetingId: 'meeting-20',
        date: new Date(2024, 10, 1),
        duration: 3.0,
        rate: 50.00,
        isSubstitute: false
      },
      {
        meetingId: 'meeting-21',
        date: new Date(2024, 10, 5),
        duration: 1.5,
        rate: 55.00,
        isSubstitute: true
      }
      // ... more meetings
    ]
  },
  // October 2024 Records
  {
    id: 'payroll-teacher-1-oct-2024',
    teacherId: 'teacher-1',
    periodId: 'period-2024-10',
    period: mockPayrollPeriods[1],
    regularHours: 35.5,
    substituteHours: 4.5,
    totalHours: 40.0,
    regularRate: 45.00,
    substituteRate: 50.00,
    regularPay: 1597.50,
    substitutePay: 225.00,
    grossPay: 1822.50,
    deductions: {
      federalTax: 400.95,
      stateTax: 109.35,
      socialSecurity: 112.99,
      medicare: 26.43,
      total: 649.72
    },
    netPay: 1172.78,
    status: 'paid',
    generatedDate: new Date(2024, 9, 25),
    paidDate: new Date(2024, 9, 30),
    meetings: []
  }
];

// Helper functions for mock data
export function getMockTeacherPayrolls(teacherId?: string, periodId?: string): TeacherPayroll[] {
  let payrolls = mockTeacherPayrolls;
  
  if (teacherId) {
    payrolls = payrolls.filter(p => p.teacherId === teacherId);
  }
  
  if (periodId) {
    payrolls = payrolls.filter(p => p.periodId === periodId);
  }
  
  return payrolls;
}

export function getMockPayrollPeriods(): SimplePayrollPeriod[] {
  return mockPayrollPeriods;
}

export function getMockPayrollPeriod(periodId: string): SimplePayrollPeriod | undefined {
  return mockPayrollPeriods.find(period => period.id === periodId);
}

// Sample payroll statistics
export function getMockPayrollStats() {
  const currentPeriodPayrolls = mockTeacherPayrolls.filter(p => p.periodId === 'period-2024-11');
  
  return {
    totalTeachers: 3,
    totalPayrolls: currentPeriodPayrolls.length,
    totalGrossPay: currentPeriodPayrolls.reduce((sum, p) => sum + p.grossPay, 0),
    totalNetPay: currentPeriodPayrolls.reduce((sum, p) => sum + p.netPay, 0),
    totalHours: currentPeriodPayrolls.reduce((sum, p) => sum + p.totalHours, 0),
    averageHoursPerTeacher: currentPeriodPayrolls.length > 0 ? 
      currentPeriodPayrolls.reduce((sum, p) => sum + p.totalHours, 0) / currentPeriodPayrolls.length : 0,
    pendingApprovals: currentPeriodPayrolls.filter(p => p.status === 'pending').length,
    readyForPayment: currentPeriodPayrolls.filter(p => p.status === 'approved').length
  };
}