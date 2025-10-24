import type { AttendanceRecord, AttendanceSession, FacilityCheckIn } from '../types';
import { format, isToday } from 'date-fns';

// Attendance Status Types
export type AttendanceStatus = AttendanceRecord['status'];

// Attendance Statistics
export interface AttendanceStats {
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

// Calculate attendance statistics for a session
export function calculateAttendanceStats(
  enrolledStudents: number,
  attendanceRecords: AttendanceRecord[]
): AttendanceStats {
  const present = attendanceRecords.filter(r => r.status === 'present').length;
  const absent = attendanceRecords.filter(r => r.status === 'absent').length;
  const late = attendanceRecords.filter(r => r.status === 'late').length;
  const excused = attendanceRecords.filter(r => r.status === 'excused').length;
  
  const attendanceRate = enrolledStudents > 0 
    ? (present + late) / enrolledStudents * 100 
    : 0;

  return {
    totalStudents: enrolledStudents,
    present,
    absent,
    late,
    excused,
    attendanceRate: Math.round(attendanceRate * 100) / 100
  };
}

// Get attendance status color class
export function getAttendanceStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'text-green-600 bg-green-100';
    case 'late':
      return 'text-yellow-600 bg-yellow-100';
    case 'absent':
      return 'text-red-600 bg-red-100';
    case 'excused':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Get attendance status display text
export function getAttendanceStatusText(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'Present';
    case 'late':
      return 'Late';
    case 'absent':
      return 'Absent';
    case 'excused':
      return 'Excused';
    default:
      return 'Unknown';
  }
}

// Format check-in time
export function formatCheckInTime(date: Date | undefined): string {
  if (!date) return 'Not checked in';
  return format(date, 'h:mm a');
}

// Check if attendance can be taken (within reasonable time window)
export function canTakeAttendance(meetingStartTime: Date, meetingEndTime: Date): boolean {
  const now = new Date();
  const meetingStart = new Date(meetingStartTime);
  const meetingEnd = new Date(meetingEndTime);
  
  // Allow attendance to be taken from 30 minutes before start to 1 hour after end
  const attendanceWindowStart = new Date(meetingStart.getTime() - 30 * 60 * 1000);
  const attendanceWindowEnd = new Date(meetingEnd.getTime() + 60 * 60 * 1000);
  
  return now >= attendanceWindowStart && now <= attendanceWindowEnd;
}

// Get today's facility check-ins
export function getTodaysCheckIns(checkIns: FacilityCheckIn[]): FacilityCheckIn[] {
  return checkIns.filter(checkIn => isToday(checkIn.checkInTime));
}

// Get active check-ins (not checked out yet)
export function getActiveCheckIns(checkIns: FacilityCheckIn[]): FacilityCheckIn[] {
  return checkIns.filter(checkIn => !checkIn.checkOutTime);
}

// Calculate total time spent (for completed check-ins)
export function calculateTimeSpent(checkIn: FacilityCheckIn): number {
  if (!checkIn.checkOutTime) return 0;
  
  const startTime = new Date(checkIn.checkInTime);
  const endTime = new Date(checkIn.checkOutTime);
  
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes
}

// Format duration in minutes to human readable
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// Generate attendance session summary
export function generateSessionSummary(
  session: AttendanceSession,
  attendanceRecords: AttendanceRecord[]
): string {
  const stats = calculateAttendanceStats(
    session.studentsPresent + session.studentsAbsent + session.studentsLate + session.studentsExcused,
    attendanceRecords
  );
  
  return `${stats.present} present, ${stats.absent} absent, ${stats.late} late, ${stats.excused} excused (${stats.attendanceRate}% attendance)`;
}