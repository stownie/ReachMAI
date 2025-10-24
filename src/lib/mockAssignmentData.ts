import type { Assignment, Submission } from '../types';
import { addDays, subDays, addHours, subHours } from 'date-fns';

// Mock Assignments
export const mockAssignments: Assignment[] = [
  {
    id: 'assign-001',
    sectionId: 'section-001', // Piano Fundamentals
    teacherId: 'teacher-001',
    title: 'Practice Scale Exercise',
    description: 'Practice major scales in C, G, and F. Record yourself playing each scale and submit the audio file.',
    dueDate: addDays(new Date(), 3),
    submissions: [],
    createdAt: subDays(new Date(), 7),
    updatedAt: subDays(new Date(), 7),
  },
  {
    id: 'assign-002',
    sectionId: 'section-001',
    teacherId: 'teacher-001',
    title: 'Music Theory Worksheet',
    description: 'Complete the worksheet on note identification and time signatures.',
    dueDate: addDays(new Date(), 1),
    submissions: [],
    createdAt: subDays(new Date(), 5),
    updatedAt: subDays(new Date(), 5),
  },
  {
    id: 'assign-003',
    sectionId: 'section-002', // Advanced Guitar
    teacherId: 'teacher-002',
    title: 'Chord Progression Practice',
    description: 'Practice the chord progressions from class. Focus on smooth transitions between Am, F, C, and G.',
    dueDate: subDays(new Date(), 1), // Overdue
    submissions: [],
    createdAt: subDays(new Date(), 10),
    updatedAt: subDays(new Date(), 10),
  },
  {
    id: 'assign-004',
    sectionId: 'section-002',
    teacherId: 'teacher-002',
    title: 'Technique Video Submission',
    description: 'Record a video demonstrating proper finger placement and strumming technique.',
    dueDate: addDays(new Date(), 7),
    submissions: [],
    createdAt: subDays(new Date(), 3),
    updatedAt: subDays(new Date(), 3),
  },
  {
    id: 'assign-005',
    sectionId: 'section-003', // Youth Orchestra
    teacherId: 'teacher-003',
    title: 'Concert Piece Analysis',
    description: 'Write a one-page analysis of the dynamics and tempo changes in our current concert piece.',
    dueDate: addDays(new Date(), 14),
    submissions: [],
    createdAt: subDays(new Date(), 2),
    updatedAt: subDays(new Date(), 2),
  },
  {
    id: 'assign-006',
    sectionId: 'section-001',
    teacherId: 'teacher-001',
    title: 'Completed Assignment Example',
    description: 'This assignment has submissions and grades to show completed work.',
    dueDate: subDays(new Date(), 5),
    submissions: [],
    createdAt: subDays(new Date(), 12),
    updatedAt: subDays(new Date(), 3),
  },
];

// Mock Submissions
export const mockSubmissions: Submission[] = [
  {
    id: 'sub-001',
    assignmentId: 'assign-006',
    studentId: 'student-001',
    content: 'Submitted audio recording of scales and written reflection on practice experience.',
    attachments: ['scales_recording.mp3', 'practice_reflection.pdf'],
    submittedAt: subDays(new Date(), 4),
    evaluation: {
      id: 'eval-001',
      submissionId: 'sub-001',
      teacherId: 'teacher-001',
      score: 92,
      feedback: 'Excellent work on the scales! Your timing has improved significantly. Work on the F major scale transitions.',
      evaluatedAt: subDays(new Date(), 2),
    },
  },
  {
    id: 'sub-002',
    assignmentId: 'assign-006',
    studentId: 'student-002',
    content: 'Audio files for all three scales with tempo variations.',
    attachments: ['c_major_scale.mp3', 'g_major_scale.mp3', 'f_major_scale.mp3'],
    submittedAt: subDays(new Date(), 3),
    evaluation: {
      id: 'eval-002',
      submissionId: 'sub-002',
      teacherId: 'teacher-001',
      score: 87,
      feedback: 'Good progress! Focus on evenness in your finger work. The G major scale was particularly well done.',
      evaluatedAt: subDays(new Date(), 1),
    },
  },
  {
    id: 'sub-003',
    assignmentId: 'assign-006',
    studentId: 'student-003',
    content: 'Scale practice with metronome at different tempos.',
    attachments: ['scales_with_metronome.mp3'],
    submittedAt: subDays(new Date(), 6), // Late submission
  },
  {
    id: 'sub-004',
    assignmentId: 'assign-003', // Overdue guitar assignment
    studentId: 'student-004',
    content: 'Chord progression practice recording.',
    attachments: ['chord_progression.mp3'],
    submittedAt: addHours(new Date(), -2), // Recent late submission
  },
  {
    id: 'sub-005',
    assignmentId: 'assign-002',
    studentId: 'student-001',
    content: 'Completed music theory worksheet.',
    attachments: ['theory_worksheet.pdf'],
    submittedAt: subHours(new Date(), 6),
  },
];

// Link submissions to assignments
mockAssignments.forEach(assignment => {
  assignment.submissions = mockSubmissions.filter(sub => sub.assignmentId === assignment.id);
});

// Helper functions to get assignment data
export function getAssignmentsForTeacher(teacherId: string): Assignment[] {
  return mockAssignments.filter(assignment => assignment.teacherId === teacherId);
}

export function getAssignmentsForSection(sectionId: string): Assignment[] {
  return mockAssignments.filter(assignment => assignment.sectionId === sectionId);
}

export function getSubmissionsForStudent(studentId: string): Submission[] {
  return mockSubmissions.filter(submission => submission.studentId === studentId);
}

export function getSubmissionsForAssignment(assignmentId: string): Submission[] {
  return mockSubmissions.filter(submission => submission.assignmentId === assignmentId);
}

export function getAssignmentById(assignmentId: string): Assignment | undefined {
  return mockAssignments.find(assignment => assignment.id === assignmentId);
}

export function getSubmissionById(submissionId: string): Submission | undefined {
  return mockSubmissions.find(submission => submission.id === submissionId);
}

// Get recent assignments (created in last 30 days)
export function getRecentAssignments(): Assignment[] {
  const thirtyDaysAgo = subDays(new Date(), 30);
  return mockAssignments.filter(assignment => assignment.createdAt >= thirtyDaysAgo);
}

// Get upcoming assignments (due in next 7 days)
export function getUpcomingAssignments(): Assignment[] {
  const now = new Date();
  const nextWeek = addDays(now, 7);
  return mockAssignments.filter(assignment => 
    assignment.dueDate && 
    assignment.dueDate >= now && 
    assignment.dueDate <= nextWeek
  );
}

// Get overdue assignments
export function getOverdueAssignments(): Assignment[] {
  const now = new Date();
  return mockAssignments.filter(assignment => 
    assignment.dueDate && assignment.dueDate < now
  );
}

// Assignment type options for creation
export const assignmentTypes = [
  { value: 'practice', label: 'Practice Exercise' },
  { value: 'performance', label: 'Performance Recording' },
  { value: 'written', label: 'Written Assignment' },
  { value: 'theory', label: 'Music Theory' },
  { value: 'analysis', label: 'Musical Analysis' },
  { value: 'composition', label: 'Composition' },
  { value: 'listening', label: 'Listening Assignment' },
  { value: 'research', label: 'Research Project' },
];