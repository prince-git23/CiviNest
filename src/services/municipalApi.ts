// ─────────────────────────────────────────────────────────────────
// CiviNest — Municipal API Client
// Every call is authenticated through the shared apiRequest layer
// (Bearer token from localStorage) so the Municipal Portal never
// duplicates auth logic.
// ─────────────────────────────────────────────────────────────────
import { apiRequest } from './api';

function authHeaders(): { token: string | undefined } {
  const token = localStorage.getItem('civinest_token') || undefined;
  return { token };
}

// ── Types ────────────────────────────────────────────────────────

export interface MunicipalDashboardData {
  totalIssues: number;
  newIssues: number;
  activeIssues: number;
  criticalIssues: number;
  highPriorityIssues: number;
  unassignedIssues: number;
  assignedIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  reopenedIssues: number;
  pendingVerification: number;
  slaAtRisk: number;
  activeClusters: number;
  departments: MunicipalDepartment[];
  priorityQueue: PriorityQueueItem[];
  spatialSummary: {
    totalClusters: number;
    activeClusters: number;
    hotspots: { clusterCode: string; title: string; priority: number; ward: string }[];
  };
  updatedAt: string;
}

export interface MunicipalDepartment {
  id: string;
  name: string;
  code: string;
  status: 'Stable' | 'Critical' | 'Optimal' | 'Warning';
  slaTargetHours: number;
  icon?: string;
  activeIssues: number;
  criticalIssues: number;
  inProgress: number;
  resolvedIssues: number;
  slaRisk: number;
  resolutionRate: number;
  teams?: { id: string; name: string; ward: string; status: string }[];
}

export interface PriorityQueueItem {
  id: string;
  reportNumber: string;
  title: string;
  ward: string;
  reports: number;
  confidence: number;
  priority: number;
  severity: string;
  status: string;
  clusterCode?: string;
}

export interface MunicipalIssue {
  id: string;
  reportNumber: string;
  title: string;
  category: string;
  subcategory?: string;
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
  department: string;
  departmentId: string;
  assignedTeam: string;
  teamId: string;
  assignedAt: string;
  sla: {
    targetHours: number;
    remainingHours: number;
    status: string;
    breached: boolean;
    atRisk: boolean;
    deadline: string;
  };
  reportedAt: string;
  updatedAt: string;
}

export interface MunicipalIssueDetail extends MunicipalIssue {
  description: string;
  cluster: {
    id: string;
    clusterCode: string;
    title: string;
    category: string;
    severity: string;
    priority: number;
    status: string;
    reportCount: number;
    confirmationCount: number;
    ward: string;
    locality: string;
  } | null;
  analysis: {
    category: string;
    categoryLabel: string;
    severity: string;
    confidence: number;
    suggestedDepartment: string;
    keywords: string[];
  } | null;
  municipal: {
    department: string;
    departmentId: string;
    team: string;
    teamId: string;
    assignedAt: string;
    inProgressAt: string;
    workCompletedAt: string;
    resolutionSubmittedAt: string;
    resolution: {
      description: string;
      submittedBy: string;
      submittedById: string;
      evidence: { id: string; url: string; name: string; type: string; size: string }[];
      submittedAt: string;
    } | null;
    priorityOverrides: { previous: string; new: string; officer: string; reason: string; timestamp: string }[];
    notes: { text: string; author: string; timestamp: string }[];
  } | null;
  evidence: { id: string; name: string; type: string; size: string }[];
  timeline: { status: string; timestamp: string; note: string; actor: string }[];
  relatedIssues: { id: string; reportNumber: string; title: string; status: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface FieldTeam {
  id: string;
  name: string;
  departmentId: string;
  department: string;
  ward: string;
  zone: string;
  status: 'Active' | 'Standby' | 'En Route' | 'On Site';
  focus: string;
  maxTasks: number;
  activeTasks: number;
  members: { name: string; initials: string; role?: string }[];
}

export interface WardSummary {
  id: string;
  name: string;
  activeIssues: number;
  criticalIssues: number;
  resolvedIssues: number;
  overSla: number;
  status: 'CRITICAL' | 'ELEVATED' | 'NOMINAL';
}

export interface SpatialData {
  issues: {
    id: string;
    reportNumber: string;
    title: string;
    category: string;
    severity: string;
    priority: number;
    status: string;
    latitude: number;
    longitude: number;
    ward: string;
    locality: string;
    city: string;
    department: string;
    reportCount: number;
    confirmationCount: number;
    createdAt: string;
  }[];
  clusters: {
    id: string;
    clusterCode: string;
    title: string;
    category: string;
    severity: string;
    priority: number;
    status: string;
    latitude: number;
    longitude: number;
    ward: string;
    locality: string;
    city: string;
    reportCount: number;
    confirmationCount: number;
  }[];
  wards: WardSummary[];
  hotspots: { clusterId: string; clusterCode: string; title: string; priority: number; reportCount: number; ward: string }[];
  deployments: { id: string; teamName: string; department: string; ward: string; status: string }[];
}

export interface MunicipalAnalytics {
  summary: {
    totalIssues: number;
    activeIssues: number;
    resolvedIssues: number;
    reopenedIssues: number;
    newIssues7d: number;
    newIssues30d: number;
    resolutionRate: number;
    reopenRate: number;
    avgResponseHours: number;
    avgResolutionHours: number;
    activeClusters: number;
    totalClusters: number;
  };
  pipeline: { rawReports: number; aiClustered: number; verified: number; resolved: number };
  sla: { compliance: number; withinTarget: number; breached: number; total: number };
  categories: { name: string; count: number }[];
  severityDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  wards: { name: string; active: number; resolved: number; critical: number }[];
  departments: { name: string; total: number; active: number; resolved: number; critical: number; resolutionRate: number }[];
  teams: { id: string; name: string; department: string; ward: string; status: string }[];
  clusterGrowth: { active: number; total: number; last7d: number };
  issueVolumeTrend: { label: string; count: number }[];
  statusDistribution: Record<string, number>;
}

export interface AIBrief {
  generatedAt: string;
  grounded: boolean;
  summary: string[];
  criticalIssues: { id: string; reportNumber: string; title: string; priority: number; ward: string; status: string }[];
  topCluster: { clusterCode: string; title: string; category: string; priority: number; ward: string; locality: string; reportCount: number; confirmationCount: number; status: string } | null;
  slaRiskCount: number;
  slaRiskIssues: { id: string; reportNumber: string; title: string; ward: string }[];
  departmentBottlenecks: { name: string; activeCount: number }[];
  hotspots: { clusterCode: string; title: string; priority: number; ward: string }[];
  trends: { label: string; value: number | string; direction: string }[];
}

export interface MunicipalNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  relatedIssueId?: string;
  relatedWardId?: string;
  relatedDepartmentId?: string;
  timestamp: string;
}

// ── Dashboard ────────────────────────────────────────────────────

export async function getMunicipalDashboard(): Promise<{ dashboard: MunicipalDashboardData; user: any }> {
  const res = await apiRequest<{ dashboard: MunicipalDashboardData; user: any }>('/municipal/dashboard', { ...authHeaders() });
  if (!res.data) throw new Error('Failed to load municipal dashboard.');
  return res.data;
}

// ── Issues ───────────────────────────────────────────────────────

export interface IssueQuery {
  search?: string;
  category?: string;
  severity?: string;
  priority?: string;
  status?: string;
  ward?: string;
  department?: string;
  assignment?: 'assigned' | 'unassigned';
  page?: number;
  limit?: number;
  sort?: 'latest' | 'priority' | 'reports';
}

export async function getMunicipalIssues(query: IssueQuery = {}): Promise<{ issues: MunicipalIssue[]; total: number; page: number; limit: number }> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  const res = await apiRequest<{ issues: MunicipalIssue[]; total: number; page: number; limit: number }>(
    `/municipal/issues${qs ? '?' + qs : ''}`,
    { ...authHeaders() }
  );
  if (!res.data) throw new Error('Failed to load issues.');
  return res.data;
}

export async function getMunicipalIssue(id: string): Promise<MunicipalIssueDetail> {
  const res = await apiRequest<{ issue: MunicipalIssueDetail }>(`/municipal/issues/${id}`, { ...authHeaders() });
  if (!res.data) throw new Error('Failed to load issue.');
  return res.data.issue;
}

export async function assignMunicipalIssue(
  id: string,
  input: { departmentId?: string; teamId?: string; priorityOverride?: string; reason?: string; notes?: string }
): Promise<{ assigned: boolean; department?: string; team?: string; reportNumber?: string }> {
  const res = await apiRequest<{ assigned: boolean; department?: string; team?: string; reportNumber?: string }>(
    `/municipal/issues/${id}/assign`,
    { method: 'PUT', body: input, ...authHeaders() }
  );
  if (!res.data) throw new Error('Failed to assign issue.');
  return res.data;
}

export async function startMunicipalWork(id: string, notes?: string): Promise<void> {
  const res = await apiRequest(`/municipal/issues/${id}/work-start`, { method: 'POST', body: { notes }, ...authHeaders() });
  if (!res.data) throw new Error('Failed to start work.');
}

export async function completeMunicipalWork(id: string, notes?: string): Promise<void> {
  const res = await apiRequest(`/municipal/issues/${id}/work-complete`, { method: 'POST', body: { notes }, ...authHeaders() });
  if (!res.data) throw new Error('Failed to complete work.');
}

export async function submitMunicipalResolution(
  id: string,
  input: { description: string; evidence?: { id: string; url: string; name: string; type: string; size: string }[] }
): Promise<void> {
  const res = await apiRequest(`/municipal/issues/${id}/resolution`, { method: 'POST', body: input, ...authHeaders() });
  if (!res.data) throw new Error('Failed to submit resolution.');
}

export async function reopenMunicipalIssue(id: string, reason: string): Promise<void> {
  const res = await apiRequest(`/municipal/issues/${id}/reopen`, { method: 'POST', body: { reason }, ...authHeaders() });
  if (!res.data) throw new Error('Failed to reopen issue.');
}

export async function getMunicipalResolutionState(
  id: string
): Promise<{ issue: any; resolution: any; verificationState: string; timeline: any[] }> {
  const res = await apiRequest<{ issue: any; resolution: any; verificationState: string; timeline: any[] }>(
    `/municipal/issues/${id}/resolution`,
    { ...authHeaders() }
  );
  if (!res.data) throw new Error('Failed to load resolution state.');
  return res.data;
}

// ── Departments & teams ──────────────────────────────────────────

export async function getMunicipalDepartments(): Promise<MunicipalDepartment[]> {
  const res = await apiRequest<{ departments: MunicipalDepartment[] }>('/municipal/departments', { ...authHeaders() });
  if (!res.data) throw new Error('Failed to load departments.');
  return res.data.departments;
}

export async function getMunicipalDepartment(id: string): Promise<any> {
  const res = await apiRequest<{ department: any }>(`/municipal/departments/${id}`, { ...authHeaders() });
  if (!res.data) throw new Error('Failed to load department.');
  return res.data.department;
}

export async function getMunicipalTeams(): Promise<FieldTeam[]> {
  const res = await apiRequest<{ teams: FieldTeam[] }>('/municipal/teams', { ...authHeaders() });
  if (!res.data) throw new Error('Failed to load teams.');
  return res.data.teams;
}

export async function getMunicipalTeam(id: string): Promise<any> {
  const res = await apiRequest<{ team: any }>(`/municipal/teams/${id}`, { ...authHeaders() });
  if (!res.data) throw new Error('Failed to load team.');
  return res.data.team;
}

// ── Spatial / analytics / AI ─────────────────────────────────────

export async function getMunicipalSpatial(filters: { category?: string; severity?: string; status?: string; ward?: string } = {}): Promise<SpatialData> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.set(k, String(v));
  });
  const qs = params.toString();
  const res = await apiRequest<SpatialData>(`/municipal/spatial${qs ? '?' + qs : ''}`, { ...authHeaders() });
  if (!res.data) throw new Error('Failed to load spatial intelligence.');
  return res.data;
}

export async function getMunicipalAnalytics(): Promise<MunicipalAnalytics> {
  const res = await apiRequest<{ analytics: MunicipalAnalytics }>('/municipal/analytics', { ...authHeaders() });
  if (!res.data) throw new Error('Failed to load analytics.');
  return res.data.analytics;
}

export async function getMunicipalAIBriefs(): Promise<AIBrief> {
  const res = await apiRequest<{ brief: AIBrief }>('/municipal/ai/briefs', { ...authHeaders() });
  if (!res.data) throw new Error('AI analysis unavailable.');
  return res.data.brief;
}

// ── Notifications & audit ────────────────────────────────────────

export async function getMunicipalNotifications(page = 1, limit = 30): Promise<{ notifications: MunicipalNotificationItem[]; total: number; unreadCount: number }> {
  const res = await apiRequest<{ notifications: MunicipalNotificationItem[]; total: number; unreadCount: number }>(
    `/municipal/notifications?page=${page}&limit=${limit}`,
    { ...authHeaders() }
  );
  if (!res.data) throw new Error('Failed to load notifications.');
  return res.data;
}

export async function markMunicipalNotificationRead(id: string): Promise<void> {
  await apiRequest(`/municipal/notifications/${id}/read`, { method: 'PATCH', ...authHeaders() });
}

export async function markAllMunicipalNotificationsRead(): Promise<void> {
  await apiRequest('/municipal/notifications/read-all', { method: 'PATCH', ...authHeaders() });
}

export async function getMunicipalAuditLog(limit = 25): Promise<any[]> {
  const res = await apiRequest<{ log: any[] }>(`/municipal/audit?limit=${limit}`, { ...authHeaders() });
  if (!res.data) throw new Error('Failed to load audit log.');
  return res.data.log;
}

// ── Profile ──────────────────────────────────────────────────────

export async function getMunicipalProfile(): Promise<any> {
  const res = await apiRequest<{ user: any }>('/municipal/profile', { ...authHeaders() });
  if (!res.data) throw new Error('Failed to load profile.');
  return res.data.user;
}

export async function updateMunicipalProfile(input: { phone?: string; locality?: string }): Promise<any> {
  const res = await apiRequest<{ user: any }>('/municipal/profile', { method: 'PATCH', body: input, ...authHeaders() });
  if (!res.data) throw new Error('Failed to update profile.');
  return res.data.user;
}
