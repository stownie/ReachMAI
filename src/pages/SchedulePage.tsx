import React, { useState } from 'react';
import { Calendar, Users, Clock, MapPin } from 'lucide-react';
import ScheduleView from '../features/scheduling/ScheduleView';
import EnrollmentManager from '../features/scheduling/EnrollmentManager';
import type { UserProfile, Meeting, Section } from '../types';
import { mockSchedulingData } from '../lib/mockSchedulingData';
import { generateId } from '../lib/utils';

interface SchedulePageProps {
  currentProfile: UserProfile;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ currentProfile }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'enrollments'>('schedule');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [meetings] = useState(mockSchedulingData.meetings);
  const [sections] = useState(mockSchedulingData.sections);
  const [enrollments, setEnrollments] = useState(mockSchedulingData.enrollments);

  const handleMeetingClick = (meeting: Meeting, _instance: { start: Date; end: Date }) => {
    const section = sections.find(s => s.id === meeting.sectionId);
    if (section) {
      setSelectedSection(section);
      setActiveTab('enrollments');
    }
  };

  const handleEnroll = (studentId: string) => {
    if (!selectedSection) return;
    
    const sectionStats = selectedSection.enrollments.filter(e => e.status === 'enrolled').length;
    const hasCapacity = sectionStats < selectedSection.capacity;
    
    const newEnrollment = {
      id: generateId(),
      sectionId: selectedSection.id,
      studentId,
      status: hasCapacity ? 'enrolled' as const : 'waitlisted' as const,
      enrolledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setEnrollments(prev => [...prev, newEnrollment]);
    
    // Update section enrollments
    setSelectedSection(prev => {
      if (!prev) return null;
      return {
        ...prev,
        enrollments: [...prev.enrollments, newEnrollment],
      };
    });
  };

  const handleWithdraw = (enrollmentId: string) => {
    setEnrollments(prev => 
      prev.map(e => 
        e.id === enrollmentId 
          ? { ...e, status: 'cancelled' as const, cancelledAt: new Date(), updatedAt: new Date() }
          : e
      )
    );
    
    // Update section enrollments
    setSelectedSection(prev => {
      if (!prev) return null;
      return {
        ...prev,
        enrollments: prev.enrollments.map(e => 
          e.id === enrollmentId 
            ? { ...e, status: 'cancelled' as const, cancelledAt: new Date(), updatedAt: new Date() }
            : e
        ),
      };
    });
  };

  const handleMoveFromWaitlist = (enrollmentId: string) => {
    setEnrollments(prev => 
      prev.map(e => 
        e.id === enrollmentId 
          ? { ...e, status: 'enrolled' as const, updatedAt: new Date() }
          : e
      )
    );
    
    // Update section enrollments
    setSelectedSection(prev => {
      if (!prev) return null;
      return {
        ...prev,
        enrollments: prev.enrollments.map(e => 
          e.id === enrollmentId 
            ? { ...e, status: 'enrolled' as const, updatedAt: new Date() }
            : e
        ),
      };
    });
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return meetings
      .filter(meeting => {
        const nextMeeting = meeting.startTime;
        return nextMeeting >= now && nextMeeting <= oneWeekFromNow;
      })
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5);
  };

  const upcomingMeetings = getUpcomingMeetings();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Schedule & Enrollment
          </h1>
          <p className="text-gray-600">
            Manage your classes, view schedules, and handle enrollments.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">This Week</span>
                  </div>
                  <span className="text-sm font-medium">{upcomingMeetings.length} classes</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Enrolled</span>
                  </div>
                  <span className="text-sm font-medium">
                    {enrollments.filter(e => e.status === 'enrolled').length} sections
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Waitlisted</span>
                  </div>
                  <span className="text-sm font-medium">
                    {enrollments.filter(e => e.status === 'waitlisted').length} sections
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Classes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Classes</h3>
              <div className="space-y-3">
                {upcomingMeetings.map(meeting => {
                  const section = sections.find(s => s.id === meeting.sectionId);
                  return (
                    <div key={meeting.id} className="border-l-4 border-blue-500 pl-3">
                      <div className="text-sm font-medium text-gray-900">
                        {section?.name || 'Unknown Section'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {meeting.startTime.toLocaleDateString()} at{' '}
                          {meeting.startTime.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      {meeting.roomId && (
                        <div className="text-xs text-gray-500 flex items-center space-x-2 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>Room {meeting.roomId}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {upcomingMeetings.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No upcoming classes this week
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'schedule'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Calendar View
                  </button>
                  <button
                    onClick={() => setActiveTab('enrollments')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'enrollments'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Enrollment Management
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'schedule' && (
                  <ScheduleView
                    meetings={meetings}
                    sections={sections}
                    currentProfile={currentProfile}
                    onMeetingClick={handleMeetingClick}
                  />
                )}

                {activeTab === 'enrollments' && (
                  <div>
                    {selectedSection ? (
                      <div>
                        <div className="mb-4">
                          <button
                            onClick={() => setSelectedSection(null)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            ← Back to all sections
                          </button>
                        </div>
                        <EnrollmentManager
                          section={selectedSection}
                          enrollments={selectedSection.enrollments}
                          currentProfile={currentProfile}
                          onEnroll={handleEnroll}
                          onWithdraw={handleWithdraw}
                          onMoveFromWaitlist={handleMoveFromWaitlist}
                        />
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                          Available Sections
                        </h3>
                        <div className="grid gap-4">
                          {sections.map(section => {
                            const program = mockSchedulingData.programs.find(p => p.id === section.programId);
                            const enrolledCount = section.enrollments.filter(e => e.status === 'enrolled').length;
                            const waitlistedCount = section.enrollments.filter(e => e.status === 'waitlisted').length;
                            
                            return (
                              <div
                                key={section.id}
                                onClick={() => setSelectedSection(section)}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{section.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{program?.name}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                      <span>Capacity: {enrolledCount}/{section.capacity}</span>
                                      {waitlistedCount > 0 && (
                                        <span>Waitlist: {waitlistedCount}</span>
                                      )}
                                      <span>Room: {section.roomId || 'TBD'}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`px-2 py-1 text-xs rounded-full ${
                                      enrolledCount >= section.capacity 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {enrolledCount >= section.capacity ? 'Full' : 'Available'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;