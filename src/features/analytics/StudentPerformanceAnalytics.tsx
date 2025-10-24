import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, BookOpen, Clock, AlertTriangle, CheckCircle, User, Award } from 'lucide-react';
import { getStudentAnalytics } from '../../lib/mockAnalyticsData';
import type { SubjectPerformance } from '../../types';

interface StudentPerformanceAnalyticsProps {
  studentId?: string;
  showAllStudents?: boolean;
}

export default function StudentPerformanceAnalyticsView({ 
  studentId = 'student-1', 
  showAllStudents = false 
}: StudentPerformanceAnalyticsProps) {
  const [selectedStudent] = useState(studentId);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  
  // Avoid unused variable warnings
  console.log('showAllStudents:', showAllStudents);
  
  const analytics = getStudentAnalytics(selectedStudent);

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Performance data is not available for this student.
        </p>
      </div>
    );
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Performance Analytics</h1>
            <p className="text-gray-600">
              Comprehensive performance tracking and insights
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="block w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              <option value="current">Current Semester</option>
              <option value="previous">Previous Semester</option>
              <option value="year">Full Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overall GPA</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.overallGPA.toFixed(1)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-900">Target:</span>
              <span className="ml-2 text-gray-600">3.5+</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Attendance Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.attendanceRate.toFixed(1)}%</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-900">Target:</span>
              <span className="ml-2 text-gray-600">90%+</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Assignment Completion</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.assignmentCompletionRate.toFixed(1)}%</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-900">Target:</span>
              <span className="ml-2 text-gray-600">85%+</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {analytics.riskLevel === 'low' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Risk Level</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRiskLevelColor(analytics.riskLevel)}`}>
                      {analytics.riskLevel}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject Performance */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Subject Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.subjectPerformance.map((subject) => (
                <SubjectPerformanceCard key={subject.subjectId} subject={subject} />
              ))}
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{trend.period}</div>
                    <div className="text-xs text-gray-500">
                      {trend.date.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-500">GPA</div>
                      <div className="font-medium">{trend.gpa.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Attendance</div>
                      <div className="font-medium">{trend.attendanceRate.toFixed(0)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Assignments</div>
                      <div className="font-medium">{trend.assignmentCompletion.toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analytics.recommendations.length > 0 && (
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analytics.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-700">{recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <Clock className="inline h-4 w-4 mr-1" />
        Last updated: {analytics.lastUpdated.toLocaleString()}
      </div>
    </div>
  );
}

// Subject Performance Card Component
function SubjectPerformanceCard({ subject }: { subject: SubjectPerformance }) {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 bg-green-100';
    if (grade >= 80) return 'text-blue-600 bg-blue-100';
    if (grade >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">{subject.subjectName}</h4>
        <div className="flex items-center space-x-2">
          {getTrendIcon(subject.trend)}
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(subject.currentGrade)}`}>
            {subject.currentGrade}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Current Grade</div>
          <div className="font-medium">{subject.currentGrade}%</div>
        </div>
        <div>
          <div className="text-gray-500">Class Average</div>
          <div className="font-medium">{subject.averageGrade}%</div>
        </div>
        <div>
          <div className="text-gray-500">Attendance</div>
          <div className="font-medium">{subject.attendanceRate}%</div>
        </div>
        <div>
          <div className="text-gray-500">Assignments</div>
          <div className="font-medium">{subject.completedAssignments}/{subject.assignmentCount}</div>
        </div>
      </div>

      {subject.upcomingAssignments > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-600">
            <AlertTriangle className="inline h-3 w-3 mr-1 text-yellow-500" />
            {subject.upcomingAssignments} upcoming assignment{subject.upcomingAssignments !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Last assessment: {subject.lastAssessment.toLocaleDateString()}
      </div>
    </div>
  );
}