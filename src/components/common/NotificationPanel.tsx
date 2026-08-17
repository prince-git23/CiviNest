import React from 'react';
import {
  Bell,
  Building2,
  Users,
  GitMerge,
  CheckCircle2,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';
import type { NotificationItem } from '../../services/notificationService';
import { getUnreadCount } from '../../services/notificationService';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />,
  Users: <Users className="w-3.5 h-3.5 text-[#10B981]" />,
  GitMerge: <GitMerge className="w-3.5 h-3.5 text-[#8B5CF6]" />,
  CheckCircle2: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
};

function getTypeIcon(type: string): React.ReactNode {
  const map: Record<string, string> = {
    municipal: 'Building2',
    community: 'Users',
    cluster: 'GitMerge',
    resolution: 'CheckCircle2',
  };
  return TYPE_ICONS[map[type]] || <Bell className="w-3.5 h-3.5 text-[#9CA3AF]" />;
}

// ─── Shared notification list (used by popover and full page) ────────────────

interface NotificationListProps {
  notifications: NotificationItem[];
  onSelect: (notification: NotificationItem) => void;
  maxHeightClass?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onSelect,
  maxHeightClass = 'max-h-80',
}) => {
  if (notifications.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <Bell className="w-6 h-6 text-[#D1D5DB] mx-auto mb-2" />
        <p className="text-xs text-[#6B7280]">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className={`divide-y divide-[#F3F4F6] overflow-y-auto ${maxHeightClass}`}>
      {notifications.map((item) => (
        <div
          key={item.id}
          className={`p-3.5 hover:bg-[#F9FAFB] transition-colors cursor-pointer text-left ${
            !item.read ? 'bg-[#F0FDF4]/40' : ''
          }`}
          onClick={() => onSelect(item)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="mt-0.5 shrink-0">{getTypeIcon(item.type)}</div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-[#111827] leading-snug">{item.title}</h4>
                <p className="text-[11.5px] text-[#4B5563] mt-1 leading-relaxed">{item.message}</p>
              </div>
            </div>
            {!item.read && (
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0 mt-1.5" aria-label="Unread" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 ml-6">
            <span className="text-[10px] text-[#9CA3AF]">{item.timestamp}</span>
            {item.relatedIssueId && (
              <span className="text-[10px] font-mono text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded">
                {item.relatedIssueId}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Popover panel (bell trigger) ────────────────────────────────────────────

interface NotificationPanelProps {
  notifications: NotificationItem[];
  onSelect: (notification: NotificationItem) => void;
  onMarkAllRead: () => void;
  onViewAll: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onSelect,
  onMarkAllRead,
  onViewAll,
}) => {
  const unreadCount = getUnreadCount(notifications);

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
      <div className="px-4 pb-2.5 border-b border-[#F3F4F6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="text-[11px] font-mono font-medium text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      <NotificationList notifications={notifications} onSelect={onSelect} />

      <div className="px-4 pt-2.5 border-t border-[#F3F4F6]">
        <button
          type="button"
          onClick={onViewAll}
          className="w-full flex items-center justify-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer py-0.5"
        >
          View All Notifications
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;
