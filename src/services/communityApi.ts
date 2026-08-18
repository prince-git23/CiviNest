// ============================================================
// Community Representative API client
//
// Single typed boundary for every Community Portal request.
// Uses the same auth mechanism as the rest of the app: the JWT
// stored in localStorage by the auth flow.
// ============================================================

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

async function apiRequest<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed') as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data;
}

function authToken(): string | undefined {
  return localStorage.getItem('civinest_token') || undefined;
}

// ── Shared shapes ─────────────────────────────────────────────────────────────

export interface CommunityIssue {
  id: string;
  reportNumber: string;
  title: string;
  category: string;
  categoryLabel?: string;
  severity: string;
  priority: string;
  priorityScore: number;
  status: string;
  location: {
    address: string;
    ward: string;
    locality: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  reportCount: number;
  confirmationCount: number;
  clusterId?: string;
  clusterCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityIssueDetail extends CommunityIssue {
  description: string;
  subcategory?: string;
  evidenceSummary: { count: number; images: number; videos: number };
  confidence?: number;
  timeline: { status: string; timestamp: string; note: string; actor?: string }[];
  relatedIssues: { id: string; reportNumber: string; title: string; status: string; distanceMeters?: number }[];
  municipalWorkflow: { status: string; note: string };
  aggregations: { id: string; context: string; createdAt: string }[];
}

export interface HealthSegment {
  category: string;
  score: number;
  color: string;
}

export interface CommunityDashboardData {
  community: { name: string; role: string; location: string; city: string; lastUpdated: string };
  health: {
    score: number;
    maxScore: number;
    status: string;
    explanation: string;
    activeClusters: number;
    trend: 'up' | 'down' | 'stable';
    segments: HealthSegment[];
    breakdown: { label: string; value: number; weight: number; detail: string }[];
  };
  metrics: {
    activeIssues: { count: number; change: number; trend: 'up' | 'down' };
    confirmations: { count: number; issueCount: number };
    openCases: { count: number; awaitingCount: number };
    municipalResponse: { count: number; coveragePercent: number };
  };
  activeIssues: CommunityIssue[];
  highPriorityIssues: CommunityIssue[];
  recentIssues: CommunityIssue[];
  consensus: { category: string; confirmations: number; percentage: number; color: string }[];
  municipalCases: { id: string; caseId: string; issue: string; department: string; status: string }[];
  responseDistribution: { responded: number; awaiting: number; resolved: number; reopened: number; insight: string };
  activeClusters: {
    id: string; clusterCode: string; title: string; category: string; severity: string;
    priority: { score: number; level: string }; ward: string; locality: string; status: string;
    reportCount: number; confirmationCount: number; center: { latitude: number; longitude: number };
  }[];
}

export interface CommunityAnalytics {
  timeRange: '30D' | '90D' | 'YTD';
  scope: { community: string; ward: string; locality: string; city: string };
  totals: { totalIssues: number; activeIssues: number; resolvedIssues: number; reopenedIssues: number; pendingReview: number };
  categories: { category: string; count: number }[];
  severityDistribution: { severity: string; count: number }[];
  priorityDistribution: { priority: string; count: number }[];
  participation: {
    registeredResidents: number; verifiedResidents: number; activeContributors: number;
    confirmationsThisMonth: number; reportsSubmitted: number;
  };
  clusters: { activeClusters: number; totalClusters: number };
  municipalResponse: { responded: number; awaiting: number; avgResponseHours: number | null; coveragePercent: number };
  resolution: { departmentResolved: number; citizenConfirmed: number; reopened: number; total: number; resolutionRate: number };
  recurringProblems: { category: string; incidents: number; trend: 'up' | 'down' | 'stable'; change: number }[];
  trend7d: { label: string; issues: number; resolved: number; confirmations: number }[];
  trend30d: { label: string; issues: number; resolved: number; confirmations: number }[];
  monthlyTrend: { label: string; issues: number; resolved: number; confirmations: number }[];
}

export interface CommunityMember {
  id: string;
  name: string;
  verificationStatus: 'Verified' | 'Pending' | 'Unverified';
  community: string;
  ward: string;
  locality: string;
  city: string;
  participationStatus: 'Active' | 'Occasional' | 'Inactive';
  reportsCount: number;
  confirmationsCount: number;
  lastActive: string | null;
}

export interface CommunityAggregation {
  id: string;
  representativeId: string;
  community: string;
  ward: string;
  locality: string;
  city: string;
  clusterId?: string;
  clusterCode?: string;
  issueIds: string[];
  context: string;
  notes?: string;
  issueTitles: { id: string; reportNumber: string; title: string; status: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'municipal' | 'community' | 'cluster' | 'resolution' | 'system';
  timestamp: string;
  read: boolean;
  relatedIssueId?: string;
  relatedSection?: string;
}

export interface CommunityProfile {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    community: string;
    ward: string;
    locality: string;
    city: string;
    pincode?: string;
    isVerified: boolean;
    joinedAt: string;
  };
  contribution: {
    aggregationsCreated: number;
    communityConfirmations: number;
    registeredMembers: number;
    activeContributors: number;
    activeIssues: number;
  };
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getCommunityDashboard(): Promise<{ user: unknown; dashboard: CommunityDashboardData }> {
  const res = await apiRequest<{ user: unknown; dashboard: CommunityDashboardData }>('/community/dashboard', { token: authToken() });
  if (!res.data) throw new Error(res.error || 'Failed to load dashboard');
  return res.data;
}

export async function getCommunityIssues(params?: {
  search?: string;
  category?: string;
  severity?: string;
  priority?: string;
  status?: string;
  ward?: string;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'priority' | 'reports';
}): Promise<{
  issues: CommunityIssue[];
  pagination: { page: number; limit: number; total: number; pages: number };
  facets: { categories: { category: string; count: number }[]; statuses: { status: string; count: number }[]; wards: { ward: string; count: number }[] };
}> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.severity) query.set('severity', params.severity);
  if (params?.priority) query.set('priority', params.priority);
  if (params?.status) query.set('status', params.status);
  if (params?.ward) query.set('ward', params.ward);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.sort) query.set('sort', params.sort);
  const qs = query.toString();
  const res = await apiRequest<{
    issues: CommunityIssue[];
    pagination: { page: number; limit: number; total: number; pages: number };
    facets: { categories: { category: string; count: number }[]; statuses: { status: string; count: number }[]; wards: { ward: string; count: number }[] };
  }>(`/community/issues${qs ? '?' + qs : ''}`, { token: authToken() });
  if (!res.data) throw new Error(res.error || 'Failed to load issues');
  return res.data;
}

export async function getCommunityIssue(id: string): Promise<{ issue: CommunityIssueDetail }> {
  const res = await apiRequest<{ issue: CommunityIssueDetail }>(`/community/issues/${id}`, { token: authToken() });
  if (!res.data) throw new Error(res.error || 'Issue not found');
  return res.data;
}

export async function getCommunityMapData(params?: {
  category?: string;
  severity?: string;
  status?: string;
  ward?: string;
}): Promise<{
  issues: {
    id: string; reportNumber: string; title: string; category: string; status: string; priority: string;
    latitude: number; longitude: number; ward: string; locality: string; city: string;
    reportCount: number; confirmationCount: number; clusterId?: string; createdAt: string;
  }[];
  clusters: {
    id: string; clusterCode: string; title: string; category: string; severity: string;
    priority: { score: number; level: string }; center: { latitude: number; longitude: number };
    ward: string; locality: string; city: string; status: string; reportCount: number; confirmationCount: number;
  }[];
}> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.severity) query.set('severity', params.severity);
  if (params?.status) query.set('status', params.status);
  if (params?.ward) query.set('ward', params.ward);
  const qs = query.toString();
  const res = await apiRequest<{
    issues: { id: string; reportNumber: string; title: string; category: string; status: string; priority: string; latitude: number; longitude: number; ward: string; locality: string; city: string; reportCount: number; confirmationCount: number; clusterId?: string; createdAt: string }[];
    clusters: { id: string; clusterCode: string; title: string; category: string; severity: string; priority: { score: number; level: string }; center: { latitude: number; longitude: number }; ward: string; locality: string; city: string; status: string; reportCount: number; confirmationCount: number }[];
  }>(`/community/map/issues${qs ? '?' + qs : ''}`, { token: authToken() });
  if (!res.data) throw new Error(res.error || 'Failed to load map data');
  return res.data;
}

export async function createCommunityAggregation(data: {
  issueIds: string[];
  clusterId?: string;
  context: string;
  notes?: string;
}): Promise<{ aggregation: CommunityAggregation; duplicate: boolean }> {
  const res = await apiRequest<{ aggregation: CommunityAggregation; duplicate: boolean }>('/community/aggregations', {
    method: 'POST',
    body: data,
    token: authToken(),
  });
  if (!res.data) throw new Error(res.error || 'Failed to create aggregation');
  return res.data;
}

export async function getCommunityAggregations(params?: { page?: number; limit?: number }): Promise<{
  aggregations: CommunityAggregation[];
  total: number;
}> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  const res = await apiRequest<{ aggregations: CommunityAggregation[]; total: number }>(`/community/aggregations${qs ? '?' + qs : ''}`, { token: authToken() });
  if (!res.data) throw new Error(res.error || 'Failed to load aggregations');
  return res.data;
}

export async function getCommunityMembers(params?: {
  search?: string;
  ward?: string;
  verification?: string;
  participation?: string;
  page?: number;
  limit?: number;
}): Promise<{
  members: CommunityMember[];
  pagination: { page: number; limit: number; total: number; pages: number };
  metrics: { registeredMembers: number; verifiedResidents: number; activeContributors: number; confirmationsThisMonth: number };
}> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.ward) query.set('ward', params.ward);
  if (params?.verification) query.set('verification', params.verification);
  if (params?.participation) query.set('participation', params.participation);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  const res = await apiRequest<{
    members: CommunityMember[];
    pagination: { page: number; limit: number; total: number; pages: number };
    metrics: { registeredMembers: number; verifiedResidents: number; activeContributors: number; confirmationsThisMonth: number };
  }>(`/community/members${qs ? '?' + qs : ''}`, { token: authToken() });
  if (!res.data) throw new Error(res.error || 'Failed to load members');
  return res.data;
}

export async function getCommunityAnalytics(range: '30D' | '90D' | 'YTD' = '30D'): Promise<{ analytics: CommunityAnalytics }> {
  const res = await apiRequest<{ analytics: CommunityAnalytics }>(`/community/analytics?range=${range}`, { token: authToken() });
  if (!res.data) throw new Error(res.error || 'Failed to load analytics');
  return res.data;
}

export async function getCommunityNotifications(): Promise<{ notifications: CommunityNotificationItem[]; unread: number }> {
  const res = await apiRequest<{ notifications: CommunityNotificationItem[]; unread: number }>('/community/notifications', { token: authToken() });
  if (!res.data) throw new Error(res.error || 'Failed to load notifications');
  return res.data;
}

export async function markCommunityNotificationRead(id: string): Promise<void> {
  await apiRequest(`/community/notifications/${id}/read`, { method: 'PATCH', token: authToken() });
}

export async function markAllCommunityNotificationsRead(): Promise<{ updated: number }> {
  const res = await apiRequest<{ updated: number }>('/community/notifications/read-all', { method: 'PATCH', token: authToken() });
  return res.data || { updated: 0 };
}

export async function getCommunityProfile(): Promise<{ profile: CommunityProfile }> {
  const res = await apiRequest<{ profile: CommunityProfile }>('/community/profile', { token: authToken() });
  if (!res.data) throw new Error(res.error || 'Failed to load profile');
  return res.data;
}

export async function updateCommunityProfile(data: Record<string, unknown>): Promise<{ user: CommunityProfile['user']; changed: string[] }> {
  const res = await apiRequest<{ user: CommunityProfile['user']; changed: string[] }>('/community/profile', {
    method: 'PATCH',
    body: data,
    token: authToken(),
  });
  if (!res.data) throw new Error(res.error || 'Failed to update profile');
  return res.data;
}
