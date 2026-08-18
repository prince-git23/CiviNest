import { Report } from '../models/Report.js';
import { Department } from '../models/Department.js';
import { Team } from '../models/Team.js';
import { User } from '../models/User.js';
import { recordAudit } from './municipalAudit.service.js';
import { createMunicipalNotification } from './municipalNotification.service.js';

// ── Status transition guard ─────────────────────────────────────
// Canonical lifecycle shared across portals:
//   Under Review → Assigned → In Progress → Verification → Resolved
//   Resolved → Reopened → In Progress
const VALID_TRANSITIONS: Record<string, string[]> = {
  'Under Review': ['Assigned', 'In Progress'],
  Assigned: ['In Progress', 'Under Review'],
  'In Progress': ['Verification', 'Assigned', 'Reopened'],
  Verification: ['Resolved', 'Reopened'],
  Resolved: ['Reopened'],
  Reopened: ['In Progress', 'Assigned'],
};

export function canTransition(from: string, to: string): boolean {
  if (from === to) return true;
  return (VALID_TRANSITIONS[from] || []).includes(to);
}

async function actorName(officerId: string): Promise<string> {
  const user = await User.findById(officerId).select('name').lean();
  return user?.name || 'Municipal Officer';
}

function pushTimeline(report: any, status: string, note: string, actor: string) {
  report.timeline = report.timeline || [];
  report.timeline.push({
    status,
    timestamp: new Date().toISOString(),
    note,
    actor,
  });
}

export interface AssignInput {
  departmentId?: string;
  teamId?: string;
  priorityOverride?: string;
  reason?: string;
  notes?: string;
}

export async function assignIssue(officerId: string, issueId: string, input: AssignInput): Promise<{ report: any; assigned: boolean; department?: string; team?: string }> {
  const report = await Report.findById(issueId);
  if (!report) throw Object.assign(new Error('Issue not found.'), { status: 404 });

  const actor = await actorName(officerId);

  if (input.priorityOverride) {
    const levels = ['low', 'medium', 'high', 'critical'];
    if (!levels.includes(input.priorityOverride.toLowerCase())) {
      throw Object.assign(new Error('Invalid priority override.'), { status: 400 });
    }
    const previous = report.priority;
    if (previous !== input.priorityOverride.toLowerCase()) {
      report.priority = input.priorityOverride.toLowerCase() as any;
      report.markModified('priority');
      report.municipal = report.municipal || {};
      report.municipal.priorityOverrides = report.municipal.priorityOverrides || [];
      report.municipal.priorityOverrides.push({
        previous,
        new: input.priorityOverride.toLowerCase(),
        officer: actor,
        officerId,
        reason: input.reason || 'Priority override during triage',
        timestamp: new Date().toISOString(),
      });
      await recordAudit({
        actorId: officerId,
        actorName: actor,
        action: 'PRIORITY_OVERRIDDEN',
        entityId: String(report._id),
        entityLabel: report.title,
        previousValue: previous,
        newValue: input.priorityOverride.toLowerCase(),
        reason: input.reason,
      });
    }
  }

  let departmentName = report.municipal?.department || report.analysis?.suggestedDepartment || '';
  let departmentId = report.municipal?.departmentId || '';
  let teamName = report.municipal?.team || '';
  let teamId = report.municipal?.teamId || '';

  if (input.departmentId) {
    const dept = await Department.findById(input.departmentId);
    if (!dept) throw Object.assign(new Error('Department not found.'), { status: 404 });
    const prevDept = report.municipal?.department || '';
    departmentName = dept.name;
    departmentId = String(dept._id);
    if (prevDept && prevDept !== departmentName) {
      await recordAudit({
        actorId: officerId,
        actorName: actor,
        action: 'DEPARTMENT_CHANGED',
        entityId: String(report._id),
        entityLabel: report.title,
        previousValue: prevDept,
        newValue: departmentName,
        reason: input.reason,
      });
    }
  }

  if (input.teamId) {
    const team = await Team.findById(input.teamId);
    if (!team) throw Object.assign(new Error('Team not found.'), { status: 404 });
    if (input.departmentId && String(team.departmentId) !== input.departmentId) {
      throw Object.assign(new Error('Team does not belong to the selected department.'), { status: 400 });
    }
    const prevTeam = report.municipal?.team || '';
    teamName = team.name;
    teamId = String(team._id);
    if (prevTeam && prevTeam !== teamName) {
      await recordAudit({
        actorId: officerId,
        actorName: actor,
        action: 'TEAM_ASSIGNED',
        entityId: String(report._id),
        entityLabel: report.title,
        previousValue: prevTeam,
        newValue: teamName,
        reason: input.reason,
      });
    }
  }

  if (departmentName || teamName) {
    report.municipal = report.municipal || {};
    if (departmentName) {
      report.municipal.department = departmentName;
      report.municipal.departmentId = departmentId;
    }
    if (teamName) {
      report.municipal.team = teamName;
      report.municipal.teamId = teamId;
    }
    if (!report.municipal.assignedAt) {
      report.municipal.assignedAt = new Date().toISOString();
      if (report.status === 'Under Review') {
        report.status = 'Assigned' as any;
        pushTimeline(report, 'Assigned', `Issue assigned to ${[departmentName, teamName].filter(Boolean).join(' · ')}.`, actor);
      } else {
        pushTimeline(report, 'Assigned', `Assignment updated to ${[departmentName, teamName].filter(Boolean).join(' · ')}.`, actor);
      }
    } else {
      pushTimeline(report, 'Assigned', `Assignment updated to ${[departmentName, teamName].filter(Boolean).join(' · ')}.`, actor);
    }
    if (input.notes) {
      report.municipal.notes = report.municipal.notes || [];
      report.municipal.notes.push({ text: input.notes, author: actor, authorId: officerId, timestamp: new Date().toISOString() });
    }
    await recordAudit({
      actorId: officerId,
      actorName: actor,
      action: 'ISSUE_ASSIGNED',
      entityId: String(report._id),
      entityLabel: report.title,
      previousValue: report.status === 'Assigned' ? 'Unassigned' : report.status,
      newValue: `${departmentName}${teamName ? ' / ' + teamName : ''}`,
      reason: input.reason,
    });
    await createMunicipalNotification({
      type: 'ISSUE_ASSIGNED',
      title: 'Issue assigned',
      message: `${report.title} (${report.reportNumber}) assigned to ${[departmentName, teamName].filter(Boolean).join(' · ')}.`,
      priority: report.priority === 'critical' ? 'CRITICAL' : report.priority === 'high' ? 'HIGH' : 'MEDIUM',
      relatedIssueId: String(report._id),
      relatedWardId: report.location?.ward,
      relatedDepartmentId: departmentName,
    });
  }

  await report.save();
  return { report, assigned: !!(departmentName || teamName), department: departmentName, team: teamName };
}

export async function startWork(officerId: string, issueId: string, notes?: string): Promise<any> {
  const report = await Report.findById(issueId);
  if (!report) throw Object.assign(new Error('Issue not found.'), { status: 404 });
  if (report.status !== 'Assigned' && report.status !== 'Under Review' && report.status !== 'Reopened') {
    throw Object.assign(new Error(`Cannot start work from status "${report.status}".`), { status: 409 });
  }
  const actor = await actorName(officerId);
  if (!report.municipal?.assignedAt && report.municipal?.department) {
    report.municipal.assignedAt = new Date().toISOString();
  }
  report.status = 'In Progress' as any;
  report.municipal = report.municipal || {};
  report.municipal.inProgressAt = new Date().toISOString();
  pushTimeline(report, 'In Progress', notes || 'Municipal work started on this issue.', actor);
  await recordAudit({
    actorId: officerId,
    actorName: actor,
    action: 'WORK_STARTED',
    entityId: String(report._id),
    entityLabel: report.title,
    newValue: 'In Progress',
    reason: notes,
  });
  await report.save();
  return report;
}

export async function completeWork(officerId: string, issueId: string, notes?: string): Promise<any> {
  const report = await Report.findById(issueId);
  if (!report) throw Object.assign(new Error('Issue not found.'), { status: 404 });
  if (report.status !== 'In Progress') {
    throw Object.assign(new Error(`Cannot complete work from status "${report.status}".`), { status: 409 });
  }
  const actor = await actorName(officerId);
  report.municipal = report.municipal || {};
  report.municipal.workCompletedAt = new Date().toISOString();
  pushTimeline(report, 'Work Completed', notes || 'Municipal work completed. Submitted for resolution verification.', actor);
  await recordAudit({
    actorId: officerId,
    actorName: actor,
    action: 'WORK_COMPLETED',
    entityId: String(report._id),
    entityLabel: report.title,
    previousValue: 'In Progress',
    newValue: 'Work Completed',
    reason: notes,
  });
  await report.save();
  return report;
}

export interface ResolutionInput {
  description: string;
  evidence?: { id: string; url: string; name: string; type: string; size: string }[];
}

export async function submitResolution(officerId: string, issueId: string, input: ResolutionInput): Promise<any> {
  const report = await Report.findById(issueId);
  if (!report) throw Object.assign(new Error('Issue not found.'), { status: 404 });
  if (report.status !== 'In Progress' && report.status !== 'Assigned') {
    throw Object.assign(new Error(`Cannot submit resolution from status "${report.status}".`), { status: 409 });
  }
  if (!input.description || !input.description.trim()) {
    throw Object.assign(new Error('Resolution description is required.'), { status: 400 });
  }
  const actor = await actorName(officerId);
  report.status = 'Verification' as any;
  report.municipal = report.municipal || {};
  report.municipal.resolution = {
    description: input.description.trim(),
    submittedBy: actor,
    submittedById: officerId,
    evidence: input.evidence || [],
    submittedAt: new Date().toISOString(),
  };
  report.municipal.resolutionSubmittedAt = new Date().toISOString();
  pushTimeline(report, 'Verification', 'Resolution submitted. Awaiting resident verification.', actor);
  await report.save();
  await recordAudit({
    actorId: officerId,
    actorName: actor,
    action: 'RESOLUTION_SUBMITTED',
    entityId: String(report._id),
    entityLabel: report.title,
    previousValue: 'In Progress',
    newValue: 'Verification',
    reason: input.description,
  });
  await createMunicipalNotification({
    type: 'RESOLUTION_SUBMITTED',
    title: 'Resolution submitted for verification',
    message: `${report.title} (${report.reportNumber}) has been submitted for resident verification.`,
    priority: 'MEDIUM',
    relatedIssueId: String(report._id),
    relatedWardId: report.location?.ward,
    relatedDepartmentId: report.municipal?.department,
  });
  return report;
}

export async function reopenIssue(officerId: string, issueId: string, reason: string): Promise<any> {
  const report = await Report.findById(issueId);
  if (!report) throw Object.assign(new Error('Issue not found.'), { status: 404 });
  if (!['Resolved', 'Verification'].includes(report.status)) {
    throw Object.assign(new Error(`Cannot reopen from status "${report.status}".`), { status: 409 });
  }
  const actor = await actorName(officerId);
  report.status = 'Reopened' as any;
  pushTimeline(report, 'Reopened', reason || 'Issue reopened for further action.', actor);
  await recordAudit({
    actorId: officerId,
    actorName: actor,
    action: 'ISSUE_REOPENED',
    entityId: String(report._id),
    entityLabel: report.title,
    previousValue: 'Resolved',
    newValue: 'Reopened',
    reason,
  });
  await createMunicipalNotification({
    type: 'ISSUE_REOPENED',
    title: 'Issue reopened',
    message: `${report.title} (${report.reportNumber}) was reopened.`,
    priority: 'HIGH',
    relatedIssueId: String(report._id),
    relatedWardId: report.location?.ward,
    relatedDepartmentId: report.municipal?.department,
  });
  await report.save();
  return report;
}
