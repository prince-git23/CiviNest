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

async function apiRequest<T = unknown>(
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
  title: string;
  description: string;
  category: string;
  trendPercentage: number;
  confidence: number;
  ward: string;
  locality: string;
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

export interface DiscussionData {
  _id: string;
  issueId: string;
  issueTitle: string;
  category: string;
  ward: string;
  locality: string;
  status: 'OPEN' | 'ACTIVE' | 'CLOSED';
  messages: {
    userId: string;
    userName: string;
    text: string;
    createdAt?: string;
  }[];
  confirmations: string[];
  createdAt: string;
  updatedAt?: string;
}

export async function getDiscussion(id: string): Promise<{ discussion: DiscussionData }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ discussion: DiscussionData }>(`/resident/discussions/${id}`, {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Discussion not found', 404);
  return res.data;
}

export async function postDiscussionMessage(id: string, text: string): Promise<{ message: DiscussionData['messages'][number] }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ message: DiscussionData['messages'][number] }>(`/resident/discussions/${id}/messages`, {
    method: 'POST',
    body: { text },
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to post message', 400);
  return res.data;
}

export async function confirmDiscussion(id: string): Promise<{ confirmations: number }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ confirmations: number }>(`/resident/discussions/${id}/confirm`, {
    method: 'POST',
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to confirm', 400);
  return res.data;
}

export async function getResidentDiscussions(): Promise<{ discussions: DiscussionData[] }> {
  const token = localStorage.getItem('civinest_token');
  const res = await apiRequest<{ discussions: DiscussionData[] }>('/resident/discussions', {
    token: token || undefined,
  });
  if (!res.data) throw new ApiError(res.error || 'Failed to load discussions', 400);
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
