
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

// ─── Service ─────────────────────────────────────────────────────
// Backend-driven: every method calls the authenticated municipal API.
// The subscription uses a polling fallback (no fabricated events).
export const notificationService = {
  async getNotifications(_userId?: string): Promise<MunicipalNotification[]> {
    const { getMunicipalNotifications } = await import('./municipalApi');
    const data = await getMunicipalNotifications(1, 50);
    return data.notifications.map((n) => ({
      id: n.id,
      type: n.type as MunicipalNotificationType,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp,
      read: n.read,
      priority: n.priority as MunicipalNotificationPriority,
      relatedIssueId: n.relatedIssueId,
      relatedWardId: n.relatedWardId,
      relatedDepartmentId: n.relatedDepartmentId,
    }));
  },

  async getUnreadCount(): Promise<number> {
    const { getMunicipalNotifications } = await import('./municipalApi');
    const data = await getMunicipalNotifications(1, 1);
    return data.unreadCount;
  },

  async markNotificationRead(id: string): Promise<void> {
    const { markMunicipalNotificationRead } = await import('./municipalApi');
    await markMunicipalNotificationRead(id);
  },

  async markAllNotificationsRead(): Promise<void> {
    const { markAllMunicipalNotificationsRead } = await import('./municipalApi');
    await markAllMunicipalNotificationsRead();
  },

  async deleteNotification(id: string): Promise<void> {
    // No backend delete endpoint; read-state only.
    void id;
  },

  /**
   * Polling fallback for live updates. Emits only notifications that
   * actually exist in the backend feed (newest unseen item). No fake
   * events are generated.
   */
  subscribeToNotifications(onNotification: (n: MunicipalNotification) => void): () => void {
    let seen = new Set<string>();
    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      try {
        const { getMunicipalNotifications } = await import('./municipalApi');
        const data = await getMunicipalNotifications(1, 10);
        for (const n of data.notifications) {
          if (!seen.has(n.id)) {
            seen.add(n.id);
            if (seen.size > 1) {
              // Emit only genuinely new items (skip the first backfill batch).
              onNotification({
                id: n.id,
                type: n.type as MunicipalNotificationType,
                title: n.title,
                message: n.message,
                timestamp: n.timestamp,
                read: n.read,
                priority: n.priority as MunicipalNotificationPriority,
                relatedIssueId: n.relatedIssueId,
                relatedWardId: n.relatedWardId,
                relatedDepartmentId: n.relatedDepartmentId,
              });
            }
          }
        }
      } catch {
        // Backend unavailable — silently skip; the UI shows its own state.
      }
    };

    void poll();
    const interval = setInterval(poll, 60_000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  },
};

export default notificationService;

