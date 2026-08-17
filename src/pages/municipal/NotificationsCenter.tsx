import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationPanel } from '../../components/municipal-new/NotificationPanel';
import { getNotificationDestination } from '../../components/municipal-new/notificationUtils';
import type { MunicipalNotification } from '../../types';
import type { MunicipalPage } from '../../components/municipal-new/MunicipalShell';

interface NotificationsCenterProps {
  /** Navigate to a municipal page when a notification has a destination. */
  onNavigate: (page: MunicipalPage) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({ onNavigate }) => {
  const { unreadCount } = useNotifications();

  const handleOpen = (n: MunicipalNotification) => {
    const destination = getNotificationDestination(n);
    if (destination) onNavigate(destination);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Notifications</h1>
          <p className="text-sm text-[#6B7280] mt-1">Municipal operations and civic activity updates.</p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[11px] font-semibold text-red-700">{unreadCount} unread</span>
          </span>
        )}
      </div>

      {/* ── Shared Notification Panel (same state as the header bell) ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <NotificationPanel variant="page" onOpenNotification={handleOpen} />
      </div>
    </div>
  );
};

export default NotificationsCenter;
