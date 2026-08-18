import { Report } from '../models/Report.js';
import { CivicCluster } from '../models/CivicCluster.js';
import { Department } from '../models/Department.js';
import { Team } from '../models/Team.js';
import { User } from '../models/User.js';
import { computeSla } from './municipalSla.service.js';

// ── Shared view helpers ─────────────────────────────────────────

const SEVERITY_WEIGHT: Record<string, number> = { critical: 95, high: 80, medium: 60, low: 40 };

export function priorityScoreOf(r: any): number {
  if (r.analysis?.severity) return SEVERITY_WEIGHT[r.analysis.severity.toLowerCase()] ?? 60;
  return SEVERITY_WEIGHT[r.priority || 'medium'] ?? 60;
}

function severityOf(r: any): string {
  return (r.analysis?.severity || r.priority || 'medium').toLowerCase();
}

export interface IssueListQuery {
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

export async function listMunicipalIssues(q: IssueListQuery): Promise<{ issues: any[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, q.page || 1);
  const limit = Math.min(100, Math.max(1, q.limit || 20));
  const filter: any = {};

  if (q.search) {
    const re = new RegExp(q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: re }, { reportNumber: re }, { description: re }];
  }
  if (q.category) filter.category = q.category;
  if (q.ward) filter['location.ward'] = q.ward;
  if (q.status) filter.status = q.status;
  if (q.severity) {
    const sev = q.severity.toLowerCase();
    filter.$or = [{ 'analysis.severity': new RegExp(`^${sev}$`, 'i') }, { priority: sev }];
  }
  if (q.priority) filter.priority = q.priority.toLowerCase();
  if (q.department) filter['municipal.department'] = q.department;
  if (q.assignment === 'assigned') filter['municipal.assignedAt'] = { $ne: '' };
  if (q.assignment === 'unassigned') {
    filter.$and = [{ 'municipal.assignedAt': { $in: ['', null, undefined] } }];
  }

  const sort: any =
    q.sort === 'priority'
      ? { createdAt: -1 }
      : q.sort === 'reports'
      ? { upvotes: -1 }
      : { createdAt: -1 };

  const [reports, total] = await Promise.all([
    Report.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Report.countDocuments(filter),
  ]);

  const reportIds = reports.map((r) => r._id);
  const clusterMap = new Map<string, any>();
  const clusters = await CivicCluster.find({ issueIds: { $in: reportIds } }).lean();
  for (const c of clusters) {
    for (const id of c.issueIds) clusterMap.set(String(id), c);
  }

  const issues = reports.map((r) => {
    const cluster = clusterMap.get(String(r._id));
    const score = priorityScoreOf(r);
    const sla = computeSla(r.createdAt, r.status === 'Resolved' ? r.updatedAt : undefined, r.priority, undefined);
    return {
      id: String(r._id),
      reportNumber: r.reportNumber,
      title: r.title,
      category: r.categoryLabel || r.category,
      subcategory: r.subcategory || '',
      severity: severityOf(r),
      priority: r.priority,
      priorityScore: score,
      status: r.status,
      location: {
        address: r.location?.address || '',
        ward: r.location?.ward || '',
        locality: r.location?.address?.split(',')[0] || '',
        city: r.location?.city || '',
        latitude: r.location?.latitude || 0,
        longitude: r.location?.longitude || 0,
      },
      reportCount: cluster?.reportCount || r.upvotes || 1,
      confirmationCount: cluster?.confirmationCount || 0,
      clusterId: cluster ? String(cluster._id) : undefined,
      clusterCode: cluster?.clusterCode,
      department: r.municipal?.department || r.analysis?.suggestedDepartment || '',
      departmentId: r.municipal?.departmentId || '',
      assignedTeam: r.municipal?.team || '',
      teamId: r.municipal?.teamId || '',
      assignedAt: r.municipal?.assignedAt || '',
      sla: {
        targetHours: sla.targetHours,
        remainingHours: Math.round(sla.remainingHours * 10) / 10,
        status: sla.status,
        breached: sla.breached,
        atRisk: sla.atRisk,
        deadline: sla.deadline,
      },
      reportedAt: r.createdAt ? new Date(r.createdAt).toISOString() : '',
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : '',
    };
  });

  return { issues, total, page, limit };
}

export async function getMunicipalIssueDetail(issueId: string): Promise<any> {
  const report = await Report.findById(issueId).lean();
  if (!report) return null;

  const clusters = await CivicCluster.find({ issueIds: report._id }).lean();
  const cluster = clusters[0];
  const score = priorityScoreOf(report);
  const related = await Report.find({
    _id: { $ne: report._id },
    'location.ward': report.location?.ward || '__none__',
  })
    .select('reportNumber title status createdAt')
    .limit(5)
    .lean();

  return {
    id: String(report._id),
    reportNumber: report.reportNumber,
    title: report.title,
    description: report.description,
    category: report.categoryLabel || report.category,
    subcategory: report.subcategory || '',
    severity: severityOf(report),
    priority: report.priority,
    priorityScore: score,
    status: report.status,
    location: {
      address: report.location?.address || '',
      ward: report.location?.ward || '',
      city: report.location?.city || '',
      latitude: report.location?.latitude || 0,
      longitude: report.location?.longitude || 0,
      accuracy: report.location?.accuracy || '',
    },
    reportCount: cluster?.reportCount || report.upvotes || 1,
    confirmationCount: cluster?.confirmationCount || 0,
    cluster: cluster
      ? {
          id: String(cluster._id),
          clusterCode: cluster.clusterCode,
          title: cluster.title,
          category: cluster.category,
          severity: String(cluster.severity || '').toLowerCase(),
          priority: cluster.priority?.score || 0,
          status: cluster.status,
          reportCount: cluster.reportCount,
          confirmationCount: cluster.confirmationCount,
          ward: cluster.ward,
          locality: cluster.locality,
        }
      : null,
    analysis: report.analysis
      ? {
          category: report.analysis.category,
          categoryLabel: report.analysis.categoryLabel,
          severity: report.analysis.severity,
          confidence: report.analysis.confidence,
          suggestedDepartment: report.analysis.suggestedDepartment,
          keywords: report.analysis.keywords || [],
        }
      : null,
    municipal: report.municipal || null,
    evidence: (report.evidence || []).map((e: any) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      size: e.size,
    })),
    timeline: (report.timeline || []).map((t: any) => ({
      status: t.status,
      timestamp: t.timestamp,
      note: t.note,
      actor: t.actor || '',
    })),
    relatedIssues: related.map((r) => ({
      id: String(r._id),
      reportNumber: r.reportNumber,
      title: r.title,
      status: r.status,
    })),
    createdAt: report.createdAt ? new Date(report.createdAt).toISOString() : '',
    updatedAt: report.updatedAt ? new Date(report.updatedAt).toISOString() : '',
  };
}

// ── Dashboard ───────────────────────────────────────────────────

export async function getMunicipalDashboard(officerId: string): Promise<any> {
  const user = await User.findById(officerId);
  const [reports, clusters, departments, teams] = await Promise.all([
    Report.find().sort({ createdAt: -1 }).lean(),
    CivicCluster.find().lean(),
    Department.find().lean(),
    Team.find().lean(),
  ]);

  const active = reports.filter((r) => !['Resolved'].includes(r.status));
  const critical = active.filter((r) => priorityScoreOf(r) >= 90);
  const highPriority = active.filter((r) => priorityScoreOf(r) >= 75);
  const unassigned = active.filter((r) => !r.municipal?.assignedAt);
  const inProgress = active.filter((r) => r.status === 'In Progress');
  const pendingVerification = reports.filter((r) => r.status === 'Verification');
  const reopened = reports.filter((r) => r.status === 'Reopened');
  const resolved = reports.filter((r) => r.status === 'Resolved');

  const slaRisk = active
    .map((r) => ({
      report: r,
      sla: computeSla(r.createdAt, undefined, r.priority, undefined),
    }))
    .filter((x) => x.sla.atRisk || x.sla.breached);

  // Department workload from real assignment data (fallback to suggested dept).
  const deptWorkload: Record<string, { active: number; critical: number; inProgress: number; resolved: number; slaRisk: number }> = {};
  for (const r of reports) {
    const dept = r.municipal?.department || r.analysis?.suggestedDepartment || 'Unassigned';
    const entry = (deptWorkload[dept] ||= { active: 0, critical: 0, inProgress: 0, resolved: 0, slaRisk: 0 });
    if (r.status === 'Resolved') entry.resolved += 1;
    else {
      entry.active += 1;
      if (priorityScoreOf(r) >= 90) entry.critical += 1;
      if (r.status === 'In Progress') entry.inProgress += 1;
    }
  }
  for (const x of slaRisk) {
    const dept = x.report.municipal?.department || x.report.analysis?.suggestedDepartment || 'Unassigned';
    if (deptWorkload[dept]) deptWorkload[dept].slaRisk += 1;
  }

  // Recent high-priority issues for the priority queue.
  const priorityQueue = [...active]
    .sort((a, b) => priorityScoreOf(b) - priorityScoreOf(a))
    .slice(0, 8)
    .map((r) => {
      const cluster = clusters.find((c) => (c.issueIds || []).some((id) => String(id) === String(r._id)));
      return {
        id: String(r._id),
        reportNumber: r.reportNumber,
        title: r.title,
        ward: r.location?.ward || '',
        reports: cluster?.reportCount || r.upvotes || 1,
        confidence: r.analysis?.confidence ? Math.round((r.analysis.confidence <= 1 ? r.analysis.confidence * 100 : r.analysis.confidence)) : 0,
        priority: priorityScoreOf(r),
        severity: severityOf(r),
        status: r.status,
        clusterCode: cluster?.clusterCode,
      };
    });

  // Departments with live workload.
  const departmentsView = departments.map((d) => {
    const w = deptWorkload[d.name] || { active: 0, critical: 0, inProgress: 0, resolved: 0, slaRisk: 0 };
    const deptTeams = teams.filter((t) => String(t.departmentId) === String(d._id));
    const deptResolved = reports.filter((r) => r.status === 'Resolved' && (r.municipal?.department === d.name || r.analysis?.suggestedDepartment === d.name));
    const compliance = deptResolved.length ? Math.round((deptResolved.length / Math.max(1, deptResolved.length + w.active)) * 100) : 0;
    return {
      id: String(d._id),
      name: d.name,
      code: d.code,
      status: d.status,
      slaTargetHours: d.slaTargetHours,
      icon: d.icon || '🏛️',
      activeIssues: w.active,
      criticalIssues: w.critical,
      inProgress: w.inProgress,
      resolvedIssues: w.resolved,
      slaRisk: w.slaRisk,
      resolutionRate: compliance,
      teams: deptTeams.map((t) => ({ id: String(t._id), name: t.name, ward: t.ward, status: t.status })),
    };
  });

  // Spatial summary.
  const spatialSummary = {
    totalClusters: clusters.length,
    activeClusters: clusters.filter((c) => ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'].includes(c.status)).length,
    hotspots: [...clusters]
      .filter((c) => ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'].includes(c.status))
      .sort((a, b) => (b.priority?.score || 0) - (a.priority?.score || 0))
      .slice(0, 5)
      .map((c) => ({ clusterCode: c.clusterCode, title: c.title, priority: c.priority?.score || 0, ward: c.ward || '' })),
  };

  return {
    user: user ? user.toSafeObject() : null,
    dashboard: {
      totalIssues: reports.length,
      newIssues: reports.filter((r) => Date.now() - new Date(r.createdAt).getTime() < 24 * 3600_000).length,
      activeIssues: active.length,
      criticalIssues: critical.length,
      highPriorityIssues: highPriority.length,
      unassignedIssues: unassigned.length,
      assignedIssues: active.length - unassigned.length,
      inProgressIssues: inProgress.length,
      resolvedIssues: resolved.length,
      reopenedIssues: reopened.length,
      pendingVerification: pendingVerification.length,
      slaAtRisk: slaRisk.length,
      activeClusters: clusters.filter((c) => ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'].includes(c.status)).length,
      departments: departmentsView,
      priorityQueue,
      spatialSummary,
      recentActions: [],
      updatedAt: new Date().toISOString(),
    },
  };
}

// ── Departments & teams ─────────────────────────────────────────

export async function getDepartmentList(): Promise<any[]> {
  const [departments, teams, reports] = await Promise.all([
    Department.find().sort({ name: 1 }).lean(),
    Team.find().lean(),
    Report.find().lean(),
  ]);

  const workload: Record<string, { active: number; critical: number; inProgress: number; resolved: number; slaRisk: number }> = {};
  for (const r of reports) {
    const dept = r.municipal?.department || r.analysis?.suggestedDepartment || '';
    if (!dept) continue;
    const entry = (workload[dept] ||= { active: 0, critical: 0, inProgress: 0, resolved: 0, slaRisk: 0 });
    if (r.status === 'Resolved') entry.resolved += 1;
    else {
      entry.active += 1;
      if (priorityScoreOf(r) >= 90) entry.critical += 1;
      if (r.status === 'In Progress') entry.inProgress += 1;
    }
  }

  return departments.map((d) => {
    const w = workload[d.name] || { active: 0, critical: 0, inProgress: 0, resolved: 0, slaRisk: 0 };
    const deptTeams = teams.filter((t) => String(t.departmentId) === String(d._id));
    const total = w.active + w.resolved;
    return {
      id: String(d._id),
      name: d.name,
      code: d.code,
      status: d.status,
      slaTargetHours: d.slaTargetHours,
      icon: d.icon || '🏛️',
      activeIssues: w.active,
      criticalIssues: w.critical,
      inProgress: w.inProgress,
      resolvedIssues: w.resolved,
      slaRisk: w.slaRisk,
      resolutionRate: total ? Math.round((w.resolved / total) * 100) : 0,
      avgResponseHours: null,
      teams: deptTeams.map((t) => ({
        id: String(t._id),
        name: t.name,
        ward: t.ward,
        zone: t.zone,
        status: t.status,
        maxTasks: t.maxTasks,
      })),
    };
  });
}

export async function getDepartmentDetail(departmentId: string): Promise<any> {
  const dept = await Department.findById(departmentId).lean();
  if (!dept) return null;
  const [teams, reports] = await Promise.all([
    Team.find({ departmentId: dept._id }).lean(),
    Report.find({ $or: [{ 'municipal.department': dept.name }, { 'analysis.suggestedDepartment': dept.name }] }).sort({ createdAt: -1 }).lean(),
  ]);

  const active = reports.filter((r) => !['Resolved'].includes(r.status));
  const critical = active.filter((r) => priorityScoreOf(r) >= 90);
  const overdue = active.filter((r) => {
    const sla = computeSla(r.createdAt, undefined, r.priority, dept.slaTargetHours);
    return sla.breached || sla.atRisk;
  });

  return {
    id: String(dept._id),
    name: dept.name,
    code: dept.code,
    status: dept.status,
    slaTargetHours: dept.slaTargetHours,
    icon: dept.icon,
    workload: {
      active: active.length,
      critical: critical.length,
      inProgress: active.filter((r) => r.status === 'In Progress').length,
      overdue: overdue.length,
      resolved: reports.filter((r) => r.status === 'Resolved').length,
      reopened: reports.filter((r) => r.status === 'Reopened').length,
    },
    teams: teams.map((t) => ({
      id: String(t._id),
      name: t.name,
      ward: t.ward,
      zone: t.zone,
      status: t.status,
      maxTasks: t.maxTasks,
      members: t.members || [],
    })),
    recentIssues: reports.slice(0, 8).map((r) => ({
      id: String(r._id),
      reportNumber: r.reportNumber,
      title: r.title,
      status: r.status,
      priorityScore: priorityScoreOf(r),
      ward: r.location?.ward || '',
      assignedTeam: r.municipal?.team || '',
    })),
  };
}

export async function getTeamList(): Promise<any[]> {
  const teams = await Team.find().sort({ departmentName: 1, name: 1 }).lean();
  const reports = await Report.find({ 'municipal.teamId': { $ne: '' } }).select('municipal status').lean();
  return teams.map((t) => {
    const tasks = reports.filter((r) => r.municipal?.teamId === String(t._id));
    return {
      id: String(t._id),
      name: t.name,
      departmentId: String(t.departmentId),
      department: t.departmentName,
      ward: t.ward,
      zone: t.zone,
      status: t.status,
      focus: t.focus,
      maxTasks: t.maxTasks,
      activeTasks: tasks.filter((r) => r.status !== 'Resolved').length,
      members: t.members || [],
    };
  });
}

export async function getTeamDetail(teamId: string): Promise<any> {
  const team = await Team.findById(teamId).lean();
  if (!team) return null;
  const issues = await Report.find({ 'municipal.teamId': String(team._id) })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  return {
    id: String(team._id),
    name: team.name,
    departmentId: String(team.departmentId),
    department: team.departmentName,
    ward: team.ward,
    zone: team.zone,
    status: team.status,
    focus: team.focus,
    maxTasks: team.maxTasks,
    members: team.members || [],
    activeTasks: issues.filter((r) => r.status !== 'Resolved').length,
    issues: issues.map((r) => ({
      id: String(r._id),
      reportNumber: r.reportNumber,
      title: r.title,
      status: r.status,
      priorityScore: priorityScoreOf(r),
      ward: r.location?.ward || '',
    })),
  };
}
