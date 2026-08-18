import mongoose from 'mongoose';
import { User, IUser } from '../models/User.js';
import { Report } from '../models/Report.js';
import { CivicCluster } from '../models/CivicCluster.js';
import { CommunityAggregation } from '../models/CommunityAggregation.js';
import { CommunityNotification, ICommunityNotification } from '../models/CommunityNotification.js';
import { computeCommunityHealth, RepScope, HealthBreakdownItem } from './communityHealth.service.js';
import { computeCommunityAnalytics, CommunityAnalyticsResult } from './communityAnalytics.service.js';

/**
 * Community Representative service — the single backend boundary for the
 * Community Portal. Every function derives the representative's authorized
 * geographic scope from the authenticated User record (never from the
 * frontend) and only returns data inside that scope.
 */

export interface Scope extends RepScope {}

/** Resolve the representative's authorized scope from their DB profile. */
export async function resolveRepScope(user: IUser): Promise<Scope> {
  return {
    community: user.community || '',
    ward: user.ward || '',
    locality: user.locality || '',
    city: user.city || '',
  };
}

export function reportScopeFilter(scope: Scope): Record<string, unknown> {
  const or: Record<string, unknown>[] = [];
  if (scope.ward) or.push({ 'location.ward': scope.ward });
  if (scope.city) or.push({ 'location.city': scope.city, 'location.ward': { $in: ['', scope.ward || ''] } });
  return or.length ? { $or: or } : {};
}

export function clusterScopeFilter(scope: Scope): Record<string, unknown> {
  const or: Record<string, unknown>[] = [];
  if (scope.ward) or.push({ ward: scope.ward });
  if (scope.city) or.push({ city: scope.city });
  return or.length ? { $or: or } : {};
}

// ── View builders ─────────────────────────────────────────────────────────────

export interface CommunityIssueView {
  id: string;
  reportNumber: string;
  title: string;
  category: string;
  categoryLabel?: string;
  severity: string;
  priority: string;
  priorityScore: number;
  status: string;
  location: { address: string; ward: string; locality: string; city: string; latitude: number; longitude: number };
  reportCount: number;
  confirmationCount: number;
  clusterId?: string;
  clusterCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityIssueDetail extends CommunityIssueView {
  description: string;
  subcategory?: string;
  evidenceSummary: { count: number; images: number; videos: number };
  confidence?: number;
  timeline: { status: string; timestamp: string; note: string; actor?: string }[];
  relatedIssues: { id: string; reportNumber: string; title: string; status: string; distanceMeters?: number }[];
  municipalWorkflow: { status: string; note: string };
  aggregations: { id: string; context: string; createdAt: string }[];
}

function severityFromPriority(priority?: string): string {
  switch ((priority || 'medium').toLowerCase()) {
    case 'critical': return 'critical';
    case 'high': return 'high';
    case 'low': return 'low';
    default: return 'medium';
  }
}

async function toIssueView(r: any, scope: Scope): Promise<CommunityIssueView> {
  const cluster = r.clusterRef as any;
  const severity = r.analysis?.severity?.toLowerCase() || severityFromPriority(r.priority);
  const priorityScore =
    cluster?.priority?.score != null
      ? cluster.priority.score
      : ({ critical: 95, high: 80, medium: 60, low: 40 } as Record<string, number>)[r.priority || 'medium'] || 60;
  return {
    id: String(r._id),
    reportNumber: r.reportNumber,
    title: r.title,
    category: r.category,
    categoryLabel: r.categoryLabel || r.category,
    severity,
    priority: r.priority,
    priorityScore,
    status: r.status,
    location: {
      address: r.location?.address || '',
      ward: r.location?.ward || scope.ward || '',
      locality: r.location?.locality || scope.locality || '',
      city: r.location?.city || scope.city || '',
      latitude: r.location?.latitude || 0,
      longitude: r.location?.longitude || 0,
    },
    reportCount: cluster?.reportCount || r.reportCount || 1,
    confirmationCount: cluster?.confirmationCount || r.confirmationCount || 0,
    clusterId: cluster ? String(cluster._id) : undefined,
    clusterCode: cluster?.clusterCode,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
  };
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface CommunityDashboardResult {
  community: { name: string; role: string; location: string; city: string; lastUpdated: string };
  health: {
    score: number; maxScore: number; status: string; explanation: string;
    activeClusters: number; trend: 'up' | 'down' | 'stable';
    segments: { category: string; score: number; color: string }[];
    breakdown: HealthBreakdownItem[];
  };
  metrics: {
    activeIssues: { count: number; change: number; trend: 'up' | 'down' };
    confirmations: { count: number; issueCount: number };
    openCases: { count: number; awaitingCount: number };
    municipalResponse: { count: number; coveragePercent: number };
  };
  activeIssues: CommunityIssueView[];
  highPriorityIssues: CommunityIssueView[];
  recentIssues: CommunityIssueView[];
  consensus: { category: string; confirmations: number; percentage: number; color: string }[];
  municipalCases: { id: string; caseId: string; issue: string; department: string; status: string }[];
  responseDistribution: { responded: number; awaiting: number; resolved: number; reopened: number; insight: string };
  activeClusters: {
    id: string; clusterCode: string; title: string; category: string; severity: string;
    priority: { score: number; level: string }; ward: string; locality: string; status: string;
    reportCount: number; confirmationCount: number; center: { latitude: number; longitude: number };
  }[];
  scope: Scope;
  analytics: CommunityAnalyticsResult;
}

const CONSENSUS_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6'];

export async function getCommunityDashboard(user: IUser): Promise<CommunityDashboardResult> {
  const scope = await resolveRepScope(user);
  const reportFilter = reportScopeFilter(scope);
  const clusterFilter = clusterScopeFilter(scope);

  const [health, analytics, reports, clusters, confirmations] = await Promise.all([
    computeCommunityHealth(scope),
    computeCommunityAnalytics(scope, '30D'),
    Report.find(reportFilter).sort({ createdAt: -1 }).limit(200).lean(),
    CivicCluster.find(clusterFilter).sort({ 'priority.score': -1 }).lean(),
    CivicCluster.aggregate([{ $match: clusterFilter }, { $group: { _id: '$category', confirmations: { $sum: '$confirmationCount' }, count: { $sum: 1 } } }]),
  ]);

  const activeStatuses = ['Under Review', 'Assigned', 'In Progress', 'Verification', 'Reopened'];
  const resolvedStatuses = ['Resolved'];

  const clusterByReportId = new Map<string, any>();
  for (const c of clusters) {
    for (const issueId of c.issueIds || []) clusterByReportId.set(String(issueId), c);
  }
  const reportsWithCluster = reports.map((r) => ({ ...r, clusterRef: clusterByReportId.get(String(r._id)) }));

  const active = reportsWithCluster.filter((r) => activeStatuses.includes(r.status));
  const resolved = reportsWithCluster.filter((r) => resolvedStatuses.includes(r.status));
  const reopened = reportsWithCluster.filter((r) => r.status === 'Reopened');
  const awaiting = reportsWithCluster.filter((r) => r.status === 'Under Review');

  const activeIssues: CommunityIssueView[] = [];
  for (const r of active) activeIssues.push(await toIssueView(r, scope));
  activeIssues.sort((a, b) => b.priorityScore - a.priorityScore);

  const recentIssues: CommunityIssueView[] = [];
  for (const r of reportsWithCluster.slice(0, 6)) recentIssues.push(await toIssueView(r, scope));

  const highPriorityIssues: CommunityIssueView[] = [];
  for (const r of reportsWithCluster.filter((x) => (x.clusterRef?.priority?.score ?? 0) >= 70).slice(0, 6)) {
    highPriorityIssues.push(await toIssueView(r, scope));
  }

  const totalConfirmations = clusters.reduce((s, c) => s + c.confirmationCount, 0);

  const consensus = confirmations.map((row, i) => {
    const total = totalConfirmations || 1;
    return {
      category: String(row._id || 'other'),
      confirmations: row.confirmations,
      percentage: Math.round((row.confirmations / total) * 100),
      color: CONSENSUS_COLORS[i % CONSENSUS_COLORS.length],
    };
  }).sort((a, b) => b.confirmations - a.confirmations);

  const municipalCases = activeIssues.slice(0, 8).map((issue) => ({
    id: issue.id,
    caseId: issue.reportNumber,
    issue: issue.title,
    department: issue.categoryLabel || issue.category,
    status: issue.status as any,
  }));

  const responded = reportsWithCluster.length - awaiting.length;
  const coveragePercent = reportsWithCluster.length > 0 ? Math.round((responded / reportsWithCluster.length) * 100) : 0;
  const insight =
    reportsWithCluster.length === 0
      ? 'No civic issues recorded in your community yet.'
      : `${coveragePercent}% of issues have received municipal response; ${resolved.length} resolved, ${reopened.length} reopened.`;

  return {
    community: {
      name: scope.community || user.community || 'Community',
      role: 'Community Representative',
      location: [scope.ward, scope.locality].filter(Boolean).join(', ') || scope.city || 'Location not set',
      city: scope.city || '',
      lastUpdated: 'Updated just now',
    },
    health,
    metrics: {
      activeIssues: {
        count: active.length,
        change: analytics.totals.activeIssues - analytics.totals.resolvedIssues,
        trend: analytics.totals.activeIssues > analytics.totals.resolvedIssues ? 'up' : 'down',
      },
      confirmations: { count: totalConfirmations, issueCount: clusters.length },
      openCases: { count: active.length, awaitingCount: awaiting.length },
      municipalResponse: { count: responded, coveragePercent },
    },
    activeIssues: activeIssues.slice(0, 8),
    highPriorityIssues,
    recentIssues,
    consensus,
    municipalCases,
    responseDistribution: {
      responded,
      awaiting: awaiting.length,
      resolved: resolved.length,
      reopened: reopened.length,
      insight,
    },
    activeClusters: clusters.map((c) => ({
      id: String(c._id),
      clusterCode: c.clusterCode,
      title: c.title,
      category: c.category,
      severity: c.severity?.toLowerCase?.() || 'medium',
      priority: c.priority || { score: 0, level: 'LOW' },
      ward: c.ward || '',
      locality: c.locality || '',
      status: c.status,
      reportCount: c.reportCount,
      confirmationCount: c.confirmationCount,
      center: { latitude: c.center?.latitude || 0, longitude: c.center?.longitude || 0 },
    })),
    scope,
    analytics,
  };
}

// ── Issues list ───────────────────────────────────────────────────────────────

export interface IssueListParams {
  search?: string;
  category?: string;
  severity?: string;
  priority?: string;
  status?: string;
  ward?: string;
  locality?: string;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'priority' | 'reports';
}

export interface IssueListResult {
  issues: CommunityIssueView[];
  pagination: { page: number; limit: number; total: number; pages: number };
  facets: { categories: { category: string; count: number }[]; statuses: { status: string; count: number }[]; wards: { ward: string; count: number }[] };
}

export async function listCommunityIssues(user: IUser, params: IssueListParams = {}): Promise<IssueListResult> {
  const scope = await resolveRepScope(user);
  const page = Math.max(1, Math.min(100, Number(params.page) || 1));
  const limit = Math.max(1, Math.min(50, Number(params.limit) || 20));

  const filter: Record<string, unknown> = { ...reportScopeFilter(scope) };
  if (params.category) filter.category = params.category;
  if (params.severity) {
    const sev = String(params.severity).toUpperCase();
    filter.$or = [{ 'analysis.severity': sev }, { 'analysis.severity': { $exists: false }, priority: sev.toLowerCase() }];
  }
  if (params.priority) filter.priority = params.priority.toLowerCase();
  if (params.status) filter.status = params.status;
  if (params.ward) filter['location.ward'] = params.ward;
  if (params.locality) filter['location.locality'] = params.locality;
  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    const searchOr: Record<string, unknown>[] = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { reportNumber: { $regex: q, $options: 'i' } },
      { 'location.address': { $regex: q, $options: 'i' } },
    ];
    const existingOr = filter.$or as Record<string, unknown>[] | undefined;
    if (existingOr && existingOr.length) {
      filter.$and = [{ $or: existingOr }, { $or: searchOr }];
      delete filter.$or;
    } else {
      filter.$or = searchOr;
    }
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    latest: { createdAt: -1 },
    priority: { 'priority.score': -1 },
    reports: { reportCount: -1 },
  };

  const [raw, total, facetCategory, facetStatus, facetWard] = await Promise.all([
    Report.find(filter).sort(sortMap[params.sort || 'latest'] || sortMap.latest).skip((page - 1) * limit).limit(limit).lean(),
    Report.countDocuments(filter),
    Report.aggregate([{ $match: reportScopeFilter(scope) }, { $group: { _id: '$category', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 20 }]),
    Report.aggregate([{ $match: reportScopeFilter(scope) }, { $group: { _id: '$status', n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
    Report.aggregate([{ $match: reportScopeFilter(scope) }, { $group: { _id: '$location.ward', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 20 }]),
  ]);

  // Attach clusters for report counts.
  const clusterByReportId = new Map<string, any>();
  const clusters = await CivicCluster.find(clusterScopeFilter(scope)).lean();
  for (const c of clusters) {
    for (const issueId of c.issueIds || []) clusterByReportId.set(String(issueId), c);
  }

  const issues: CommunityIssueView[] = [];
  for (const r of raw) {
    const view = await toIssueView({ ...r, clusterRef: clusterByReportId.get(String(r._id)) }, scope);
    if (params.sort === 'priority' || params.sort === 'reports') {
      view.priorityScore = view.priorityScore || ({ critical: 95, high: 80, medium: 60, low: 40 } as Record<string, number>)[view.priority] || 60;
    }
    issues.push(view);
  }

  return {
    issues,
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    facets: {
      categories: facetCategory.map((r) => ({ category: String(r._id || 'other'), count: r.n })),
      statuses: facetStatus.map((r) => ({ status: String(r._id || ''), count: r.n })),
      wards: facetWard.map((r) => ({ ward: String(r._id || ''), count: r.n })),
    },
  };
}

// ── Issue detail ──────────────────────────────────────────────────────────────

export async function getCommunityIssueDetail(user: IUser, issueId: string): Promise<CommunityIssueDetail | null> {
  if (!mongoose.Types.ObjectId.isValid(issueId)) return null;
  const scope = await resolveRepScope(user);
  const report = await Report.findOne({ _id: issueId, ...reportScopeFilter(scope) }).lean();
  if (!report) return null;

  const cluster = await CivicCluster.findOne({ issueIds: report._id }).lean();
  const clusterById = cluster ? { ...cluster } : undefined;

  const base = await toIssueView({ ...report, clusterRef: clusterById }, scope);
  const evidence = report.evidence || [];
  const images = evidence.filter((e) => e.type === 'image').length;
  const videos = evidence.filter((e) => e.type === 'video').length;

  // Related issues: same cluster first, then same category within a radius.
  const related: CommunityIssueDetail['relatedIssues'] = [];
  if (cluster) {
    const clusterIssues = await Report.find({ _id: { $in: cluster.issueIds, $nin: [report._id] } })
      .select('reportNumber title status')
      .lean();
    for (const r of clusterIssues) {
      related.push({ id: String(r._id), reportNumber: r.reportNumber, title: r.title, status: r.status });
    }
  }
  if (related.length < 4) {
    const nearby = await Report.find({
      _id: { $nin: [report._id, ...related.map((r) => r.id)] },
      ...reportScopeFilter(scope),
      category: report.category,
      status: { $in: ['Under Review', 'Assigned', 'In Progress', 'Verification', 'Reopened'] },
    })
      .select('reportNumber title status location latitude longitude')
      .limit(4 - related.length)
      .lean();
    for (const r of nearby) {
      related.push({ id: String(r._id), reportNumber: r.reportNumber, title: r.title, status: r.status });
    }
  }

  const aggregations = await CommunityAggregation.find({ representativeId: user._id, issueIds: report._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    ...base,
    description: report.description || '',
    subcategory: report.subcategory,
    evidenceSummary: { count: evidence.length, images, videos },
    confidence: report.analysis?.confidence,
    timeline: (report.timeline || []).map((t) => ({
      status: t.status,
      timestamp: t.timestamp,
      note: t.note,
      actor: t.actor,
    })),
    relatedIssues: related,
    municipalWorkflow: {
      status: report.status,
      note: `Municipal workflow status: ${report.status}.`,
    },
    aggregations: aggregations.map((a) => ({ id: String(a._id), context: a.context || '', createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : '' })),
  };
}

// ── Map data ──────────────────────────────────────────────────────────────────

export interface MapIssuePoint {
  id: string;
  reportNumber: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  severity: string;
  latitude: number;
  longitude: number;
  ward: string;
  locality: string;
  city: string;
  reportCount: number;
  confirmationCount: number;
  clusterId?: string;
  createdAt: string;
}

export interface MapClusterPoint {
  id: string;
  clusterCode: string;
  title: string;
  category: string;
  severity: string;
  priority: { score: number; level: string };
  center: { latitude: number; longitude: number };
  ward: string;
  locality: string;
  city: string;
  status: string;
  reportCount: number;
  confirmationCount: number;
}

export async function getCommunityMapData(
  user: IUser,
  params: { category?: string; severity?: string; status?: string; ward?: string } = {}
): Promise<{ issues: MapIssuePoint[]; clusters: MapClusterPoint[] }> {
  const scope = await resolveRepScope(user);
  const reportFilter: Record<string, unknown> = { ...reportScopeFilter(scope) };
  const clusterFilter: Record<string, unknown> = { ...clusterScopeFilter(scope) };
  if (params.category) { reportFilter.category = params.category; clusterFilter.category = params.category; }
  if (params.severity) { reportFilter.$or = [{ 'analysis.severity': String(params.severity).toUpperCase() }]; clusterFilter.severity = String(params.severity).toUpperCase(); }
  if (params.status) {
    const status = String(params.status);
    reportFilter.status = status;
    const clusterStatusMap: Record<string, string> = {
      'Under Review': 'INVESTIGATING',
      Assigned: 'ASSIGNED',
      'In Progress': 'ASSIGNED',
      Verification: 'INVESTIGATING',
      Resolved: 'RESOLVED',
      Reopened: 'REOPENED',
    };
    clusterFilter.status = clusterStatusMap[status] || status.toUpperCase();
  }
  if (params.ward) { reportFilter['location.ward'] = params.ward; clusterFilter.ward = params.ward; }

  const [reports, clusters] = await Promise.all([
    Report.find(reportFilter).select('reportNumber title category status priority location createdAt').limit(500).lean(),
    CivicCluster.find(clusterFilter).limit(200).lean(),
  ]);

  const issues: MapIssuePoint[] = reports.map((r) => ({
    id: String(r._id),
    reportNumber: r.reportNumber,
    title: r.title,
    category: r.category,
    status: r.status,
    priority: r.priority,
    severity: 'unknown',
    latitude: r.location?.latitude || 0,
    longitude: r.location?.longitude || 0,
    ward: r.location?.ward || '',
    locality: '',
    city: r.location?.city || '',
    reportCount: 1,
    confirmationCount: 0,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : '',
  }));

  const clusterPoints: MapClusterPoint[] = clusters.map((c) => ({
    id: String(c._id),
    clusterCode: c.clusterCode,
    title: c.title,
    category: c.category,
    severity: String(c.severity || '').toLowerCase(),
    priority: c.priority || { score: 0, level: 'LOW' },
    center: { latitude: c.center?.latitude || 0, longitude: c.center?.longitude || 0 },
    ward: c.ward || '',
    locality: c.locality || '',
    city: c.city || '',
    status: c.status,
    reportCount: c.reportCount,
    confirmationCount: c.confirmationCount,
  }));

  return { issues, clusters: clusterPoints };
}

// ── Members ───────────────────────────────────────────────────────────────────

export interface CommunityMemberView {
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

export interface MemberListParams {
  search?: string;
  ward?: string;
  verification?: string;
  participation?: string;
  page?: number;
  limit?: number;
}

export async function listCommunityMembers(user: IUser, params: MemberListParams = {}): Promise<{
  members: CommunityMemberView[];
  pagination: { page: number; limit: number; total: number; pages: number };
  metrics: { registeredMembers: number; verifiedResidents: number; activeContributors: number; confirmationsThisMonth: number };
}> {
  const scope = await resolveRepScope(user);
  const page = Math.max(1, Math.min(100, Number(params.page) || 1));
  const limit = Math.max(1, Math.min(50, Number(params.limit) || 20));

  const filter: Record<string, unknown> = { role: 'CITIZEN' };
  const scopedOr: Record<string, unknown>[] = [];
  if (scope.community) scopedOr.push({ community: scope.community });
  if (scope.ward) scopedOr.push({ ward: scope.ward });
  if (scopedOr.length) filter.$or = scopedOr;
  if (params.ward) filter.ward = params.ward;
  if (params.verification) {
    const v = String(params.verification).toLowerCase();
    if (v === 'verified') filter.isVerified = true;
    else if (v === 'unverified') filter.isVerified = false;
    else filter.isVerified = { $in: [true, false] };
  }
  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    filter.name = { $regex: q, $options: 'i' };
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('name isVerified community ward locality city createdAt updatedAt').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  const userIds = users.map((u) => u._id);
  const [reportAgg, clusterAgg] = await Promise.all([
    Report.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', reports: { $sum: 1 }, last: { $max: '$createdAt' } } },
    ]),
    CivicCluster.aggregate([
      { $unwind: '$issueIds' },
      { $lookup: { from: 'reports', localField: 'issueIds', foreignField: '_id', as: 'rep' } },
      { $unwind: { path: '$rep', preserveNullAndEmptyArrays: false } },
      { $match: { 'rep.userId': { $in: userIds } } },
      { $group: { _id: '$rep.userId', confirmations: { $sum: '$confirmationCount' } } },
    ]),
  ]);

  const reportMap = new Map(reportAgg.map((r) => [String(r._id), r]));
  const clusterMap = new Map(clusterAgg.map((r) => [String(r._id), r]));

  const members: CommunityMemberView[] = users.map((u) => {
    const rep = reportMap.get(String(u._id));
    const reportsCount = rep?.reports || 0;
    const lastActive = rep?.last ? new Date(rep.last).toISOString() : u.createdAt ? new Date(u.createdAt).toISOString() : null;
    const daysSince = lastActive ? (Date.now() - new Date(lastActive).getTime()) / 86400000 : Infinity;
    const participationStatus: CommunityMemberView['participationStatus'] =
      daysSince <= 14 ? 'Active' : daysSince <= 45 ? 'Occasional' : 'Inactive';
    return {
      id: String(u._id),
      name: u.name,
      verificationStatus: u.isVerified ? 'Verified' : 'Unverified',
      community: u.community || '',
      ward: u.ward || '',
      locality: u.locality || '',
      city: u.city || '',
      participationStatus,
      reportsCount,
      confirmationsCount: clusterMap.get(String(u._id))?.confirmations || 0,
      lastActive,
    };
  });

  const [registeredMembers, verifiedResidents, activeContributorRows, confirmationsThisMonth] = await Promise.all([
    User.countDocuments(filter),
    User.countDocuments({ ...filter, isVerified: true }),
    Report.aggregate([
      { $match: { ...reportScopeFilter(scope), createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
      { $group: { _id: '$userId' } },
      { $count: 'n' },
    ]),
    CivicCluster.aggregate([
      { $match: { ...clusterScopeFilter(scope), updatedAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
      { $group: { _id: null, n: { $sum: '$confirmationCount' } } },
    ]),
  ]);

  return {
    members,
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    metrics: {
      registeredMembers,
      verifiedResidents,
      activeContributors: activeContributorRows[0]?.n || 0,
      confirmationsThisMonth: confirmationsThisMonth[0]?.n || 0,
    },
  };
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationView {
  id: string;
  title: string;
  message: string;
  type: 'municipal' | 'community' | 'cluster' | 'resolution' | 'system';
  timestamp: string;
  read: boolean;
  relatedIssueId?: string;
  relatedSection?: string;
}

/** Derive current notification events from real data and upsert per-rep. */
export async function syncCommunityNotifications(user: IUser): Promise<NotificationView[]> {
  const scope = await resolveRepScope(user);
  const reportFilter = reportScopeFilter(scope);
  const clusterFilter = clusterScopeFilter(scope);
  const now = Date.now();

  const candidates: Omit<NotificationView, 'id' | 'read' | 'timestamp'>[] = [];

  // Reopened issues (last 30 days) → resolution
  const reopened = await Report.find({ ...reportFilter, status: 'Reopened', updatedAt: { $gte: new Date(now - 30 * 86400000) } })
    .select('title reportNumber')
    .limit(5)
    .lean();
  for (const r of reopened) {
    candidates.push({
      type: 'resolution',
      title: 'Issue reopened by resident',
      message: `${r.title} (${r.reportNumber}) was reopened after resolution verification.`,
      relatedIssueId: String(r._id),
      relatedSection: 'issues',
    });
  }

  // High/critical issues (last 7 days) → community
  const highPriority = await Report.find({
    ...reportFilter,
    createdAt: { $gte: new Date(now - 7 * 86400000) },
    $or: [{ priority: { $in: ['critical', 'high'] } }, { 'analysis.severity': { $in: ['CRITICAL', 'HIGH'] } }],
  })
    .select('title reportNumber priority analysis')
    .limit(5)
    .lean();
  for (const r of highPriority) {
    candidates.push({
      type: 'community',
      title: 'High-priority issue reported',
      message: `${r.title} (${r.reportNumber}) needs community attention.`,
      relatedIssueId: String(r._id),
      relatedSection: 'issues',
    });
  }

  // Municipal status movement (last 7 days) → municipal
  const updated = await Report.find({ ...reportFilter, updatedAt: { $gte: new Date(now - 7 * 86400000) } })
    .select('title reportNumber status')
    .limit(5)
    .lean();
  for (const r of updated) {
    candidates.push({
      type: 'municipal',
      title: 'Municipal status update',
      message: `${r.title} (${r.reportNumber}) is now ${r.status}.`,
      relatedIssueId: String(r._id),
      relatedSection: 'issues',
    });
  }

  // New clusters (last 7 days) → cluster
  const clusters = await CivicCluster.find({ ...clusterFilter, createdAt: { $gte: new Date(now - 7 * 86400000) } })
    .select('clusterCode title reportCount')
    .limit(5)
    .lean();
  for (const c of clusters) {
    candidates.push({
      type: 'cluster',
      title: 'New civic cluster formed',
      message: `${c.clusterCode} — ${c.title} (${c.reportCount} reports).`,
      relatedIssueId: undefined,
      relatedSection: 'aggregation',
    });
  }

  // Recent aggregations by this rep (last 7 days) → system
  const aggregations = await CommunityAggregation.find({ representativeId: user._id, createdAt: { $gte: new Date(now - 7 * 86400000) } })
    .select('issueIds createdAt')
    .limit(5)
    .lean();
  for (const a of aggregations) {
    candidates.push({
      type: 'system',
      title: 'Community aggregation recorded',
      message: `You aggregated ${a.issueIds.length} related issue${a.issueIds.length !== 1 ? 's' : ''} with community context.`,
      relatedIssueId: undefined,
      relatedSection: 'aggregation',
    });
  }

  // Upsert: keep read-state on existing keys, add new as unread.
  const repId = user._id;
  const existing = await CommunityNotification.find({ representativeId: repId }).lean();
  const existingByKey = new Map(existing.map((n) => [n.key, n]));

  const ops = candidates.map((c) => {
    const key = `${String(repId)}:${c.type}:${c.relatedIssueId || 'x'}:${c.title.slice(0, 40)}`;
    const prev = existingByKey.get(key);
    return {
      updateOne: {
        filter: { representativeId: repId, key },
        update: {
          $set: {
            type: c.type,
            title: c.title,
            message: c.message,
            relatedIssueId: c.relatedIssueId,
            relatedSection: c.relatedSection,
            read: prev?.read ?? false,
            createdAt: prev?.createdAt || new Date(),
          },
        },
        upsert: true,
      },
    };
  });

  if (ops.length) {
    await CommunityNotification.bulkWrite(ops);
  }

  const docs = await CommunityNotification.find({ representativeId: repId }).sort({ createdAt: -1 }).limit(30).lean();
  return docs.map((n) => ({
    id: String(n._id),
    title: n.title,
    message: n.message,
    type: n.type,
    timestamp: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    read: n.read,
    relatedIssueId: n.relatedIssueId,
    relatedSection: n.relatedSection,
  }));
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) return false;
  const res = await CommunityNotification.updateOne(
    { _id: notificationId, representativeId: userId },
    { $set: { read: true } }
  );
  return res.modifiedCount > 0 || res.matchedCount > 0;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const res = await CommunityNotification.updateMany(
    { representativeId: userId, read: false },
    { $set: { read: true } }
  );
  return res.modifiedCount || 0;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface CommunityProfileView {
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

export async function getCommunityProfile(user: IUser): Promise<CommunityProfileView> {
  const scope = await resolveRepScope(user);
  const [aggregationsCreated, clusters, members, issues, activeContributorRows] = await Promise.all([
    CommunityAggregation.countDocuments({ representativeId: user._id }),
    CivicCluster.find(clusterScopeFilter(scope)).lean(),
    User.countDocuments({ role: 'CITIZEN', community: scope.community }),
    Report.countDocuments({ ...reportScopeFilter(scope), status: { $in: ['Under Review', 'Assigned', 'In Progress', 'Verification', 'Reopened'] } }),
    Report.aggregate([
      { $match: { ...reportScopeFilter(scope), createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
      { $group: { _id: '$userId' } },
      { $count: 'n' },
    ]),
  ]);

  return {
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      community: scope.community || user.community || '',
      ward: scope.ward || user.ward || '',
      locality: scope.locality || user.locality || '',
      city: scope.city || user.city || '',
      pincode: user.pincode,
      isVerified: user.isVerified,
      joinedAt: user.createdAt ? new Date(user.createdAt).toISOString() : '',
    },
    contribution: {
      aggregationsCreated,
      communityConfirmations: clusters.reduce((s, c) => s + c.confirmationCount, 0),
      registeredMembers: members,
      activeContributors: activeContributorRows[0]?.n || 0,
      activeIssues: issues,
    },
  };
}

/** Whitelist of fields a representative may update on their own profile. */
const EDITABLE_PROFILE_FIELDS = ['name', 'phone', 'pincode'];

export async function updateCommunityProfile(
  user: IUser,
  body: Record<string, unknown>
): Promise<{ user: CommunityProfileView['user']; changed: string[] }> {
  const changed: string[] = [];
  for (const field of EDITABLE_PROFILE_FIELDS) {
    if (body[field] !== undefined && typeof body[field] === 'string') {
      const value = (body[field] as string).trim();
      if (value) {
        (user as any)[field] = value;
        changed.push(field);
      }
    }
  }
  if (changed.length) await user.save();
  const profile = await getCommunityProfile(user);
  return { user: profile.user, changed };
}
