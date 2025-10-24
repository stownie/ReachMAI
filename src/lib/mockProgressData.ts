import type { ProgressReport, SkillAssessment, Skill } from '../types';
import { subDays, subWeeks } from 'date-fns';

// Mock Skills for Music Programs
export const mockSkills: Skill[] = [
  // Piano Skills
  {
    id: 'piano-technique-001',
    programId: 'prog-001',
    name: 'Proper Hand Position',
    category: 'technique',
    description: 'Maintaining correct hand and finger position while playing',
    level: 1,
    milestones: [
      {
        id: 'milestone-001',
        name: 'Basic Position',
        description: 'Can maintain curved fingers and relaxed wrists',
        level: 'beginning',
        criteria: ['Curved fingers', 'Relaxed wrists', 'Proper bench height']
      },
      {
        id: 'milestone-002',
        name: 'Consistent Position',
        description: 'Maintains proper position throughout simple pieces',
        level: 'proficient',
        criteria: ['Consistent throughout piece', 'Natural movement', 'No tension']
      }
    ]
  },
  {
    id: 'piano-scales-001',
    programId: 'prog-001',
    name: 'Major Scales',
    category: 'technique',
    description: 'Playing major scales with proper fingering',
    level: 2,
    prerequisites: ['piano-technique-001'],
    milestones: [
      {
        id: 'milestone-003',
        name: 'C Major Scale',
        description: 'Can play C major scale hands separately',
        level: 'developing',
        criteria: ['Correct fingering', 'Even tempo', 'Clear notes']
      },
      {
        id: 'milestone-004',
        name: 'Multiple Scales',
        description: 'Can play C, G, and F major scales hands together',
        level: 'advanced',
        criteria: ['Hands together', 'Multiple keys', 'Fluent execution']
      }
    ]
  },
  {
    id: 'piano-rhythm-001',
    programId: 'prog-001',
    name: 'Basic Rhythm Patterns',
    category: 'rhythm',
    description: 'Understanding and playing basic note values',
    level: 1,
    milestones: [
      {
        id: 'milestone-005',
        name: 'Quarter Notes',
        description: 'Can play steady quarter note patterns',
        level: 'beginning',
        criteria: ['Steady tempo', 'Even spacing', 'Uses metronome']
      },
      {
        id: 'milestone-006',
        name: 'Mixed Rhythms',
        description: 'Can play combinations of quarter, half, and whole notes',
        level: 'proficient',
        criteria: ['Mixed note values', 'Accurate timing', 'Musical flow']
      }
    ]
  },
  
  // Guitar Skills
  {
    id: 'guitar-chords-001',
    programId: 'prog-002',
    name: 'Basic Open Chords',
    category: 'technique',
    description: 'Playing fundamental open chord shapes',
    level: 1,
    milestones: [
      {
        id: 'milestone-007',
        name: 'First Chords',
        description: 'Can play G, C, and D chords cleanly',
        level: 'developing',
        criteria: ['Clear notes', 'Proper finger placement', 'Clean chord changes']
      },
      {
        id: 'milestone-008',
        name: 'Chord Progressions',
        description: 'Can play common chord progressions smoothly',
        level: 'advanced',
        criteria: ['Smooth transitions', 'Consistent strumming', 'Musical timing']
      }
    ]
  },
  {
    id: 'guitar-strumming-001',
    programId: 'prog-002',
    name: 'Strumming Patterns',
    category: 'rhythm',
    description: 'Basic strumming techniques and patterns',
    level: 1,
    milestones: [
      {
        id: 'milestone-009',
        name: 'Basic Strum',
        description: 'Can perform basic down-strum pattern',
        level: 'beginning',
        criteria: ['Consistent motion', 'Even sound', 'Relaxed wrist']
      },
      {
        id: 'milestone-010',
        name: 'Complex Patterns',
        description: 'Can perform various up-down strumming patterns',
        level: 'proficient',
        criteria: ['Multiple patterns', 'Rhythmic accuracy', 'Dynamic control']
      }
    ]
  }
];

// Mock Skill Assessments
export const mockSkillAssessments: SkillAssessment[] = [
  {
    skillId: 'piano-technique-001',
    skillName: 'Proper Hand Position',
    category: 'technique',
    level: 'proficient',
    description: 'Student demonstrates good hand position most of the time',
    notes: 'Excellent improvement! Occasional reminders needed for wrist position.',
    evidenceIds: ['assign-001', 'assign-002']
  },
  {
    skillId: 'piano-scales-001',
    skillName: 'Major Scales',
    category: 'technique',
    level: 'developing',
    description: 'Can play C major scale hands separately, working on hands together',
    notes: 'Good progress on C major. Continue practicing G and F major scales.',
    evidenceIds: ['assign-001']
  },
  {
    skillId: 'piano-rhythm-001',
    skillName: 'Basic Rhythm Patterns',
    category: 'rhythm',
    level: 'advanced',
    description: 'Excellent rhythm skills, plays complex patterns accurately',
    notes: 'Natural sense of rhythm. Ready for more challenging patterns.',
    evidenceIds: ['assign-002']
  },
  
  // Guitar skills for another student
  {
    skillId: 'guitar-chords-001',
    skillName: 'Basic Open Chords',
    category: 'technique',
    level: 'developing',
    description: 'Can play G and C chords, struggling with D chord',
    notes: 'Focus on finger strength and positioning for D chord.',
    evidenceIds: ['assign-003']
  },
  {
    skillId: 'guitar-strumming-001',
    skillName: 'Strumming Patterns',
    category: 'rhythm',
    level: 'proficient',
    description: 'Good strumming technique, consistent rhythm',
    notes: 'Excellent rhythmic control. Ready to learn fingerpicking.',
    evidenceIds: ['assign-004']
  }
];

// Mock Progress Reports
export const mockProgressReports: ProgressReport[] = [
  {
    id: 'progress-001',
    studentId: 'student-001',
    sectionId: 'section-001', // Piano Fundamentals
    termId: 'term-001',
    teacherId: 'teacher-001',
    skills: mockSkillAssessments.slice(0, 3), // Piano skills
    overallGrade: 'B+',
    comments: 'Emily has shown remarkable progress this term. Her hand position has improved significantly, and she demonstrates excellent rhythm skills. We should continue working on scale fluency, particularly hands-together coordination. Overall, she is well-prepared to advance to intermediate pieces.',
    parentFeedback: 'Emily really enjoys her piano lessons and practices regularly at home. Thank you for your patience and encouragement!',
    status: 'published',
    publishedAt: subDays(new Date(), 5),
    acknowledgedAt: subDays(new Date(), 2),
    createdAt: subWeeks(new Date(), 2),
    updatedAt: subDays(new Date(), 5),
  },
  {
    id: 'progress-002',
    studentId: 'student-004',
    sectionId: 'section-002', // Advanced Guitar
    termId: 'term-001',
    teacherId: 'teacher-002',
    skills: mockSkillAssessments.slice(3, 5), // Guitar skills
    overallGrade: 'B',
    comments: 'Jake is making steady progress with his guitar skills. His strumming technique is quite good, and he has a natural sense of rhythm. The main area for improvement is chord transitions, particularly the D chord finger positioning. With continued practice, he should master all basic open chords by next term.',
    status: 'published',
    publishedAt: subDays(new Date(), 12),
    acknowledgedAt: subDays(new Date(), 8),
    createdAt: subWeeks(new Date(), 3),
    updatedAt: subDays(new Date(), 12),
  },
  {
    id: 'progress-003',
    studentId: 'student-002',
    sectionId: 'section-001',
    termId: 'term-001',
    teacherId: 'teacher-001',
    skills: [
      {
        skillId: 'piano-technique-001',
        skillName: 'Proper Hand Position',
        category: 'technique',
        level: 'developing',
        description: 'Improving hand position, needs consistent reminders',
        notes: 'Continue focusing on curved fingers and relaxed shoulders.'
      },
      {
        skillId: 'piano-scales-001',
        skillName: 'Major Scales',
        category: 'technique',
        level: 'beginning',
        description: 'Just starting to learn C major scale',
        notes: 'Take time with proper fingering. Practice hands separately first.'
      },
      {
        skillId: 'piano-rhythm-001',
        skillName: 'Basic Rhythm Patterns',
        category: 'rhythm',
        level: 'proficient',
        description: 'Good understanding of basic note values',
        notes: 'Strength in rhythm! Can help with overall musical development.'
      }
    ],
    overallGrade: 'C+',
    comments: 'Michael is working hard and showing gradual improvement. His strength lies in rhythm and musical understanding. We need to focus more on technical fundamentals, especially hand position and finger independence. Regular practice at home will help reinforce these concepts.',
    status: 'draft',
    createdAt: subDays(new Date(), 3),
    updatedAt: subDays(new Date(), 1),
  },
];

// Helper functions
export function getProgressReportsForStudent(studentId: string): ProgressReport[] {
  return mockProgressReports.filter(report => report.studentId === studentId);
}

export function getProgressReportsForTeacher(teacherId: string): ProgressReport[] {
  return mockProgressReports.filter(report => report.teacherId === teacherId);
}

export function getProgressReportsForSection(sectionId: string): ProgressReport[] {
  return mockProgressReports.filter(report => report.sectionId === sectionId);
}

export function getSkillsForProgram(programId: string): Skill[] {
  return mockSkills.filter(skill => skill.programId === programId);
}

export function getSkillById(skillId: string): Skill | undefined {
  return mockSkills.find(skill => skill.id === skillId);
}

export function getProgressReportById(reportId: string): ProgressReport | undefined {
  return mockProgressReports.find(report => report.id === reportId);
}

// Get recent progress reports (within last 60 days)
export function getRecentProgressReports(): ProgressReport[] {
  const twoMonthsAgo = subDays(new Date(), 60);
  return mockProgressReports.filter(report => 
    report.publishedAt && report.publishedAt >= twoMonthsAgo
  );
}

// Get pending progress reports (drafts)
export function getPendingProgressReports(): ProgressReport[] {
  return mockProgressReports.filter(report => report.status === 'draft');
}

// Get skills needing assessment (no current assessment)
export function getSkillsNeedingAssessment(programId: string): Skill[] {
  const programSkills = getSkillsForProgram(programId);
  const assessedSkillIds = mockSkillAssessments.map(assessment => assessment.skillId);
  
  return programSkills.filter(skill => !assessedSkillIds.includes(skill.id));
}