export interface ImpactMetric {
  id: string;
  label: string;
  value: number;
  maxValue: number;
  icon: string;
  color: string;
  description: string;
}

export interface ImpactHistoryItem {
  id: string;
  type: 'report_verified' | 'issue_confirmed' | 'evidence_contributed' | 'resolution_verified' | 'community_contribution';
  title: string;
  description: string;
  points: number;
  timestamp: string;
  category: string;
  locality: string;
}

export interface ImpactContribution {
  category: string;
  count: number;
  points: number;
  color: string;
}

export interface ImpactTimelinePoint {
  date: string;
  points: number;
  cumulative: number;
}

export interface CommunityImpactData {
  issuesInfluenced: number;
  verifiedContributions: number;
  resolutionsVerified: number;
  communityConfirmations: number;
  localRank: number;
  wardRank: number;
}

export interface ImpactScoreProfile {
  totalScore: number;
  level: string;
  nextLevelThreshold: number;
  progressToNextLevel: number;
  metrics: ImpactMetric[];
  contributions: ImpactContribution[];
  history: ImpactHistoryItem[];
  timeline: ImpactTimelinePoint[];
  communityImpact: CommunityImpactData;
  badges: ImpactBadge[];
}

export interface ImpactBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  isRare: boolean;
}

export const impactMetrics: ImpactMetric[] = [
  {
    id: 'verified_reports',
    label: 'Verified Reports',
    value: 8,
    maxValue: 50,
    icon: 'FileCheck',
    color: '#2563EB',
    description: 'Reports that passed AI verification and were escalated to municipal authorities.',
  },
  {
    id: 'issue_confirmations',
    label: 'Issue Confirmations',
    value: 14,
    maxValue: 100,
    icon: 'CheckCircle2',
    color: '#10B981',
    description: 'Times you confirmed and strengthened existing civic issues in your locality.',
  },
  {
    id: 'useful_evidence',
    label: 'Useful Evidence',
    value: 6,
    maxValue: 30,
    icon: 'Camera',
    color: '#F59E0B',
    description: 'Photo/video evidence that helped verify and resolve civic issues faster.',
  },
  {
    id: 'resolution_verification',
    label: 'Resolution Verification',
    value: 5,
    maxValue: 25,
    icon: 'ShieldCheck',
    color: '#8B5CF6',
    description: 'Times you verified municipal resolutions, ensuring quality and accountability.',
  },
  {
    id: 'community_contributions',
    label: 'Community Contributions',
    value: 23,
    maxValue: 100,
    icon: 'Users',
    color: '#EC4899',
    description: 'Participation in discussions, upvotes, and community coordination efforts.',
  },
];

export const impactContributions: ImpactContribution[] = [
  { category: 'Street Lighting', count: 12, points: 145, color: '#F59E0B' },
  { category: 'Water Supply', count: 8, points: 95, color: '#2563EB' },
  { category: 'Roads & Transport', count: 15, points: 180, color: '#4B5563' },
  { category: 'Sanitation', count: 6, points: 72, color: '#EF4444' },
];

export const impactHistory: ImpactHistoryItem[] = [
  {
    id: 'hist-001',
    type: 'resolution_verified',
    title: 'Pothole Repair Verified',
    description: 'Confirmed successful repair on Main Avenue',
    points: 50,
    timestamp: '2 hours ago',
    category: 'roads',
    locality: 'Sector 14',
  },
  {
    id: 'hist-002',
    type: 'report_verified',
    title: 'Streetlight Report Verified',
    description: 'Your report #CV-8821 was verified and escalated',
    points: 25,
    timestamp: 'Yesterday',
    category: 'lighting',
    locality: 'Gate 2',
  },
  {
    id: 'hist-003',
    type: 'evidence_contributed',
    title: 'Photo Evidence Added',
    description: 'Added 2 photos to drainage issue cluster',
    points: 15,
    timestamp: '2 days ago',
    category: 'sanitation',
    locality: 'Market Square',
  },
  {
    id: 'hist-004',
    type: 'issue_confirmed',
    title: 'Issue Confirmation',
    description: 'Confirmed water pressure issue in Block B',
    points: 10,
    timestamp: '3 days ago',
    category: 'water',
    locality: 'Block B',
  },
  {
    id: 'hist-005',
    type: 'community_contribution',
    title: 'Discussion Participation',
    description: 'Contributed to school zone safety discussion',
    points: 8,
    timestamp: '4 days ago',
    category: 'safety',
    locality: 'Sector 14',
  },
  {
    id: 'hist-006',
    type: 'resolution_verified',
    title: 'Drainage Resolution Confirmed',
    description: 'Verified stormwater drain clearance',
    points: 50,
    timestamp: '5 days ago',
    category: 'sanitation',
    locality: 'Lane 4',
  },
  {
    id: 'hist-007',
    type: 'report_verified',
    title: 'Water Supply Report Verified',
    description: 'Report #CV-8904 verified by AI analysis',
    points: 25,
    timestamp: '1 week ago',
    category: 'water',
    locality: 'Block B',
  },
];

export const impactTimeline: ImpactTimelinePoint[] = [
  { date: 'Week 1', points: 45, cumulative: 45 },
  { date: 'Week 2', points: 62, cumulative: 107 },
  { date: 'Week 3', points: 78, cumulative: 185 },
  { date: 'Week 4', points: 95, cumulative: 280 },
  { date: 'Week 5', points: 55, cumulative: 335 },
  { date: 'Week 6', points: 85, cumulative: 420 },
];

export const communityImpactData: CommunityImpactData = {
  issuesInfluenced: 12,
  verifiedContributions: 28,
  resolutionsVerified: 5,
  communityConfirmations: 42,
  localRank: 3,
  wardRank: 15,
};

export const impactBadges: ImpactBadge[] = [
  {
    id: 'badge-signal-contributor',
    name: 'Signal Contributor',
    description: 'Submitted 12+ verified civic signals with accurate geolocation',
    icon: 'Radio',
    earnedAt: 'Aug 10, 2026',
    isRare: false,
  },
  {
    id: 'badge-community-voice',
    name: 'Community Voice',
    description: 'Participated in 25+ verification quorums',
    icon: 'Users',
    earnedAt: 'Aug 5, 2026',
    isRare: false,
  },
  {
    id: 'badge-evidence-expert',
    name: 'Evidence Expert',
    description: 'Contributed 10+ verified photo evidences',
    icon: 'Camera',
    earnedAt: 'Aug 12, 2026',
    isRare: true,
  },
  {
    id: 'badge-resolution-champion',
    name: 'Resolution Champion',
    description: 'Verified 5+ municipal resolutions',
    icon: 'ShieldCheck',
    earnedAt: 'Aug 14, 2026',
    isRare: true,
  },
];

export const defaultImpactProfile: ImpactScoreProfile = {
  totalScore: 420,
  level: 'Civic Champion',
  nextLevelThreshold: 500,
  progressToNextLevel: 84,
  metrics: impactMetrics,
  contributions: impactContributions,
  history: impactHistory,
  timeline: impactTimeline,
  communityImpact: communityImpactData,
  badges: impactBadges,
};

export function calculateLevel(score: number): { level: string; nextThreshold: number; progress: number } {
  if (score < 100) {
    return { level: 'Newcomer', nextThreshold: 100, progress: score };
  }
  if (score < 250) {
    return { level: 'Active Citizen', nextThreshold: 250, progress: score - 100 };
  }
  if (score < 500) {
    return { level: 'Civic Champion', nextThreshold: 500, progress: score - 250 };
  }
  if (score < 1000) {
    return { level: 'Community Leader', nextThreshold: 1000, progress: score - 500 };
  }
  return { level: 'Civic Legend', nextThreshold: score + 500, progress: 500 };
}

export function getTotalPointsFromHistory(history: ImpactHistoryItem[]): number {
  return history.reduce((sum, item) => sum + item.points, 0);
}
