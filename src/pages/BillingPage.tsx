import { useState } from 'react';
import type { UserProfile } from '../types';
import BillingView from '../features/billing/BillingView';
import { mockParentProfile, mockAdultProfile } from '../lib/mockData';

export default function BillingPage() {
  // For demo purposes, use a parent profile to show billing from family perspective
  const [currentProfile] = useState<UserProfile>(
    mockParentProfile || mockAdultProfile
  );

  return <BillingView currentProfile={currentProfile} />;
}