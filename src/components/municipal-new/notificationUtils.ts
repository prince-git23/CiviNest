import type {
  MunicipalNotification,
  MunicipalNotificationFilter,
  MunicipalNotificationPriority,
  MunicipalNotificationType,
} from '../../types';
import type { MunicipalPage } from './MunicipalShell';

export function getNotificationDestination(notification: MunicipalNotification): MunicipalPage | null {
  switch (notification.type) {
    case 'ISSUE_ASSIGNED':
    case 'CRITICAL_ISSUE':
    case 'SLA_WARNING':
    case 'SLA_BREACH':
    case 'ISSUE_UPDATED':
    case 'COMMUNITY_ESCALATION':
      return 'issue-triage';
    case 'RESIDENT_CONFIRMATION':
      return 'resolution-verification';
    case 'SYSTEM':
      return 'command-center';
    default:
      return null;
  }
}

export const NOTIFICATION_FILTER_GROUPS: Record<
  Exclude<MunicipalNotificationFilter, 'all' | 'unread'>,
  MunicipalNotificationType[]
> = {
  issues: ['ISSUE_ASSIGNED', 'CRITICAL_ISSUE', 'SLA_WARNING', 'SLA_BREACH', 'ISSUE_UPDATED'],
  operations: ['RESIDENT_CONFIRMATION', 'COMMUNITY_ESCALATION'],
  system: ['SYSTEM'],
};

export const NOTIFICATION_FILTER_LABELS: Record<MunicipalNotificationFilter, string> = {
  all: 'All',
  unread: 'Unread',
  issues: 'Issues',
  operations: 'Operations',
  system: 'System',
};

export const NOTIFICATION_PRIORITY_META: Record<
  MunicipalNotificationPriority,
  { iconBg: string; iconColor: string }
> = {
  CRITICAL: { iconBg: 'bg-red-50', iconColor: 'text-red-600' },
  HIGH: { iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  MEDIUM: { iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  LOW: { iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
};

export const NOTIFICATION_TYPE_LABELS: Record<MunicipalNotificationType, string> = {
  ISSUE_ASSIGNED: 'Assignment',
  CRITICAL_ISSUE: 'Critical',
  SLA_WARNING: 'SLA',
  SLA_BREACH: 'SLA',
  ISSUE_UPDATED: 'Update',
  RESIDENT_CONFIRMATION: 'Verification',
  COMMUNITY_ESCALATION: 'Escalation',
  SYSTEM: 'System',
};

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

export type NotificationGroupKey = 'today' | 'yesterday' | 'older';

export function getNotificationGroup(iso: string): NotificationGroupKey {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const t = new Date(iso).getTime();
  if (t >= startOfToday) return 'today';
  if (t >= startOfYesterday) return 'yesterday';
  return 'older';
}

export const NOTIFICATION_GROUP_LABELS: Record<NotificationGroupKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  older: 'Older',
};
