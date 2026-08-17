export interface DiscussionParticipant {
  id: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
}

export interface DiscussionMessage {
  id: string;
  author: DiscussionParticipant;
  content: string;
  timestamp: string;
  isEvidence: boolean;
  evidenceUrl?: string;
}

export interface DiscussionItem {
  id: string;
  title: string;
  category: 'water' | 'roads' | 'lighting' | 'sanitation' | 'safety' | 'environment' | 'general';
  categoryLabel: string;
  locality: string;
  ward: string;
  associatedIssueId?: string;
  associatedIssueTitle?: string;
  participants: DiscussionParticipant[];
  messageCount: number;
  confirmations: number;
  status: 'active' | 'resolved' | 'escalated' | 'pending_action';
  createdAt: string;
  lastActivity: string;
  description: string;
  tags: string[];
  isPinned?: boolean;
}

export interface DiscussionCategory {
  id: string;
  label: string;
  icon: string;
  count: number;
  color: string;
}

export interface TrendingTopic {
  id: string;
  title: string;
  category: string;
  engagementScore: number;
  reportCount: number;
}

export interface CommunityPulseItem {
  id: string;
  type: 'verification' | 'resolution' | 'escalation' | 'evidence';
  title: string;
  description: string;
  timestamp: string;
  locality: string;
}

export const discussionCategories: DiscussionCategory[] = [
  { id: 'all', label: 'All Discussions', icon: 'MessageSquare', count: 47, color: '#6B7280' },
  { id: 'water', label: 'Water Supply', icon: 'Droplet', count: 12, color: '#2563EB' },
  { id: 'roads', label: 'Roads & Transport', icon: 'Car', count: 15, color: '#4B5563' },
  { id: 'lighting', label: 'Street Lighting', icon: 'Lightbulb', count: 8, color: '#F59E0B' },
  { id: 'sanitation', label: 'Sanitation', icon: 'Trash2', count: 6, color: '#EF4444' },
  { id: 'safety', label: 'Public Safety', icon: 'Shield', count: 4, color: '#DC2626' },
  { id: 'environment', label: 'Environment', icon: 'TreePine', count: 2, color: '#10B981' },
];

export const trendingTopics: TrendingTopic[] = [
  {
    id: 'trend-1',
    title: 'Monsoon Drainage Preparedness',
    category: 'sanitation',
    engagementScore: 89,
    reportCount: 34,
  },
  {
    id: 'trend-2',
    title: 'School Zone Traffic Safety',
    category: 'safety',
    engagementScore: 76,
    reportCount: 21,
  },
  {
    id: 'trend-3',
    title: 'Water Pressure Issues - Block B',
    category: 'water',
    engagementScore: 72,
    reportCount: 18,
  },
  {
    id: 'trend-4',
    title: 'Street Light Maintenance Drive',
    category: 'lighting',
    engagementScore: 68,
    reportCount: 25,
  },
];

export const communityPulseItems: CommunityPulseItem[] = [
  {
    id: 'pulse-1',
    type: 'verification',
    title: 'Resolution Verified',
    description: 'Pothole repair on Main Ave confirmed by 12 residents',
    timestamp: '15m ago',
    locality: 'Sector 14',
  },
  {
    id: 'pulse-2',
    type: 'escalation',
    title: 'Issue Escalated',
    description: 'Drainage overflow escalated to Municipal Commissioner',
    timestamp: '1h ago',
    locality: 'Market Square',
  },
  {
    id: 'pulse-3',
    type: 'evidence',
    title: 'Evidence Added',
    description: '3 new photos added to Street Lighting cluster',
    timestamp: '2h ago',
    locality: 'Lane 3',
  },
  {
    id: 'pulse-4',
    type: 'resolution',
    title: 'Resolution In Progress',
    description: 'Water pressure restoration work started',
    timestamp: '3h ago',
    locality: 'Block B',
  },
];

export const sampleDiscussions: DiscussionItem[] = [
  {
    id: 'disc-001',
    title: 'Streetlights near Sector 14 School',
    category: 'lighting',
    categoryLabel: 'Street Lighting',
    locality: 'Sector 14',
    ward: 'Dharampeth',
    associatedIssueId: 'CIV-2023-892',
    associatedIssueTitle: 'Street Lighting Failure - Sector 14 Corridor',
    participants: [
      { id: 'p1', name: 'Priya S.', isVerified: true },
      { id: 'p2', name: 'Rajesh K.', isVerified: true },
      { id: 'p3', name: 'Anita M.', isVerified: false },
    ],
    messageCount: 24,
    confirmations: 18,
    status: 'active',
    createdAt: '2 days ago',
    lastActivity: '1 hour ago',
    description: 'Multiple streetlights have been non-functional for the past week near the school zone. Parents are concerned about children crossing the road in the dark.',
    tags: ['school-zone', 'safety', 'urgent'],
    isPinned: true,
  },
  {
    id: 'disc-002',
    title: 'Water supply timing inconsistency',
    category: 'water',
    categoryLabel: 'Water Supply',
    locality: 'Block B',
    ward: 'Dharampeth',
    associatedIssueId: 'CIV-2023-445',
    participants: [
      { id: 'p4', name: 'Suresh T.', isVerified: true },
      { id: 'p5', name: 'Meena L.', isVerified: false },
    ],
    messageCount: 15,
    confirmations: 8,
    status: 'escalated',
    createdAt: '5 days ago',
    lastActivity: '3 hours ago',
    description: 'Water supply timing has shifted from 6:30 AM to 8:00 AM without notice. Many residents are unable to store water before leaving for work.',
    tags: ['water-supply', 'timing', 'inconvenience'],
  },
  {
    id: 'disc-003',
    title: 'Road repair coordination - Main Avenue',
    category: 'roads',
    categoryLabel: 'Roads & Transport',
    locality: 'Main Avenue',
    ward: 'Dharampeth',
    associatedIssueId: 'CIV-2023-678',
    participants: [
      { id: 'p6', name: 'Amit G.', isVerified: true },
      { id: 'p7', name: 'Neha R.', isVerified: true },
      { id: 'p8', name: 'Vikram S.', isVerified: true },
      { id: 'p9', name: 'Deepa K.', isVerified: false },
    ],
    messageCount: 32,
    confirmations: 27,
    status: 'resolved',
    createdAt: '1 week ago',
    lastActivity: 'Yesterday',
    description: 'Coordinating with PWD for the road resurfacing work. Updates on schedule and alternative routes discussed here.',
    tags: ['road-work', 'coordination', 'progress'],
  },
  {
    id: 'disc-004',
    title: 'Garbage collection schedule changes',
    category: 'sanitation',
    categoryLabel: 'Sanitation',
    locality: 'Green Valley Residency',
    ward: 'Dharampeth',
    participants: [
      { id: 'p10', name: 'Kavita M.', isVerified: true },
    ],
    messageCount: 8,
    confirmations: 5,
    status: 'pending_action',
    createdAt: '3 days ago',
    lastActivity: '6 hours ago',
    description: 'Discussion about the new garbage collection schedule and how to handle the transition period.',
    tags: ['garbage', 'schedule', 'municipal'],
  },
  {
    id: 'disc-005',
    title: 'Traffic signal malfunction at Market Junction',
    category: 'safety',
    categoryLabel: 'Public Safety',
    locality: 'Market Junction',
    ward: 'Dharampeth',
    associatedIssueId: 'CIV-2023-912',
    participants: [
      { id: 'p11', name: 'Ramesh P.', isVerified: true },
      { id: 'p12', name: 'Sunita A.', isVerified: false },
    ],
    messageCount: 12,
    confirmations: 9,
    status: 'active',
    createdAt: '1 day ago',
    lastActivity: '30 minutes ago',
    description: 'Traffic signal has been blinking red for 3 days causing congestion during peak hours. Requesting traffic police deployment.',
    tags: ['traffic', 'signal', 'congestion'],
  },
  {
    id: 'disc-006',
    title: 'Tree plantation drive initiative',
    category: 'environment',
    categoryLabel: 'Environment',
    locality: 'Sector 14 Park',
    ward: 'Dharampeth',
    participants: [
      { id: 'p13', name: 'Green Valley RWA', isVerified: true },
      { id: 'p14', name: 'Environmental Club', isVerified: true },
    ],
    messageCount: 19,
    confirmations: 14,
    status: 'active',
    createdAt: '4 days ago',
    lastActivity: '2 hours ago',
    description: 'Planning a community tree plantation drive on the upcoming weekend. Volunteers needed for the initiative.',
    tags: ['environment', 'community', 'volunteer'],
  },
];

export function filterDiscussions(
  discussions: DiscussionItem[],
  filters: {
    category: string;
    status: string;
    searchQuery: string;
    locality: string;
  }
): DiscussionItem[] {
  return discussions.filter((discussion) => {
    if (filters.category !== 'all' && discussion.category !== filters.category) {
      return false;
    }
    if (filters.status !== 'all' && discussion.status !== filters.status) {
      return false;
    }
    if (filters.locality !== 'all' && !discussion.locality.toLowerCase().includes(filters.locality.toLowerCase())) {
      return false;
    }
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = discussion.title.toLowerCase().includes(query);
      const matchesDesc = discussion.description.toLowerCase().includes(query);
      const matchesIssue = discussion.associatedIssueId?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDesc && !matchesIssue) {
        return false;
      }
    }
    return true;
  });
}
