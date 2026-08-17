import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { NotificationList } from '../../components/common/NotificationPanel';
import type { NotificationItem } from '../../services/notificationService';
import { getUnreadCount } from '../../services/notificationService';

interface NotificationsPageProps {
  notifications: NotificationItem[];
  onSelect: (notification: NotificationItem) => void;
  onMarkAllRead: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onSelect,
  onMarkAllRead,
}) => {
  const unreadCount = getUnreadCount(notifications);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1E36]" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Notifications
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Community updates, municipal responses, and cluster activity
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#2563EB] hover:bg-[#F3F4F6] transition-colors cursor-pointer w-fit"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#6B7280]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
              All Notifications
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#6B7280]">
            {notifications.length} total · {unreadCount} unread
          </span>
        </div>
        <NotificationList
          notifications={notifications}
          onSelect={onSelect}
          maxHeightClass="max-h-[60vh]"
        />
      </div>
    </div>
  );
};

export default NotificationsPage;
