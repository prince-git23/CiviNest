import React, { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationPanel } from './NotificationPanel';
import { getNotificationDestination } from './notificationUtils';
import type { MunicipalNotification } from '../../types';
import type { MunicipalPage } from './MunicipalShell';

interface NotificationBellProps {
  /** Navigate to a municipal page (used when a notification has a destination). */
  onNavigate: (page: MunicipalPage) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const { unreadCount, lastIncoming, clearLastIncoming } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(unreadCount);

  // Subtle badge animation when the unread count increases (new notification).
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setBadgeBump(true);
      const t = setTimeout(() => setBadgeBump(false), 600);
      prevUnreadRef.current = unreadCount;
      return () => clearTimeout(t);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  // Non-intrusive toast when a real-time notification arrives.
  useEffect(() => {
    if (lastIncoming) {
      setToastVisible(true);
      const t = setTimeout(() => {
        setToastVisible(false);
        clearLastIncoming();
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [lastIncoming, clearLastIncoming]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus management: move into the panel when opened, return to the bell when closed.
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => panelRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
    bellRef.current?.focus();
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const handleOpenNotification = (n: MunicipalNotification) => {
    close();
    const destination = getNotificationDestination(n);
    if (destination) onNavigate(destination);
  };

  const badge = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <div className="relative" ref={wrapperRef}>
      {/* ── Bell button ── */}
      <button
        ref={bellRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36]"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            key={`${unreadCount}-${badgeBump ? 'bump' : 'idle'}`}
            className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ${
              badgeBump ? 'animate-badge-pop' : ''
            }`}
          >
            {badge}
          </span>
        )}
      </button>

      {/* ── Popover panel (desktop anchored to bell; mobile near-full-width) ── */}
      {isOpen && (
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label="Notification panel"
          className="fixed inset-x-3 top-16 z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[420px] bg-white rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden outline-none animate-panel-in"
        >
          <NotificationPanel
            variant="popover"
            onOpenNotification={handleOpenNotification}
            onViewAll={() => {
              close();
              onNavigate('notifications');
            }}
          />
        </div>
      )}

      {/* ── Real-time incoming toast (subtle, non-blocking) ── */}
      {toastVisible && lastIncoming && (
        <div className="fixed bottom-6 right-6 z-[60] w-[min(360px,92vw)] bg-[#0F1E36] text-white text-xs font-medium px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-start gap-2.5 animate-toast-in">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse mt-1 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{lastIncoming.title}</p>
            <p className="text-[#CBD5E1] mt-0.5 truncate">{lastIncoming.message}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setToastVisible(false);
              clearLastIncoming();
            }}
            className="text-[#94A3B8] hover:text-white shrink-0 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
