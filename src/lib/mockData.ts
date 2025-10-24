import type { AuthAccount, UserProfile, StudentProfile, ParentProfile, TeacherProfile } from '../types';

// Mock Authentication Account
export const mockAuthAccount: AuthAccount = {
  id: 'auth-001',
  email: 'demo@reachmai.com',
  phone: '+1 (555) 123-4567',
  profiles: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-10-24'),
};

// Mock Student Profile
export const mockStudentProfile: StudentProfile = {
  id: 'student-001',
  type: 'student',
  firstName: 'Emma',
  lastName: 'Johnson',
  preferredName: 'Emma',
  email: 'emma.johnson@email.com',
  phone: '+1 (555) 987-6543',
  preferredContactMethod: 'email',
  emailVerified: true,
  phoneVerified: true,
  accountId: 'auth-001',
  dateOfBirth: new Date('2010-03-15'),
  school: 'Lincoln Elementary School',
  schoolCatalog: 'lincoln-elementary',
  parentIds: ['parent-001'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-10-24'),
};

// Mock Parent Profile
export const mockParentProfile: ParentProfile = {
  id: 'parent-001',
  type: 'parent',
  firstName: 'Sarah',
  lastName: 'Johnson',
  preferredName: 'Sarah',
  email: 'sarah.johnson@email.com',
  phone: '+1 (555) 456-7890',
  preferredContactMethod: 'phone',
  emailVerified: true,
  phoneVerified: true,
  accountId: 'auth-001',
  studentIds: ['student-001'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-10-24'),
};

// Mock Teacher Profile
export const mockTeacherProfile: TeacherProfile = {
  id: 'teacher-001',
  type: 'teacher',
  firstName: 'Michael',
  lastName: 'Davis',
  preferredName: 'Mr. Davis',
  email: 'michael.davis@mai.org',
  phone: '+1 (555) 234-5678',
  preferredContactMethod: 'email',
  emailVerified: true,
  phoneVerified: true,
  accountId: 'auth-001',
  clearances: [
    {
      id: 'clearance-001',
      teacherId: 'teacher-001',
      campusId: 'campus-001',
      type: 'Background Check',
      status: 'active',
      expiryDate: new Date('2025-12-31'),
      documentUrl: '/documents/bg-check-001.pdf',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'clearance-002',
      teacherId: 'teacher-001',
      campusId: 'campus-001',
      type: 'CPR Certification',
      status: 'active',
      expiryDate: new Date('2025-06-30'),
      documentUrl: '/documents/cpr-cert-001.pdf',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-10-24'),
};

// Mock Adult Profile
export const mockAdultProfile: UserProfile = {
  id: 'adult-001',
  type: 'adult',
  firstName: 'Jennifer',
  lastName: 'Wilson',
  preferredName: 'Jen',
  email: 'jen.wilson@email.com',
  phone: '+1 (555) 345-6789',
  preferredContactMethod: 'email',
  emailVerified: true,
  phoneVerified: true,
  accountId: 'auth-001',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-10-24'),
};

// Complete mock auth account with all profiles
export const mockCompleteAuthAccount: AuthAccount = {
  ...mockAuthAccount,
  profiles: [
    mockStudentProfile,
    mockParentProfile,
    mockTeacherProfile,
    mockAdultProfile,
  ],
};

// Individual profile examples for testing different user types
export const mockProfiles = {
  student: mockStudentProfile,
  parent: mockParentProfile,
  teacher: mockTeacherProfile,
  adult: mockAdultProfile,
};

// Mock data for different scenarios
export const mockScenarios = {
  // Single student profile
  studentOnly: {
    ...mockAuthAccount,
    profiles: [mockStudentProfile],
  },
  
  // Parent with multiple students
  parentWithMultipleStudents: {
    ...mockAuthAccount,
    profiles: [
      mockParentProfile,
      mockStudentProfile,
      {
        ...mockStudentProfile,
        id: 'student-002',
        firstName: 'Alex',
        lastName: 'Johnson',
        preferredName: 'Alex',
        dateOfBirth: new Date('2012-08-20'),
        school: 'Roosevelt Middle School',
        schoolCatalog: 'roosevelt-middle',
      },
    ],
  },
  
  // Teacher only
  teacherOnly: {
    ...mockAuthAccount,
    profiles: [mockTeacherProfile],
  },
  
  // Adult learner
  adultOnly: {
    ...mockAuthAccount,
    profiles: [mockAdultProfile],
  },
  
  // Complex family account
  complexFamily: {
    ...mockAuthAccount,
    profiles: [
      mockParentProfile,
      mockStudentProfile,
      {
        ...mockStudentProfile,
        id: 'student-003',
        firstName: 'Olivia',
        lastName: 'Johnson',
        preferredName: 'Liv',
        dateOfBirth: new Date('2014-11-05'),
        school: 'Washington Elementary',
        schoolCatalog: 'washington-elementary',
      },
      {
        ...mockAdultProfile,
        id: 'adult-002',
        firstName: 'David',
        lastName: 'Johnson',
        preferredName: 'Dave',
        email: 'david.johnson@email.com',
      },
    ],
  },
};

// Helper function to get mock data by scenario
export function getMockAccountByScenario(scenario: keyof typeof mockScenarios): AuthAccount {
  return mockScenarios[scenario];
}

// Helper function to get profile by type
export function getMockProfileByType(type: UserProfile['type']): UserProfile {
  return mockProfiles[type];
}

// Export default for easy access
export default {
  account: mockCompleteAuthAccount,
  profiles: mockProfiles,
  scenarios: mockScenarios,
};