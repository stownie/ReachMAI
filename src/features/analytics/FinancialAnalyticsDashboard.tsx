import { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  PieChart,
  BarChart3,
  Download
} from 'lucide-react';
// Mock data removed - use real API data
import type { FinancialMetrics, PaymentAnalytics, BudgetForecast } from '../../types';

export default function FinancialAnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedView, setSelectedView] = useState<'overview' | 'payments' | 'budget'>('overview');

  // TODO: Replace with real API calls
  const financialMetrics: FinancialMetrics | null = null;
  const paymentAnalytics: PaymentAnalytics | null = null;
  const budgetForecast: BudgetForecast | null = null;

  if (!financialMetrics || !paymentAnalytics || !budgetForecast) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Financial Analytics</h2>
          <p className="text-gray-500">No data available. Connect to real API to view financial analytics.</p>
        </div>
      </div>
    );
  }

  const profitMargin = ((financialMetrics.netProfit / financialMetrics.totalRevenue) * 100);
  const growthRate = 8.5; // Mock growth rate
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Analytics</h1>
            <p className="text-gray-600">
              Revenue tracking, payment analytics, and budget forecasting
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="block w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedView('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedView === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Revenue Overview
          </button>
          <button
            onClick={() => setSelectedView('payments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedView === 'payments'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Payment Analytics
          </button>
          <button
            onClick={() => setSelectedView('budget')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedView === 'budget'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Budget Forecast
          </button>
        </nav>
      </div>

      {/* Key Metrics Cards */}
      {selectedView === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${financialMetrics.totalRevenue.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="text-green-600 font-medium flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{growthRate}%
                  </span>
                  <span className="text-gray-600 ml-2">vs last month</span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Net Profit</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${financialMetrics.netProfit.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Margin:</span>
                  <span className="ml-2 text-gray-600">{profitMargin.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Students</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {financialMetrics.activeStudents}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">New:</span>
                  <span className="ml-2 text-gray-600">+{financialMetrics.newEnrollments}</span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Revenue per Student</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${financialMetrics.revenuePerStudent}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Utilization:</span>
                  <span className="ml-2 text-gray-600">{financialMetrics.utilizationRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Revenue Sources
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Enrollment Fees</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${financialMetrics.enrollmentRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((financialMetrics.enrollmentRevenue / financialMetrics.totalRevenue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Materials</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${financialMetrics.materialRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((financialMetrics.materialRevenue / financialMetrics.totalRevenue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Events</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${financialMetrics.eventRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((financialMetrics.eventRevenue / financialMetrics.totalRevenue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Other</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${financialMetrics.otherRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((financialMetrics.otherRevenue / financialMetrics.totalRevenue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Expense Breakdown
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Teacher Payroll</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${financialMetrics.teacherPayroll.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((financialMetrics.teacherPayroll / financialMetrics.totalExpenses) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Facility Costs</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${financialMetrics.facilityExpenses.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((financialMetrics.facilityExpenses / financialMetrics.totalExpenses) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Materials</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${financialMetrics.materialExpenses.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((financialMetrics.materialExpenses / financialMetrics.totalExpenses) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Operations</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${financialMetrics.operationalExpenses.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((financialMetrics.operationalExpenses / financialMetrics.totalExpenses) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Payment Analytics View */}
      {selectedView === 'payments' && (
        <PaymentAnalyticsView analytics={paymentAnalytics} />
      )}

      {/* Budget Forecast View */}
      {selectedView === 'budget' && (
        <BudgetForecastView forecast={budgetForecast} />
      )}
    </div>
  );
}

// Payment Analytics Component
function PaymentAnalyticsView({ analytics }: { analytics: PaymentAnalytics }) {
  const totalOutstanding = analytics.totalPending + analytics.totalOverdue;
  
  return (
    <div className="space-y-8">
      {/* Payment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Collected</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${analytics.totalCollected.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-5 py-3">
            <div className="text-sm text-green-700">
              {analytics.collectionRate.toFixed(1)}% collection rate
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${analytics.totalPending.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-3">
            <div className="text-sm text-blue-700">
              Avg {analytics.averagePaymentTime.toFixed(1)} days to pay
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${analytics.totalOverdue.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-red-50 px-5 py-3">
            <div className="text-sm text-red-700">
              {((analytics.totalOverdue / totalOutstanding) * 100).toFixed(1)}% of outstanding
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Refunds</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${analytics.refundsIssued.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 px-5 py-3">
            <div className="text-sm text-purple-700">
              {((analytics.refundsIssued / analytics.totalCollected) * 100).toFixed(2)}% of collections
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods & Revenue Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(analytics.paymentMethodBreakdown).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{method}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {((amount / analytics.totalCollected) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Revenue Types</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Monthly Recurring</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ${analytics.monthlyRecurring.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {((analytics.monthlyRecurring / analytics.totalCollected) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">One-time Payments</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ${analytics.oneTimePayments.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {((analytics.oneTimePayments / analytics.totalCollected) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Budget Forecast Component
function BudgetForecastView({ forecast }: { forecast: BudgetForecast }) {
  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'under_budget': return 'text-green-700 bg-green-100';
      case 'on_budget': return 'text-blue-700 bg-blue-100';
      case 'over_budget': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getBudgetStatusIcon = (status: string) => {
    switch (status) {
      case 'under_budget': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'on_budget': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'over_budget': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Budget Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{forecast.name}</h3>
            <div className="text-sm text-gray-500">
              Forecast Accuracy: {forecast.forecastAccuracy}%
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${forecast.totalBudget.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${forecast.totalSpent.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                ${forecast.totalCommitted.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Committed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${forecast.remainingBudget.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Budget Categories</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {forecast.categories.map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                    {getBudgetStatusIcon(category.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getBudgetStatusColor(category.status).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                      {category.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${category.spentAmount.toLocaleString()} / ${category.budgetedAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {((category.spentAmount / category.budgetedAmount) * 100).toFixed(1)}% used
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full ${
                      category.status === 'over_budget' ? 'bg-red-500' :
                      category.status === 'on_budget' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min((category.spentAmount / category.budgetedAmount) * 100, 100)}%` 
                    }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Spent</div>
                    <div className="font-medium">${category.spentAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Committed</div>
                    <div className="font-medium">${category.committedAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Variance</div>
                    <div className={`font-medium ${category.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {category.variance >= 0 ? '+' : ''}${category.variance.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}