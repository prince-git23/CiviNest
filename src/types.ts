export interface CivicSignal {
  id: string;
  reportNumber: string;
  location: string;
  timestamp: string;
  text: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface IssueCluster {
  id: string;
  title: string;
  location: string;
  priorityScore: number;
  aggregatedReportsCount: number;
  aiConfidence: number;
  status: 'Verified' | 'Analyzing' | 'Resolved' | 'Action_Pending';
  escalatedTo: string;
  reports: CivicSignal[];
  category: string;
}

export interface SectorData {
  id: string;
  name: string;
  civicHealthIndex: number;
  activeSignals: number;
  criticalIssues: number;
  topIssues: {
    title: string;
    priority: 'High Priority' | 'Medium' | 'Low';
    linkedReports: number;
    status: 'Active' | 'Scheduled' | 'Investigating' | 'Resolved';
  }[];
  coordinates: { x: number; y: number }[];
  hotspots: { id: string; x: number; y: number; type: 'critical' | 'medium' | 'info'; title: string }[];
}

export interface AuditEvent {
  time: string;
  action: string;
  actor?: string;
  isHuman?: boolean;
}

export type UserRoleId = 'resident' | 'community_rep' | 'municipal_officer' | 'admin';

export interface UserRoleConfig {
  id: UserRoleId;
  label: string;
  title: string;
  description: string;
  perspectiveBadge: string;
  perspectiveHeadline: string;
  defaultEmail: string;
  accessScope: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export type OnboardingStepId = 'profile' | 'location' | 'community' | 'interests' | 'review';

export interface UserProfileData {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
}

export interface UserLocationData {
  city: string;
  ward: string;
  locality: string;
  pincode: string;
  isGeoLocated: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface SocietyItem {
  id: string;
  name: string;
  type: 'RWA' | 'Apartment Complex' | 'Residents Forum' | 'Neighborhood Guild';
  ward: string;
  memberCount: number;
  isVerified: boolean;
}

export interface UserCommunityData {
  societyId: string;
  societyName: string;
  societyType: string;
  isCustom: boolean;
  memberCount?: number;
}

export type CivicInterestId =
  | 'water'
  | 'roads'
  | 'lighting'
  | 'waste'
  | 'parks'
  | 'safety'
  | 'power'
  | 'amenities';

export interface CivicInterestItem {
  id: CivicInterestId;
  label: string;
  category: string;
  color: string;
  hexColor: number;
  description: string;
}

export interface OnboardingFormData {
  profile: UserProfileData;
  location: UserLocationData;
  community: UserCommunityData;
  interests: CivicInterestId[];
}

export type ReportStatusType =
  | 'Under Review'
  | 'Verification'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Reopened'
  | 'Awaiting Review';

export interface ReportTimelineEvent {
  status: string;
  timestamp: string;
  note: string;
  completed?: boolean;
  current?: boolean;
  actor?: string;
}

export interface CivicClusterInfo {
  id: string;
  category: string;
  title: string;
  reportCount: number;
  confirmationCount: number;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trendDescription?: string;
}

export interface GovernmentActionInfo {
  department: string;
  assignedTeam?: string;
  actionDescription?: string;
  sla?: string;
  lastUpdated?: string;
  expectedNextStep?: string;
}

export interface ResolutionVerificationInfo {
  isVerifiedByResident?: boolean;
  residentConfirmed?: boolean;
  verifiedAt?: string;
  reopenedReason?: string;
  residentFeedback?: string;
}

export interface DashboardReportItem {
  id: string;
  reportNumber: string;
  title: string;
  category: 'lighting' | 'water' | 'roads' | 'sanitation' | 'safety' | 'power';
  reportedAgo: string;
  dateString: string;
  status: ReportStatusType;
  location: string;
  description?: string;
  upvotes?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timeline?: ReportTimelineEvent[];
  cluster?: CivicClusterInfo | null;
  governmentAction?: GovernmentActionInfo | null;
  resolution?: ResolutionVerificationInfo | null;
  evidenceUrls?: string[];
}

export interface CivicHealthCategory {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  status: 'Optimal' | 'Good' | 'Fair' | 'Critical';
  icon: 'water' | 'lighting' | 'roads' | 'sanitation' | 'safety';
}

export interface DashboardCivicHealth {
  overallScore: number;
  wardName: string;
  locality: string;
  categories: CivicHealthCategory[];
}

export interface DashboardAIInsight {
  id: string;
  eyebrow: string;
  headline: string;
  description: string;
  category: string;
  confidenceScore: number;
  affectedSector: string;
  actionCta?: string;
  relatedReportCount?: number;
}

export interface DashboardImpactScore {
  points: number;
  rankPercentile: number;
  locality: string;
  badges: { id: string; label: string; icon: string; description: string }[];
  reportsSubmitted: number;
  verifiedSignals: number;
  communityUpvotes: number;
}

export interface CommunityPulseData {
  primaryCommunity: {
    name: string;
    score: number;
  };
  sectorBenchmark: {
    name: string;
    score: number;
  };
  trendSummary: string;
  daysSpan: number;
}

export interface DashboardNearbyIssue {
  id: string;
  badge: 'HIGH PRIORITY' | 'INVESTIGATING' | 'EMERGING TREND' | 'SCHEDULED WORK';
  badgeType: 'high' | 'investigating' | 'trend' | 'scheduled';
  sector: string;
  locality: string;
  title: string;
  description: string;
  supportCount: number;
  isSupported?: boolean;
  hasViewData?: boolean;
}

export interface SpatialMapNode {
  id: string;
  title: string;
  category: 'lighting' | 'water' | 'drainage' | 'roads' | 'sanitation';
  severity: 'critical' | 'attention' | 'info' | 'resolved';
  position: [number, number, number];
  sector: string;
  distance: string;
  assignedTo: string;
  status: string;
  description: string;
}

export interface DashboardDataset {
  user: {
    name: string;
    city: string;
    ward: string;
    community: string;
    avatarUrl?: string;
    role: string;
  };
  civicHealth: DashboardCivicHealth;
  quickActions: {
    canReport: boolean;
    canUploadPhoto: boolean;
    canVoiceRecord: boolean;
    canShareLocation: boolean;
  };
  spatialNodes: SpatialMapNode[];
  activeReports: DashboardReportItem[];
  aiInsight: DashboardAIInsight;
  impact: DashboardImpactScore;
  communityPulse: CommunityPulseData;
  nearbyIssues: DashboardNearbyIssue[];
}
