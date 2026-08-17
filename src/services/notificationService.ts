
/**
 * Notification Service — Community Representative Portal
 *
 * Single boundary for notification data. Today this is mock/demo data persisted
 * locally (read-state only). When a live backend becomes available, replace the
 * `loadNotifications` / `saveNotifications` internals while keeping the shape.
 */
import type { RepresentativeSection } from '../components/community-representative/RepresentativeSidebar';

export type NotificationType = 'municipal' | 'community' | 'cluster' | 'resolution' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  /** Issue / section this notification points to inside the portal */
  relatedIssueId?: string;
  relatedSection?: RepresentativeSection;
}

const STORAGE_KEY = 'civinet_rep_notifications';

const defaultNotifications: NotificationItem[] = [
  {
    id: 'ntf-1',
    title: 'Municipality responded to: Streetlight Failure',
    message: 'Electricity department acknowledged CIV-2026-014 and dispatched a crew to Elm Street.',
    type: 'municipal',
    timestamp: '8 min ago',
    read: false,
    relatedIssueId: 'CIV-2026-014',
    relatedSection: 'issues',
  },
  {
    id: 'ntf-2',
    title: '3 residents confirmed: Water Supply Issue',
    message: 'Independent confirmations received for low pressure in Block B Apartments.',
    type: 'community',
    timestamp: '42 min ago',
    read: false,
    relatedIssueId: 'CIV-2026-028',
    relatedSection: 'issues',
  },
  {
    id: 'ntf-3',
    title: 'Issue cluster updated: Road Damage',
    message: 'Cluster for West Access Road potholes grew to 18 reports with 12 confirmations.',
    type: 'cluster',
    timestamp: '2h ago',
    read: false,
    relatedIssueId: 'CIV-2026-023',
    relatedSection: 'aggregation',
  },
  {
    id: 'ntf-4',
    title: 'Resolution verified: Waste Collection Delay',
    message: 'Resident confirmed resolution for the Lane 4 waste collection issue.',
    type: 'resolution',
    timestamp: 'Yesterday',
    read: true,
    relatedIssueId: 'CIV-2026-031',
    relatedSection: 'issues',
  },
  {
    id: 'ntf-5',
    title: 'New contributor joined the community',
    message: 'A Green Valley resident started contributing civic signals this week.',
    type: 'system',
    timestamp: '2 days ago',
    read: true,
    relatedSection: 'members',
  },
];

/**
 * Load notifications — returns locally persisted state if available,
 * otherwise the demo set. Read state only; notification feed itself is mock.
 */
export function loadNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultNotifications.map((n) => ({ ...n }));
    const parsed = JSON.parse(raw) as NotificationItem[];
    if (!Array.isArray(parsed)) return defaultNotifications.map((n) => ({ ...n }));
    return parsed;
  } catch {
    return defaultNotifications.map((n) => ({ ...n }));
  }
}

/** Persist read-state locally so the badge survives reloads. */
export function saveNotifications(items: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private mode etc.) — state simply stays in memory.
  }
}

export function markNotificationRead(items: NotificationItem[], id: string): NotificationItem[] {
  return items.map((n) => (n.id === id ? { ...n, read: true } : n));
}

export function markAllNotificationsRead(items: NotificationItem[]): NotificationItem[] {
  return items.map((n) => (n.read ? n : { ...n, read: true }));
}

export function getUnreadCount(items: NotificationItem[]): number {
  return items.filter((n) => !n.read).length;
}

export function getNotificationTypeIcon(type: NotificationType): string {
  switch (type) {
    case 'municipal':
      return 'Building2';
    case 'community':
      return 'Users';
    case 'cluster':
      return 'GitMerge';
    case 'resolution':
      return 'CheckCircle2';
    default:
      return 'Bell';
  }
}

// ============================================================
// CiviNest — Municipal Notification Service
// ------------------------------------------------------------
// Data flow:
//   UI → Notification Context → notificationService → API / WebSocket → Backend
//
// Currently the service serves realistic demo data so the full
// notification system is usable end-to-end. When the backend is
// available, only the methods below need to be re-pointed at the
// real API — no component code changes required.
// ============================================================

import type { MunicipalNotification, MunicipalNotificationPriority, MunicipalNotificationType } from '../types';

// ─── Time helpers for demo data (relative timestamps stay fresh) ───
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const hoursAgo = (h: number) => minutesAgo(h * 60);
const daysAgo = (d: number) => hoursAgo(d * 24);

// ─── Demo notifications ──────────────────────────────────────────
// Structure is identical to the future API payload. Replace this
// array with `getNotifications()` fetching from the backend.
export const demoNotifications: MunicipalNotification[] = [
  {
    id: 'ntf-001',
    type: 'CRITICAL_ISSUE',
    title: 'Critical issue requires attention',
    message: 'Water pipeline failure reported in Ward 14 requires municipal review.',
    timestamp: minutesAgo(2),
    read: false,
    priority: 'CRITICAL',
    relatedIssueId: 'civ-2026-014',
    relatedWardId: 'Ward 14',
    relatedDepartmentId: 'Water Supply',
  },
  {
    id: 'ntf-002',
    type: 'SLA_WARNING',
    title: 'SLA deadline approaching',
    message: 'Road damage complaint #CN-2048 has 4 hours remaining.',
    timestamp: minutesAgo(18),
    read: false,
    priority: 'HIGH',
    relatedIssueId: 'civ-2026-016',
    relatedWardId: 'Ward 22',
    relatedDepartmentId: 'Roads & Transport',
  },
  {
    id: 'ntf-003',
    type: 'ISSUE_ASSIGNED',
    title: 'Issue assigned',
    message: 'Streetlight failure in Dharampeth has been assigned to Electrical Maintenance.',
    timestamp: hoursAgo(1),
    read: false,
    priority: 'MEDIUM',
    relatedIssueId: 'civ-2026-019',
    relatedWardId: 'Ward 14',
    relatedDepartmentId: 'Electrical Operations',
  },
  {
    id: 'ntf-004',
    type: 'RESIDENT_CONFIRMATION',
    title: 'Resolution verification received',
    message: 'A resident reported that issue #CN-2018 is still unresolved.',
    timestamp: hoursAgo(2),
    read: false,
    priority: 'HIGH',
    relatedIssueId: 'civ-2026-020',
    relatedWardId: 'Ward 12',
    relatedDepartmentId: 'Drainage',
  },
  {
    id: 'ntf-005',
    type: 'COMMUNITY_ESCALATION',
    title: 'Community escalation',
    message: 'Drainage issue has been escalated by the community representative.',
    timestamp: hoursAgo(3),
    read: true,
    priority: 'HIGH',
    relatedIssueId: 'civ-2026-018',
    relatedWardId: 'Ward 22',
    relatedDepartmentId: 'Drainage',
  },
  {
    id: 'ntf-006',
    type: 'ISSUE_UPDATED',
    title: 'Issue status updated',
    message: 'Drainage complaint #CN-2048 is now marked In Progress.',
    timestamp: hoursAgo(5),
    read: true,
    priority: 'MEDIUM',
    relatedIssueId: 'civ-2026-018',
    relatedWardId: 'Ward 22',
    relatedDepartmentId: 'Drainage',
  },
  {
    id: 'ntf-007',
    type: 'SLA_BREACH',
    title: 'SLA breached',
    message: 'Road damage complaint #CN-1984 exceeded its resolution deadline.',
    timestamp: daysAgo(1),
    read: true,
    priority: 'HIGH',
    relatedIssueId: 'civ-2026-016',
    relatedWardId: 'Ward 08',
    relatedDepartmentId: 'Roads & Transport',
  },
  {
    id: 'ntf-008',
    type: 'SYSTEM',
    title: 'GIS data synchronized',
    message: 'Ward boundary data was successfully synchronized.',
    timestamp: daysAgo(1),
    read: true,
    priority: 'LOW',
    relatedWardId: 'Ward 14',
  },
  {
    id: 'ntf-009',
    type: 'SYSTEM',
    title: 'Sanitation fleet report',
    message: '3 garbage collection vehicles are offline for maintenance in the northern district.',
    timestamp: daysAgo(2),
    read: true,
    priority: 'LOW',
    relatedDepartmentId: 'Sanitation & Waste',
  },
];

// ─── Notifications pushed later by the demo real-time stream ───
// These mirror the events the backend will emit over WebSocket/SSE.
const demoStream: { type: MunicipalNotificationType; title: string; message: string; priority: MunicipalNotificationPriority; relatedIssueId?: string; relatedWardId?: string }[] = [
  {
    type: 'ISSUE_ASSIGNED',
    title: 'New issue assigned',
    message: 'Water main break in Ward 14 has been assigned to Water Supply.',
    priority: 'MEDIUM',
    relatedIssueId: 'civ-2026-014',
    relatedWardId: 'Ward 14',
  },
  {
    type: 'CRITICAL_ISSUE',
    title: 'Critical issue detected',
    message: 'Exposed electrical wire reported near the primary school in Ward 14.',
    priority: 'CRITICAL',
    relatedIssueId: 'civ-2026-017',
    relatedWardId: 'Ward 14',
  },
  {
    type: 'SLA_WARNING',
    title: 'SLA deadline approaching',
    message: 'Sewer overflow complaint #CN-2062 has 1 hour remaining.',
    priority: 'HIGH',
    relatedIssueId: 'civ-2026-018',
    relatedWardId: 'Ward 22',
  },
  {
    type: 'SYSTEM',
    title: 'Operational report ready',
    message: 'Morning operational summary for all departments is ready to review.',
    priority: 'LOW',
  },
];

const clone = (list: MunicipalNotification[]) => list.map((n) => ({ ...n }));

// ─── Service ─────────────────────────────────────────────────────
// Every method is async and returns a Promise so the real backend
// can be plugged in without changing the context or UI layer.
export const notificationService = {
  /**
   * Fetch the full notification list for an authenticated user.
   * @param userId Backend-ready; the demo ignores it but per-user
   *               scoping will happen server-side.
   */
  async getNotifications(_userId?: string): Promise<MunicipalNotification[]> {
    // Simulated latency so the loading skeleton is visible. Remove
    // once a real API endpoint exists.
    await new Promise((resolve) => setTimeout(resolve, 700));
    return clone(demoNotifications);
  },

  async getUnreadCount(): Promise<number> {
    return demoNotifications.filter((n) => !n.read).length;
  },

  async markNotificationRead(id: string): Promise<void> {
    // TODO: POST /notifications/:id/read when backend is available.
    void id;
  },

  async markAllNotificationsRead(): Promise<void> {
    // TODO: POST /notifications/read-all when backend is available.
  },

  async deleteNotification(id: string): Promise<void> {
    // TODO: DELETE /notifications/:id when backend is available.
    void id;
  },

  /**
   * Subscribe to real-time notification events.
   *
   * Demo implementation: emits sample notifications on a fixed
   * interval to exercise the full pipeline (state update → unread
   * badge → toast). Replace the internals with a WebSocket / SSE
   * connection (or polling fallback) when the backend is live.
   *
   * Expected backend events:
   *   NOTIFICATION_CREATED, NOTIFICATION_READ, NOTIFICATION_ALL_READ,
   *   ISSUE_ASSIGNED, CRITICAL_ISSUE_CREATED, SLA_WARNING, SLA_BREACH,
   *   RESIDENT_VERIFICATION, COMMUNITY_ESCALATION
   */
  subscribeToNotifications(onNotification: (n: MunicipalNotification) => void): () => void {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= demoStream.length) {
        clearInterval(interval);
        return;
      }
      const item = demoStream[index];
      index += 1;
      onNotification({
        id: `ntf-live-${Date.now()}-${index}`,
        type: item.type,
        title: item.title,
        message: item.message,
        timestamp: new Date().toISOString(),
        read: false,
        priority: item.priority,
        relatedIssueId: item.relatedIssueId,
        relatedWardId: item.relatedWardId,
      });
    }, 90_000);

    return () => clearInterval(interval);
  },
};

export default notificationService;

