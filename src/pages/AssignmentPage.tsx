import { useState } from 'react';
import type { UserProfile } from '../types';
import AssignmentView from '../features/assignments/AssignmentView';
// Mock data removed - use real API data

export default function AssignmentPage() {
  // For demo purposes, use a teacher profile
  const [currentProfile] = useState<UserProfile>(
    { type: 'teacher', id: '', firstName: '', lastName: '' } // TODO: Use real profile
  );

  return <AssignmentView currentProfile={currentProfile} />;
}