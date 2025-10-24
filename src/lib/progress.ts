import type { ProgressReport, SkillAssessment } from '../types';
import { format, differenceInDays } from 'date-fns';

// Skill Level Types and Utilities
export type SkillLevel = 'beginning' | 'developing' | 'proficient' | 'advanced' | 'mastery';

export const skillLevels: { value: SkillLevel; label: string; color: string; score: number }[] = [
  { value: 'beginning', label: 'Beginning', color: 'bg-red-100 text-red-800', score: 1 },
  { value: 'developing', label: 'Developing', color: 'bg-yellow-100 text-yellow-800', score: 2 },
  { value: 'proficient', label: 'Proficient', color: 'bg-blue-100 text-blue-800', score: 3 },
  { value: 'advanced', label: 'Advanced', color: 'bg-green-100 text-green-800', score: 4 },
  { value: 'mastery', label: 'Mastery', color: 'bg-purple-100 text-purple-800', score: 5 },
];

// Progress Statistics
export interface ProgressStats {
  totalSkills: number;
  skillsAssessed: number;
  averageLevel: number;
  masterSkills: number;
  advancedSkills: number;
  proficientSkills: number;
  developingSkills: number;
  beginningSkills: number;
  progressPercentage: number;
}

// Calculate progress statistics
export function calculateProgressStats(skillAssessments: SkillAssessment[]): ProgressStats {
  const totalSkills = skillAssessments.length;
  const skillsAssessed = skillAssessments.filter(s => s.level).length;
  
  const levelCounts = {
    mastery: skillAssessments.filter(s => s.level === 'mastery').length,
    advanced: skillAssessments.filter(s => s.level === 'advanced').length,
    proficient: skillAssessments.filter(s => s.level === 'proficient').length,
    developing: skillAssessments.filter(s => s.level === 'developing').length,
    beginning: skillAssessments.filter(s => s.level === 'beginning').length,
  };
  
  const totalScore = skillAssessments.reduce((sum, skill) => {
    const levelData = skillLevels.find(l => l.value === skill.level);
    return sum + (levelData?.score || 0);
  }, 0);
  
  const averageLevel = skillsAssessed > 0 ? totalScore / skillsAssessed : 0;
  const progressPercentage = totalSkills > 0 
    ? Math.round(((levelCounts.proficient + levelCounts.advanced + levelCounts.mastery) / totalSkills) * 100)
    : 0;

  return {
    totalSkills,
    skillsAssessed,
    averageLevel: Math.round(averageLevel * 100) / 100,
    masterSkills: levelCounts.mastery,
    advancedSkills: levelCounts.advanced,
    proficientSkills: levelCounts.proficient,
    developingSkills: levelCounts.developing,
    beginningSkills: levelCounts.beginning,
    progressPercentage
  };
}

// Get skill level color
export function getSkillLevelColor(level: SkillLevel): string {
  const levelData = skillLevels.find(l => l.value === level);
  return levelData?.color || 'bg-gray-100 text-gray-800';
}

// Get skill level label
export function getSkillLevelLabel(level: SkillLevel): string {
  const levelData = skillLevels.find(l => l.value === level);
  return levelData?.label || 'Unknown';
}

// Get skill level score (1-5)
export function getSkillLevelScore(level: SkillLevel): number {
  const levelData = skillLevels.find(l => l.value === level);
  return levelData?.score || 0;
}

// Calculate overall grade from skill assessments
export function calculateOverallGrade(skillAssessments: SkillAssessment[]): string {
  const stats = calculateProgressStats(skillAssessments);
  const averageScore = stats.averageLevel;
  
  if (averageScore >= 4.5) return 'A+';
  if (averageScore >= 4.0) return 'A';
  if (averageScore >= 3.5) return 'A-';
  if (averageScore >= 3.0) return 'B+';
  if (averageScore >= 2.5) return 'B';
  if (averageScore >= 2.0) return 'B-';
  if (averageScore >= 1.5) return 'C+';
  if (averageScore >= 1.0) return 'C';
  return 'In Progress';
}

// Format progress report date
export function formatProgressDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

// Get progress report status color
export function getProgressStatusColor(status: ProgressReport['status']): string {
  switch (status) {
    case 'draft':
      return 'text-gray-600 bg-gray-100';
    case 'published':
      return 'text-green-600 bg-green-100';
    case 'acknowledged':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Get progress report status label
export function getProgressStatusLabel(status: ProgressReport['status']): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'published':
      return 'Published';
    case 'acknowledged':
      return 'Acknowledged';
    default:
      return 'Unknown';
  }
}

// Check if progress report is recent (within 30 days)
export function isRecentProgressReport(report: ProgressReport): boolean {
  if (!report.publishedAt) return false;
  return differenceInDays(new Date(), report.publishedAt) <= 30;
}

// Group skills by category
export function groupSkillsByCategory(skillAssessments: SkillAssessment[]): Record<string, SkillAssessment[]> {
  return skillAssessments.reduce((groups, skill) => {
    const category = skill.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(skill);
    return groups;
  }, {} as Record<string, SkillAssessment[]>);
}

// Calculate category progress
export function calculateCategoryProgress(skills: SkillAssessment[]): ProgressStats {
  return calculateProgressStats(skills);
}

// Sort skills by level (lowest first for improvement planning)
export function sortSkillsByLevel(skills: SkillAssessment[]): SkillAssessment[] {
  return skills.sort((a, b) => {
    const aScore = getSkillLevelScore(a.level);
    const bScore = getSkillLevelScore(b.level);
    return aScore - bScore;
  });
}

// Get skills that need attention (beginning/developing levels)
export function getSkillsNeedingAttention(skills: SkillAssessment[]): SkillAssessment[] {
  return skills.filter(skill => 
    skill.level === 'beginning' || skill.level === 'developing'
  );
}

// Get skills showing strength (advanced/mastery levels)
export function getStrengthSkills(skills: SkillAssessment[]): SkillAssessment[] {
  return skills.filter(skill => 
    skill.level === 'advanced' || skill.level === 'mastery'
  );
}

// Generate progress summary text
export function generateProgressSummary(stats: ProgressStats): string {
  const { totalSkills, progressPercentage, masterSkills, advancedSkills } = stats;
  
  if (totalSkills === 0) return 'No skills assessed yet';
  
  const strongSkills = masterSkills + advancedSkills;
  
  if (progressPercentage >= 80) {
    return `Excellent progress! ${progressPercentage}% of skills are proficient or above, with ${strongSkills} advanced skills.`;
  } else if (progressPercentage >= 60) {
    return `Good progress! ${progressPercentage}% of skills are proficient or above. Focus on developing remaining skills.`;
  } else if (progressPercentage >= 40) {
    return `Making progress! ${progressPercentage}% of skills are proficient. Continue practicing fundamental skills.`;
  } else {
    return `Early stages of learning. ${progressPercentage}% of skills are proficient. Focus on building foundational skills.`;
  }
}

// Skill category definitions for music education
export const musicSkillCategories = [
  { id: 'technique', name: 'Technique', icon: '🎯' },
  { id: 'rhythm', name: 'Rhythm & Timing', icon: '🥁' },
  { id: 'pitch', name: 'Pitch & Intonation', icon: '🎵' },
  { id: 'expression', name: 'Musical Expression', icon: '🎭' },
  { id: 'theory', name: 'Music Theory', icon: '📚' },
  { id: 'sight-reading', name: 'Sight Reading', icon: '👀' },
  { id: 'improvisation', name: 'Improvisation', icon: '✨' },
  { id: 'ensemble', name: 'Ensemble Skills', icon: '👥' },
];