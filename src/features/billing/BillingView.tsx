import { useState } from 'react';
import {
  DollarSign,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  FileText,
  Filter,
  Search,
  Download,
  Eye,
  Send,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import type { UserProfile, Invoice } from '../../types';
import {
  calculateBillingStats,
  formatCurrency,
  getInvoiceStatusColor,
  getInvoiceStatusText,
  getPaymentStatusColor,
  getPaymentStatusText,
  formatDueDateWithUrgency,
  isInvoiceOverdue,
  sortInvoicesByPriority,
  generateBillingSummary
} from '../../lib/billing';
import {
  mockInvoices,
  mockPayments,
  mockFamilyAccounts,
  getInvoicesForFamily,
  getPaymentsForFamily
} from '../../lib/mockBillingData';

interface BillingViewProps {
  currentProfile: UserProfile;
}

type BillingFilter = 'all' | 'sent' | 'paid' | 'overdue' | 'draft';

export default function BillingView({ currentProfile }: BillingViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<BillingFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'invoices' | 'payments' | 'families'>('invoices');

  // Filter data based on user profile and view
  const allInvoices = currentProfile.type === 'parent' 
    ? getInvoicesForFamily('family-001') // Demo: show first family's invoices
    : mockInvoices;

  const allPayments = currentProfile.type === 'parent'
    ? getPaymentsForFamily('family-001')
    : mockPayments;

  // Apply filters
  const filteredInvoices = allInvoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.lineItems.some(item => 
                           item.description.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    if (!matchesSearch) return false;

    switch (selectedFilter) {
      case 'sent':
        return invoice.status === 'sent';
      case 'paid':
        return invoice.status === 'paid';
      case 'overdue':
        return invoice.status === 'overdue' || isInvoiceOverdue(invoice);
      case 'draft':
        return invoice.status === 'draft';
      default:
        return true;
    }
  });

  const sortedInvoices = sortInvoicesByPriority(filteredInvoices);

  // Calculate stats
  const stats = calculateBillingStats(allInvoices, allPayments);

  const handleViewInvoice = (invoiceId: string) => {
    console.log('Viewing invoice:', invoiceId);
  };

  const handleSendInvoice = (invoiceId: string) => {
    console.log('Sending invoice:', invoiceId);
  };

  const renderInvoiceCard = (invoice: Invoice) => {
    const dueDateInfo = formatDueDateWithUrgency(invoice.dueDate);
    const familyAccount = mockFamilyAccounts.find(f => f.id === invoice.familyAccountId);

    return (
      <div key={invoice.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {invoice.invoiceNumber}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getInvoiceStatusColor(invoice.status)
              }`}>
                {getInvoiceStatusText(invoice.status)}
              </span>
              {isInvoiceOverdue(invoice) && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <p>Family: {familyAccount?.accountId || 'Unknown'}</p>
              <p>Issue Date: {invoice.issueDate.toLocaleDateString()}</p>
              <p className={dueDateInfo.urgent ? 'text-red-600 font-medium' : ''}>
                Due: {dueDateInfo.text}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(invoice.totalAmount)}
            </div>
            {invoice.amountDue > 0 && (
              <div className="text-sm text-red-600">
                {formatCurrency(invoice.amountDue)} due
              </div>
            )}
          </div>
        </div>

        {/* Line Items Summary */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
          <div className="space-y-1">
            {invoice.lineItems.slice(0, 3).map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate pr-2">{item.description}</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            ))}
            {invoice.lineItems.length > 3 && (
              <div className="text-xs text-gray-500">
                +{invoice.lineItems.length - 3} more items
              </div>
            )}
          </div>
        </div>

        {/* Payment Status */}
        {invoice.amountPaid > 0 && (
          <div className="mb-4 p-3 bg-green-50 rounded-md">
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm text-green-800">
                {formatCurrency(invoice.amountPaid)} paid
                {invoice.paidAt && ` on ${invoice.paidAt.toLocaleDateString()}`}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewInvoice(invoice.id)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </button>
            {currentProfile.type !== 'parent' && invoice.status === 'draft' && (
              <button
                onClick={() => handleSendInvoice(invoice.id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Send className="w-3 h-3 mr-1" />
                Send
              </button>
            )}
          </div>
          
          {currentProfile.type === 'parent' && invoice.amountDue > 0 && (
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700">
              <CreditCard className="w-4 h-4 mr-2" />
              Pay Now
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderPaymentCard = (payment: any) => {
    const invoice = payment.invoiceId ? mockInvoices.find(i => i.id === payment.invoiceId) : null;
    
    return (
      <div key={payment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {formatCurrency(payment.amount)}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getPaymentStatusColor(payment.status)
              }`}>
                {getPaymentStatusText(payment.status)}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Date: {payment.paymentDate.toLocaleDateString()}</p>
              {invoice && <p>Invoice: {invoice.invoiceNumber}</p>}
              {payment.transactionId && <p>Transaction: {payment.transactionId}</p>}
            </div>
          </div>
          <div className="flex items-center">
            {payment.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {payment.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
            {payment.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
          </div>
        </div>

        {payment.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">{payment.notes}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentProfile.type === 'parent' ? 'Billing & Payments' : 'Financial Management'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {generateBillingSummary(stats)}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            {currentProfile.type !== 'parent' && (
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                <FileText className="w-4 h-4 mr-2" />
                New Invoice
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats.totalInvoiced)}
              </p>
              <p className="text-sm text-gray-600">Total Invoiced</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats.totalPaid)}
              </p>
              <p className="text-sm text-gray-600">Total Paid</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats.overdueAmount)}
              </p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {stats.paymentSuccessRate}%
              </p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedView('invoices')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedView === 'invoices'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Invoices ({allInvoices.length})
            </button>
            <button
              onClick={() => setSelectedView('payments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedView === 'payments'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payments ({allPayments.length})
            </button>
            {currentProfile.type !== 'parent' && (
              <button
                onClick={() => setSelectedView('families')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedView === 'families'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Families ({mockFamilyAccounts.length})
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Filters and Search (only for invoices) */}
      {selectedView === 'invoices' && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as BillingFilter)}
                className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {selectedView === 'invoices' && (
          <>
            {sortedInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no invoices matching your criteria.
                </p>
              </div>
            ) : (
              sortedInvoices.map(renderInvoiceCard)
            )}
          </>
        )}

        {selectedView === 'payments' && (
          <>
            {allPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no payments to display.
                </p>
              </div>
            ) : (
              allPayments.map(renderPaymentCard)
            )}
          </>
        )}

        {selectedView === 'families' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockFamilyAccounts.map(family => (
              <div key={family.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Family Account {family.id.slice(-3)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {family.studentIds.length} student{family.studentIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      family.currentBalance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(family.currentBalance)}
                    </div>
                    <p className="text-xs text-gray-500">Current Balance</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Auto Pay</p>
                    <p className="font-medium">
                      {family.autoPayEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Billing Cycle</p>
                    <p className="font-medium capitalize">
                      {family.billingPreferences.billingCycle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}