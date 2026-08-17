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
