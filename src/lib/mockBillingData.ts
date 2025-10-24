import type { 
  FamilyAccount, 
  Invoice, 
  Payment, 
  TuitionRate, 
  Fee, 
  Discount,
  InvoiceLineItem,
  PaymentMethod,
  Address,
  BillingPreferences 
} from '../types';
import { subDays, subWeeks, subMonths, addDays, addWeeks } from 'date-fns';

// Mock Addresses
export const mockAddresses: Address[] = [
  {
    id: 'addr-001',
    street1: '123 Maple Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'USA'
  },
  {
    id: 'addr-002',
    street1: '456 Oak Avenue',
    street2: 'Apt 2B',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62702',
    country: 'USA'
  },
  {
    id: 'addr-003',
    street1: '789 Pine Road',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62703',
    country: 'USA'
  }
];

// Mock Payment Methods
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm-001',
    type: 'credit_card',
    isDefault: true,
    lastFour: '4242',
    expiryMonth: 12,
    expiryYear: 2027,
    cardBrand: 'Visa',
    isActive: true
  },
  {
    id: 'pm-002',
    type: 'bank_account',
    isDefault: false,
    lastFour: '1234',
    bankName: 'First National Bank',
    isActive: true
  },
  {
    id: 'pm-003',
    type: 'credit_card',
    isDefault: false,
    lastFour: '8888',
    expiryMonth: 8,
    expiryYear: 2026,
    cardBrand: 'Mastercard',
    isActive: true
  }
];

// Mock Billing Preferences
export const mockBillingPreferences: BillingPreferences[] = [
  {
    billingCycle: 'monthly',
    billingDate: 1,
    emailNotifications: true,
    smsNotifications: false,
    paperStatements: false,
    autoPayEnabled: true
  },
  {
    billingCycle: 'monthly',
    billingDate: 15,
    emailNotifications: true,
    smsNotifications: true,
    paperStatements: true,
    autoPayEnabled: false
  }
];

// Mock Family Accounts
export const mockFamilyAccounts: FamilyAccount[] = [
  {
    id: 'family-001',
    accountId: 'account-001',
    parentIds: ['parent-001'],
    studentIds: ['student-001', 'student-002'],
    billingAddress: mockAddresses[0],
    paymentMethods: [mockPaymentMethods[0], mockPaymentMethods[1]],
    currentBalance: 580.00,
    creditBalance: 0,
    autoPayEnabled: true,
    billingPreferences: mockBillingPreferences[0],
    createdAt: subMonths(new Date(), 6),
    updatedAt: subDays(new Date(), 3)
  },
  {
    id: 'family-002',
    accountId: 'account-002',
    parentIds: ['parent-002'],
    studentIds: ['student-003'],
    billingAddress: mockAddresses[1],
    paymentMethods: [mockPaymentMethods[2]],
    currentBalance: 0,
    creditBalance: 25.00,
    autoPayEnabled: false,
    billingPreferences: mockBillingPreferences[1],
    createdAt: subMonths(new Date(), 4),
    updatedAt: subDays(new Date(), 1)
  },
  {
    id: 'family-003',
    accountId: 'account-003',
    parentIds: ['parent-003'],
    studentIds: ['student-004', 'student-005'],
    billingAddress: mockAddresses[2],
    paymentMethods: [mockPaymentMethods[1]],
    currentBalance: 1250.00,
    creditBalance: 0,
    autoPayEnabled: true,
    billingPreferences: mockBillingPreferences[0],
    createdAt: subMonths(new Date(), 8),
    updatedAt: subWeeks(new Date(), 1)
  }
];

// Mock Tuition Rates
export const mockTuitionRates: TuitionRate[] = [
  {
    id: 'rate-001',
    programId: 'prog-001',
    name: 'Piano Lessons - Individual',
    amount: 120.00,
    frequency: 'monthly',
    description: '4 individual 30-minute lessons per month',
    effectiveDate: subMonths(new Date(), 12),
  },
  {
    id: 'rate-002',
    programId: 'prog-002',
    name: 'Guitar Lessons - Individual',
    amount: 110.00,
    frequency: 'monthly',
    description: '4 individual 30-minute lessons per month',
    effectiveDate: subMonths(new Date(), 12),
  },
  {
    id: 'rate-003',
    programId: 'prog-003',
    name: 'Youth Orchestra',
    amount: 85.00,
    frequency: 'monthly',
    description: 'Weekly group rehearsals and performances',
    effectiveDate: subMonths(new Date(), 12),
  },
  {
    id: 'rate-004',
    programId: 'prog-001',
    name: 'Piano Lessons - Per Lesson',
    amount: 35.00,
    frequency: 'per-lesson',
    description: 'Individual 30-minute lesson',
    effectiveDate: subMonths(new Date(), 12),
  }
];

// Mock Fees
export const mockFees: Fee[] = [
  {
    id: 'fee-001',
    organizationId: 'org-001',
    name: 'Registration Fee',
    description: 'One-time registration fee for new students',
    amount: 50.00,
    type: 'registration',
    isRequired: true,
    applicablePrograms: ['prog-001', 'prog-002', 'prog-003'],
    effectiveDate: subMonths(new Date(), 12),
  },
  {
    id: 'fee-002',
    organizationId: 'org-001',
    name: 'Recital Fee',
    description: 'Participation in annual recital',
    amount: 25.00,
    type: 'recital',
    isRequired: false,
    applicablePrograms: ['prog-001', 'prog-002'],
    effectiveDate: subMonths(new Date(), 6),
    endDate: addWeeks(new Date(), 4)
  },
  {
    id: 'fee-003',
    organizationId: 'org-001',
    name: 'Late Payment Fee',
    description: 'Fee for payments received after due date',
    amount: 15.00,
    type: 'late',
    isRequired: false,
    applicablePrograms: [],
    effectiveDate: subMonths(new Date(), 12),
  },
  {
    id: 'fee-004',
    organizationId: 'org-001',
    name: 'Music Books & Materials',
    description: 'Required music books and sheet music',
    amount: 40.00,
    type: 'material',
    isRequired: true,
    applicablePrograms: ['prog-001', 'prog-002'],
    effectiveDate: subMonths(new Date(), 12),
  }
];

// Mock Discounts
export const mockDiscounts: Discount[] = [
  {
    id: 'disc-001',
    organizationId: 'org-001',
    name: 'Sibling Discount',
    description: '10% discount for families with 2+ students',
    type: 'percentage',
    value: 10,
    applicableTo: 'tuition',
    requirements: [
      {
        type: 'sibling_count',
        value: 2,
        comparison: 'greater_equal'
      }
    ],
    isActive: true,
    startDate: subMonths(new Date(), 12),
  },
  {
    id: 'disc-002',
    organizationId: 'org-001',
    name: 'Early Payment Discount',
    description: '$10 off for payments made 10+ days early',
    type: 'fixed_amount',
    value: 10,
    applicableTo: 'all',
    requirements: [
      {
        type: 'early_payment',
        value: 10
      }
    ],
    isActive: true,
    startDate: subMonths(new Date(), 6),
  },
  {
    id: 'disc-003',
    organizationId: 'org-001',
    name: 'Multi-Program Discount',
    description: '15% discount for students enrolled in 3+ programs',
    type: 'percentage',
    value: 15,
    applicableTo: 'tuition',
    requirements: [
      {
        type: 'program_enrollment',
        value: 3,
        comparison: 'greater_equal'
      }
    ],
    isActive: true,
    startDate: subMonths(new Date(), 3),
  }
];

// Mock Invoice Line Items
export const mockLineItems: InvoiceLineItem[] = [
  {
    id: 'li-001',
    description: 'Piano Lessons - November 2024',
    studentId: 'student-001',
    sectionId: 'section-001',
    quantity: 1,
    unitPrice: 120.00,
    totalPrice: 120.00,
    type: 'tuition'
  },
  {
    id: 'li-002',
    description: 'Guitar Lessons - November 2024',
    studentId: 'student-002',
    sectionId: 'section-002',
    quantity: 1,
    unitPrice: 110.00,
    totalPrice: 110.00,
    type: 'tuition'
  },
  {
    id: 'li-003',
    description: 'Sibling Discount (10%)',
    quantity: 1,
    unitPrice: -23.00,
    totalPrice: -23.00,
    type: 'discount'
  },
  {
    id: 'li-004',
    description: 'Recital Fee',
    studentId: 'student-001',
    quantity: 1,
    unitPrice: 25.00,
    totalPrice: 25.00,
    type: 'fee'
  }
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    familyAccountId: 'family-001',
    invoiceNumber: 'INV-2024-001',
    issueDate: subDays(new Date(), 15),
    dueDate: addDays(new Date(), 15),
    billingPeriodStart: subDays(new Date(), 30),
    billingPeriodEnd: new Date(),
    lineItems: mockLineItems.slice(0, 4),
    subtotal: 230.00,
    taxAmount: 0,
    discountAmount: 23.00,
    totalAmount: 207.00,
    amountPaid: 0,
    amountDue: 207.00,
    status: 'sent',
    sentAt: subDays(new Date(), 15),
    createdAt: subDays(new Date(), 20),
    updatedAt: subDays(new Date(), 15)
  },
  {
    id: 'inv-002',
    familyAccountId: 'family-002',
    invoiceNumber: 'INV-2024-002',
    issueDate: subDays(new Date(), 25),
    dueDate: subDays(new Date(), 10),
    billingPeriodStart: subDays(new Date(), 60),
    billingPeriodEnd: subDays(new Date(), 30),
    lineItems: [
      {
        id: 'li-005',
        description: 'Youth Orchestra - October 2024',
        studentId: 'student-003',
        sectionId: 'section-003',
        quantity: 1,
        unitPrice: 85.00,
        totalPrice: 85.00,
        type: 'tuition'
      }
    ],
    subtotal: 85.00,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 85.00,
    amountPaid: 85.00,
    amountDue: 0,
    status: 'paid',
    sentAt: subDays(new Date(), 25),
    paidAt: subDays(new Date(), 15),
    createdAt: subDays(new Date(), 30),
    updatedAt: subDays(new Date(), 15)
  },
  {
    id: 'inv-003',
    familyAccountId: 'family-003',
    invoiceNumber: 'INV-2024-003',
    issueDate: subDays(new Date(), 35),
    dueDate: subDays(new Date(), 5), // Overdue
    billingPeriodStart: subDays(new Date(), 60),
    billingPeriodEnd: subDays(new Date(), 30),
    lineItems: [
      {
        id: 'li-006',
        description: 'Piano Lessons - September 2024',
        studentId: 'student-004',
        sectionId: 'section-001',
        quantity: 1,
        unitPrice: 120.00,
        totalPrice: 120.00,
        type: 'tuition'
      },
      {
        id: 'li-007',
        description: 'Guitar Lessons - September 2024',
        studentId: 'student-005',
        sectionId: 'section-002',
        quantity: 1,
        unitPrice: 110.00,
        totalPrice: 110.00,
        type: 'tuition'
      },
      {
        id: 'li-008',
        description: 'Late Payment Fee',
        quantity: 1,
        unitPrice: 15.00,
        totalPrice: 15.00,
        type: 'penalty'
      }
    ],
    subtotal: 230.00,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 245.00,
    amountPaid: 0,
    amountDue: 245.00,
    status: 'overdue',
    sentAt: subDays(new Date(), 35),
    createdAt: subDays(new Date(), 40),
    updatedAt: subDays(new Date(), 30)
  }
];

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: 'pay-001',
    familyAccountId: 'family-002',
    invoiceId: 'inv-002',
    amount: 85.00,
    paymentMethodId: 'pm-003',
    paymentDate: subDays(new Date(), 15),
    status: 'completed',
    transactionId: 'txn_1234567890',
    processorResponse: 'Payment successful',
    createdAt: subDays(new Date(), 15),
    updatedAt: subDays(new Date(), 15)
  },
  {
    id: 'pay-002',
    familyAccountId: 'family-001',
    amount: 100.00,
    paymentMethodId: 'pm-001',
    paymentDate: subDays(new Date(), 5),
    status: 'pending',
    notes: 'Partial payment on account',
    createdAt: subDays(new Date(), 5),
    updatedAt: subDays(new Date(), 5)
  },
  {
    id: 'pay-003',
    familyAccountId: 'family-003',
    invoiceId: 'inv-003',
    amount: 245.00,
    paymentMethodId: 'pm-001',
    paymentDate: subDays(new Date(), 2),
    status: 'failed',
    processorResponse: 'Insufficient funds',
    notes: 'Card declined - insufficient funds',
    createdAt: subDays(new Date(), 2),
    updatedAt: subDays(new Date(), 2)
  }
];

// Helper functions
export function getInvoicesForFamily(familyAccountId: string): Invoice[] {
  return mockInvoices.filter(invoice => invoice.familyAccountId === familyAccountId);
}

export function getPaymentsForFamily(familyAccountId: string): Payment[] {
  return mockPayments.filter(payment => payment.familyAccountId === familyAccountId);
}

export function getFamilyAccountById(familyAccountId: string): FamilyAccount | undefined {
  return mockFamilyAccounts.find(account => account.id === familyAccountId);
}

export function getInvoiceById(invoiceId: string): Invoice | undefined {
  return mockInvoices.find(invoice => invoice.id === invoiceId);
}

export function getPaymentById(paymentId: string): Payment | undefined {
  return mockPayments.find(payment => payment.id === paymentId);
}

export function getTuitionRateByProgram(programId: string): TuitionRate[] {
  return mockTuitionRates.filter(rate => rate.programId === programId);
}

export function getApplicableFeesForProgram(programId: string): Fee[] {
  return mockFees.filter(fee => 
    fee.applicablePrograms.includes(programId) || fee.applicablePrograms.length === 0
  );
}

export function getActiveDiscounts(): Discount[] {
  return mockDiscounts.filter(discount => discount.isActive);
}

// Get overdue invoices
export function getOverdueInvoices(): Invoice[] {
  return mockInvoices.filter(invoice => invoice.status === 'overdue');
}

// Get recent payments (last 30 days)
export function getRecentPayments(): Payment[] {
  const thirtyDaysAgo = subDays(new Date(), 30);
  return mockPayments.filter(payment => payment.paymentDate >= thirtyDaysAgo);
}

// Get pending payments
export function getPendingPayments(): Payment[] {
  return mockPayments.filter(payment => payment.status === 'pending');
}