import type { Assignment, Submission } from '../types';
import { format, differenceInDays, isPast } from 'date-fns';

// Assignment Status Types
export type AssignmentStatus = 'draft' | 'published' | 'closed' | 'archived';
export type SubmissionStatus = 'not_submitted' | 'submitted' | 'graded' | 'late';

// Assignment Statistics
export interface AssignmentStats {
  totalStudents: number;
  submitted: number;
  notSubmitted: number;
  graded: number;
  averageScore?: number;
  submissionRate: number;
}

// Calculate assignment statistics
export function calculateAssignmentStats(
  totalStudents: number,
  submissions: Submission[]
): AssignmentStats {
  const submitted = submissions.length;
  const notSubmitted = totalStudents - submitted;
  const graded = submissions.filter(s => s.evaluation).length;
  
  const scores = submissions
    .filter(s => s.evaluation?.score !== undefined)
    .map(s => s.evaluation!.score!);
  
  const averageScore = scores.length > 0 
    ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100
    : undefined;
  
  const submissionRate = totalStudents > 0 
    ? Math.round((submitted / totalStudents) * 100) 
    : 0;

  return {
    totalStudents,
    submitted,
    notSubmitted,
    graded,
    averageScore,
    submissionRate
  };
}

// Get assignment status based on due date and submissions
export function getAssignmentStatus(assignment: Assignment): AssignmentStatus {
  if (!assignment.dueDate) return 'published';
  
  if (isPast(assignment.dueDate)) {
    return 'closed';
  }
  
  return 'published';
}

// Get submission status
export function getSubmissionStatus(
  submission: Submission | undefined,
  dueDate: Date | undefined
): SubmissionStatus {
  if (!submission) return 'not_submitted';
  
  if (submission.evaluation) return 'graded';
  
  if (dueDate && submission.submittedAt > dueDate) {
    return 'late';
  }
  
  return 'submitted';
}

// Get status color class
export function getAssignmentStatusColor(status: AssignmentStatus): string {
  switch (status) {
    case 'draft':
      return 'text-gray-600 bg-gray-100';
    case 'published':
      return 'text-green-600 bg-green-100';
    case 'closed':
      return 'text-blue-600 bg-blue-100';
    case 'archived':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getSubmissionStatusColor(status: SubmissionStatus): string {
  switch (status) {
    case 'not_submitted':
      return 'text-red-600 bg-red-100';
    case 'submitted':
      return 'text-blue-600 bg-blue-100';
    case 'graded':
      return 'text-green-600 bg-green-100';
    case 'late':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Get status display text
export function getAssignmentStatusText(status: AssignmentStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'published':
      return 'Published';
    case 'closed':
      return 'Closed';
    case 'archived':
      return 'Archived';
    default:
      return 'Unknown';
  }
}

export function getSubmissionStatusText(status: SubmissionStatus): string {
  switch (status) {
    case 'not_submitted':
      return 'Not Submitted';
    case 'submitted':
      return 'Submitted';
    case 'graded':
      return 'Graded';
    case 'late':
      return 'Late';
    default:
      return 'Unknown';
  }
}

// Format due date
export function formatDueDate(date: Date | undefined): string {
  if (!date) return 'No due date';
  
  const now = new Date();
  const daysDiff = differenceInDays(date, now);
  
  if (daysDiff < 0) {
    return `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''}`;
  } else if (daysDiff === 0) {
    return `Due today at ${format(date, 'h:mm a')}`;
  } else if (daysDiff === 1) {
    return `Due tomorrow at ${format(date, 'h:mm a')}`;
  } else if (daysDiff <= 7) {
    return `Due in ${daysDiff} days (${format(date, 'MMM d, h:mm a')})`;
  } else {
    return `Due ${format(date, 'MMM d, yyyy')}`;
  }
}

// Check if assignment is overdue
export function isAssignmentOverdue(assignment: Assignment): boolean {
  if (!assignment.dueDate) return false;
  return isPast(assignment.dueDate);
}

// Get assignment priority (based on due date)
export function getAssignmentPriority(assignment: Assignment): 'high' | 'medium' | 'low' {
  if (!assignment.dueDate) return 'low';
  
  const daysDiff = differenceInDays(assignment.dueDate, new Date());
  
  if (daysDiff < 0) return 'high'; // Overdue
  if (daysDiff <= 2) return 'high'; // Due soon
  if (daysDiff <= 7) return 'medium'; // Due this week
  return 'low'; // Due later
}

// Sort assignments by priority and due date
export function sortAssignmentsByPriority(assignments: Assignment[]): Assignment[] {
  return assignments.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[getAssignmentPriority(a)];
    const bPriority = priorityOrder[getAssignmentPriority(b)];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    
    // Same priority, sort by due date
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime(); // Earlier due date first
    } else if (a.dueDate) {
      return -1; // Assignments with due dates come first
    } else if (b.dueDate) {
      return 1;
    }
    
    return 0; // Same priority and no due dates
  });
}

// Calculate grade letter from score
export function calculateGradeLetter(score: number): string {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 65) return 'D';
  return 'F';
}