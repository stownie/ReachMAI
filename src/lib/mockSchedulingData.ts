import type { Organization, Campus, Room, Term, Program, Section, Meeting, Enrollment } from '../types';
import { generateRRule } from './scheduling';

// Mock Organization Structure
export const mockOrganization: Organization = {
  id: 'org-001',
  name: 'Metropolitan Arts Institute',
  campuses: [],
  roles: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-10-24'),
};

export const mockCampuses: Campus[] = [
  {
    id: 'campus-001',
    organizationId: 'org-001',
    name: 'Downtown Campus',
    address: '123 Arts Avenue, Downtown, NY 10001',
    rooms: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
  {
    id: 'campus-002',
    organizationId: 'org-001',
    name: 'Uptown Campus',
    address: '456 Creative Street, Uptown, NY 10025',
    rooms: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
];

export const mockRooms: Room[] = [
  {
    id: 'room-001',
    campusId: 'campus-001',
    name: 'Studio A',
    capacity: 15,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
  {
    id: 'room-002',
    campusId: 'campus-001',
    name: 'Studio B',
    capacity: 20,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
  {
    id: 'room-003',
    campusId: 'campus-001',
    name: 'Practice Room 1',
    capacity: 8,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
  {
    id: 'room-004',
    campusId: 'campus-002',
    name: 'Main Hall',
    capacity: 50,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
];

export const mockTerms: Term[] = [
  {
    id: 'term-001',
    organizationId: 'org-001',
    name: 'Fall 2024',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-12-15'),
    enrollmentWindowStart: new Date('2024-08-01'),
    enrollmentWindowEnd: new Date('2024-08-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
  {
    id: 'term-002',
    organizationId: 'org-001',
    name: 'Spring 2025',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-05-30'),
    enrollmentWindowStart: new Date('2024-12-01'),
    enrollmentWindowEnd: new Date('2025-01-10'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
];

export const mockPrograms: Program[] = [
  {
    id: 'program-001',
    organizationId: 'org-001',
    name: 'Youth Orchestra',
    description: 'Comprehensive orchestral training for young musicians',
    type: {
      id: 'type-001',
      name: 'Group Music Program',
      category: 'group',
      allowSelfEnroll: true,
      visibleToRoles: ['student', 'parent'],
      selfEnrollRoles: ['student', 'parent'],
      requiresApproval: false,
    },
    sections: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
  {
    id: 'program-002',
    organizationId: 'org-001',
    name: 'Private Piano Lessons',
    description: 'One-on-one piano instruction',
    type: {
      id: 'type-002',
      name: 'Private Lessons',
      category: 'private-lessons',
      allowSelfEnroll: true,
      visibleToRoles: ['student', 'parent', 'adult'],
      selfEnrollRoles: ['student', 'parent', 'adult'],
      requiresApproval: true,
    },
    sections: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
  {
    id: 'program-003',
    organizationId: 'org-001',
    name: 'Adult Choir',
    description: 'Choir for adult learners and community members',
    type: {
      id: 'type-003',
      name: 'Adult Group Program',
      category: 'group',
      allowSelfEnroll: true,
      visibleToRoles: ['adult'],
      selfEnrollRoles: ['adult'],
      requiresApproval: false,
    },
    sections: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
];

// Mock Enrollments
export const mockEnrollments: Enrollment[] = [
  {
    id: 'enrollment-001',
    sectionId: 'section-001',
    studentId: 'student-001',
    status: 'enrolled',
    enrolledAt: new Date('2024-08-15'),
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-15'),
  },
  {
    id: 'enrollment-002',
    sectionId: 'section-001',
    studentId: 'student-002',
    status: 'enrolled',
    enrolledAt: new Date('2024-08-16'),
    createdAt: new Date('2024-08-16'),
    updatedAt: new Date('2024-08-16'),
  },
  {
    id: 'enrollment-003',
    sectionId: 'section-001',
    studentId: 'student-003',
    status: 'waitlisted',
    enrolledAt: new Date('2024-08-20'),
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-20'),
  },
  {
    id: 'enrollment-004',
    sectionId: 'section-002',
    studentId: 'student-001',
    status: 'enrolled',
    enrolledAt: new Date('2024-08-17'),
    createdAt: new Date('2024-08-17'),
    updatedAt: new Date('2024-08-17'),
  },
];

// Mock Sections
export const mockSections: Section[] = [
  {
    id: 'section-001',
    programId: 'program-001',
    termId: 'term-001',
    name: 'Youth Orchestra - Beginner',
    roomId: 'room-002',
    teacherIds: ['teacher-001'],
    capacity: 18,
    enrollments: mockEnrollments.filter(e => e.sectionId === 'section-001'),
    meetings: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
  {
    id: 'section-002',
    programId: 'program-002',
    termId: 'term-001',
    name: 'Piano Lessons - Ms. Smith',
    roomId: 'room-003',
    teacherIds: ['teacher-002'],
    capacity: 1,
    enrollments: mockEnrollments.filter(e => e.sectionId === 'section-002'),
    meetings: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
  {
    id: 'section-003',
    programId: 'program-003',
    termId: 'term-001',
    name: 'Adult Choir - Evening',
    roomId: 'room-004',
    teacherIds: ['teacher-001'],
    capacity: 40,
    enrollments: [],
    meetings: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-24'),
  },
];

// Mock Meetings with RRULE
export const mockMeetings: Meeting[] = [
  {
    id: 'meeting-001',
    sectionId: 'section-001',
    startTime: new Date('2024-10-25T14:00:00'),
    endTime: new Date('2024-10-25T15:30:00'),
    isRecurring: true,
    recurrenceRule: generateRRule({
      frequency: 'weekly',
      daysOfWeek: [5], // Friday
      count: 16, // 16 weeks
    }),
    exceptions: [new Date('2024-11-29')], // Thanksgiving week
    roomId: 'room-002',
    teacherIds: ['teacher-001'],
    attendance: [],
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01'),
  },
  {
    id: 'meeting-002',
    sectionId: 'section-002',
    startTime: new Date('2024-10-24T16:00:00'),
    endTime: new Date('2024-10-24T16:45:00'),
    isRecurring: true,
    recurrenceRule: generateRRule({
      frequency: 'weekly',
      daysOfWeek: [4], // Thursday
      count: 16,
    }),
    roomId: 'room-003',
    teacherIds: ['teacher-002'],
    attendance: [],
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01'),
  },
  {
    id: 'meeting-003',
    sectionId: 'section-003',
    startTime: new Date('2024-10-23T19:00:00'),
    endTime: new Date('2024-10-23T20:30:00'),
    isRecurring: true,
    recurrenceRule: generateRRule({
      frequency: 'weekly',
      daysOfWeek: [3], // Wednesday
      count: 16,
    }),
    roomId: 'room-004',
    teacherIds: ['teacher-001'],
    attendance: [],
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01'),
  },
  {
    id: 'meeting-004',
    sectionId: 'section-001',
    startTime: new Date('2024-12-20T18:00:00'),
    endTime: new Date('2024-12-20T20:00:00'),
    isRecurring: false,
    roomId: 'room-004',
    teacherIds: ['teacher-001'],
    attendance: [],
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01'),
  },
];

// Update sections with meetings
mockSections.forEach(section => {
  section.meetings = mockMeetings.filter(meeting => meeting.sectionId === section.id);
});

// Complete organization structure
mockOrganization.campuses = mockCampuses;
mockCampuses.forEach(campus => {
  campus.rooms = mockRooms.filter(room => room.campusId === campus.id);
});
mockPrograms.forEach(program => {
  program.sections = mockSections.filter(section => section.programId === program.id);
});

export const mockSchedulingData = {
  organization: mockOrganization,
  campuses: mockCampuses,
  rooms: mockRooms,
  terms: mockTerms,
  programs: mockPrograms,
  sections: mockSections,
  meetings: mockMeetings,
  enrollments: mockEnrollments,
};

export default mockSchedulingData;