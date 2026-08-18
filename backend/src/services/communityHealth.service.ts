import { Report } from '../models/Report.js';
import { CivicCluster } from '../models/CivicCluster.js';
import { User } from '../models/User.js';

/**
 * Community Health service
 *
 * Community Health measures the CONDITION of a community's civic-response
 * state — it is NOT the resident Impact Score and NOT a black box. Every input
 * below is derived from real database records within the representative's
 * authorized geographic scope and returned as an explainable breakdown.
 */

export interface RepScope {
  community: string;
  ward: string;
  locality: string;
  city: string;
}

export interface HealthSegment {
  category: string;
  score: number;
  color: string;
}

export interface HealthBreakdownItem {
  label: string;
  value: number;
  weight: number;
  detail: string;
}

export interface CommunityHealthResult {
  score: number;
  maxScore: number;
  status: 'Stable' | 'Improving' | 'Needs Attention' | 'At Risk';
  explanation: string;
  activeClusters: number;
  trend: 'up' | 'down' | 'stable';
  segments: HealthSegment[];
  breakdown: HealthBreakdownItem[];
}

const SEGMENT_COLORS: Record<string, string> = {
  Infrastructure: '#3B82F6',
  Safety: '#10B981',
  Sanitation: '#F59E0B',
  Water: '#06B6D4',
  Community: '#8B5CF6',
};

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

const ACTIVE_STATUSES = ['Under Review', 'Assigned', 'In Progress', 'Verification', 'Reopened'];
const RESPONDED_STATUSES = ['Assigned', 'In Progress', 'Verification', 'Resolved'];

export async function computeCommunityHealth(scope: RepScope): Promise<CommunityHealthResult> {
  const reportFilter = reportScopeFilter(scope);
  const clusterFilter = clusterScopeFilter(scope);

  const [totalReports, activeReports, resolvedReports, reopenedReports, respondedReports, clusterRows, reportRows] =
    await Promise.all([
      Report.countDocuments(reportFilter),
      Report.countDocuments({ ...reportFilter, status: { $in: ACTIVE_STATUSES } }),
      Report.countDocuments({ ...reportFilter, status: 'Resolved' }),
      Report.countDocuments({ ...reportFilter, status: 'Reopened' }),
      Report.countDocuments({ ...reportFilter, status: { $in: RESPONDED_STATUSES } }),
      CivicCluster.aggregate([
        { $match: clusterFilter },
        { $group: { _id: '$category', active: { $sum: { $cond: [{ $in: ['$status', ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED']] }, 1, 0] } }, count: { $sum: 1 } } },
      ]),
      Report.aggregate([
        { $match: reportFilter },
        { $group: { _id: '$category', count: { $sum: 1 }, critical: { $sum: { $cond: [{ $in: ['$priority', ['critical', 'high']] }, 1, 0] } } } },
      ]),
    ]);

  // ── Per-category segment scores (Infrastructure / Safety / Sanitation / Water / Community)
  const categoryMap = new Map<string, { total: number; active: number; critical: number }>();
  for (const row of reportRows) {
    categoryMap.set(String(row._id || 'other'), {
      total: row.count,
      active: row.count,
      critical: row.critical,
    });
  }
  for (const row of clusterRows) {
    const key = String(row._id || 'other');
    const prev = categoryMap.get(key) || { total: 0, active: 0, critical: 0 };
    categoryMap.set(key, { ...prev, active: prev.active + row.active, total: prev.total + row.count });
  }

  const categoryScore = (total: number, active: number, critical: number): number => {
    if (total === 0) return 100; // no recorded burden in this category
    const activeRatio = active / total;
    const criticalRatio = critical / total;
    return Math.max(0, Math.round(100 - activeRatio * 35 - criticalRatio * 50));
  };

  const segments: HealthSegment[] = [];
  const CATEGORY_KEYS: [string, string[]][] = [
    ['Infrastructure', ['roads', 'road', 'street-lighting', 'lighting', 'infrastructure']],
    ['Sanitation', ['sanitation', 'waste', 'drainage']],
    ['Water', ['water', 'water_supply', 'water-supply']],
    ['Safety', ['safety', 'public_safety', 'electricity', 'public-safety']],
    ['Community', ['community', 'environment', 'parks']],
  ];
  for (const [label, keys] of CATEGORY_KEYS) {
    let total = 0;
    let active = 0;
    let critical = 0;
    for (const key of keys) {
      const entry = categoryMap.get(key);
      if (entry) {
        total += entry.total;
        active += entry.active;
        critical += entry.critical;
      }
    }
    segments.push({ category: label, score: categoryScore(total, active, critical), color: SEGMENT_COLORS[label] || '#94A3B8' });
  }

  // ── Explainable score inputs ──
  const resolutionRate = totalReports > 0 ? resolvedReports / totalReports : 1;
  const responseCoverage = totalReports > 0 ? respondedReports / totalReports : 1;
  const activeBurden = totalReports > 0 ? activeReports / totalReports : 0;
  const reopenedBurden = totalReports > 0 ? reopenedReports / totalReports : 0;
  const clusterBurden = Math.min(1, clusterRows.reduce((s, r) => s + r.active, 0) / 10);

  // Resident participation — share of scoped citizens with civic activity.
  const [scopedCitizens, activeCitizens] = await Promise.all([
    User.countDocuments({ role: 'CITIZEN', community: scope.community }),
    Report.aggregate([
      { $match: reportFilter },
      { $group: { _id: '$userId' } },
      { $count: 'n' },
    ]),
  ]);
  const participation = scopedCitizens > 0 ? Math.min(1, (activeCitizens[0]?.n || 0) / scopedCitizens) : activeCitizens[0]?.n ? 1 : 0;

  const weights: HealthBreakdownItem[] = [
    { label: 'Resolution rate', value: Math.round(resolutionRate * 100), weight: 0.25, detail: `${resolvedReports} of ${totalReports} issues resolved` },
    { label: 'Municipal response', value: Math.round(responseCoverage * 100), weight: 0.2, detail: `${respondedReports} of ${totalReports} issues have received municipal response` },
    { label: 'Low active burden', value: Math.round((1 - activeBurden) * 100), weight: 0.2, detail: `${activeReports} issues currently active` },
    { label: 'No reopenings', value: Math.round((1 - reopenedBurden) * 100), weight: 0.15, detail: `${reopenedReports} issues reopened` },
    { label: 'Cluster control', value: Math.round((1 - clusterBurden) * 100), weight: 0.1, detail: `${clusterRows.reduce((s, r) => s + r.active, 0)} active clusters` },
    { label: 'Resident participation', value: Math.round(participation * 100), weight: 0.1, detail: `${activeCitizens[0]?.n || 0} of ${scopedCitizens} residents active` },
  ];

  const score = Math.round(weights.reduce((sum, w) => sum + w.value * w.weight, 0));
  const status: CommunityHealthResult['status'] =
    score >= 75 ? 'Stable' : score >= 60 ? 'Improving' : score >= 45 ? 'Needs Attention' : 'At Risk';

  // Trend: compare current active burden to the previous 7-day window.
  const now = Date.now();
  const [recentActive, priorActive] = await Promise.all([
    Report.countDocuments({ ...reportFilter, status: { $in: ACTIVE_STATUSES }, updatedAt: { $gte: new Date(now - 7 * 86400000) } }),
    Report.countDocuments({ ...reportFilter, status: { $in: ACTIVE_STATUSES }, updatedAt: { $gte: new Date(now - 14 * 86400000), $lt: new Date(now - 7 * 86400000) } }),
  ]);
  const trend: CommunityHealthResult['trend'] = recentActive < priorActive ? 'up' : recentActive > priorActive ? 'down' : 'stable';

  const explanation = `Community health is ${status === 'Stable' ? 'stable' : status === 'Improving' ? 'improving' : status.toLowerCase()} — resolution rate ${Math.round(resolutionRate * 100)}%, municipal response on ${Math.round(responseCoverage * 100)}% of issues, ${activeReports} issues active.`;

  return {
    score,
    maxScore: 100,
    status,
    explanation,
    activeClusters: clusterRows.reduce((s, r) => s + r.active, 0),
    trend,
    segments,
    breakdown: weights,
  };
}
