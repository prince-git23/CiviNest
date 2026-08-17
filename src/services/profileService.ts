export interface ProfilePreference {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
  category: string;
}

export interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: string;
}

export interface PrivacySetting {
  id: string;
  label: string;
  description: string;
  value: 'public' | 'community' | 'private';
  icon: string;
}

export interface ProfileCompletionItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
  category: string;
}

export interface ProfileIdentity {
  fullName: string;
  email: string;
  phone: string;
  locality: string;
  ward: string;
  city: string;
  residenceType: 'apartment' | 'house' | 'society';
  societyName?: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  joinedDate: string;
  avatarUrl?: string;
}

export interface ProfileOptimizationData {
  identity: ProfileIdentity;
  completionPercentage: number;
  completionItems: ProfileCompletionItem[];
  civicPreferences: ProfilePreference[];
  notificationPreferences: NotificationPreference[];
  privacySettings: PrivacySetting[];
  profileStrength: number;
  contributionSummary: {
    totalReports: number;
    verifiedReports: number;
    communityConfirmations: number;
    impactPoints: number;
  };
}

export const defaultProfileIdentity: ProfileIdentity = {
  fullName: 'Prince Yadav',
  email: 'prince.yadav@email.com',
  phone: '+91 98765 43210',
  locality: 'Green Valley Residency',
  ward: 'Dharampeth Ward 14',
  city: 'Nagpur',
  residenceType: 'apartment',
  societyName: 'Green Valley Residency',
  verificationStatus: 'verified',
  joinedDate: 'January 2026',
};

export const profileCompletionItems: ProfileCompletionItem[] = [
  { id: 'location_verified', label: 'Location Verified', completed: true, required: true, category: 'identity' },
  { id: 'locality_selected', label: 'Locality Selected', completed: true, required: true, category: 'identity' },
  { id: 'residence_type', label: 'Residence Type Selected', completed: true, required: false, category: 'identity' },
  { id: 'community_selected', label: 'Community/Society Selected', completed: true, required: false, category: 'identity' },
  { id: 'preferred_language', label: 'Preferred Language Set', completed: true, required: false, category: 'preferences' },
  { id: 'notification_setup', label: 'Notification Preferences Set', completed: false, required: false, category: 'preferences' },
  { id: 'civic_interests', label: 'Civic Interests Selected', completed: true, required: false, category: 'preferences' },
  { id: 'privacy_settings', label: 'Privacy Settings Configured', completed: false, required: false, category: 'privacy' },
];

export const civicPreferences: ProfilePreference[] = [
  { id: 'roads', label: 'Roads & Transport', icon: 'Car', enabled: true, category: 'infrastructure' },
  { id: 'water', label: 'Water Supply', icon: 'Droplet', enabled: true, category: 'infrastructure' },
  { id: 'lighting', label: 'Street Lighting', icon: 'Lightbulb', enabled: true, category: 'infrastructure' },
  { id: 'sanitation', label: 'Sanitation & Waste', icon: 'Trash2', enabled: true, category: 'infrastructure' },
  { id: 'electricity', label: 'Electricity & Power', icon: 'Zap', enabled: false, category: 'infrastructure' },
  { id: 'safety', label: 'Public Safety', icon: 'Shield', enabled: true, category: 'safety' },
  { id: 'environment', label: 'Environment & Parks', icon: 'TreePine', enabled: false, category: 'environment' },
  { id: 'drainage', label: 'Drainage & Stormwater', icon: 'CloudRain', enabled: true, category: 'infrastructure' },
];

export const notificationPreferences: NotificationPreference[] = [
  {
    id: 'critical_issues',
    label: 'Nearby Critical Issues',
    description: 'Get alerts for high-priority issues within 500m of your location',
    enabled: true,
    icon: 'AlertTriangle',
  },
  {
    id: 'status_changes',
    label: 'Issue Status Changes',
    description: 'Notifications when your reported issues change status',
    enabled: true,
    icon: 'RefreshCw',
  },
  {
    id: 'resolution_verification',
    label: 'Resolution Verification',
    description: 'Reminders to verify municipal resolutions',
    enabled: true,
    icon: 'CheckCircle2',
  },
  {
    id: 'community_updates',
    label: 'Community Updates',
    description: 'Updates from your locality and community discussions',
    enabled: false,
    icon: 'Users',
  },
  {
    id: 'municipal_responses',
    label: 'Municipal Responses',
    description: 'Alerts when municipal authorities respond to your issues',
    enabled: true,
    icon: 'Building2',
  },
  {
    id: 'weekly_digest',
    label: 'Weekly Digest',
    description: 'Summary of civic activity in your ward',
    enabled: false,
    icon: 'Mail',
  },
];

export const privacySettings: PrivacySetting[] = [
  {
    id: 'profile_visibility',
    label: 'Profile Visibility',
    description: 'Who can see your profile information',
    value: 'community',
    icon: 'Eye',
  },
  {
    id: 'participation_visibility',
    label: 'Participation Visibility',
    description: 'Who can see your civic reports and confirmations',
    value: 'public',
    icon: 'Activity',
  },
  {
    id: 'location_precision',
    label: 'Location Precision',
    description: 'How precisely your location is shown on reports',
    value: 'community',
    icon: 'MapPin',
  },
  {
    id: 'evidence_visibility',
    label: 'Evidence Visibility',
    description: 'Who can view your submitted photo/video evidence',
    value: 'public',
    icon: 'Camera',
  },
];

export const defaultProfileData: ProfileOptimizationData = {
  identity: defaultProfileIdentity,
  completionPercentage: 82,
  completionItems: profileCompletionItems,
  civicPreferences: civicPreferences,
  notificationPreferences: notificationPreferences,
  privacySettings: privacySettings,
  profileStrength: 78,
  contributionSummary: {
    totalReports: 8,
    verifiedReports: 7,
    communityConfirmations: 42,
    impactPoints: 420,
  },
};

export function calculateCompletionPercentage(items: ProfileCompletionItem[]): number {
  const completed = items.filter((item) => item.completed).length;
  return Math.round((completed / items.length) * 100);
}

export function getProfileStrengthLabel(strength: number): string {
  if (strength >= 90) return 'Excellent';
  if (strength >= 75) return 'Strong';
  if (strength >= 50) return 'Moderate';
  if (strength >= 25) return 'Developing';
  return 'New';
}

export function getVerificationBadgeColor(status: ProfileIdentity['verificationStatus']): string {
  switch (status) {
    case 'verified':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'unverified':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}
