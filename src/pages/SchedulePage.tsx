import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  GraduationCap,
  BookOpen,
  Plus, 
  Edit, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import type { UserProfile, Program, Campus } from '../types';
import { apiClient } from '../lib/api';

interface SchedulePageProps {
  currentProfile: UserProfile;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ currentProfile }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'classes' | 'calendar'>('classes');
  
  // Class modal state
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [classFormData, setClassFormData] = useState({
    name: '',
    description: '',
    programId: '',
    teacherId: '',
    campusId: '',
    roomId: '',
    startDate: '',
    endDate: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    maxStudents: '20',
    location: '',
    allowPublicEnrollment: true,
    isActive: true
  });

  // Conflict check state
  const [scheduleConflicts, setScheduleConflicts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, programsData, campusesData, teachersData] = await Promise.all([
        apiClient.getClasses(),
        apiClient.getPrograms(),
        apiClient.getAllCampuses(),
        apiClient.getUsersByType('teacher')
      ]);
      
      setClasses(classesData);
      setPrograms(programsData);
      setCampuses(campusesData);
      setTeachers(teachersData);
      
      // Collect all rooms from campuses
      const allRooms = campusesData.flatMap((campus: any) => 
        (campus.rooms || []).map((room: any) => ({
          ...room,
          campus_name: campus.name
        }))
      );
      setRooms(allRooms);
      
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Class functions
  const handleAddClass = () => {
    setEditingClass(null);
    setClassFormData({
      name: '',
      description: '',
      programId: '',
      teacherId: '',
      campusId: '',
      roomId: '',
      startDate: '',
      endDate: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      maxStudents: '20',
      location: '',
      allowPublicEnrollment: true,
      isActive: true
    });
    setScheduleConflicts([]);
    setShowClassModal(true);
  };

  const handleEditClass = (classItem: any) => {
    setEditingClass(classItem);
    setClassFormData({
      name: classItem.name,
      description: classItem.description || '',
      programId: classItem.program_id,
      teacherId: classItem.teacher_id || '',
      campusId: classItem.campus_id || '',
      roomId: classItem.room_id || '',
      startDate: classItem.start_date,
      endDate: classItem.end_date,
      dayOfWeek: classItem.day_of_week?.toString() || '',
      startTime: classItem.start_time,
      endTime: classItem.end_time,
      maxStudents: classItem.max_students?.toString() || '20',
      location: classItem.location || '',
      allowPublicEnrollment: classItem.allow_public_enrollment ?? true,
      isActive: classItem.is_active ?? true
    });
    setScheduleConflicts([]);
    setShowClassModal(true);
  };

  const checkForConflicts = async () => {
    if (!classFormData.dayOfWeek || !classFormData.startTime || !classFormData.endTime || 
        !classFormData.startDate || !classFormData.endDate) {
      return;
    }

    try {
      const conflictData = {
        teacherId: classFormData.teacherId || undefined,
        roomId: classFormData.roomId || undefined,
        classId: editingClass?.id || undefined,
        dayOfWeek: parseInt(classFormData.dayOfWeek),
        startTime: classFormData.startTime,
        endTime: classFormData.endTime,
        startDate: classFormData.startDate,
        endDate: classFormData.endDate
      };

      const result = await apiClient.checkScheduleConflict(conflictData);
      setScheduleConflicts(result.conflicts || []);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const classData = {
        name: classFormData.name,
        description: classFormData.description || undefined,
        programId: classFormData.programId,
        teacherId: classFormData.teacherId || undefined,
        campusId: classFormData.campusId || undefined,
        roomId: classFormData.roomId || undefined,
        startDate: classFormData.startDate,
        endDate: classFormData.endDate,
        dayOfWeek: parseInt(classFormData.dayOfWeek),
        startTime: classFormData.startTime,
        endTime: classFormData.endTime,
        maxStudents: parseInt(classFormData.maxStudents),
        location: classFormData.location || undefined,
        allowPublicEnrollment: classFormData.allowPublicEnrollment,
        isActive: classFormData.isActive
      };

      if (editingClass) {
        await apiClient.updateClass(editingClass.id, classData);
        alert('Class updated successfully!');
      } else {
        await apiClient.createClass(classData);
        alert('Class created successfully!');
      }

      setShowClassModal(false);
      setClassFormData({
        name: '',
        description: '',
        programId: '',
        teacherId: '',
        campusId: '',
        roomId: '',
        startDate: '',
        endDate: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        maxStudents: '20',
        location: '',
        allowPublicEnrollment: true,
        isActive: true
      });
      setEditingClass(null);
      setScheduleConflicts([]);
      
      await loadData();
    } catch (error: any) {
      console.error('Error saving class:', error);
      if (error.message.includes('conflict')) {
        alert('Schedule conflict detected! Please check the times and try again.');
      } else {
        alert('Error saving class. Please try again.');
      }
    }
  };

  const handleDeleteClass = async (classItem: any) => {
    if (confirm(`Are you sure you want to delete "${classItem.name}"?`)) {
      try {
        await apiClient.deleteClass(classItem.id);
        alert('Class deleted successfully!');
        await loadData();
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Error deleting class. Please try again.');
      }
    }
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || 'Unknown';
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.profile_id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'No Teacher Assigned';
  };

  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    return program?.name || 'Unknown Program';
  };

  // Filter rooms by selected campus
  const availableRooms = classFormData.campusId 
    ? rooms.filter(room => room.campus_id === classFormData.campusId)
    : [];

  const isAdmin = currentProfile.type === 'admin';
  const isTeacher = currentProfile.type === 'teacher';
  const showManagement = isAdmin || isTeacher;

  if (!showManagement) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Schedule Access</h2>
          <p className="text-gray-600">
            Schedule management is available for administrators and teachers only.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Schedule Management</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('classes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'classes'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BookOpen className="inline w-4 h-4 mr-2" />
            Classes ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="inline w-4 h-4 mr-2" />
            Calendar View
          </button>
        </nav>
      </div>

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Classes</h2>
            {isAdmin && (
              <button
                onClick={handleAddClass}
                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Class
              </button>
            )}
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classes.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2">No classes found</p>
                      {isAdmin && (
                        <button
                          onClick={handleAddClass}
                          className="mt-2 text-amber-600 hover:text-amber-700"
                        >
                          Add the first class
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  classes.map((classItem) => (
                    <tr key={classItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                          {classItem.description && (
                            <div className="text-sm text-gray-500">{classItem.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getProgramName(classItem.program_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                          {getTeacherName(classItem.teacher_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <div>{getDayName(classItem.day_of_week)}</div>
                            <div className="text-xs text-gray-500">
                              {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {classItem.start_date} to {classItem.end_date}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            {classItem.campus_name && <div>{classItem.campus_name}</div>}
                            {classItem.room_name && <div className="text-xs text-gray-500">{classItem.room_name}</div>}
                            {classItem.location && <div className="text-xs text-gray-500">{classItem.location}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{classItem.current_students || 0} / {classItem.max_students}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {classItem.allow_public_enrollment ? 'Public enrollment' : 'Private enrollment'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          classItem.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {classItem.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditClass(classItem)}
                            className="text-amber-600 hover:text-amber-900 mr-3"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(classItem)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Calendar View</h3>
            <p className="text-gray-600">Calendar view will be implemented in a future update.</p>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h2>
            
            <form onSubmit={handleSaveClass} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    value={classFormData.name}
                    onChange={(e) => setClassFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program *
                  </label>
                  <select
                    value={classFormData.programId}
                    onChange={(e) => setClassFormData(prev => ({ ...prev, programId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select Program</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>{program.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher
                  </label>
                  <select
                    value={classFormData.teacherId}
                    onChange={(e) => setClassFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">No Teacher Assigned</option>
                    {teachers.map(teacher => (
                      <option key={teacher.profile_id} value={teacher.profile_id}>
                        {teacher.first_name} {teacher.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campus
                  </label>
                  <select
                    value={classFormData.campusId}
                    onChange={(e) => {
                      setClassFormData(prev => ({ 
                        ...prev, 
                        campusId: e.target.value,
                        roomId: '' // Reset room when campus changes
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">No Campus Assigned</option>
                    {campuses.map(campus => (
                      <option key={campus.id} value={campus.id}>{campus.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room
                  </label>
                  <select
                    value={classFormData.roomId}
                    onChange={(e) => setClassFormData(prev => ({ ...prev, roomId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    disabled={!classFormData.campusId}
                  >
                    <option value="">No Room Assigned</option>
                    {availableRooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} {room.capacity && `(${room.capacity} capacity)`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week *
                  </label>
                  <select
                    value={classFormData.dayOfWeek}
                    onChange={(e) => {
                      setClassFormData(prev => ({ ...prev, dayOfWeek: e.target.value }));
                      setTimeout(checkForConflicts, 100);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select Day</option>
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={classFormData.startTime}
                    onChange={(e) => {
                      setClassFormData(prev => ({ ...prev, startTime: e.target.value }));
                      setTimeout(checkForConflicts, 100);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={classFormData.endTime}
                    onChange={(e) => {
                      setClassFormData(prev => ({ ...prev, endTime: e.target.value }));
                      setTimeout(checkForConflicts, 100);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={classFormData.startDate}
                    onChange={(e) => {
                      setClassFormData(prev => ({ ...prev, startDate: e.target.value }));
                      setTimeout(checkForConflicts, 100);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={classFormData.endDate}
                    onChange={(e) => {
                      setClassFormData(prev => ({ ...prev, endDate: e.target.value }));
                      setTimeout(checkForConflicts, 100);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Students
                  </label>
                  <input
                    type="number"
                    value={classFormData.maxStudents}
                    onChange={(e) => setClassFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={classFormData.location}
                    onChange={(e) => setClassFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Additional location info"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={classFormData.description}
                  onChange={(e) => setClassFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowPublicEnrollment"
                    checked={classFormData.allowPublicEnrollment}
                    onChange={(e) => setClassFormData(prev => ({ ...prev, allowPublicEnrollment: e.target.checked }))}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowPublicEnrollment" className="ml-2 block text-sm text-gray-900">
                    Allow Public Enrollment
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="classIsActive"
                    checked={classFormData.isActive}
                    onChange={(e) => setClassFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="classIsActive" className="ml-2 block text-sm text-gray-900">
                    Active Class
                  </label>
                </div>
              </div>

              {/* Conflict Warnings */}
              {scheduleConflicts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Schedule Conflicts Detected
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        {scheduleConflicts.map((conflict, index) => (
                          <div key={index} className="mb-2">
                            <strong>{conflict.type === 'teacher' ? 'Teacher' : 'Room'} Conflict:</strong> {conflict.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                  disabled={scheduleConflicts.length > 0}
                >
                  {editingClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;