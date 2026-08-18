import { CivicCluster, ICivicCluster } from '../models/CivicCluster.js';
import { CivicSignal } from '../models/CivicSignal.js';
import { Report } from '../models/Report.js';

// ─────────────────────────────────────────────────────────────────────────────
// Emerging Trend Service
//
// Trends are DERIVED from the existing CivicCluster model (plus the reports and
// signals linked to each cluster). We deliberately do not create a separate
// "Trend" collection — the cluster is the single source of truth.
// ─────────────────────────────────────────────────────────────────────────────

export interface TrendSummary {
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

export interface TrendDetail extends TrendSummary {
  description: string;
  severity: string;
  relatedTrends: TrendSummary[];
  recentReports: {
    id: string;
    reportNumber: string;
    title: string;
    status: string;
    createdAt: string;
    location: string;
  }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  water_supply: 'Water Supply',
  street_lighting: 'Street Lighting',
  roads: 'Roads & Pavements',
  drainage: 'Drainage & Sewerage',
  waste: 'Waste Management',
  electricity: 'Power Grid',
  public_safety: 'Public Safety',
  parks: 'Public Parks',
};

function statusLabel(cluster: ICivicCluster): string {
  const map: Record<string, string> = {
    ACTIVE: 'Active',
    INVESTIGATING: 'Under Investigation',
    ASSIGNED: 'Assigned',
    RESOLVED: 'Resolved',
    REOPENED: 'Reopened',
  };
  return map[cluster.status] || cluster.status;
}

function trendDirection(cluster: ICivicCluster, reportCount: number): 'increasing' | 'stable' | 'declining' {
  const hoursSinceLast = (Date.now() - new Date(cluster.lastSignalAt).getTime()) / 3600000;
  if (hoursSinceLast < 24 && reportCount >= 5) return 'increasing';
  if (hoursSinceLast < 72 && reportCount >= 3) return 'increasing';
  if (cluster.status === 'RESOLVED' || cluster.status === 'REOPENED') return 'declining';
  if (hoursSinceLast > 24 * 5) return 'declining';
  return 'stable';
}

function confidenceFromCluster(cluster: ICivicCluster): number {
  // Structured estimate: more reports + recent activity → higher confidence.
  const base = Math.min(0.5 + cluster.reportCount * 0.05, 0.95);
  const recency = Math.min(1 - (Date.now() - new Date(cluster.lastSignalAt).getTime()) / (30 * 86400000), 1);
  return Math.round(Math.min(Math.max(base + recency * 0.05, 0.5), 0.97) * 100);
}

function priorityLevel(cluster: ICivicCluster): { score: number; level: string } {
  if (cluster.priority?.score != null) {
    return { score: cluster.priority.score, level: cluster.priority.level || 'MEDIUM' };
  }
  const scoreMap: Record<string, number> = { CRITICAL: 95, HIGH: 75, MEDIUM: 50, LOW: 25 };
  const score = scoreMap[cluster.severity] ?? 50;
  return { score, level: cluster.severity || 'MEDIUM' };
}

async function buildTrendSummary(cluster: ICivicCluster): Promise<TrendSummary> {
  // Independent residents = distinct users who submitted reports/signals in the cluster
  const [signals, reports] = await Promise.all([
    CivicSignal.find({ _id: { $in: cluster.signalIds } }).select('userId createdAt').lean(),
    Report.find({ _id: { $in: cluster.issueIds } }).select('userId createdAt status title reportNumber location').lean(),
  ]);

  const userIds = new Set<string>();
  signals.forEach((s) => userIds.add(String(s.userId)));
  reports.forEach((r) => userIds.add(String(r.userId)));

  const dates: Date[] = [];
  signals.forEach((s) => s.createdAt && dates.push(s.createdAt));
  reports.forEach((r) => r.createdAt && dates.push(r.createdAt));
  const firstReported = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))).toISOString() : null;
  const latestReport = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString() : null;

  return {
    id: cluster._id.toString(),
    clusterCode: cluster.clusterCode,
    title: cluster.title,
    category: cluster.category,
    categoryLabel: CATEGORY_LABELS[cluster.category] || cluster.category.replace(/_/g, ' '),
    ward: cluster.ward || '',
    locality: cluster.locality || '',
    city: cluster.city || 'Nagpur',
    reportCount: cluster.reportCount,
    independentResidents: Math.max(userIds.size, cluster.reportCount >= 1 ? 1 : 0),
    confirmationCount: cluster.confirmationCount,
    priority: priorityLevel(cluster),
    confidence: confidenceFromCluster(cluster),
    trendDirection: trendDirection(cluster, cluster.reportCount),
    status: statusLabel(cluster),
    affectedArea: cluster.locality || cluster.ward || 'Local area',
    firstReported,
    latestReport,
    center: cluster.center,
    radiusMeters: 500,
    keywords: cluster.keywords || [],
  };
}

async function findRelatedTrends(cluster: ICivicCluster, limit = 3): Promise<TrendSummary[]> {
  const related = await CivicCluster.find({
    _id: { $ne: cluster._id },
    category: cluster.category,
    status: { $in: ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'] },
  })
    .sort({ 'priority.score': -1 })
    .limit(limit)
    .lean();
  const summaries: TrendSummary[] = [];
  for (const c of related) {
    summaries.push(await buildTrendSummary(c as unknown as ICivicCluster));
  }
  return summaries;
}

export async function getTrends(input: { city?: string; ward?: string }): Promise<TrendSummary[]> {
  const filter: Record<string, unknown> = { city: input.city || 'Nagpur' };
  if (input.ward) filter.ward = input.ward;

  const clusters = await CivicCluster.find(filter)
    .sort({ 'priority.score': -1, lastSignalAt: -1 })
    .limit(30)
    .lean();

  const summaries: TrendSummary[] = [];
  for (const c of clusters) {
    summaries.push(await buildTrendSummary(c as unknown as ICivicCluster));
  }
  return summaries;
}

export async function getTrendById(
  id: string,
  input: { city?: string; ward?: string }
): Promise<TrendDetail | null> {
  const cluster = await CivicCluster.findById(id).lean();
  if (!cluster) return null;

  const summary = await buildTrendSummary(cluster as unknown as ICivicCluster);
  const relatedTrends = await findRelatedTrends(cluster as unknown as ICivicCluster);

  // Recent reports linked to this cluster (sanitized — no private fields)
  const reports = await Report.find({ _id: { $in: cluster.issueIds } })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('_id reportNumber title status createdAt location.ward location.locality location.address')
    .lean();

  return {
    ...summary,
    description: cluster.description || '',
    severity: cluster.severity,
    relatedTrends,
    recentReports: reports.map((r) => ({
      id: r._id.toString(),
      reportNumber: r.reportNumber,
      title: r.title,
      status: r.status,
      createdAt: r.createdAt ? r.createdAt.toISOString() : '',
      location: (r.location as any)?.ward || (r.location as any)?.locality || '',
    })),
  };
}
