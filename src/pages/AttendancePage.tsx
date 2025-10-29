import { useState } from 'react';
import type { UserProfile } from '../types';
import AttendanceView from '../features/attendance/AttendanceView';
// Mock data removed - use real API data

export default function AttendancePage() {
  // For demo purposes, use a teacher profile
  const [currentProfile] = useState<UserProfile>(
    { type: 'teacher', id: '', firstName: '', lastName: '' } // TODO: Use real profile
  );

  return <AttendanceView currentProfile={currentProfile} />;
}