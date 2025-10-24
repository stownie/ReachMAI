import type { 
  Invoice, 
  Payment, 
  FamilyAccount, 
  TuitionRate, 
  Discount,
  InvoiceLineItem
} from '../types';
import { format, addMonths, addDays, differenceInDays, isBefore } from 'date-fns';

// Billing Status Types
export type InvoiceStatus = Invoice['status'];
export type PaymentStatus = Payment['status'];

// Financial Statistics
export interface BillingStats {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  currentMonthRevenue: number;
  averageInvoiceAmount: number;
  paymentSuccessRate: number;
}

// Calculate billing statistics
export function calculateBillingStats(
  invoices: Invoice[],
  payments: Payment[]
): BillingStats {
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalOutstanding = invoices
    .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, invoice) => sum + invoice.amountDue, 0);
  
  const overdueInvoices = invoices.filter(i => 
    i.status === 'overdue' || (i.status === 'sent' && isBefore(i.dueDate, new Date()))
  );
  const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + invoice.amountDue, 0);
  
  const currentMonth = new Date();
  const currentMonthInvoices = invoices.filter(i => 
    i.issueDate.getMonth() === currentMonth.getMonth() && 
    i.issueDate.getFullYear() === currentMonth.getFullYear()
  );
  const currentMonthRevenue = currentMonthInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  
  const averageInvoiceAmount = invoices.length > 0 ? totalInvoiced / invoices.length : 0;
  
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const totalPaymentAttempts = payments.length;
  const paymentSuccessRate = totalPaymentAttempts > 0 
    ? (completedPayments / totalPaymentAttempts) * 100 
    : 0;

  return {
    totalInvoiced: Math.round(totalInvoiced * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalOutstanding: Math.round(totalOutstanding * 100) / 100,
    overdueAmount: Math.round(overdueAmount * 100) / 100,
    currentMonthRevenue: Math.round(currentMonthRevenue * 100) / 100,
    averageInvoiceAmount: Math.round(averageInvoiceAmount * 100) / 100,
    paymentSuccessRate: Math.round(paymentSuccessRate * 100) / 100
  };
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Get invoice status color
export function getInvoiceStatusColor(status: InvoiceStatus): string {
  switch (status) {
    case 'draft':
      return 'text-gray-600 bg-gray-100';
    case 'sent':
      return 'text-blue-600 bg-blue-100';
    case 'paid':
      return 'text-green-600 bg-green-100';
    case 'overdue':
      return 'text-red-600 bg-red-100';
    case 'cancelled':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Get payment status color
export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'refunded':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Get status display text
export function getInvoiceStatusText(status: InvoiceStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'sent':
      return 'Sent';
    case 'paid':
      return 'Paid';
    case 'overdue':
      return 'Overdue';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

export function getPaymentStatusText(status: PaymentStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'refunded':
      return 'Refunded';
    default:
      return 'Unknown';
  }
}

// Calculate days until due
export function getDaysUntilDue(dueDate: Date): number {
  return differenceInDays(dueDate, new Date());
}

// Format due date with urgency
export function formatDueDateWithUrgency(dueDate: Date): { text: string; urgent: boolean } {
  const days = getDaysUntilDue(dueDate);
  
  if (days < 0) {
    return { 
      text: `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`, 
      urgent: true 
    };
  } else if (days === 0) {
    return { text: 'Due today', urgent: true };
  } else if (days === 1) {
    return { text: 'Due tomorrow', urgent: true };
  } else if (days <= 7) {
    return { text: `Due in ${days} days`, urgent: true };
  } else {
    return { text: format(dueDate, 'MMM d, yyyy'), urgent: false };
  }
}

// Check if invoice is overdue
export function isInvoiceOverdue(invoice: Invoice): boolean {
  return invoice.status !== 'paid' && isBefore(invoice.dueDate, new Date());
}

// Calculate total family balance
export function calculateFamilyBalance(
  invoices: Invoice[]
): { currentBalance: number; overdueBalance: number } {
  const unpaidInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');
  const currentBalance = unpaidInvoices.reduce((sum, invoice) => sum + invoice.amountDue, 0);
  
  const overdueInvoices = unpaidInvoices.filter(isInvoiceOverdue);
  const overdueBalance = overdueInvoices.reduce((sum, invoice) => sum + invoice.amountDue, 0);
  
  return {
    currentBalance: Math.round(currentBalance * 100) / 100,
    overdueBalance: Math.round(overdueBalance * 100) / 100
  };
}

// Generate next billing date
export function getNextBillingDate(
  lastBillingDate: Date,
  frequency: TuitionRate['frequency']
): Date {
  switch (frequency) {
    case 'monthly':
      return addMonths(lastBillingDate, 1);
    case 'weekly':
      return addDays(lastBillingDate, 7);
    case 'per-lesson':
      // For per-lesson billing, this would depend on lesson schedule
      return addDays(lastBillingDate, 1);
    case 'per-term':
      // Assume terms are 3 months
      return addMonths(lastBillingDate, 3);
    case 'annual':
      return addMonths(lastBillingDate, 12);
    default:
      return addMonths(lastBillingDate, 1);
  }
}

// Calculate line item total
export function calculateLineItemTotal(lineItem: InvoiceLineItem): number {
  return Math.round(lineItem.quantity * lineItem.unitPrice * 100) / 100;
}

// Calculate invoice totals
export function calculateInvoiceTotals(
  lineItems: InvoiceLineItem[],
  taxRate: number = 0,
  discountAmount: number = 0
): { subtotal: number; taxAmount: number; totalAmount: number } {
  const subtotal = lineItems.reduce((sum, item) => sum + calculateLineItemTotal(item), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount - discountAmount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  };
}

// Apply discount to amount
export function applyDiscount(amount: number, discount: Discount): number {
  if (discount.type === 'percentage') {
    return amount * (discount.value / 100);
  } else {
    return Math.min(discount.value, amount); // Don't discount more than the amount
  }
}

// Check if family qualifies for discount
export function checkDiscountEligibility(
  familyAccount: FamilyAccount,
  discount: Discount
): boolean {
  return discount.requirements.every(requirement => {
    switch (requirement.type) {
      case 'sibling_count':
        const siblingCount = familyAccount.studentIds.length;
        return compareValues(siblingCount, requirement.value as number, requirement.comparison || 'greater_equal');
      
      case 'early_payment':
        // This would check if payment was made early, implementation depends on business logic
        return true;
      
      // Add other requirement types as needed
      default:
        return false;
    }
  });
}

// Helper function to compare values
function compareValues(actual: number, expected: number, comparison: string): boolean {
  switch (comparison) {
    case 'greater_than':
      return actual > expected;
    case 'less_than':
      return actual < expected;
    case 'equal_to':
      return actual === expected;
    case 'greater_equal':
      return actual >= expected;
    case 'less_equal':
      return actual <= expected;
    default:
      return false;
  }
}

// Sort invoices by priority (overdue first, then by due date)
export function sortInvoicesByPriority(invoices: Invoice[]): Invoice[] {
  return invoices.sort((a, b) => {
    const aOverdue = isInvoiceOverdue(a);
    const bOverdue = isInvoiceOverdue(b);
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // Both overdue or both not overdue, sort by due date
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
}

// Generate billing summary text
export function generateBillingSummary(stats: BillingStats): string {
  const { totalOutstanding, overdueAmount, paymentSuccessRate } = stats;
  
  if (overdueAmount > 0) {
    return `${formatCurrency(overdueAmount)} overdue. Total outstanding: ${formatCurrency(totalOutstanding)}`;
  } else if (totalOutstanding > 0) {
    return `${formatCurrency(totalOutstanding)} outstanding. Payment success rate: ${paymentSuccessRate}%`;
  } else {
    return `All invoices paid. Payment success rate: ${paymentSuccessRate}%`;
  }
}