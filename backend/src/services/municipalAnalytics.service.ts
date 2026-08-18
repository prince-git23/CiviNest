import { Report } from '../models/Report.js';
import { CivicCluster } from '../models/CivicCluster.js';
import { Department } from '../models/Department.js';
import { Team } from '../models/Team.js';
import { complianceFromIssues } from './municipalSla.service.js';

// ── Helpers ─────────────────────────────────────────────────────

const SEVERITY_WEIGHT: Record<string, number> = { critical: 95, high: 80, medium: 60, low: 40 };

function resolvePriorityScore(report: any): number {
  if (report.analysis?.severity) return SEVERITY_WEIGHT[report.analysis.severity.toLowerCase()] ?? 60;
  return SEVERITY_WEIGHT[report.priority || 'medium'] ?? 60;
}

function statusBucket(status: string): string {
  switch ((status || '').toLowerCase()) {
    case 'resolved': return 'Resolved';
    case 'reopened': return 'Reopened';
    case 'verification': return 'Verification';
    case 'in progress': return 'In Progress';
    case 'assigned': return 'Assigned';
    default: return 'Under Review';
  }
}

// ── Main analytics ──────────────────────────────────────────────

export async function getMunicipalAnalytics(): Promise<any> {
  const [reports, clusters, departments, teams] = await Promise.all([
    Report.find().select('category priority status analysis createdAt timeline municipal').lean(),
    CivicCluster.find().select('category severity priority status reportCount createdAt').lean(),
    Department.find().lean(),
    Team.find().lean(),
  ]);

  const now = Date.now();
  const DAY = 86400_000;
  const last7 = now - 7 * DAY;
  const last30 = now - 30 * DAY;

  const active = reports.filter((r) => !['Resolved'].includes(r.status));
  const resolved = reports.filter((r) => r.status === 'Resolved');
  const reopened = reports.filter((r) => r.status === 'Reopened');

  // Timestamps for timing metrics (parse from timeline events where available).
  const firstActionAt = (r: any) => {
    const ev = (r.timeline || []).find((t: any) =>
      /assigned|in progress|work started/i.test(t.status || '')
    );
    return ev ? new Date(ev.timestamp).getTime() : NaN;
  };
  const resolvedAt = (r: any) => {
    const ev = (r.timeline || []).find((t: any) => /resolved/i.test(t.status || ''));
    return ev ? new Date(ev.timestamp).getTime() : NaN;
  };

  const withAction = active.filter((r) => !Number.isNaN(firstActionAt(r)));
  const avgResponseHours = withAction.length
    ? withAction.reduce((s, r) => s + Math.max(0, (firstActionAt(r) - new Date(r.createdAt).getTime()) / 3600_000), 0) / withAction.length
    : 0;

  const withResolvedAt = resolved.filter((r) => !Number.isNaN(resolvedAt(r)));
  const avgResolutionHours = withResolvedAt.length
    ? withResolvedAt.reduce((s, r) => s + Math.max(0, (resolvedAt(r) - new Date(r.createdAt).getTime()) / 3600_000), 0) / withResolvedAt.length
    : 0;

  const sla = complianceFromIssues(
    resolved.map((r) => {
      const ts = resolvedAt(r);
      return { createdAt: r.createdAt, resolvedAt: Number.isNaN(ts) ? undefined : new Date(ts), priority: r.priority };
    })
  );

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  for (const r of reports) {
    const cat = r.categoryLabel || r.category || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  const categories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Severity / priority distribution
  const severityCounts: Record<string, number> = {};
  const priorityCounts: Record<string, number> = {};
  for (const r of reports) {
    const sev = (r.analysis?.severity || r.priority || 'medium').toLowerCase();
    severityCounts[sev] = (severityCounts[sev] || 0) + 1;
    const score = resolvePriorityScore(r);
    const bucket = score >= 90 ? 'critical' : score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';
    priorityCounts[bucket] = (priorityCounts[bucket] || 0) + 1;
  }

  // Ward performance
  const wardMap: Record<string, { active: number; resolved: number; critical: number }> = {};
  for (const r of reports) {
    const ward = r.location?.ward || 'Unknown';
    const entry = (wardMap[ward] ||= { active: 0, resolved: 0, critical: 0 });
    if (r.status === 'Resolved') entry.resolved += 1;
    else {
      entry.active += 1;
      if (resolvePriorityScore(r) >= 90) entry.critical += 1;
    }
  }
  const wards = Object.entries(wardMap).map(([name, v]) => ({ name, ...v }));

  // Department performance from actual reports + teams
  const deptMap: Record<string, { total: number; resolved: number; active: number; critical: number }> = {};
  for (const r of reports) {
    const dept = r.municipal?.department || r.analysis?.suggestedDepartment || 'Unassigned';
    const entry = (deptMap[dept] ||= { total: 0, resolved: 0, active: 0, critical: 0 });
    entry.total += 1;
    if (r.status === 'Resolved') entry.resolved += 1;
    else {
      entry.active += 1;
      if (resolvePriorityScore(r) >= 90) entry.critical += 1;
    }
  }
  const departmentsPerformance = Object.entries(deptMap).map(([name, v]) => ({
    name,
    total: v.total,
    active: v.active,
    resolved: v.resolved,
    critical: v.critical,
    resolutionRate: v.total ? Math.round((v.resolved / v.total) * 100) : 0,
  }));

  // Trend over the last 30 days (weekly buckets)
  const trendBuckets: Record<string, number> = {};
  for (const r of reports) {
    const created = new Date(r.createdAt).getTime();
    if (created < last30) continue;
    const bucket = Math.floor((created - last30) / (7 * DAY));
    const key = `${bucket}`;
    trendBuckets[key] = (trendBuckets[key] || 0) + 1;
  }
  const issueVolumeTrend = Array.from({ length: 5 }, (_, i) => ({
    label: `Week ${i + 1}`,
    count: trendBuckets[`${i}`] || 0,
  }));

  const clusterGrowth = {
    active: clusters.filter((c) => c.status === 'ACTIVE').length,
    total: clusters.length,
    last7d: clusters.filter((c) => new Date(c.createdAt).getTime() >= last7).length,
  };

  return {
    summary: {
      totalIssues: reports.length,
      activeIssues: active.length,
      resolvedIssues: resolved.length,
      reopenedIssues: reopened.length,
      newIssues7d: reports.filter((r) => new Date(r.createdAt).getTime() >= last7).length,
      newIssues30d: reports.filter((r) => new Date(r.createdAt).getTime() >= last30).length,
      resolutionRate: reports.length ? Math.round((resolved.length / reports.length) * 100) : 0,
      reopenRate: resolved.length ? Math.round((reopened.length / Math.max(1, resolved.length + reopened.length)) * 100) : 0,
      avgResponseHours: Math.round(avgResponseHours * 10) / 10,
      avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
      activeClusters: clusters.filter((c) => ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'].includes(c.status)).length,
      totalClusters: clusters.length,
    },
    pipeline: {
      rawReports: reports.length,
      aiClustered: clusters.reduce((s, c) => s + (c.reportCount || 1), 0),
      verified: clusters.reduce((s, c) => s + (c.confirmationCount || 0), 0),
      resolved: resolved.length,
    },
    sla: {
      compliance: sla.compliance,
      withinTarget: sla.withinTarget,
      breached: sla.breached,
      total: sla.total,
    },
    categories,
    severityDistribution: severityCounts,
    priorityDistribution: priorityCounts,
    wards,
    departments: departmentsPerformance,
    teams: teams.map((t) => ({ id: String(t._id), name: t.name, department: t.departmentName, ward: t.ward, status: t.status })),
    clusterGrowth,
    issueVolumeTrend,
    statusDistribution: reports.reduce<Record<string, number>>((acc, r) => {
      const b = statusBucket(r.status);
      acc[b] = (acc[b] || 0) + 1;
      return acc;
    }, {}),
    departmentsCount: departments.length,
  };
}
