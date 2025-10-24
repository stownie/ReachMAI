import { useState } from 'react';
import type { UserProfile } from '../types';
import AttendanceView from '../features/attendance/AttendanceView';
import { mockTeacherProfile, mockAdultProfile } from '../lib/mockData';

export default function AttendancePage() {
  // For demo purposes, use a teacher profile
  const [currentProfile] = useState<UserProfile>(
    mockTeacherProfile || mockAdultProfile
  );

  return <AttendanceView currentProfile={currentProfile} />;
}