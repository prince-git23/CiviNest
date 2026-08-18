import { MunicipalAudit } from '../models/MunicipalAudit.js';

export type AuditAction =
  | 'ISSUE_ASSIGNED'
  | 'TEAM_ASSIGNED'
  | 'PRIORITY_OVERRIDDEN'
  | 'DEPARTMENT_CHANGED'
  | 'STATUS_CHANGED'
  | 'WORK_STARTED'
  | 'WORK_COMPLETED'
  | 'RESOLUTION_SUBMITTED'
  | 'ISSUE_REOPENED'
  | 'RESOLUTION_VERIFIED';

export async function recordAudit(entry: {
  actorId: string;
  actorName: string;
  action: AuditAction;
  entityId: string;
  entityLabel?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}): Promise<void> {
  await MunicipalAudit.create(entry);
}

export async function listAuditLog(limit = 25): Promise<any[]> {
  const entries = await MunicipalAudit.find().sort({ timestamp: -1 }).limit(limit).lean();
  return entries.map((e) => ({
    id: String(e._id),
    actorId: String(e.actorId),
    actor: e.actorName,
    action: e.action,
    target: e.entityLabel || e.entityId,
    entityId: e.entityId,
    previousValue: e.previousValue,
    newValue: e.newValue,
    reason: e.reason,
    date: e.timestamp ? new Date(e.timestamp).toISOString() : '',
  }));
}
