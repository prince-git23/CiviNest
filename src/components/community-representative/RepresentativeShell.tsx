import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Bell,
  User,
  Menu,
  X,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';
import { ProfileDropdown } from '../common/ProfileDropdown';
import { NotificationPanel } from '../common/NotificationPanel';
import { RepresentativeSidebar, RepresentativeSection } from './RepresentativeSidebar';
import type { AuthenticatedUser, PortalId } from '../../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../../types';
import type { NotificationItem } from '../../services/notificationService';
import { getUnreadCount } from '../../services/notificationService';

interface RepresentativeShellProps {
  activeSection: RepresentativeSection;
  onSelectSection: (section: RepresentativeSection) => void;
  children: React.ReactNode;
  communityName?: string;
  wardName?: string;
  authenticatedUser?: AuthenticatedUser;
  notifications: NotificationItem[];
  onSelectNotification: (notification: NotificationItem) => void;
  onMarkAllNotificationsRead: () => void;
  onViewAllNotifications: () => void;
  onSignOut?: () => void;
}

interface SearchEntry {
  tag: string;
  text: string;
  section: RepresentativeSection;
}

const SEARCH_ENTRIES: SearchEntry[] = [
  { tag: 'Issue', text: 'Street Lighting Failure (CIV-2026-014)', section: 'issues' },
  { tag: 'Issue', text: 'Drainage Overflow (CIV-2026-019)', section: 'issues' },
  { tag: 'Issue', text: 'Road Damage (CIV-2026-023)', section: 'issues' },
  { tag: 'Issue', text: 'Water Pressure Drop (CIV-2026-028)', section: 'issues' },
  { tag: 'Issue', text: 'Waste Collection Delay (CIV-2026-031)', section: 'issues' },
  { tag: 'Category', text: 'Infrastructure issues', section: 'issues' },
  { tag: 'Category', text: 'Sanitation issues', section: 'issues' },
  { tag: 'Location', text: 'Sector 14 — Elm Street', section: 'issues' },
  { tag: 'Location', text: 'West Access Road', section: 'issues' },
  { tag: 'Members', text: 'Community Members List', section: 'members' },
  { tag: 'Navigation', text: 'Community Dashboard', section: 'dashboard' },
  { tag: 'Navigation', text: 'Issue Aggregation Workspace', section: 'aggregation' },
  { tag: 'Navigation', text: 'Community Analytics Dashboard', section: 'analytics' },
  { tag: 'Navigation', text: 'Settings', section: 'settings' },
  { tag: 'Navigation', text: 'Support Center', section: 'support' },
  { tag: 'Navigation', text: 'All Notifications', section: 'notifications' },
];

export const RepresentativeShell: React.FC<RepresentativeShellProps> = ({
  activeSection,
  onSelectSection,
  children,
  communityName = 'Green Valley Residency',
  wardName = 'Ward 12, Nagpur',
  authenticatedUser,
  notifications,
  onSelectNotification,
  onMarkAllNotificationsRead,
  onViewAllNotifications,
  onSignOut,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const unreadCount = getUnreadCount(notifications);

  // Role-aware profile user. Falls back to a representative identity when the
  // session user is not a community_rep (e.g. entered via the resident portal).
  // The ward/locality always reflect the portal context (Ward 12, Nagpur).
  const repUser: AuthenticatedUser = useMemo(() => {
    const portalWard = wardName.split(',')[0].trim() || 'Ward 12';
    if (
      authenticatedUser &&
      (authenticatedUser.role === 'community_rep' || authenticatedUser.hasCommunityRepRole)
    ) {
      return {
        ...authenticatedUser,
        currentPortal: 'community' as PortalId,
        ward: portalWard,
        city: 'Nagpur',
        locality: communityName,
      };
    }
    return {
      id: 'rep-default',
      name: 'Prince',
      email: 'prince.yadav@email.com',
      role: 'community_rep',
      permissions: ROLE_DEFAULT_PERMISSIONS.community_rep,
      locality: communityName,
      ward: portalWard,
      city: 'Nagpur',
      currentPortal: 'community',
      hasCommunityRepRole: true,
      impactScore: 420,
    };
  }, [authenticatedUser, communityName, wardName]);

  // Close overlays on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotificationsOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    if (!notificationsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  const closeOverlays = () => {
    setNotificationsOpen(false);
    setSearchOpen(false);
  };

  const handleSectionSelect = (section: RepresentativeSection) => {
    closeOverlays();
    onSelectSection(section);
  };

  const handleSelectNotification = (notification: NotificationItem) => {
    setNotificationsOpen(false);
    onSelectNotification(notification);
  };

  const filteredSearch = SEARCH_ENTRIES.filter((entry) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return entry.text.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 text-[#4B5563] hover:text-[#0F1E36] rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <CiviNestLogo size={28} />
          </div>

          {/* Center: Community Location */}
          <div className="hidden md:flex items-center gap-2 text-sm text-[#4B5563]">
            <MapPin className="w-4 h-4 text-[#2563EB]" />
            <span className="font-medium">{communityName}</span>
            <span className="text-[#9CA3AF]">·</span>
            <span className="text-[#6B7280]">{wardName}</span>
            <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
          </div>

          {/* Right: Search, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(false);
                setSearchOpen(true);
              }}
              className="p-2 text-[#4B5563] hover:text-[#0F1E36] rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setNotificationsOpen(!notificationsOpen);
                }}
                className="relative p-2 text-[#4B5563] hover:text-[#0F1E36] rounded-lg hover:bg-gray-100 cursor-pointer"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {notificationsOpen && (
                <NotificationPanel
                  notifications={notifications}
                  onSelect={handleSelectNotification}
                  onMarkAllRead={onMarkAllNotificationsRead}
                  onViewAll={() => {
                    setNotificationsOpen(false);
                    onViewAllNotifications();
                  }}
                />
              )}
            </div>

            {/* Profile — shared role-aware dropdown */}
            <ProfileDropdown
              user={repUser}
              hideResidentActions
              hidePublicPlatformSwitch
              avatarIcon={<User className="w-3.5 h-3.5" />}
              onNavigateToProfile={() => handleSectionSelect('profile')}
              onNavigateToSettings={() => handleSectionSelect('settings')}
              onSignOut={onSignOut}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <RepresentativeSidebar
          activeSection={activeSection}
          onSelectSection={handleSectionSelect}
          communityName={communityName}
          wardName={wardName}
        />

        {/* Mobile Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-black/40 backdrop-blur-sm flex">
            <div className="w-72 bg-[#FBFBFA] h-full shadow-2xl relative">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
              <RepresentativeSidebar
                activeSection={activeSection}
                onSelectSection={(section) => {
                  handleSectionSelect(section);
                  setMobileDrawerOpen(false);
                }}
                communityName={communityName}
                wardName={wardName}
                isMobileDrawer={true}
                onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
              />
            </div>
            <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#E5E7EB] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                autoFocus
                placeholder="Search issues, issue IDs, categories, locations, or members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none text-[#111827] placeholder:text-[#9CA3AF]"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-gray-100 cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-72 overflow-y-auto text-left">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280] mb-2">
                {searchQuery.trim() ? 'Search Results' : 'Quick Navigation'}
              </div>
              {filteredSearch.length > 0 ? (
                <div className="space-y-1.5">
                  {filteredSearch.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        handleSectionSelect(item.section);
                      }}
                      className="w-full p-2.5 rounded-lg hover:bg-[#F9FAFB] flex items-center justify-between text-left group transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-[#F3F4F6] text-[#4B5563] rounded">
                          {item.tag}
                        </span>
                        <span className="text-xs text-[#1F2937] font-medium group-hover:text-[#2563EB]">
                          {item.text}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B7280] py-3">
                  No results for “{searchQuery.trim()}”. Try an issue title, ID, category, or location.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepresentativeShell;
