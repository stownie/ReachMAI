import { useState } from 'react';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Building,
  User,
  BarChart3,
  Download
} from 'lucide-react';
// Mock data removed - use real API data
import type { 
  OperationalMetrics, 
  ClassUtilizationMetric, 
  TeacherWorkloadMetric, 
  FacilityUsageMetric,
  EnrollmentTrendMetric,
  AttendancePatternMetric
} from '../../types';

export default function OperationalInsights() {
  const [selectedView, setSelectedView] = useState<'overview' | 'classes' | 'teachers' | 'facilities' | 'trends'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // TODO: Replace with real API call
  const metrics = null;



  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Operational Insights</h1>
            <p className="text-gray-600">
              Class utilization, teacher workload, and facility management analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="block w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
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
            Overview
          </button>
          <button
            onClick={() => setSelectedView('classes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedView === 'classes'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Class Analytics
          </button>
          <button
            onClick={() => setSelectedView('teachers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedView === 'teachers'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Teacher Workload
          </button>
          <button
            onClick={() => setSelectedView('facilities')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedView === 'facilities'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Facility Usage
          </button>
          <button
            onClick={() => setSelectedView('trends')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedView === 'trends'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Enrollment Trends
          </button>
        </nav>
      </div>

      {/* Content based on selected view */}
      {selectedView === 'overview' && (
        <OverviewSection metrics={metrics} />
      )}
      
      {selectedView === 'classes' && (
        <ClassAnalyticsSection classMetrics={metrics.classUtilization} />
      )}
      
      {selectedView === 'teachers' && (
        <TeacherWorkloadSection teacherMetrics={metrics.teacherWorkload} />
      )}
      
      {selectedView === 'facilities' && (
        <FacilityUsageSection facilityMetrics={metrics.facilityUsage} />
      )}
      
      {selectedView === 'trends' && (
        <EnrollmentTrendsSection 
          enrollmentTrends={metrics.enrollmentTrends}
          attendancePatterns={metrics.attendancePatterns}
        />
      )}
    </div>
  );
}

// Overview Section
function OverviewSection({ metrics }: { metrics: OperationalMetrics }) {
  const totalUtilization = metrics.classUtilization.reduce((sum, cls) => sum + cls.utilizationRate, 0) / metrics.classUtilization.length;
  const totalWaitlist = metrics.classUtilization.reduce((sum, cls) => sum + cls.waitlistLength, 0);

  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Class Size</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.averageClassSize}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm text-gray-600">
              Optimal: 8-12 students
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Utilization Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalUtilization.toFixed(1)}%</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm text-gray-600">
              Target: 80%+
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Waitlist</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalWaitlist}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm text-gray-600">
              Potential revenue opportunity
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Cancelled Classes</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.cancelledClasses}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm text-gray-600">
              {metrics.makeupClasses} makeup classes scheduled
            </div>
          </div>
        </div>
      </div>

      {/* Quick Class Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Class Performance Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.classUtilization.slice(0, 6).map((classMetric) => (
              <div key={classMetric.classId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{classMetric.className}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUtilizationColor(classMetric.utilizationRate)}`}>
                    {classMetric.utilizationRate.toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {classMetric.averageAttendance.toFixed(1)} / {classMetric.capacity} students
                </div>
                {classMetric.waitlistLength > 0 && (
                  <div className="text-xs text-amber-600 mt-1">
                    {classMetric.waitlistLength} on waitlist
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function getUtilizationColor(rate: number) {
    if (rate >= 85) return 'text-green-600 bg-green-100';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }
}

// Class Analytics Section
function ClassAnalyticsSection({ classMetrics }: { classMetrics: ClassUtilizationMetric[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Class Utilization Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waitlist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classMetrics.map((classMetric) => (
                <tr key={classMetric.classId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {classMetric.className}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classMetric.capacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classMetric.averageAttendance.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      classMetric.utilizationRate >= 85 ? 'text-green-600 bg-green-100' :
                      classMetric.utilizationRate >= 70 ? 'text-yellow-600 bg-yellow-100' :
                      'text-red-600 bg-red-100'
                    }`}>
                      {classMetric.utilizationRate.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classMetric.waitlistLength > 0 ? (
                      <span className="text-amber-600 font-medium">{classMetric.waitlistLength}</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classMetric.cancelledSessions > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-1">
                        {classMetric.cancelledSessions} cancelled
                      </span>
                    )}
                    {classMetric.makeupSessions > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {classMetric.makeupSessions} makeup
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Teacher Workload Section
function TeacherWorkloadSection({ teacherMetrics }: { teacherMetrics: TeacherWorkloadMetric[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teacherMetrics.map((teacher) => (
          <div key={teacher.teacherId} className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">{teacher.teacherName}</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Hours</span>
                  <span className="text-sm font-medium text-gray-900">{teacher.totalHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Teaching Hours</span>
                  <span className="text-sm font-medium text-gray-900">{teacher.teachingHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Admin Hours</span>
                  <span className="text-sm font-medium text-gray-900">{teacher.adminHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Students</span>
                  <span className="text-sm font-medium text-gray-900">{teacher.totalStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Avg Class Size</span>
                  <span className="text-sm font-medium text-gray-900">{teacher.averageClassSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Satisfaction</span>
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    {teacher.satisfactionRating.toFixed(1)}/5.0
                    {teacher.satisfactionRating >= 4.5 ? (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
                    ) : teacher.satisfactionRating >= 4.0 ? (
                      <CheckCircle className="h-4 w-4 text-yellow-500 ml-1" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500 ml-1" />
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Absence Rate</span>
                  <span className={`text-sm font-medium ${
                    teacher.absenceRate > 10 ? 'text-red-600' : 
                    teacher.absenceRate > 5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {teacher.absenceRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Facility Usage Section
function FacilityUsageSection({ facilityMetrics }: { facilityMetrics: FacilityUsageMetric[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {facilityMetrics.map((facility) => (
          <div key={facility.facilityId} className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">{facility.facilityName}</h3>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  facility.utilizationRate >= 85 ? 'text-green-600 bg-green-100' :
                  facility.utilizationRate >= 70 ? 'text-yellow-600 bg-yellow-100' :
                  'text-red-600 bg-red-100'
                }`}>
                  {facility.utilizationRate.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Hours</span>
                  <span className="text-sm font-medium text-gray-900">{facility.totalHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Booked Hours</span>
                  <span className="text-sm font-medium text-gray-900">{facility.bookedHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Maintenance Hours</span>
                  <span className="text-sm font-medium text-gray-900">{facility.maintenanceHours}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Peak Hours</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {facility.peakHours.map((timeSlot, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded"
                      >
                        {timeSlot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Enrollment Trends Section
function EnrollmentTrendsSection({ 
  enrollmentTrends, 
  attendancePatterns 
}: { 
  enrollmentTrends: EnrollmentTrendMetric[];
  attendancePatterns: AttendancePatternMetric[];
}) {
  return (
    <div className="space-y-8">
      {/* Enrollment Trends */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Enrollment Trends</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {enrollmentTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {trend.period.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-500">
                    Retention Rate: {trend.retentionRate.toFixed(1)}%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-medium">+{trend.newEnrollments}</div>
                    <div className="text-gray-500">New</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600 font-medium">{trend.renewals}</div>
                    <div className="text-gray-500">Renewals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-medium">-{trend.cancellations}</div>
                    <div className="text-gray-500">Cancelled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-600 font-medium">{trend.transfers}</div>
                    <div className="text-gray-500">Transfers</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${trend.netGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.netGrowth >= 0 ? '+' : ''}{trend.netGrowth}
                  </div>
                  <div className="text-xs text-gray-500">Net Growth</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Patterns */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Attendance Patterns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No Show Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late Arrival
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Early Departure
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendancePatterns.map((pattern, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pattern.dayOfWeek} {pattern.timeSlot}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pattern.averageAttendance.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      pattern.noShowRate > 15 ? 'text-red-600' :
                      pattern.noShowRate > 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {pattern.noShowRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      pattern.lateArrivalRate > 10 ? 'text-red-600' :
                      pattern.lateArrivalRate > 5 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {pattern.lateArrivalRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      pattern.earlyDepartureRate > 8 ? 'text-red-600' :
                      pattern.earlyDepartureRate > 5 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {pattern.earlyDepartureRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}