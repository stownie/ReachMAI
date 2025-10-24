import { RRule } from 'rrule';
import { addDays, format, isWithinInterval } from 'date-fns';
import type { Meeting, Section, Room } from '../types';

/**
 * Parse RRULE string and generate meeting instances
 */
export function generateMeetingInstances(
  meeting: Meeting,
  startDate: Date,
  endDate: Date
): Array<{ start: Date; end: Date; meetingId: string }> {
  const instances: Array<{ start: Date; end: Date; meetingId: string }> = [];
  
  if (!meeting.isRecurring || !meeting.recurrenceRule) {
    // Single meeting
    if (isWithinInterval(meeting.startTime, { start: startDate, end: endDate })) {
      instances.push({
        start: meeting.startTime,
        end: meeting.endTime,
        meetingId: meeting.id,
      });
    }
    return instances;
  }

  try {
    const rule = RRule.fromString(meeting.recurrenceRule);
    const occurrences = rule.between(startDate, endDate, true);
    
    const duration = meeting.endTime.getTime() - meeting.startTime.getTime();
    
    occurrences.forEach(occurrence => {
      // Check if this occurrence is not in the exceptions list
      if (!meeting.exceptions?.some(exception => 
        format(exception, 'yyyy-MM-dd') === format(occurrence, 'yyyy-MM-dd')
      )) {
        instances.push({
          start: occurrence,
          end: new Date(occurrence.getTime() + duration),
          meetingId: meeting.id,
        });
      }
    });
  } catch (error) {
    console.error('Error parsing RRULE:', error);
    // Fallback to single instance
    if (isWithinInterval(meeting.startTime, { start: startDate, end: endDate })) {
      instances.push({
        start: meeting.startTime,
        end: meeting.endTime,
        meetingId: meeting.id,
      });
    }
  }

  return instances;
}

/**
 * Check if a room has capacity conflicts
 */
export function checkRoomCapacity(
  room: Room,
  section: Section
): { hasCapacity: boolean; availableSpots: number; waitlistCount: number } {
  const enrolledCount = section.enrollments.filter(e => e.status === 'enrolled').length;
  const waitlistedCount = section.enrollments.filter(e => e.status === 'waitlisted').length;
  
  return {
    hasCapacity: enrolledCount < Math.min(room.capacity, section.capacity),
    availableSpots: Math.min(room.capacity, section.capacity) - enrolledCount,
    waitlistCount: waitlistedCount,
  };
}

/**
 * Generate RRULE string from schedule parameters
 */
export interface ScheduleParams {
  frequency: 'weekly' | 'daily' | 'monthly';
  interval?: number;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  endDate?: Date;
  count?: number;
}

export function generateRRule(params: ScheduleParams): string {
  const rule = new RRule({
    freq: params.frequency === 'weekly' ? RRule.WEEKLY :
          params.frequency === 'daily' ? RRule.DAILY :
          RRule.MONTHLY,
    interval: params.interval || 1,
    byweekday: params.daysOfWeek || undefined,
    until: params.endDate || undefined,
    count: params.count || undefined,
  });
  
  return rule.toString();
}

/**
 * Parse human-readable schedule description
 */
export function parseScheduleDescription(rrule: string): string {
  try {
    const rule = RRule.fromString(rrule);
    return rule.toText();
  } catch (error) {
    return 'Invalid schedule';
  }
}

/**
 * Check for scheduling conflicts between meetings
 */
export function checkScheduleConflicts(
  newMeeting: Omit<Meeting, 'id' | 'attendance' | 'createdAt' | 'updatedAt'>,
  existingMeetings: Meeting[],
  startDate: Date,
  endDate: Date
): Array<{ meetingId: string; conflictTime: Date }> {
  const conflicts: Array<{ meetingId: string; conflictTime: Date }> = [];
  
  // Generate instances for the new meeting
  const newMeetingWithId = { ...newMeeting, id: 'temp', attendance: [], createdAt: new Date(), updatedAt: new Date() };
  const newInstances = generateMeetingInstances(newMeetingWithId, startDate, endDate);
  
  // Check against existing meetings
  existingMeetings.forEach(existingMeeting => {
    // Skip if different rooms (unless room is not specified)
    if (newMeeting.roomId && existingMeeting.roomId && newMeeting.roomId !== existingMeeting.roomId) {
      return;
    }
    
    // Skip if no teacher overlap
    if (newMeeting.teacherIds.length && existingMeeting.teacherIds.length) {
      const hasTeacherOverlap = newMeeting.teacherIds.some(id => 
        existingMeeting.teacherIds.includes(id)
      );
      if (!hasTeacherOverlap) return;
    }
    
    const existingInstances = generateMeetingInstances(existingMeeting, startDate, endDate);
    
    // Check for time overlaps
    newInstances.forEach(newInstance => {
      existingInstances.forEach(existingInstance => {
        const newStart = newInstance.start.getTime();
        const newEnd = newInstance.end.getTime();
        const existingStart = existingInstance.start.getTime();
        const existingEnd = existingInstance.end.getTime();
        
        // Check if times overlap
        if (newStart < existingEnd && newEnd > existingStart) {
          conflicts.push({
            meetingId: existingMeeting.id,
            conflictTime: newInstance.start,
          });
        }
      });
    });
  });
  
  return conflicts;
}

/**
 * Format meeting time for display
 */
export function formatMeetingTime(start: Date, end: Date): string {
  const startTime = format(start, 'h:mm a');
  const endTime = format(end, 'h:mm a');
  const date = format(start, 'MMM d, yyyy');
  
  return `${date} • ${startTime} - ${endTime}`;
}

/**
 * Get next meeting instance
 */
export function getNextMeetingInstance(meeting: Meeting): Date | null {
  const now = new Date();
  const oneYearFromNow = addDays(now, 365);
  
  const instances = generateMeetingInstances(meeting, now, oneYearFromNow);
  const futureInstances = instances.filter(instance => instance.start > now);
  
  if (futureInstances.length === 0) return null;
  
  return futureInstances[0].start;
}

/**
 * Calculate enrollment statistics
 */
export function calculateEnrollmentStats(section: Section, room?: Room) {
  const enrollments = section.enrollments;
  const enrolled = enrollments.filter(e => e.status === 'enrolled').length;
  const waitlisted = enrollments.filter(e => e.status === 'waitlisted').length;
  const cancelled = enrollments.filter(e => e.status === 'cancelled').length;
  
  const maxCapacity = room ? Math.min(room.capacity, section.capacity) : section.capacity;
  
  return {
    enrolled,
    waitlisted, 
    cancelled,
    available: Math.max(0, maxCapacity - enrolled),
    maxCapacity,
    utilizationRate: maxCapacity > 0 ? (enrolled / maxCapacity) * 100 : 0,
  };
}