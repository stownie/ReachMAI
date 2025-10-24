import type { AttendanceRecord, AttendanceSession, FacilityCheckIn } from '../types';
import { subHours, subMinutes } from 'date-fns';

// Mock Attendance Records
export const mockAttendanceRecords: AttendanceRecord[] = [
  // Piano Fundamentals - Morning Class
  {
    id: 'att-001',
    meetingInstanceId: 'mi-001',
    studentId: 'student-001',
    status: 'present',
    checkInTime: subMinutes(new Date(), 120),
    markedBy: 'teacher-001',
    markedAt: subMinutes(new Date(), 115),
    notes: 'On time and ready to learn',
    createdAt: subMinutes(new Date(), 115),
    updatedAt: subMinutes(new Date(), 115),
  },
  {
    id: 'att-002',
    meetingInstanceId: 'mi-001',
    studentId: 'student-002',
    status: 'late',
    checkInTime: subMinutes(new Date(), 105),
    markedBy: 'teacher-001',
    markedAt: subMinutes(new Date(), 100),
    notes: 'Arrived 15 minutes late due to traffic',
    createdAt: subMinutes(new Date(), 100),
    updatedAt: subMinutes(new Date(), 100),
  },
  {
    id: 'att-003',
    meetingInstanceId: 'mi-001',
    studentId: 'student-003',
    status: 'absent',
    markedBy: 'teacher-001',
    markedAt: subMinutes(new Date(), 110),
    notes: 'Called in sick',
    createdAt: subMinutes(new Date(), 110),
    updatedAt: subMinutes(new Date(), 110),
  },
  
  // Advanced Guitar - Afternoon Class
  {
    id: 'att-004',
    meetingInstanceId: 'mi-002',
    studentId: 'student-004',
    status: 'present',
    checkInTime: subMinutes(new Date(), 45),
    markedBy: 'teacher-002',
    markedAt: subMinutes(new Date(), 40),
    createdAt: subMinutes(new Date(), 40),
    updatedAt: subMinutes(new Date(), 40),
  },
  {
    id: 'att-005',
    meetingInstanceId: 'mi-002',
    studentId: 'student-005',
    status: 'excused',
    markedBy: 'teacher-002',
    markedAt: subMinutes(new Date(), 50),
    notes: 'Family emergency - pre-approved absence',
    createdAt: subMinutes(new Date(), 50),
    updatedAt: subMinutes(new Date(), 50),
  },
  
  // Youth Orchestra - Yesterday
  {
    id: 'att-006',
    meetingInstanceId: 'mi-003',
    studentId: 'student-006',
    status: 'present',
    checkInTime: subHours(new Date(), 26),
    markedBy: 'teacher-003',
    markedAt: subHours(new Date(), 25),
    createdAt: subHours(new Date(), 25),
    updatedAt: subHours(new Date(), 25),
  },
  {
    id: 'att-007',
    meetingInstanceId: 'mi-003',
    studentId: 'student-007',
    status: 'present',
    checkInTime: subHours(new Date(), 26),
    markedBy: 'teacher-003',
    markedAt: subHours(new Date(), 25),
    createdAt: subHours(new Date(), 25),
    updatedAt: subHours(new Date(), 25),
  },
];

// Mock Attendance Sessions
export const mockAttendanceSessions: AttendanceSession[] = [
  {
    id: 'session-001',
    meetingInstanceId: 'mi-001',
    teacherId: 'teacher-001',
    startedAt: subMinutes(new Date(), 120),
    endedAt: subMinutes(new Date(), 60),
    status: 'completed',
    studentsPresent: 1,
    studentsAbsent: 1,
    studentsLate: 1,
    studentsExcused: 0,
    notes: 'Good class participation despite one absence',
  },
  {
    id: 'session-002',
    meetingInstanceId: 'mi-002',
    teacherId: 'teacher-002',
    startedAt: subMinutes(new Date(), 60),
    status: 'active',
    studentsPresent: 1,
    studentsAbsent: 0,
    studentsLate: 0,
    studentsExcused: 1,
    notes: 'Ongoing class session',
  },
  {
    id: 'session-003',
    meetingInstanceId: 'mi-003',
    teacherId: 'teacher-003',
    startedAt: subHours(new Date(), 26),
    endedAt: subHours(new Date(), 24),
    status: 'completed',
    studentsPresent: 8,
    studentsAbsent: 0,
    studentsLate: 2,
    studentsExcused: 0,
    notes: 'Excellent rehearsal for upcoming concert',
  },
];

// Mock Facility Check-ins
export const mockFacilityCheckIns: FacilityCheckIn[] = [
  // Students checking in for classes
  {
    id: 'checkin-001',
    personId: 'student-001',
    personType: 'student',
    campusId: 'campus-001',
    roomId: 'room-001',
    checkInTime: subMinutes(new Date(), 125),
    checkOutTime: subMinutes(new Date(), 65),
    purpose: 'class',
    notes: 'Piano lesson',
    checkedInBy: 'staff-001',
    createdAt: subMinutes(new Date(), 125),
    updatedAt: subMinutes(new Date(), 65),
  },
  {
    id: 'checkin-002',
    personId: 'student-002',
    personType: 'student',
    campusId: 'campus-001',
    roomId: 'room-001',
    checkInTime: subMinutes(new Date(), 110),
    checkOutTime: subMinutes(new Date(), 65),
    purpose: 'class',
    notes: 'Piano lesson - arrived late',
    checkedInBy: 'staff-001',
    createdAt: subMinutes(new Date(), 110),
    updatedAt: subMinutes(new Date(), 65),
  },
  {
    id: 'checkin-003',
    personId: 'student-004',
    personType: 'student',
    campusId: 'campus-001',
    roomId: 'room-002',
    checkInTime: subMinutes(new Date(), 50),
    purpose: 'class',
    notes: 'Guitar class',
    checkedInBy: 'staff-001',
    createdAt: subMinutes(new Date(), 50),
    updatedAt: subMinutes(new Date(), 50),
  },
  
  // Teachers checking in
  {
    id: 'checkin-004',
    personId: 'teacher-001',
    personType: 'teacher',
    campusId: 'campus-001',
    roomId: 'room-001',
    checkInTime: subMinutes(new Date(), 135),
    checkOutTime: subMinutes(new Date(), 55),
    purpose: 'class',
    notes: 'Piano instruction',
    createdAt: subMinutes(new Date(), 135),
    updatedAt: subMinutes(new Date(), 55),
  },
  {
    id: 'checkin-005',
    personId: 'teacher-002',
    personType: 'teacher',
    campusId: 'campus-001',
    roomId: 'room-002',
    checkInTime: subMinutes(new Date(), 65),
    purpose: 'class',
    notes: 'Guitar instruction',
    createdAt: subMinutes(new Date(), 65),
    updatedAt: subMinutes(new Date(), 65),
  },
  
  // Parent pickup
  {
    id: 'checkin-006',
    personId: 'parent-001',
    personType: 'parent',
    campusId: 'campus-001',
    checkInTime: subMinutes(new Date(), 15),
    checkOutTime: subMinutes(new Date(), 10),
    purpose: 'pickup',
    notes: 'Picking up Emily after piano lesson',
    checkedInBy: 'staff-001',
    createdAt: subMinutes(new Date(), 15),
    updatedAt: subMinutes(new Date(), 10),
  },
  
  // Yesterday's check-ins
  {
    id: 'checkin-007',
    personId: 'student-006',
    personType: 'student',
    campusId: 'campus-001',
    roomId: 'room-003',
    checkInTime: subHours(new Date(), 27),
    checkOutTime: subHours(new Date(), 25),
    purpose: 'class',
    notes: 'Orchestra rehearsal',
    checkedInBy: 'staff-001',
    createdAt: subHours(new Date(), 27),
    updatedAt: subHours(new Date(), 25),
  },
  {
    id: 'checkin-008',
    personId: 'student-007',
    personType: 'student',
    campusId: 'campus-001',
    roomId: 'room-003',
    checkInTime: subHours(new Date(), 27),
    checkOutTime: subHours(new Date(), 25),
    purpose: 'class',
    notes: 'Orchestra rehearsal',
    checkedInBy: 'staff-001',
    createdAt: subHours(new Date(), 27),
    updatedAt: subHours(new Date(), 25),
  },
];

// Helper functions to get attendance data by various filters
export function getAttendanceForMeeting(meetingInstanceId: string): AttendanceRecord[] {
  return mockAttendanceRecords.filter(record => record.meetingInstanceId === meetingInstanceId);
}

export function getAttendanceForStudent(studentId: string): AttendanceRecord[] {
  return mockAttendanceRecords.filter(record => record.studentId === studentId);
}

export function getSessionForMeeting(meetingInstanceId: string): AttendanceSession | undefined {
  return mockAttendanceSessions.find(session => session.meetingInstanceId === meetingInstanceId);
}

export function getCheckInsForPerson(personId: string): FacilityCheckIn[] {
  return mockFacilityCheckIns.filter(checkIn => checkIn.personId === personId);
}

export function getCheckInsForCampus(campusId: string): FacilityCheckIn[] {
  return mockFacilityCheckIns.filter(checkIn => checkIn.campusId === campusId);
}

export function getActiveCheckInsForCampus(campusId: string): FacilityCheckIn[] {
  return mockFacilityCheckIns.filter(checkIn => 
    checkIn.campusId === campusId && !checkIn.checkOutTime
  );
}