import { useState } from 'react';
import type { UserProfile } from '../types';
import BillingView from '../features/billing/BillingView';
// Mock data removed - use real API data

export default function BillingPage() {
  // For demo purposes, use a parent profile to show billing from family perspective
  const [currentProfile] = useState<UserProfile>(
    { type: 'parent', id: '', firstName: '', lastName: '' } // TODO: Use real profile
  );

  return <BillingView currentProfile={currentProfile} />;
}