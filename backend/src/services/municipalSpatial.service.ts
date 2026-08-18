import { Report } from '../models/Report.js';
import { CivicCluster } from '../models/CivicCluster.js';
import { Team } from '../models/Team.js';

const SEVERITY_WEIGHT: Record<string, number> = { critical: 95, high: 80, medium: 60, low: 40 };

function priorityScore(r: any): number {
  if (r.analysis?.severity) return SEVERITY_WEIGHT[r.analysis.severity.toLowerCase()] ?? 60;
  return SEVERITY_WEIGHT[r.priority || 'medium'] ?? 60;
}

export async function getMunicipalSpatial(filters: {
  category?: string;
  severity?: string;
  status?: string;
  ward?: string;
} = {}): Promise<any> {
  const reportFilter: any = {};
  const clusterFilter: any = {};

  if (filters.category) {
    reportFilter.category = filters.category;
    clusterFilter.category = filters.category;
  }
  if (filters.ward) {
    reportFilter['location.ward'] = filters.ward;
    clusterFilter.ward = filters.ward;
  }
  if (filters.status) {
    const statusMap: Record<string, string> = {
      'under review': 'Under Review',
      assigned: 'Assigned',
      'in progress': 'In Progress',
      verification: 'Verification',
      resolved: 'Resolved',
      reopened: 'Reopened',
    };
    const rStatus = statusMap[filters.status.toLowerCase()] || filters.status;
    reportFilter.status = rStatus;
    const clusterStatusMap: Record<string, string> = {
      'under review': 'ACTIVE',
      assigned: 'ASSIGNED',
      'in progress': 'ASSIGNED',
      verification: 'INVESTIGATING',
      resolved: 'RESOLVED',
      reopened: 'REOPENED',
    };
    clusterFilter.status = clusterStatusMap[filters.status.toLowerCase()] || filters.status.toUpperCase();
  }
  if (filters.severity) {
    // Reports carry severity in analysis or priority level.
    const sev = filters.severity.toLowerCase();
    reportFilter.$or = [
      { 'analysis.severity': new RegExp(`^${sev}$`, 'i') },
      { priority: sev },
    ];
    clusterFilter.severity = new RegExp(`^${sev}$`, 'i');
  }

  const [reports, clusters, teams] = await Promise.all([
    Report.find(reportFilter).select('reportNumber title category status priority analysis location createdAt municipal').limit(500).lean(),
    CivicCluster.find(clusterFilter).limit(300).lean(),
    Team.find().lean(),
  ]);

  const issues = reports.map((r) => ({
    id: String(r._id),
    reportNumber: r.reportNumber,
    title: r.title,
    category: r.categoryLabel || r.category,
    severity: (r.analysis?.severity || r.priority || 'medium').toLowerCase(),
    priority: priorityScore(r),
    status: r.status,
    latitude: r.location?.latitude || 0,
    longitude: r.location?.longitude || 0,
    ward: r.location?.ward || '',
    locality: r.location?.address?.split(',')[0] || '',
    city: r.location?.city || '',
    department: r.municipal?.department || r.analysis?.suggestedDepartment || '',
    reportCount: 1,
    confirmationCount: 0,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : '',
  }));

  const clusterPoints = clusters.map((c) => ({
    id: String(c._id),
    clusterCode: c.clusterCode,
    title: c.title,
    category: c.category,
    severity: String(c.severity || '').toLowerCase(),
    priority: c.priority?.score || 0,
    status: c.status,
    latitude: c.center?.latitude || 0,
    longitude: c.center?.longitude || 0,
    ward: c.ward || '',
    locality: c.locality || '',
    city: c.city || '',
    reportCount: c.reportCount || 0,
    confirmationCount: c.confirmationCount || 0,
  }));

  // Ward summaries aggregated from real report data.
  const wardMap: Record<string, { active: number; critical: number; resolved: number; overSla: number }> = {};
  for (const r of reports) {
    const ward = r.location?.ward || 'Unknown';
    const entry = (wardMap[ward] ||= { active: 0, critical: 0, resolved: 0, overSla: 0 });
    if (r.status === 'Resolved') entry.resolved += 1;
    else {
      entry.active += 1;
      if (priorityScore(r) >= 90) entry.critical += 1;
      // Simple SLA heuristic: unassigned critical issues older than 4h.
      const created = new Date(r.createdAt).getTime();
      if (!r.municipal?.assignedAt && Date.now() - created > 4 * 3600_000) entry.overSla += 1;
    }
  }
  const wards = Object.entries(wardMap)
    .map(([name, v]) => ({
      id: name.replace(/\s+/g, '-').toLowerCase(),
      name,
      activeIssues: v.active,
      criticalIssues: v.critical,
      resolvedIssues: v.resolved,
      overSla: v.overSla,
      status: v.critical >= 5 ? 'CRITICAL' : v.critical >= 1 ? 'ELEVATED' : 'NOMINAL',
    }))
    .sort((a, b) => b.activeIssues - a.activeIssues);

  // Hotspots: clusters with the highest priority + report volume.
  const hotspots = clusterPoints
    .filter((c) => ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'].includes(c.status))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8)
    .map((c) => ({ clusterId: c.id, clusterCode: c.clusterCode, title: c.title, priority: c.priority, reportCount: c.reportCount, ward: c.ward }));

  return {
    issues,
    clusters: clusterPoints,
    wards,
    hotspots,
    deployments: teams.map((t) => ({
      id: String(t._id),
      teamName: t.name,
      department: t.departmentName,
      ward: t.ward,
      status: (t.status || 'Standby').toLowerCase().replace(/\s+/g, '-') as any,
    })),
  };
}
