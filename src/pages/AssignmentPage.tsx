import { useState } from 'react';
import type { UserProfile } from '../types';
import AssignmentView from '../features/assignments/AssignmentView';
import { mockTeacherProfile, mockAdultProfile } from '../lib/mockData';

export default function AssignmentPage() {
  // For demo purposes, use a teacher profile
  const [currentProfile] = useState<UserProfile>(
    mockTeacherProfile || mockAdultProfile
  );

  return <AssignmentView currentProfile={currentProfile} />;
}