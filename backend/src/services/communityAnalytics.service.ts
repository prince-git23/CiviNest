import { Report } from '../models/Report.js';
import { CivicCluster } from '../models/CivicCluster.js';
import { User } from '../models/User.js';
import type { RepScope } from './communityHealth.service.js';

/**
 * Community Analytics service
 *
 * Every metric is derived from real MongoDB aggregation over the
 * representative's authorized scope. No mock arrays, no random numbers.
 */

export interface TrendPoint {
  label: string;
  issues: number;
  resolved: number;
  confirmations: number;
}

export interface CommunityAnalyticsResult {
  timeRange: '30D' | '90D' | 'YTD';
  scope: { community: string; ward: string; locality: string; city: string };
  totals: {
    totalIssues: number;
    activeIssues: number;
    resolvedIssues: number;
    reopenedIssues: number;
    pendingReview: number;
  };
  categories: { category: string; count: number }[];
  severityDistribution: { severity: string; count: number }[];
  priorityDistribution: { priority: string; count: number }[];
  participation: {
    registeredResidents: number;
    verifiedResidents: number;
    activeContributors: number;
    confirmationsThisMonth: number;
    reportsSubmitted: number;
  };
  clusters: { activeClusters: number; totalClusters: number };
  municipalResponse: {
    responded: number;
    awaiting: number;
    avgResponseHours: number | null;
    coveragePercent: number;
  };
  resolution: {
    departmentResolved: number;
    citizenConfirmed: number;
    reopened: number;
    total: number;
    resolutionRate: number;
  };
  recurringProblems: { category: string; incidents: number; trend: 'up' | 'down' | 'stable'; change: number }[];
  trend7d: TrendPoint[];
  trend30d: TrendPoint[];
  monthlyTrend: TrendPoint[];
}

function reportScopeFilter(scope: RepScope): Record<string, unknown> {
  const or: Record<string, unknown>[] = [];
  if (scope.ward) or.push({ 'location.ward': scope.ward });
  if (scope.city) or.push({ 'location.city': scope.city, 'location.ward': { $in: ['', scope.ward || ''] } });
  return or.length ? { $or: or } : {};
}

function clusterScopeFilter(scope: RepScope): Record<string, unknown> {
  const or: Record<string, unknown>[] = [];
  if (scope.ward) or.push({ ward: scope.ward });
  if (scope.city) or.push({ city: scope.city });
  return or.length ? { $or: or } : {};
}

const DAY = 86400000;
const ACTIVE_STATUSES = ['Under Review', 'Assigned', 'In Progress', 'Verification', 'Reopened'];

export async function computeCommunityAnalytics(scope: RepScope, timeRange: '30D' | '90D' | 'YTD' = '30D'): Promise<CommunityAnalyticsResult> {
  const reportFilter = reportScopeFilter(scope);
  const clusterFilter = clusterScopeFilter(scope);
  const now = Date.now();

  const days = timeRange === 'YTD' ? 365 : timeRange === '90D' ? 90 : 30;

  // ── Totals by status ──
  const statusRows = await Report.aggregate([
    { $match: reportFilter },
    { $group: { _id: '$status', n: { $sum: 1 } } },
  ]);
  const statusMap = new Map<string, number>();
  for (const r of statusRows) statusMap.set(String(r._id), r.n);
  const totalIssues = statusRows.reduce((s, r) => s + r.n, 0);
  const resolvedIssues = statusMap.get('Resolved') || 0;
  const reopenedIssues = statusMap.get('Reopened') || 0;
  const activeIssues = ACTIVE_STATUSES.reduce((s, st) => s + (statusMap.get(st) || 0), 0);
  const pendingReview = statusMap.get('Under Review') || 0;

  // ── Category / severity / priority distributions ──
  const [categoryRows, severityRows, priorityRows] = await Promise.all([
    Report.aggregate([{ $match: reportFilter }, { $group: { _id: '$category', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 12 }]),
    Report.aggregate([{ $match: reportFilter }, { $group: { _id: '$analysis.severity', n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
    Report.aggregate([{ $match: reportFilter }, { $group: { _id: '$priority', n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
  ]);

  // ── Participation ──
  const [registeredResidents, verifiedResidents, activeContributorRows, confirmationsThisMonth] = await Promise.all([
    User.countDocuments({ role: 'CITIZEN', community: scope.community }),
    User.countDocuments({ role: 'CITIZEN', community: scope.community, isVerified: true }),
    Report.aggregate([
      { $match: { ...reportFilter, createdAt: { $gte: new Date(now - 30 * DAY) } } },
      { $group: { _id: '$userId' } },
      { $count: 'n' },
    ]),
    CivicCluster.aggregate([
      { $match: clusterFilter },
      { $group: { _id: null, n: { $sum: '$confirmationCount' } } },
    ]),
  ]);
  const reportsSubmitted = await Report.countDocuments({ ...reportFilter, createdAt: { $gte: new Date(now - days * DAY) } });

  // ── Clusters ──
  const [activeClusters, totalClusters] = await Promise.all([
    CivicCluster.countDocuments({ ...clusterFilter, status: { $in: ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'] } }),
    CivicCluster.countDocuments(clusterFilter),
  ]);

  // ── Municipal response ──
  const responded = totalIssues - (statusMap.get('Under Review') || 0);
  const awaiting = statusMap.get('Under Review') || 0;
  const coveragePercent = totalIssues > 0 ? Math.round((responded / totalIssues) * 100) : 0;

  // Avg response hours: from createdAt to first timeline event beyond "Under Review".
  let avgResponseHours: number | null = null;
  const timelineRows = await Report.aggregate([
    { $match: reportFilter },
    { $unwind: { path: '$timeline', preserveNullAndEmptyArrays: false } },
    { $match: { 'timeline.status': { $nin: ['Report Lodged', 'Under Review', 'Submitted', 'Created'] } } },
    { $project: { created: '$createdAt', ts: '$timeline.timestamp' } },
    { $limit: 200 },
  ]);
  const parsed: number[] = [];
  for (const row of timelineRows) {
    const created = new Date(row.created).getTime();
    const ts = Number(new Date(String(row.ts).replace(/^Just now$/, new Date().toISOString())).getTime());
    if (isFinite(created) && isFinite(ts) && ts >= created) parsed.push((ts - created) / 3600000);
  }
  if (parsed.length > 0) avgResponseHours = Math.round((parsed.reduce((s, v) => s + v, 0) / parsed.length) * 10) / 10;

  // ── Resolution ──
  const citizenConfirmed = resolvedIssues; // residents confirm resolutions via the verification flow
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  // ── Recurring problems: category incident counts with 30-day trend ──
  const recurringRows = await Report.aggregate([
    { $match: reportFilter },
    { $group: { _id: '$category', total: { $sum: 1 }, recent: { $sum: { $cond: [{ $gte: ['$createdAt', new Date(now - 30 * DAY)] }, 1, 0] } }, prior: { $sum: { $cond: [{ $gte: ['$createdAt', new Date(now - 60 * DAY)] }, 1, 0] } } } },
    { $sort: { total: -1 } },
    { $limit: 8 },
  ]);
  const recurringProblems = recurringRows.map((r) => {
    const total = r.total;
    const prior = Math.max(0, r.prior - r.recent);
    const change = prior > 0 ? Math.round(((r.recent - prior) / prior) * 100) : r.recent > 0 ? 100 : 0;
    const trend: 'up' | 'down' | 'stable' = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';
    return { category: String(r._id), incidents: total, trend, change };
  });

  // ── Time-series trends ──
  const buildTrend = (windowDays: number, points: number): Promise<TrendPoint[]> => {
    const step = windowDays / points;
    const queries = Array.from({ length: points }, async (_, i) => {
      const end = now - i * step * DAY;
      const start = end - step * DAY;
      const [issues, resolved, confirmations] = await Promise.all([
        Report.countDocuments({ ...reportFilter, createdAt: { $gte: new Date(start), $lt: new Date(end) } }),
        Report.countDocuments({ ...reportFilter, status: 'Resolved', updatedAt: { $gte: new Date(start), $lt: new Date(end) } }),
        CivicCluster.aggregate([
          { $match: { ...clusterFilter, updatedAt: { $gte: new Date(start), $lt: new Date(end) } } },
          { $group: { _id: null, n: { $sum: '$confirmationCount' } } },
        ]),
      ]);
      const d = new Date(start);
      return {
        label: `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`,
        issues,
        resolved,
        confirmations: confirmations[0]?.n || 0,
      };
    });
    return Promise.all(queries);
  };

  const [trend7d, trend30d] = await Promise.all([
    buildTrend(7, 7).then((p) => p.reverse()),
    buildTrend(30, 10).then((p) => p.reverse()),
  ]);

  // ── Monthly trend (last 8 months) ──
  const monthStart = new Date(now - 8 * 30 * DAY);
  const monthlyRows = await Report.aggregate([
    { $match: { ...reportFilter, createdAt: { $gte: monthStart } } },
    {
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
        issues: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ]);
  const clusterMonthly = await CivicCluster.aggregate([
    { $match: { ...clusterFilter, updatedAt: { $gte: monthStart } } },
    {
      $group: {
        _id: { y: { $year: '$updatedAt' }, m: { $month: '$updatedAt' } },
        confirmations: { $sum: '$confirmationCount' },
      },
    },
  ]);
  const clusterMonthlyMap = new Map(clusterMonthly.map((r) => [`${r._id.y}-${r._id.m}`, r.confirmations]));
  const monthlyTrend = monthlyRows.map((r) => ({
    label: new Date(r._id.y, r._id.m - 1, 1).toLocaleString('en-US', { month: 'short' }),
    issues: r.issues,
    resolved: r.resolved,
    confirmations: clusterMonthlyMap.get(`${r._id.y}-${r._id.m}`) || 0,
  }));

  return {
    timeRange,
    scope: { community: scope.community, ward: scope.ward, locality: scope.locality, city: scope.city },
    totals: { totalIssues, activeIssues, resolvedIssues, reopenedIssues, pendingReview },
    categories: categoryRows.map((r) => ({ category: String(r._id || 'other'), count: r.n })),
    severityDistribution: severityRows.map((r) => ({ severity: String(r._id || 'UNKNOWN'), count: r.n })),
    priorityDistribution: priorityRows.map((r) => ({ priority: String(r._id || 'medium'), count: r.n })),
    participation: {
      registeredResidents,
      verifiedResidents,
      activeContributors: activeContributorRows[0]?.n || 0,
      confirmationsThisMonth: confirmationsThisMonth[0]?.n || 0,
      reportsSubmitted,
    },
    clusters: { activeClusters, totalClusters },
    municipalResponse: { responded, awaiting, avgResponseHours, coveragePercent },
    resolution: {
      departmentResolved: resolvedIssues,
      citizenConfirmed,
      reopened: reopenedIssues,
      total: totalIssues,
      resolutionRate,
    },
    recurringProblems,
    trend7d,
    trend30d,
    monthlyTrend,
  };
}
