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

// ─── Community Dashboard Types ────────────────────────────────────────────────

export interface CommunityContext {
  name: string;
  role: string;
  location: string;
  city: string;
  lastUpdated: string;
}

export interface CommunityHealthData {
  score: number;
  maxScore: number;
  status: 'Stable' | 'Improving' | 'Needs Attention' | 'At Risk';
  explanation: string;
  activeClusters: number;
  trend: 'up' | 'down' | 'stable';
  segments: { category: string; score: number; color: string }[];
}

export interface CivicMetrics {
  activeIssues: { count: number; change: number; trend: 'up' | 'down' };
  confirmations: { count: number; issueCount: number };
  openCases: { count: number; awaitingCount: number };
  municipalResponse: { count: number; coveragePercent: number };
}

export interface PrioritizedIssue {
  id: string;
  title: string;
  reportCount: number;
  confirmationCount: number;
  priorityScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  clusterId?: string;
}

export interface ConsensusCategory {
  category: string;
  confirmations: number;
  percentage: number;
  color: string;
}

export interface MunicipalCase {
  id: string;
  caseId: string;
  issue: string;
  department: string;
  status: ReportStatusType;
}

export interface ResponseDistributionData {
  responded: number;
  awaiting: number;
  resolved: number;
  reopened: number;
  insight: string;
}

export interface CommunityDashboardData {
  community: CommunityContext;
  health: CommunityHealthData;
  metrics: CivicMetrics;
  activeIssues: PrioritizedIssue[];
  consensus: ConsensusCategory[];
  municipalCases: MunicipalCase[];
  responseDistribution: ResponseDistributionData;
}

// ---------------------------------------------------------------------------
// Municipal Command Dashboard Architecture Types
// ---------------------------------------------------------------------------

export type MunicipalDepartment = 'Electricity' | 'Water' | 'Roads' | 'Sanitation' | 'Public Safety';

export type MunicipalIssueStatus =
  | 'Unassigned'
  | 'Assigned'
  | 'In Progress'
  | 'Awaiting Verification'
  | 'Resolved'
  | 'Reopened'
  | 'Over SLA';

export interface MunicipalContributingSignal {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  time: string;
  distance?: string;
  verified: boolean;
  photosCount?: number;
}

export interface MunicipalSensorTelemetry {
  sensorId: string;
  type: string;
  reading: string;
  unit: string;
  baseline: string;
  deviation: string;
  anomalyScore: number;
  lastPing: string;
}

export interface MunicipalAssignedTeam {
  teamId: string;
  teamName: string;
  leadEngineer: string;
  personnelCount: number;
  contactRadio: string;
  dispatchedAt?: string;
  estimatedArrival?: string;
  notes?: string;
}

export interface MunicipalIssueItem {
  id: string;
  issueCode: string; // e.g. "EV-8821", "WT-4492"
  title: string;
  description: string;
  priorityScore: number; // e.g. 92, 88
  aiConfidence: number; // e.g. 91, 98
  reportedAgo: string; // e.g. "42m ago"
  reportedTimestamp: string;
  affectedProperties: number; // e.g. 14, 1250
  reportCount: number; // e.g. 47, 112
  department: MunicipalDepartment;
  status: MunicipalIssueStatus;
  slaTargetHours: number;
  slaRemainingHours: number;
  isOverSla: boolean;
  isLowConfidence: boolean;
  isReopened: boolean;
  location: {
    address: string;
    ward: string;
    sector: string;
    landmarks?: string;
    coordinates: { lat: number; lng: number };
  };
  assignedTeam?: MunicipalAssignedTeam | null;
  contributingSignals: MunicipalContributingSignal[];
  sensorTelemetry?: MunicipalSensorTelemetry | null;
  aiRationale: string;
  recommendedAction: string;
  timeline?: {
    time: string;
    status: string;
    note: string;
    actor: string;
  }[];
}

export interface MunicipalMetricsData {
  criticalIssuesCount: number;
  criticalIssuesTrend: string;
  activeClustersCount: number;
  activeClustersTrend: string;
  affectedPropertiesCount: number;
  estimatedCitizensAffected: number;
  lowConfidenceCount: number;
  overSlaCount: number;
  reopenedCount: number;
}

export interface MunicipalClusterSummary {
  id: string;
  clusterCode: string;
  title: string;
  location: string;
  issueCount: number;
  relativeIntensity: number; // 0 to 100 percentage
  category: 'lighting' | 'water' | 'roads' | 'sanitation' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'in_progress' | 'investigating';
  coordinates: { lat: number; lng: number };
  affectedHouseholds: number;
}

export interface MunicipalDepartmentWorkload {
  id: string;
  department: MunicipalDepartment;
  activeCases: number;
  capacity: number;
  utilizationPercentage: number;
  slaRisk: 'low' | 'moderate' | 'high' | 'critical';
  assignedTeamsCount: number;
  availableTeamsCount: number;
  avgResponseHours: number;
  color: string;
}

export interface MunicipalSystemStatusData {
  status: 'Operational' | 'Degraded' | 'Maintenance' | 'Offline';
  latencyMs: number;
  uptimePercentage: number;
  activeMeshNodes: number;
  totalMeshNodes: number;
  lastHeartbeat: string;
  telemetryStreamActive: boolean;
}

export interface MunicipalDashboardDataset {
  metrics: MunicipalMetricsData;
  issues: MunicipalIssueItem[];
  clusters: MunicipalClusterSummary[];
  departmentWorkloads: MunicipalDepartmentWorkload[];
  systemStatus: MunicipalSystemStatusData;
}
