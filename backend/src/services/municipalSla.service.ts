// ── Municipal SLA Engine ────────────────────────────────────────
// SLA rules are derived from issue priority (configurable). Deadlines
// are computed from the issue's createdAt and the department's target.
// Compliance is calculated from actual timeline timestamps, never
// hardcoded percentages.

export interface SlaRule {
  priority: string;
  targetHours: number;
}

// Default SLA targets by report priority level.
const PRIORITY_SLA_HOURS: Record<string, number> = {
  critical: 4,
  high: 8,
  medium: 24,
  low: 72,
};

export function slaTargetHoursFor(priority: string | undefined, departmentTargetHours?: number): number {
  if (departmentTargetHours && departmentTargetHours > 0) return departmentTargetHours;
  return PRIORITY_SLA_HOURS[(priority || 'medium').toLowerCase()] ?? 24;
}

export interface SlaState {
  targetHours: number;
  deadline: string; // ISO timestamp
  elapsedHours: number;
  remainingHours: number;
  status: 'OK' | 'AT_RISK' | 'BREACHED' | 'COMPLETED';
  breached: boolean;
  atRisk: boolean;
}

export function computeSla(
  createdAt: string | Date | undefined,
  resolvedAt: string | Date | undefined,
  priority: string | undefined,
  departmentTargetHours?: number
): SlaState {
  const start = createdAt ? new Date(createdAt).getTime() : Date.now();
  const end = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  const targetHours = slaTargetHoursFor(priority, departmentTargetHours);
  const targetMs = targetHours * 3600_000;
  const elapsedHours = Math.max(0, (end - start) / 3600_000);

  if (resolvedAt) {
    return {
      targetHours,
      deadline: new Date(start + targetMs).toISOString(),
      elapsedHours,
      remainingHours: Math.max(0, targetHours - elapsedHours),
      status: 'COMPLETED',
      breached: elapsedHours > targetHours,
      atRisk: false,
    };
  }

  const deadline = start + targetMs;
  const remainingMs = deadline - Date.now();
  const remainingHours = Math.max(0, remainingMs / 3600_000);
  const atRisk = remainingHours > 0 && remainingHours <= targetHours * 0.25;
  const breached = remainingMs <= 0;

  return {
    targetHours,
    deadline: new Date(deadline).toISOString(),
    elapsedHours,
    remainingHours,
    status: breached ? 'BREACHED' : atRisk ? 'AT_RISK' : 'OK',
    breached,
    atRisk,
  };
}

// Aggregate compliance across a set of resolved issues: how many
// finished within their SLA target (uses actual resolution timestamps).
export function complianceFromIssues(
  issues: {
    createdAt?: string | Date;
    resolvedAt?: string | Date;
    priority?: string;
    slaTargetHours?: number;
  }[]
): { compliance: number; total: number; withinTarget: number; breached: number } {
  const resolved = issues.filter((i) => i.resolvedAt);
  const withinTarget = resolved.filter(
    (i) => !computeSla(i.createdAt, i.resolvedAt, i.priority, i.slaTargetHours).breached
  ).length;
  return {
    compliance: resolved.length ? Math.round((withinTarget / resolved.length) * 100) : 0,
    total: resolved.length,
    withinTarget,
    breached: resolved.length - withinTarget,
  };
}
