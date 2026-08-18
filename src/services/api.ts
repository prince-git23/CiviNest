// Same-origin '/api' in dev (proxied to the backend by Vite),
// or override with VITE_API_URL (e.g. http://localhost:5000/api) for production.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(data.error || 'Request failed', res.status);
  }

  return data;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ── Auth API ──

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  city?: string;
  ward?: string;
  locality?: string;
  community?: string;
  isOnboarded: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  permissions: string[];
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}): Promise<AuthResponse> {
  const res = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: data,
  });
  if (!res.data) throw new ApiError(res.error || 'Registration failed', 400);
  return res.data;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: data,
  });
  if (!res.data) throw new ApiError(res.error || 'Login failed', 400);
  return res.data;
}

export async function getMe(token: string): Promise<{ user: AuthUser; permissions: string[] }> {
  const res = await apiRequest<{ user: AuthUser; permissions: string[] }>('/auth/me', { token });
  if (!res.data) throw new ApiError(res.error || 'Failed to get user', 401);
  return res.data;
}

export async function updateProfile(
  token: string,
  data: Record<string, unknown>
): Promise<{ user: AuthUser }> {
  const res = await apiRequest<{ user: AuthUser }>('/auth/profile', {
    method: 'PUT',
    body: data,
    token,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to update profile', 400);
  return res.data;
}

export async function logoutUser(token: string): Promise<void> {
  await apiRequest('/auth/logout', { method: 'POST', token });
}

// ── Health Check ──

export async function checkHealth(): Promise<{ status: string; database: string }> {
  const res = await apiRequest<{ status: string; database: string }>('/health');
  if (!res.data) throw new ApiError('Health check failed', 500);
  return res.data;
}

// ── Reports API ──

export interface ReportData {
  _id: string;
  userId: string;
  reportNumber: string;
  title: string;
  description: string;
  category: string;
  categoryLabel?: string;
  subcategory?: string;
  status: string;
  priority: string;
  location: {
    address: string;
    ward: string;
    city: string;
    latitude: number;
    longitude: number;
    accuracy?: string;
  };
  evidence: {
    id: string;
    url: string;
    name: string;
    type: 'image' | 'video';
    size: string;
  }[];
  analysis?: {
    category: string;
    categoryLabel: string;
    subcategory: string;
    severity: string;
    confidence: number;
    suggestedDepartment: string;
    keywords: string[];
  };
  timeline: {
    status: string;
    timestamp: string;
    note: string;
    actor?: string;
  }[];
  upvotes: number;
  createdAt: string;
  updatedAt: string;
}

export async function createReport(data: {
  title: string;
  description: string;
  category: string;
  categoryLabel?: string;
  subcategory?: string;
  priority?: string;
  location: {
    address: string;
    ward?: string;
    city?: string;
    latitude: number;
    longitude: number;
    accuracy?: string;
  };
  evidence?: { id: string; url: string; name: string; type: 'image' | 'video'; size: string; }[];
  analysis?: Record<string, unknown>;
}): Promise<{ report: ReportData }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ report: ReportData }>('/reports', {
    method: 'POST',
    body: data,
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to create report', 400);
  return res.data;
}

export async function getMyReports(params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
}): Promise<{ reports: ReportData[]; total: number; page: number; pages: number }> {
  const token = localStorage.getItem('civinest_token');
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  if (params?.category) query.set('category', params.category);
  const qs = query.toString();
  const res = await apiRequest<{ reports: ReportData[]; total: number; page: number; pages: number }>(
    `/reports${qs ? '?' + qs : ''}`,
    { token: token || undefined }
  );
  if (!res.data) throw new ApiError(res.error || 'Failed to fetch reports', 400);
  return res.data;
}

export async function getReportById(id: string): Promise<{ report: ReportData }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ report: ReportData }>(`/reports/${id}`, {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Report not found', 404);
  return res.data;
}

export async function updateReport(id: string, data: Record<string, unknown>): Promise<{ report: ReportData }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ report: ReportData }>(`/reports/${id}`, {
    method: 'PATCH',
    body: data,
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to update report', 400);
  return res.data;
}

// ── AI Signal Intelligence API ──

export interface CivicSignalData {
  _id: string;
  signalNumber: string;
  rawText: string;
  redactedText?: string;
  piiRedacted: boolean;
  piiDetected: string[];
  status: 'PROCESSING' | 'ANALYZED' | 'CLUSTERED' | 'FAILED';
  category: string;
  categoryLabel?: string;
  subcategory: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
  aiConfidence: number | null;
  confidenceSource: 'MODEL' | 'ESTIMATED' | null;
  aiAnalysisStatus: 'AVAILABLE' | 'UNAVAILABLE';
  keywords: string[];
  affectedService: string;
  publicSafety: boolean;
  reasoning: string;
  modelName: string;
  priority: {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: { name: string; contribution: number }[];
    engineVersion: string;
    safetyOverride?: boolean;
  } | null;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    ward?: string;
    city?: string;
  } | null;
  clusterId?: string;
  issueId?: string;
  createdAt: string;
}

export interface ClusterResult {
  matched: boolean;
  clusterId?: string;
  clusterCode?: string;
  clusterStatus?: string;
  clusterConfidence?: number;
  reason?: string;
}

export async function submitSignal(data: {
  rawText: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    ward?: string;
    city?: string;
  };
}): Promise<{ signal: CivicSignalData; cluster: ClusterResult; issueId?: string }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ signal: CivicSignalData; cluster: ClusterResult; issueId?: string }>(
    '/resident/signals',
    { method: 'POST', body: data, token: token || undefined }
  );
  if (!res.data) throw new ApiError(res.error || 'Failed to process signal', 400);
  return res.data;
}

// AI review preview — runs the analysis pipeline WITHOUT persisting a signal.
export interface SignalAnalysisPreview {
  category: string;
  categoryLabel: string;
  subcategory: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
  urgency: string;
  affectedService: string;
  publicSafety: boolean;
  keywords: string[];
  reasoning: string;
  confidence: number | null;
  confidenceSource: 'MODEL' | 'ESTIMATED' | null;
  aiAnalysisStatus: 'AVAILABLE' | 'UNAVAILABLE';
  priority: CivicSignalData['priority'];
  piiRedacted: boolean;
  piiDetected: string[];
}

export async function analyzeSignal(data: {
  rawText: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    ward?: string;
    city?: string;
  };
}): Promise<{
  analysis: SignalAnalysisPreview;
  nearby: NearbyIssueItem[];
}> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ analysis: SignalAnalysisPreview; nearby: NearbyIssueItem[] }>(
    '/resident/signals/analyze',
    { method: 'POST', body: data, token: token || undefined }
  );
  if (!res.data) throw new ApiError(res.error || 'Failed to analyze signal', 400);
  return res.data;
}

export interface CivicIssueDetail {
  id: string;
  reportNumber: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  latitude: number;
  longitude: number;
  ward?: string;
  locality?: string;
  confidence?: number;
  createdAt?: string;
}

export async function getIssueById(id: string): Promise<{ issue: CivicIssueDetail }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ issue: CivicIssueDetail }>(`/resident/issues/${id}`, {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Issue not found', 404);
  return res.data;
}

export async function getSignalById(id: string): Promise<{ signal: CivicSignalData }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ signal: CivicSignalData }>(`/resident/signals/${id}`, {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Signal not found', 404);
  return res.data;
}

// ── Resident Dashboard ──

export interface ResidentDashboardData {
  locality: string;
  ward: string;
  city: string;
  impactScore: number;
  reportsSubmitted: number;
  verifiedSignals: number;
  recentReports: ReportData[];
  nearbyClusters: {
    _id: string;
    clusterCode: string;
    title: string;
    category: string;
    severity: string;
    priority: { score: number; level: string };
    center: { latitude: number; longitude: number };
    ward: string;
    locality: string;
    status: string;
    reportCount: number;
    confirmationCount: number;
  }[];
  recentSignals: CivicSignalData[];
  aiInsight: AIInsightData | null;
}

export interface AIInsightData {
  id: string;
  clusterId?: string;
  title: string;
  description: string;
  category: string;
  trendPercentage: number;
  confidence: number;
  ward: string;
  locality: string;
  priority?: { score: number; level: string };
  location?: {
    latitude: number;
    longitude: number;
    ward: string;
    locality: string;
  };
  relatedClusterIds?: string[];
}

export async function getResidentDashboard(): Promise<{
  user: AuthUser;
  dashboard: ResidentDashboardData;
}> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ user: AuthUser; dashboard: ResidentDashboardData }>('/resident/dashboard', {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to load dashboard', 401);
  return res.data;
}

// ── Map clusters ──

export async function getMapClusters(): Promise<{ clusters: ResidentDashboardData['nearbyClusters'] }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ clusters: ResidentDashboardData['nearbyClusters'] }>('/resident/map/clusters', {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to load clusters', 400);
  return res.data;
}

export async function getMapIssues(): Promise<{ issues: ReportData[] }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ issues: ReportData[] }>('/resident/map/issues', {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to load map issues', 400);
  return res.data;
}

// ── Insights ──

export async function getResidentInsights(): Promise<{ insights: AIInsightData[] }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ insights: AIInsightData[] }>('/resident/insights', {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to load insights', 400);
  return res.data;
}

// ── Discussions ──

export interface DiscussionAuthorData {
  id: string;
  displayName: string;
  avatar?: string;
}

export interface DiscussionMessageData {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt?: string;
}

export interface DiscussionData {
  id: string;
  title: string;
  body: string;
  preview: string;
  category: string;
  categoryLabel: string;
  status: 'OPEN' | 'ACTIVE' | 'CLOSED';
  author: DiscussionAuthorData;
  location: {
    ward: string;
    locality: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  issueId?: string;
  issueTitle?: string;
  replyCount: number;
  confirmationCount: number;
  confirmedByMe: boolean;
  messages?: DiscussionMessageData[];
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionFacetsData {
  all: number;
  water_supply: number;
  roads: number;
  street_lighting: number;
  sanitation: number;
  public_safety: number;
  environment: number;
  community: number;
  other: number;
  wards: { name: string; count: number }[];
}

export interface DiscussionListData {
  discussions: DiscussionData[];
  pagination: { page: number; limit: number; total: number; pages: number };
  facets: DiscussionFacetsData;
}

export async function getResidentDiscussions(params?: {
  search?: string;
  status?: string;
  ward?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'supported';
}): Promise<DiscussionListData> {
  const token = localStorage.getItem('civinest_token');
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status && params.status !== 'all') query.set('status', params.status);
  if (params?.ward && params.ward !== 'all') query.set('ward', params.ward);
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.page && params.page > 1) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.sort) query.set('sort', params.sort);
  const qs = query.toString();
  const res = await apiRequest<DiscussionListData>(`/resident/discussions${qs ? '?' + qs : ''}`, {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to load discussions', 400);
  return res.data;
}

export async function createDiscussion(data: {
  title: string;
  body: string;
  category: string;
  ward?: string;
  locality?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    ward?: string;
    locality?: string;
  };
  issueId?: string;
}): Promise<{ discussion: DiscussionData }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ discussion: DiscussionData }>('/resident/discussions', {
    method: 'POST',
    body: data,
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to start discussion', 400);
  return res.data;
}

export async function getDiscussion(id: string): Promise<{ discussion: DiscussionData }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ discussion: DiscussionData }>(`/resident/discussions/${id}`, {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Discussion not found', 404);
  return res.data;
}

export async function postDiscussionMessage(
  id: string,
  text: string
): Promise<{ message: DiscussionMessageData; discussion: DiscussionData }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ message: DiscussionMessageData; discussion: DiscussionData }>(
    `/resident/discussions/${id}/messages`,
    { method: 'POST', body: { text }, token: token || undefined }
  );
  if (!res.data) throw new ApiError(res.error || 'Failed to post message', 400);
  return res.data;
}

export async function confirmDiscussion(
  id: string
): Promise<{ confirmations: number; confirmed: boolean; discussion: DiscussionData }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ confirmations: number; confirmed: boolean; discussion: DiscussionData }>(
    `/resident/discussions/${id}/confirm`,
    { method: 'POST', token: token || undefined }
  );
  if (!res.data) throw new ApiError(res.error || 'Failed to confirm', 400);
  return res.data;
}

export interface ResidentImpact {
  points: number;
  rankPercentile: number;
  locality: string;
  reportsSubmitted: number;
  verifiedSignals: number;
  communityUpvotes: number;
  resolvedCount: number;
}

export async function getResidentImpact(): Promise<{ impact: ResidentImpact }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ impact: ResidentImpact }>('/resident/impact', {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to load impact', 400);
  return res.data;
}

export async function verifyReport(
  id: string,
  resolved: boolean
): Promise<{ report: ReportData }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ report: ReportData }>(`/resident/reports/${id}/verify`, {
    method: 'PATCH',
    body: { resolved },
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to verify', 400);
  return res.data;
}

// ── Ward Sensor Metrics ──

export interface WardMetricCategory {
  category: string;
  label: string;
  score: number;
  status: 'healthy' | 'moderate' | 'attention' | 'critical';
  icon: 'water' | 'lighting' | 'roads' | 'sanitation';
  activeIssues: number;
  lastUpdated: string;
  trend: 'improving' | 'stable' | 'declining';
  detail: string;
}

export interface WardSensorStatus {
  name: string;
  status: 'operational' | 'degraded' | 'offline';
  value: string;
  unit: string;
  lastUpdated: string;
}

export interface WardMetricsData {
  ward: string;
  locality: string;
  city: string;
  overallScore: number;
  metrics: WardMetricCategory[];
  sensors: WardSensorStatus[];
  updatedAt: string;
  source: 'live' | 'demo';
}

export async function getWardMetrics(): Promise<{ metrics: WardMetricsData }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ metrics: WardMetricsData }>('/resident/ward/metrics', {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to load ward metrics', 400);
  return res.data;
}

// ── Trends ──

export interface TrendSummaryData {
  id: string;
  clusterCode: string;
  title: string;
  category: string;
  categoryLabel: string;
  ward: string;
  locality: string;
  city: string;
  reportCount: number;
  independentResidents: number;
  confirmationCount: number;
  priority: { score: number; level: string };
  confidence: number;
  trendDirection: 'increasing' | 'stable' | 'declining';
  status: string;
  affectedArea: string;
  firstReported: string | null;
  latestReport: string | null;
  center: { latitude: number; longitude: number };
  radiusMeters: number;
  keywords: string[];
}

export interface TrendDetailData extends TrendSummaryData {
  description: string;
  severity: string;
  relatedTrends: TrendSummaryData[];
  recentReports: {
    id: string;
    reportNumber: string;
    title: string;
    status: string;
    createdAt: string;
    location: string;
  }[];
}

export async function getTrends(): Promise<{ trends: TrendSummaryData[] }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ trends: TrendSummaryData[] }>('/resident/trends', {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to load trends', 400);
  return res.data;
}

export async function getTrendById(id: string): Promise<{ trend: TrendDetailData }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ trend: TrendDetailData }>(`/resident/trends/${id}`, {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Trend not found', 404);
  return res.data;
}

// ── Map extras ──

export interface MapClusterDetail {
  id: string;
  clusterCode: string;
  title: string;
  category: string;
  severity: string;
  priority: { score: number; level: string };
  center: { latitude: number; longitude: number };
  ward: string;
  locality: string;
  status: string;
  reportCount: number;
  confirmationCount: number;
  description?: string;
  keywords?: string[];
  recentSignals?: { id: string; text: string; createdAt: string }[];
}

export async function getMapClusterById(id: string): Promise<{ cluster: MapClusterDetail }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ cluster: MapClusterDetail }>(`/resident/map/clusters/${id}`, {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Cluster not found', 404);
  return res.data;
}

export interface NearbyIssueItem {
  id: string;
  reportNumber: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  latitude: number;
  longitude: number;
  ward?: string;
  locality?: string;
  address?: string;
  createdAt?: string;
  distanceMeters?: number;
}

export async function getNearbyIssues(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  category?: string;
  status?: string;
}): Promise<{ issues: NearbyIssueItem[]; count: number }> {
  const token = localStorage.getItem('civinest_token');
  const query = new URLSearchParams({
    lat: String(params.latitude),
    lng: String(params.longitude),
    radius: String(params.radius || 500),
  });
  if (params.category) query.set('category', params.category);
  if (params.status) query.set('status', params.status);
  const res = await apiRequest<{ issues: NearbyIssueItem[]; count: number }>(
    `/resident/map/nearby?${query.toString()}`,
    { token: token || undefined }
  );
  if (!res.data) throw new ApiError(res.error || 'Failed to load nearby issues', 400);
  return res.data;
}

export async function getMapWards(): Promise<{ wards: { name: string }[] }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ wards: { name: string }[] }>('/resident/map/wards', {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to load wards', 400);
  return res.data;
}

export async function getMapLocalities(): Promise<{ localities: { name: string }[] }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ localities: { name: string }[] }>('/resident/map/localities', {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to load localities', 400);
  return res.data;
}
