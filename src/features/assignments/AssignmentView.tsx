import { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Filter,
  Search,
  Download,
  Eye,
  Edit
} from 'lucide-react';
import type { Assignment, UserProfile } from '../../types';
import {
  calculateAssignmentStats,
  getAssignmentStatus,
  getAssignmentStatusColor,
  getAssignmentStatusText,
  formatDueDate,
  isAssignmentOverdue,
  getAssignmentPriority,
  sortAssignmentsByPriority,
  calculateGradeLetter
} from '../../lib/assignments';
// Mock data removed - use real API data

interface AssignmentViewProps {
  currentProfile: UserProfile;
}

type AssignmentFilter = 'all' | 'active' | 'overdue' | 'completed';

export default function AssignmentView({ currentProfile }: AssignmentViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<AssignmentFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  // TODO: Replace with real API calls based on user profile
  const userAssignments: any[] = [];

  // Apply filters
  const filteredAssignments = userAssignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (selectedFilter) {
      case 'active':
        return getAssignmentStatus(assignment) === 'published';
      case 'overdue':
        return isAssignmentOverdue(assignment);
      case 'completed':
        return getAssignmentStatus(assignment) === 'closed';
      default:
        return true;
    }
  });

  const sortedAssignments = sortAssignmentsByPriority(filteredAssignments);

  // Calculate overall stats
  const totalAssignments = userAssignments.length;
  const overdueAssignments = userAssignments.filter(isAssignmentOverdue).length;
  const activeAssignments = userAssignments.filter(a => getAssignmentStatus(a) === 'published').length;
  const totalSubmissions = userAssignments.reduce((sum, assignment) => sum + assignment.submissions.length, 0);

  const handleViewAssignment = (assignmentId: string) => {
    // In a real app, this would open assignment details modal/page
    console.log('Viewing assignment:', assignmentId);
  };

  const handleCreateAssignment = () => {
    // In a real app, this would open a creation modal/form
    console.log('Creating new assignment');
  };

  const renderAssignmentCard = (assignment: Assignment) => {
    const status = getAssignmentStatus(assignment);
    const priority = getAssignmentPriority(assignment);
    // TODO: Replace with real API call
    const submissions: any[] = [];
    const stats = calculateAssignmentStats(10, submissions); // Assuming 10 students per class

    return (
      <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getAssignmentStatusColor(status)
              }`}>
                {getAssignmentStatusText(status)}
              </span>
              {priority === 'high' && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
            {assignment.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {assignment.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDueDate(assignment.dueDate)}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {submissions.length} submissions
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => handleViewAssignment(assignment.id)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </button>
            {currentProfile.type === 'teacher' && (
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Submission Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">{stats.submitted}</span>
            </div>
            <p className="text-xs text-gray-600">Submitted</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">{stats.graded}</span>
            </div>
            <p className="text-xs text-gray-600">Graded</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">{stats.notSubmitted}</span>
            </div>
            <p className="text-xs text-gray-600">Missing</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">
                {stats.averageScore ? `${stats.averageScore}%` : 'N/A'}
              </span>
            </div>
            <p className="text-xs text-gray-600">Avg Score</p>
          </div>
        </div>

        {/* Submission Rate Progress Bar */}
        <div className="bg-gray-50 rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Submission Rate</span>
            <span className={`text-sm font-semibold ${
              stats.submissionRate >= 90 ? 'text-green-600' : 
              stats.submissionRate >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {stats.submissionRate}%
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                stats.submissionRate >= 90 ? 'bg-green-500' : 
                stats.submissionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(stats.submissionRate, 5)}%` }}
            ></div>
          </div>
        </div>

        {/* Recent Submissions Preview */}
        {submissions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Submissions</h4>
            <div className="space-y-2">
              {submissions.slice(0, 3).map(submission => (
                <div key={submission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      Student {submission.studentId.slice(-3)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {submission.evaluation && submission.evaluation.score !== undefined && (
                      <span className="text-xs font-medium text-green-600">
                        {submission.evaluation.score}% ({calculateGradeLetter(submission.evaluation.score)})
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {submissions.length > 3 && (
                <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  View all {submissions.length} submissions
                </button>
              )}
            </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and track student assignments
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            {currentProfile.type === 'teacher' && (
              <button 
                onClick={handleCreateAssignment}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{totalAssignments}</p>
              <p className="text-sm text-gray-600">Total Assignments</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{activeAssignments}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{overdueAssignments}</p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{totalSubmissions}</p>
              <p className="text-sm text-gray-600">Submissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as AssignmentFilter)}
              className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-6">
        {sortedAssignments.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no assignments matching your criteria.
            </p>
            {currentProfile.type === 'teacher' && (
              <div className="mt-6">
                <button 
                  onClick={handleCreateAssignment}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </button>
              </div>
            )}
          </div>
        ) : (
          sortedAssignments.map(renderAssignmentCard)
        )}
      </div>
    </div>
  );
}