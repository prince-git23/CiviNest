import React, { useMemo, useState } from 'react';
import {
  BellOff,
  ClipboardList,
  AlertTriangle,
  Clock,
  AlertOctagon,
  RefreshCw,
  UserCheck,
  Users,
  Database,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import type {
  MunicipalNotification,
  MunicipalNotificationFilter,
  MunicipalNotificationType,
} from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import {
  NOTIFICATION_FILTER_GROUPS,
  NOTIFICATION_FILTER_LABELS,
  NOTIFICATION_GROUP_LABELS,
  NOTIFICATION_PRIORITY_META,
  NOTIFICATION_TYPE_LABELS,
  getNotificationGroup,
  timeAgo,
  type NotificationGroupKey,
} from './notificationUtils';

interface NotificationPanelProps {
  variant: 'popover' | 'page';
  /** Called after the notification is marked read; parent decides navigation. */
  onOpenNotification: (notification: MunicipalNotification) => void;
  /** Popover footer link to the full notification center. */
  onViewAll?: () => void;
}

const TYPE_ICONS: Record<MunicipalNotificationType, LucideIcon> = {
  ISSUE_ASSIGNED: ClipboardList,
  CRITICAL_ISSUE: AlertTriangle,
  SLA_WARNING: Clock,
  SLA_BREACH: AlertOctagon,
  ISSUE_UPDATED: RefreshCw,
  RESIDENT_CONFIRMATION: UserCheck,
  COMMUNITY_ESCALATION: Users,
  SYSTEM: Database,
};

const FILTERS_POPOVER: MunicipalNotificationFilter[] = ['all', 'issues', 'operations', 'system'];
const FILTERS_PAGE: MunicipalNotificationFilter[] = ['all', 'unread', 'issues', 'operations', 'system'];

const GROUP_ORDER: NotificationGroupKey[] = ['today', 'yesterday', 'older'];

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ variant, onOpenNotification, onViewAll }) => {
  const { notifications, unreadCount, isLoading, error, markAllAsRead, openNotification, refreshNotifications } =
    useNotifications();
  const [filter, setFilter] = useState<MunicipalNotificationFilter>('all');

  const filters = variant === 'page' ? FILTERS_PAGE : FILTERS_POPOVER;

  const filtered = useMemo(() => {
    let list = notifications;
    if (filter === 'unread') {
      list = list.filter((n) => !n.read);
    } else if (filter !== 'all') {
      const allowed = NOTIFICATION_FILTER_GROUPS[filter];
      list = list.filter((n) => allowed.includes(n.type));
    }
    return [...list].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, filter]);

  const groups = useMemo(
    () =>
      GROUP_ORDER.map((key) => ({
        key,
        items: filtered.filter((n) => getNotificationGroup(n.timestamp) === key),
      })).filter((g) => g.items.length > 0),
    [filtered]
  );

  const handleOpen = (n: MunicipalNotification) => {
    openNotification(n.id); // mark read immediately (shared state)
    onOpenNotification(n);
  };

  return (
    <div className="flex flex-col">
      {/* ── Header (popover only; the page renders its own title) ── */}
      {variant === 'popover' && (
        <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#111827]">Notifications</span>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
            >
              Mark all read
            </button>
          ) : (
            <span className="text-[11px] text-[#9CA3AF]">All caught up</span>
          )}
        </div>
      )}

      {/* ── Filter tabs + (page) mark-all-as-read ── */}
      <div className="px-4 py-2.5 border-b border-[#F3F4F6] flex items-center justify-between gap-3">
        <div className="flex items-center gap-1" role="group" aria-label="Filter notifications">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-[#1E293B] text-white'
                  : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
              }`}
            >
              {NOTIFICATION_FILTER_LABELS[f]}
            </button>
          ))}
        </div>
        {variant === 'page' && unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer whitespace-nowrap"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* ── Body ── */}
      {isLoading && notifications.length === 0 ? (
        <div className={variant === 'popover' ? 'max-h-[360px] overflow-y-auto' : ''} aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse">
              <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] shrink-0" />
              <div className="flex-1 space-y-2 py-0.5">
                <div className="h-3 w-2/3 rounded bg-[#F3F4F6]" />
                <div className="h-2.5 w-full rounded bg-[#F3F4F6]" />
                <div className="h-2 w-1/3 rounded bg-[#F3F4F6]" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center px-6">
          <p className="text-sm font-semibold text-[#374151]">Unable to load notifications</p>
          <p className="text-xs text-[#6B7280] mt-1">Please try again.</p>
          <button
            type="button"
            onClick={() => void refreshNotifications()}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E293B] rounded-lg hover:bg-[#0F172A] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : groups.length === 0 ? (
        <div className="py-12 flex flex-col items-center text-center px-6">
          <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center">
            <BellOff className="w-5 h-5 text-[#9CA3AF]" />
          </div>
          <p className="text-sm font-semibold text-[#374151] mt-3">You&rsquo;re all caught up</p>
          <p className="text-xs text-[#6B7280] mt-1">No new municipal notifications.</p>
        </div>
      ) : (
        <div className={variant === 'popover' ? 'max-h-[360px] overflow-y-auto' : ''}>
          {groups.map((group) => (
            <div key={group.key}>
              <div className="px-4 pt-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
                {NOTIFICATION_GROUP_LABELS[group.key]}
              </div>
              {group.items.map((n) => (
                <NotificationRow key={n.id} notification={n} onOpen={handleOpen} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Footer (popover only) ── */}
      {variant === 'popover' && onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="w-full py-2.5 border-t border-[#F3F4F6] text-xs font-medium text-[#2563EB] hover:bg-[#F9FAFB] hover:text-[#1D4ED8] flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          View all notifications
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

// ── Single notification row ──

interface NotificationRowProps {
  notification: MunicipalNotification;
  onOpen: (notification: MunicipalNotification) => void;
}

const NotificationRow: React.FC<NotificationRowProps> = ({ notification: n, onOpen }) => {
  const Icon = TYPE_ICONS[n.type];
  const priority = NOTIFICATION_PRIORITY_META[n.priority];

  return (
    <button
      type="button"
      onClick={() => onOpen(n)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer group ${
        n.read ? 'bg-white hover:bg-[#F9FAFB]' : 'bg-[#F1F5F9]/70 hover:bg-[#F1F5F9]'
      }`}
    >
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${priority.iconBg}`}>
        <Icon className={`w-4 h-4 ${priority.iconColor}`} />
      </span>

      <span className="flex-1 min-w-0">
        <span className="flex items-start justify-between gap-2">
          <span
            className={`text-xs leading-snug ${
              n.read ? 'text-[#374151] font-medium' : 'text-[#111827] font-semibold'
            }`}
          >
            {n.title}
          </span>
          <span className="text-[10px] text-[#9CA3AF] whitespace-nowrap mt-0.5 shrink-0">{timeAgo(n.timestamp)}</span>
        </span>

        <span
          className={`block text-[11.5px] mt-1 leading-relaxed ${
            n.read ? 'text-[#6B7280]' : 'text-[#4B5563]'
          }`}
        >
          {n.message}
        </span>

        <span className="flex items-center gap-2 mt-2">
          <span
            className={`inline-flex items-center text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB] ${
              n.read ? '' : 'group-hover:bg-[#E5E7EB]'
            }`}
          >
            {NOTIFICATION_TYPE_LABELS[n.type]}
          </span>
          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" aria-label="Unread" />}
        </span>
      </span>
    </button>
  );
};

export default NotificationPanel;
