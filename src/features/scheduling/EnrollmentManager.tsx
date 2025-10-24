import React, { useState } from 'react';
import { Users, Clock, MapPin, DollarSign, AlertCircle, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import type { Section, Enrollment, UserProfile } from '../../types';
import { calculateEnrollmentStats } from '../../lib/scheduling';
import { cn, formatDate, getStatusColor } from '../../lib/utils';

interface EnrollmentManagerProps {
  section: Section;
  enrollments: Enrollment[];
  currentProfile: UserProfile;
  onEnroll?: (studentId: string) => void;
  onWithdraw?: (enrollmentId: string) => void;
  onMoveFromWaitlist?: (enrollmentId: string) => void;
}

const EnrollmentManager: React.FC<EnrollmentManagerProps> = ({
  section,
  enrollments,
  currentProfile,
  onEnroll,
  onWithdraw,
  onMoveFromWaitlist,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const stats = calculateEnrollmentStats(section);
  
  // Get students available for enrollment (for parents)
  const availableStudents = currentProfile.type === 'parent' 
    ? (currentProfile as any).studentIds?.filter((studentId: string) => 
        !enrollments.some(e => e.studentId === studentId && e.status !== 'cancelled')
      ) || []
    : [];

  const getEnrollmentsByStatus = (status: Enrollment['status']) => {
    return enrollments.filter(e => e.status === status);
  };



  const canWithdraw = (enrollment: Enrollment) => {
    if (currentProfile.type === 'student') {
      return enrollment.studentId === currentProfile.id;
    }
    if (currentProfile.type === 'parent') {
      return (currentProfile as any).studentIds?.includes(enrollment.studentId);
    }
    return true; // Admins/teachers can withdraw anyone
  };

  const handleEnroll = () => {
    if (selectedStudentId && onEnroll) {
      onEnroll(selectedStudentId);
      setSelectedStudentId('');
      setShowEnrollModal(false);
    }
  };

  const EnrollmentCard: React.FC<{ enrollment: Enrollment; showActions?: boolean }> = ({ 
    enrollment, 
    showActions = true 
  }) => {
    // In a real app, you'd fetch student data
    const studentName = `Student ${enrollment.studentId.slice(-3)}`;
    
    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{studentName}</div>
              <div className="text-sm text-gray-500">
                Enrolled {formatDate(enrollment.enrolledAt)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              getStatusColor(enrollment.status)
            )}>
              {enrollment.status}
            </span>
            
            {showActions && canWithdraw(enrollment) && (
              <button
                onClick={() => onWithdraw?.(enrollment.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Withdraw"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
            
            {enrollment.status === 'waitlisted' && showActions && (
              <button
                onClick={() => onMoveFromWaitlist?.(enrollment.id)}
                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Move to enrolled"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        {enrollment.override && (
          <div className="mt-2 p-2 bg-yellow-50 rounded-md">
            <div className="text-xs text-yellow-800">
              <strong>Override:</strong> {enrollment.override.reason}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Info Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{section.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{stats.enrolled}/{stats.maxCapacity} enrolled</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Waitlist: {stats.waitlisted}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Room {section.roomId || 'TBD'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>$200/month</span> {/* Placeholder - would come from program data */}
              </div>
            </div>
          </div>
          
          {/* Enrollment Actions */}
          {(currentProfile.type === 'parent' || currentProfile.type === 'student') && (
            <div className="flex flex-col space-y-2">
              {availableStudents.length > 0 && (
                <button
                  onClick={() => setShowEnrollModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Enroll</span>
                </button>
              )}
              
              {currentProfile.type === 'student' && !enrollments.some(e => 
                e.studentId === currentProfile.id && e.status !== 'cancelled'
              ) && (
                <button
                  onClick={() => onEnroll?.(currentProfile.id)}
                  disabled={stats.available === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{stats.available > 0 ? 'Enroll' : 'Join Waitlist'}</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Capacity Warning */}
        {stats.available === 0 && stats.waitlisted > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              This section is full. New enrollments will be added to the waitlist.
            </span>
          </div>
        )}
      </div>

      {/* Enrollment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.enrolled}</div>
          <div className="text-sm text-gray-600">Enrolled</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.waitlisted}</div>
          <div className="text-sm text-gray-600">Waitlisted</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.available}</div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{Math.round(stats.utilizationRate)}%</div>
          <div className="text-sm text-gray-600">Utilization</div>
        </div>
      </div>

      {/* Enrolled Students */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Enrolled Students ({getEnrollmentsByStatus('enrolled').length})
        </h3>
        <div className="space-y-3">
          {getEnrollmentsByStatus('enrolled').map(enrollment => (
            <EnrollmentCard 
              key={enrollment.id} 
              enrollment={enrollment} 
            />
          ))}
          {getEnrollmentsByStatus('enrolled').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students enrolled yet
            </div>
          )}
        </div>
      </div>

      {/* Waitlisted Students */}
      {getEnrollmentsByStatus('waitlisted').length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Waitlisted Students ({getEnrollmentsByStatus('waitlisted').length})
          </h3>
          <div className="space-y-3">
            {getEnrollmentsByStatus('waitlisted').map(enrollment => (
              <EnrollmentCard 
                key={enrollment.id} 
                enrollment={enrollment} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enroll Student</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Choose a student...</option>
                  {availableStudents.map((studentId: string) => (
                    <option key={studentId} value={studentId}>
                      Student {studentId.slice(-3)} {/* Placeholder name */}
                    </option>
                  ))}
                </select>
              </div>
              
              {stats.available === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    This section is full. Student will be added to the waitlist.
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEnrollModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={!selectedStudentId}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {stats.available > 0 ? 'Enroll' : 'Add to Waitlist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManager;