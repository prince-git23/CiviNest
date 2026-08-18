import { CivicCluster } from '../models/CivicCluster.js';
import { Report } from '../models/Report.js';

// ─────────────────────────────────────────────────────────────────────────────
// Ward Sensor Metrics Service
//
// Computes per-ward civic health from REAL backend data (active clusters and
// reports in the resident's ward/city). When the database has no data for the
// resident's ward yet, a clearly-structured demo dataset is returned so the UI
// always has something meaningful to render. The demo dataset is intentionally
// separate so it can be replaced by live sensor feeds later.
// ─────────────────────────────────────────────────────────────────────────────

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

export interface WardMetricsResult {
  ward: string;
  locality: string;
  city: string;
  overallScore: number;
  metrics: WardMetricCategory[];
  sensors: WardSensorStatus[];
  updatedAt: string;
  source: 'live' | 'demo';
}

// Category mapping: backend category key → civic health category
const CATEGORY_MAP: Record<string, { label: string; icon: WardMetricCategory['icon'] }> = {
  water_supply: { label: 'Water Supply', icon: 'water' },
  street_lighting: { label: 'Street Lighting', icon: 'lighting' },
  roads: { label: 'Roads & Infrastructure', icon: 'roads' },
  drainage: { label: 'Drainage & Sanitation', icon: 'sanitation' },
  waste: { label: 'Waste Collection', icon: 'sanitation' },
  electricity: { label: 'Power Grid', icon: 'lighting' },
};

const CATEGORY_ORDER = ['water_supply', 'street_lighting', 'roads', 'drainage', 'waste', 'electricity'];

// Structured demo dataset — used only when the database has no data for the
// resident's ward. These values mirror the resident dashboard's civic health
// card so the UI stays coherent; they can be replaced by live telemetry.
const DEMO_WARD_METRICS: Omit<WardMetricsResult, 'ward' | 'locality' | 'city' | 'updatedAt' | 'source'> = {
  overallScore: 70,
  metrics: [
    {
      category: 'water_supply',
      label: 'Water Supply',
      score: 82,
      status: 'healthy',
      icon: 'water',
      activeIssues: 3,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      trend: 'stable',
      detail: 'Reservoir levels nominal. 2 scheduled pressure audits this week.',
    },
    {
      category: 'street_lighting',
      label: 'Street Lighting',
      score: 71,
      status: 'moderate',
      icon: 'lighting',
      activeIssues: 5,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      trend: 'declining',
      detail: '3 luminaire outages reported near school corridor. Crew assigned.',
    },
    {
      category: 'roads',
      label: 'Roads & Infrastructure',
      score: 79,
      status: 'moderate',
      icon: 'roads',
      activeIssues: 4,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      trend: 'improving',
      detail: 'Patching work on West Avenue completed. 2 open pothole tickets remain.',
    },
    {
      category: 'drainage',
      label: 'Waste & Sanitation',
      score: 58,
      status: 'attention',
      icon: 'sanitation',
      activeIssues: 7,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      trend: 'declining',
      detail: 'Drain overflow at market junction under desilting. Collection delayed in Block B.',
    },
  ],
  sensors: [
    {
      name: 'Water Flow Sensor · Feeder FP-14',
      status: 'operational',
      value: '2.4',
      unit: 'bar',
      lastUpdated: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      name: 'Luminaire Grid · Sector 4 North',
      status: 'degraded',
      value: '61',
      unit: '% online',
      lastUpdated: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      name: 'Drain Level Monitor · Market Siphon',
      status: 'degraded',
      value: '78',
      unit: '% capacity',
      lastUpdated: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      name: 'Road Sensor · West Access Corridor',
      status: 'operational',
      value: '0.42',
      unit: 'IRI',
      lastUpdated: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    },
  ],
};

function scoreFromIssues(count: number, criticalCount: number): number {
  // Start at 100 and deduct per active issue, escalating for critical severity.
  const score = 100 - count * 4 - criticalCount * 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function statusFromScore(score: number): WardMetricCategory['status'] {
  if (score >= 80) return 'healthy';
  if (score >= 70) return 'moderate';
  if (score >= 55) return 'attention';
  return 'critical';
}

function trendFromCounts(recent: number, previous: number): WardMetricCategory['trend'] {
  if (recent < previous) return 'improving';
  if (recent > previous) return 'declining';
  return 'stable';
}

export async function getWardMetrics(input: {
  city?: string;
  ward?: string;
  locality?: string;
}): Promise<WardMetricsResult> {
  const city = input.city || 'Nagpur';
  const ward = input.ward || 'Ward 14';
  const locality = input.locality || 'Dharampeth';

  // Real data: active clusters + reports in this ward/city
  const [clusters, reports] = await Promise.all([
    CivicCluster.find({
      city,
      status: { $in: ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'] },
    }).lean(),
    Report.find({ 'location.city': city, status: { $ne: 'Resolved' } }).lean(),
  ]);

  const wardClusters = clusters.filter((c) => !ward || c.ward === ward || c.ward === '');
  const wardReports = reports.filter((r) => !ward || r.location.ward === ward || r.location.ward === '');

  // If no real data for this ward yet, return the structured demo dataset.
  if (wardClusters.length === 0 && wardReports.length === 0) {
    return {
      ward,
      locality,
      city,
      overallScore: DEMO_WARD_METRICS.overallScore,
      metrics: DEMO_WARD_METRICS.metrics.map((m) => ({ ...m })),
      sensors: DEMO_WARD_METRICS.sensors.map((s) => ({ ...s })),
      updatedAt: new Date().toISOString(),
      source: 'demo',
    };
  }

  // Build category stats from real data
  const now = Date.now();
  const categories: Record<string, { count: number; critical: number; latest: Date }> = {};

  for (const cluster of wardClusters) {
    const key = cluster.category;
    if (!CATEGORY_MAP[key]) continue;
    const entry = (categories[key] ||= { count: 0, critical: 0, latest: cluster.createdAt });
    entry.count += 1;
    if (['CRITICAL', 'HIGH'].includes(cluster.priority?.level || '')) entry.critical += 1;
    if (!entry.latest || cluster.createdAt > entry.latest) entry.latest = cluster.createdAt;
  }

  for (const report of wardReports) {
    const key = report.category;
    if (!CATEGORY_MAP[key]) continue;
    const entry = (categories[key] ||= { count: 0, critical: 0, latest: report.createdAt });
    entry.count += 1;
    if (['critical', 'high'].includes(report.priority)) entry.critical += 1;
    if (!entry.latest || report.createdAt > entry.latest) entry.latest = report.createdAt;
  }

  const metrics: WardMetricCategory[] = CATEGORY_ORDER.filter((key) => categories[key]).map((key) => {
    const stats = categories[key];
    const score = scoreFromIssues(stats.count, stats.critical);
    const recentCount = wardClusters.filter((c) => c.category === key && now - c.createdAt.getTime() < 7 * 86400000).length +
      wardReports.filter((r) => r.category === key && now - r.createdAt.getTime() < 7 * 86400000).length;
    const previousCount = stats.count - recentCount;
    const meta = CATEGORY_MAP[key];
    return {
      category: key,
      label: meta.label,
      score,
      status: statusFromScore(score),
      icon: meta.icon,
      activeIssues: stats.count,
      lastUpdated: stats.latest.toISOString(),
      trend: trendFromCounts(recentCount, previousCount),
      detail: `${stats.count} active issue${stats.count === 1 ? '' : 's'} (${stats.critical} critical) in ${ward}.`,
    };
  });

  // If no recognized categories had data, fall back to demo dataset
  if (metrics.length === 0) {
    return {
      ward,
      locality,
      city,
      overallScore: DEMO_WARD_METRICS.overallScore,
      metrics: DEMO_WARD_METRICS.metrics.map((m) => ({ ...m })),
      sensors: DEMO_WARD_METRICS.sensors.map((s) => ({ ...s })),
      updatedAt: new Date().toISOString(),
      source: 'demo',
    };
  }

  const overallScore = Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length);

  // Build a basic sensor status list derived from the live data
  const sensors: WardSensorStatus[] = metrics.map((m) => ({
    name: `${m.label} Monitor · ${ward}`,
    status: m.status === 'healthy' ? 'operational' : m.status === 'critical' ? 'offline' : 'degraded',
    value: String(Math.max(m.activeIssues, 1)),
    unit: m.status === 'healthy' ? 'active issues' : 'active issues',
    lastUpdated: m.lastUpdated,
  }));

  return {
    ward,
    locality,
    city,
    overallScore,
    metrics,
    sensors,
    updatedAt: new Date().toISOString(),
    source: 'live',
  };
}
