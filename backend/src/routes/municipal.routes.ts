import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ROLES } from '../config/constants.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Team } from '../models/Team.js';
import { Report } from '../models/Report.js';
import { CivicCluster } from '../models/CivicCluster.js';
import {
  getMunicipalDashboard,
  listMunicipalIssues,
  getMunicipalIssueDetail,
  getDepartmentList,
  getDepartmentDetail,
  getTeamList,
  getTeamDetail,
} from '../services/municipal.service.js';
import { getMunicipalSpatial } from '../services/municipalSpatial.service.js';
import { getMunicipalAnalytics } from '../services/municipalAnalytics.service.js';
import {
  assignIssue,
  startWork,
  completeWork,
  submitResolution,
  reopenIssue,
} from '../services/municipalResolution.service.js';
import {
  listMunicipalNotifications,
  markMunicipalNotificationRead,
  markAllMunicipalNotificationsRead,
  createMunicipalNotification,
} from '../services/municipalNotification.service.js';
import { listAuditLog } from '../services/municipalAudit.service.js';

const router = Router();

// All municipal routes require MUNICIPAL_OFFICER role
router.use(authenticate, requireRole(ROLES.MUNICIPAL_OFFICER));

const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
const num = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// ── Dashboard ──
// GET /api/municipal/dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const result = await getMunicipalDashboard(req.user!.userId);
    sendSuccess(res, result);
  } catch {
    sendError(res, 'Failed to load municipal dashboard.', 500);
  }
});

// ── Issues ──
// GET /api/municipal/issues
router.get('/issues', async (req: AuthRequest, res: Response) => {
  try {
    const result = await listMunicipalIssues({
      search: str(req.query.search),
      category: str(req.query.category),
      severity: str(req.query.severity),
      priority: str(req.query.priority),
      status: str(req.query.status),
      ward: str(req.query.ward),
      department: str(req.query.department),
      assignment: str(req.query.assignment) === 'assigned' || str(req.query.assignment) === 'unassigned' ? (str(req.query.assignment) as 'assigned' | 'unassigned') : undefined,
      page: num(req.query.page, 1),
      limit: num(req.query.limit, 20),
      sort: str(req.query.sort) === 'priority' || str(req.query.sort) === 'reports' ? (str(req.query.sort) as 'priority' | 'reports') : 'latest',
    });
    sendSuccess(res, result);
  } catch {
    sendError(res, 'Failed to load municipal issues.', 500);
  }
});

// GET /api/municipal/issues/:id
router.get('/issues/:id', async (req: AuthRequest, res: Response) => {
  try {
    const issue = await getMunicipalIssueDetail(req.params.id);
    if (!issue) {
      sendError(res, 'Issue not found.', 404);
      return;
    }
    sendSuccess(res, { issue });
  } catch {
    sendError(res, 'Failed to load issue.', 500);
  }
});

// GET /api/municipal/issues/:id/resolution — current resolution + verification state
router.get('/issues/:id/resolution', async (req: AuthRequest, res: Response) => {
  try {
    const report = await Report.findById(req.params.id).select('reportNumber title status municipal timeline').lean();
    if (!report) {
      sendError(res, 'Issue not found.', 404);
      return;
    }
    const timeline = (report.timeline || []).map((t: any) => ({
      status: t.status,
      timestamp: t.timestamp,
      note: t.note,
      actor: t.actor || '',
    }));
    const resolution = report.municipal?.resolution || null;
    const verificationState =
      report.status === 'Verification'
        ? 'AWAITING_VERIFICATION'
        : report.status === 'Resolved'
        ? 'VERIFIED'
        : report.status === 'Reopened'
        ? 'REOPENED'
        : 'NOT_SUBMITTED';
    sendSuccess(res, {
      issue: { id: String(report._id), reportNumber: report.reportNumber, title: report.title, status: report.status },
      resolution,
      verificationState,
      timeline,
    });
  } catch {
    sendError(res, 'Failed to load resolution.', 500);
  }
});

// PUT /api/municipal/issues/:id/assign — assign department/team, optional priority override
router.put('/issues/:id/assign', async (req: AuthRequest, res: Response) => {
  try {
    const { departmentId, teamId, priorityOverride, reason, notes } = req.body || {};
    const result = await assignIssue(req.user!.userId, req.params.id, {
      departmentId: typeof departmentId === 'string' ? departmentId : undefined,
      teamId: typeof teamId === 'string' ? teamId : undefined,
      priorityOverride: typeof priorityOverride === 'string' ? priorityOverride : undefined,
      reason: typeof reason === 'string' ? reason : undefined,
      notes: typeof notes === 'string' ? notes : undefined,
    });
    sendSuccess(res, { assigned: result.assigned, department: result.department, team: result.team, reportNumber: result.report.reportNumber });
  } catch (e: any) {
    sendError(res, e.message || 'Failed to assign issue.', e.status || 500);
  }
});

// POST /api/municipal/issues/:id/work-start
router.post('/issues/:id/work-start', async (req: AuthRequest, res: Response) => {
  try {
    const report = await startWork(req.user!.userId, req.params.id, str(req.body?.notes));
    sendSuccess(res, { status: report.status, reportNumber: report.reportNumber });
  } catch (e: any) {
    sendError(res, e.message || 'Failed to start work.', e.status || 500);
  }
});

// POST /api/municipal/issues/:id/work-complete
router.post('/issues/:id/work-complete', async (req: AuthRequest, res: Response) => {
  try {
    const report = await completeWork(req.user!.userId, req.params.id, str(req.body?.notes));
    sendSuccess(res, { status: report.status, reportNumber: report.reportNumber });
  } catch (e: any) {
    sendError(res, e.message || 'Failed to complete work.', e.status || 500);
  }
});

// POST /api/municipal/issues/:id/resolution — submit resolution for resident verification
router.post('/issues/:id/resolution', async (req: AuthRequest, res: Response) => {
  try {
    const { description, evidence } = req.body || {};
    const report = await submitResolution(req.user!.userId, req.params.id, {
      description: typeof description === 'string' ? description : '',
      evidence: Array.isArray(evidence) ? evidence : undefined,
    });
    sendSuccess(res, { status: report.status, reportNumber: report.reportNumber, resolutionSubmitted: true });
  } catch (e: any) {
    sendError(res, e.message || 'Failed to submit resolution.', e.status || 500);
  }
});

// POST /api/municipal/issues/:id/reopen
router.post('/issues/:id/reopen', async (req: AuthRequest, res: Response) => {
  try {
    const report = await reopenIssue(req.user!.userId, req.params.id, str(req.body?.reason) || '');
    sendSuccess(res, { status: report.status, reportNumber: report.reportNumber });
  } catch (e: any) {
    sendError(res, e.message || 'Failed to reopen issue.', e.status || 500);
  }
});

// ── Departments ──
// GET /api/municipal/departments
router.get('/departments', async (req: AuthRequest, res: Response) => {
  try {
    const departments = await getDepartmentList();
    sendSuccess(res, { departments });
  } catch {
    sendError(res, 'Failed to load departments.', 500);
  }
});

// GET /api/municipal/departments/:id
router.get('/departments/:id', async (req: AuthRequest, res: Response) => {
  try {
    const department = await getDepartmentDetail(req.params.id);
    if (!department) {
      sendError(res, 'Department not found.', 404);
      return;
    }
    sendSuccess(res, { department });
  } catch {
    sendError(res, 'Failed to load department.', 500);
  }
});

// ── Teams ──
// GET /api/municipal/teams
router.get('/teams', async (req: AuthRequest, res: Response) => {
  try {
    const teams = await getTeamList();
    sendSuccess(res, { teams });
  } catch {
    sendError(res, 'Failed to load teams.', 500);
  }
});

// GET /api/municipal/teams/:id
router.get('/teams/:id', async (req: AuthRequest, res: Response) => {
  try {
    const team = await getTeamDetail(req.params.id);
    if (!team) {
      sendError(res, 'Team not found.', 404);
      return;
    }
    sendSuccess(res, { team });
  } catch {
    sendError(res, 'Failed to load team.', 500);
  }
});

// ── Spatial ──
// GET /api/municipal/spatial
router.get('/spatial', async (req: AuthRequest, res: Response) => {
  try {
    const spatial = await getMunicipalSpatial({
      category: str(req.query.category),
      severity: str(req.query.severity),
      status: str(req.query.status),
      ward: str(req.query.ward),
    });
    sendSuccess(res, spatial);
  } catch {
    sendError(res, 'Failed to load spatial intelligence.', 500);
  }
});

// ── Analytics ──
// GET /api/municipal/analytics
router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const analytics = await getMunicipalAnalytics();
    sendSuccess(res, { analytics });
  } catch {
    sendError(res, 'Failed to load municipal analytics.', 500);
  }
});

// ── AI Briefs (grounded in real data) ──
// GET /api/municipal/ai/briefs
router.get('/ai/briefs', async (req: AuthRequest, res: Response) => {
  try {
    const analytics = await getMunicipalAnalytics();
    const [reports, clusters, departments, teams] = await Promise.all([
      Report.find().select('title reportNumber status priority analysis createdAt location municipal').sort({ createdAt: -1 }).limit(200).lean(),
      CivicCluster.find().lean(),
      Department.find().lean(),
      Team.find().lean(),
    ]);

    const priorityScore = (r: any) =>
      ({ critical: 95, high: 80, medium: 60, low: 40 } as Record<string, number>)[(r.analysis?.severity || r.priority || 'medium').toLowerCase()] || 60;

    const active = reports.filter((r) => !['Resolved'].includes(r.status));
    const critical = active.filter((r) => priorityScore(r) >= 90);
    const high = active.filter((r) => priorityScore(r) >= 75);
    const topCluster = [...clusters]
      .filter((c: any) => ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'].includes(c.status))
      .sort((a: any, b: any) => (b.priority?.score || 0) - (a.priority?.score || 0))[0];

    const deptBottlenecks = departments
      .map((d) => {
        const activeCount = reports.filter(
          (r) => (r.municipal?.department === d.name || r.analysis?.suggestedDepartment === d.name) && r.status !== 'Resolved'
        ).length;
        return { name: d.name, activeCount };
      })
      .sort((a, b) => b.activeCount - a.activeCount)
      .slice(0, 3);

    const slaRisk = active.filter((r) => {
      const created = new Date(r.createdAt).getTime();
      const target = ({ critical: 4, high: 8, medium: 24, low: 72 } as Record<string, number>)[r.priority || 'medium'] * 3600_000;
      return Date.now() - created > target * 0.75;
    });

    const brief = {
      generatedAt: new Date().toISOString(),
      grounded: true,
      summary: [
        `${critical.length} critical and ${high.length} high-priority issues require attention across ${departments.length} departments.`,
        topCluster
          ? `Top cluster ${topCluster.clusterCode} (${topCluster.title}) at priority ${topCluster.priority?.score || 0}/100 in ${topCluster.ward || 'the city'} with ${topCluster.reportCount || 0} linked reports.`
          : 'No active clusters currently require attention.',
        `${slaRisk.length} issues are at risk of breaching their SLA deadline.`,
        deptBottlenecks.length
          ? `${deptBottlenecks[0].name} carries the heaviest active workload (${deptBottlenecks[0].activeCount} issues).`
          : 'Department workloads are balanced.',
      ],
      criticalIssues: critical.slice(0, 5).map((r) => ({
        id: String(r._id),
        reportNumber: r.reportNumber,
        title: r.title,
        priority: priorityScore(r),
        ward: r.location?.ward || '',
        status: r.status,
      })),
      topCluster: topCluster
        ? {
            clusterCode: topCluster.clusterCode,
            title: topCluster.title,
            category: topCluster.category,
            priority: topCluster.priority?.score || 0,
            ward: topCluster.ward || '',
            locality: topCluster.locality || '',
            reportCount: topCluster.reportCount || 0,
            confirmationCount: topCluster.confirmationCount || 0,
            status: topCluster.status,
          }
        : null,
      slaRiskCount: slaRisk.length,
      slaRiskIssues: slaRisk.slice(0, 5).map((r) => ({
        id: String(r._id),
        reportNumber: r.reportNumber,
        title: r.title,
        ward: r.location?.ward || '',
      })),
      departmentBottlenecks: deptBottlenecks,
      hotspots: [...clusters]
        .filter((c: any) => ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'REOPENED'].includes(c.status))
        .sort((a: any, b: any) => (b.priority?.score || 0) - (a.priority?.score || 0))
        .slice(0, 5)
        .map((c: any) => ({ clusterCode: c.clusterCode, title: c.title, priority: c.priority?.score || 0, ward: c.ward || '' })),
      trends: [
        {
          label: 'New issues (7d)',
          value: analytics.summary.newIssues7d,
          direction: analytics.summary.newIssues7d > 0 ? 'up' : 'flat',
        },
        {
          label: 'Resolution rate',
          value: `${analytics.summary.resolutionRate}%`,
          direction: analytics.summary.resolutionRate >= 60 ? 'up' : 'down',
        },
        {
          label: 'Active clusters',
          value: analytics.summary.activeClusters,
          direction: analytics.summary.activeClusters > 0 ? 'up' : 'flat',
        },
      ],
    };
    sendSuccess(res, { brief });
  } catch {
    sendError(res, 'AI analysis unavailable.', 500);
  }
});

// ── Notifications ──
// GET /api/municipal/notifications
router.get('/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const result = await listMunicipalNotifications(req.user!.userId, num(req.query.page, 1), num(req.query.limit, 30));
    sendSuccess(res, result);
  } catch {
    sendError(res, 'Failed to load notifications.', 500);
  }
});

// PATCH /api/municipal/notifications/:id/read
router.patch('/notifications/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const ok = await markMunicipalNotificationRead(req.user!.userId, req.params.id);
    if (!ok) {
      sendError(res, 'Notification not found.', 404);
      return;
    }
    sendSuccess(res, { read: true });
  } catch {
    sendError(res, 'Failed to update notification.', 500);
  }
});

// PATCH /api/municipal/notifications/read-all
router.patch('/notifications/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await markAllMunicipalNotificationsRead(req.user!.userId);
    sendSuccess(res, { readAll: true });
  } catch {
    sendError(res, 'Failed to update notifications.', 500);
  }
});

// ── Audit log ──
// GET /api/municipal/audit
router.get('/audit', async (req: AuthRequest, res: Response) => {
  try {
    const log = await listAuditLog(num(req.query.limit, 25));
    sendSuccess(res, { log });
  } catch {
    sendError(res, 'Failed to load audit log.', 500);
  }
});

// ── Profile ──
// GET /api/municipal/profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }
    sendSuccess(res, { user: user.toSafeObject() });
  } catch {
    sendError(res, 'Failed to load profile.', 500);
  }
});

// PATCH /api/municipal/profile — editable contact fields only; role/department are never client-settable
router.patch('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }
    const { phone, locality } = req.body || {};
    if (typeof phone === 'string' && phone.trim()) user.phone = phone.trim();
    if (typeof locality === 'string' && locality.trim()) user.locality = locality.trim();
    await user.save();
    sendSuccess(res, { user: user.toSafeObject() });
  } catch {
    sendError(res, 'Failed to update profile.', 500);
  }
});

export default router;
