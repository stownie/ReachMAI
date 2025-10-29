import { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Users,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  Plus,
  Download
} from 'lucide-react';
import type { AttendanceSession, UserProfile } from '../../types';
import { 
  calculateAttendanceStats, 
  getAttendanceStatusColor, 
  getAttendanceStatusText,
  formatCheckInTime
} from '../../lib/attendance';
// Mock data removed - use real API data

interface AttendanceViewProps {
  currentProfile: UserProfile;
}

type AttendanceFilter = 'all' | 'today' | 'this-week' | 'active-only';

export default function AttendanceView({ currentProfile }: AttendanceViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<AttendanceFilter>('today');
  const [searchTerm, setSearchTerm] = useState('');
  // Filter data based on user profile
  // TODO: Replace with real API call
  const filteredSessions = [].filter((session: any) => {
    if (currentProfile.type === 'teacher') {
      return session.teacherId === currentProfile.id;
    }
    // For admins, show all sessions
    return true;
  });

  // Calculate overall stats
  const totalSessions = filteredSessions.length;
  const activeSessions = filteredSessions.filter(s => s.status === 'active').length;
  const totalStudentsToday = filteredSessions.reduce((sum, session) => 
    sum + session.studentsPresent + session.studentsAbsent + session.studentsLate + session.studentsExcused, 0
  );
  const presentStudentsToday = filteredSessions.reduce((sum, session) => sum + session.studentsPresent, 0);
  const overallAttendanceRate = totalStudentsToday > 0 
    ? Math.round((presentStudentsToday / totalStudentsToday) * 100) 
    : 0;

  const handleTakeAttendance = (sessionId: string) => {
    // In a real app, this would open an attendance taking modal
    console.log('Taking attendance for session:', sessionId);
  };

  const renderSessionCard = (session: AttendanceSession) => {
    // TODO: Replace with real API call
    const attendanceRecords: any[] = [];
    const totalStudents = session.studentsPresent + session.studentsAbsent + session.studentsLate + session.studentsExcused;
    const stats = calculateAttendanceStats(totalStudents, attendanceRecords);

    return (
      <div key={session.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Class Session {session.id.slice(-3)}
            </h3>
            <p className="text-sm text-gray-600">
              Meeting Instance: {session.meetingInstanceId.slice(-3)}
            </p>
            <p className="text-sm text-gray-500">
              {session.status === 'active' 
                ? `Started ${new Date(session.startedAt).toLocaleTimeString()}`
                : `Completed ${session.endedAt ? new Date(session.endedAt).toLocaleTimeString() : 'recently'}`
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              session.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {session.status === 'active' ? 'In Progress' : 'Completed'}
            </span>
            {session.status === 'active' && (
              <button
                onClick={() => handleTakeAttendance(session.id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                Take Attendance
              </button>
            )}
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">{stats.present}</span>
            </div>
            <p className="text-xs text-gray-600">Present</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-yellow-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">{stats.late}</span>
            </div>
            <p className="text-xs text-gray-600">Late</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <XCircle className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">{stats.absent}</span>
            </div>
            <p className="text-xs text-gray-600">Absent</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-gray-900">{stats.excused}</span>
            </div>
            <p className="text-xs text-gray-600">Excused</p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-gray-50 rounded-md p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
            <span className={`text-sm font-semibold ${
              stats.attendanceRate >= 90 ? 'text-green-600' : 
              stats.attendanceRate >= 75 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {stats.attendanceRate}%
            </span>
          </div>
          <div className="mt-2">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  stats.attendanceRate >= 90 ? 'bg-green-500' : 
                  stats.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.max(stats.attendanceRate, 5)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Student List */}
        {attendanceRecords.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Students</h4>
            <div className="space-y-2">
              {attendanceRecords.map(record => (
                <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      record.status === 'present' ? 'bg-green-500' :
                      record.status === 'late' ? 'bg-yellow-500' :
                      record.status === 'absent' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="text-sm text-gray-900">
                      Student {record.studentId.slice(-3)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getAttendanceStatusColor(record.status)
                    }`}>
                      {getAttendanceStatusText(record.status)}
                    </span>
                    {record.checkInTime && (
                      <span className="text-xs text-gray-500">
                        {formatCheckInTime(record.checkInTime)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {session.notes && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">{session.notes}</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track and manage class attendance
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            {currentProfile.type === 'teacher' && (
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                <Plus className="w-4 h-4 mr-2" />
                Start Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{totalSessions}</p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{activeSessions}</p>
              <p className="text-sm text-gray-600">Active Sessions</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{totalStudentsToday}</p>
              <p className="text-sm text-gray-600">Students Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">{overallAttendanceRate}%</p>
              <p className="text-sm text-gray-600">Attendance Rate</p>
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
              onChange={(e) => setSelectedFilter(e.target.value as AttendanceFilter)}
              className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="active-only">Active Only</option>
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-6">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no attendance sessions matching your criteria.
            </p>
          </div>
        ) : (
          filteredSessions.map(renderSessionCard)
        )}
      </div>
    </div>
  );
}