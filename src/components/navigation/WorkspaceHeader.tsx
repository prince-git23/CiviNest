import React, { useState } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  User,
  Plus,
  X,
  ExternalLink,
  Sparkles,
  Check,
  MapPin,
  Shield,
  LogOut,
  Compass,
  FileText,
  Users,
  Award,
  Home,
} from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';
import { NavigationLink } from './NavigationLink';
import { NavigationAction } from './NavigationAction';

export type WorkspaceTabId = 'home' | 'explore' | 'reports' | 'community' | 'impact';

export interface WorkspaceHeaderProps {
  activeTab: WorkspaceTabId;
  onSelectTab: (tab: WorkspaceTabId) => void;
  userName?: string;
  userWard?: string;
  impactPoints?: number;
  onOpenReportModal: () => void;
  onNavigateToCreateSignal?: () => void;
  onNavigateLanding?: () => void;
  onSignOut?: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  activeTab,
  onSelectTab,
  userName = 'Prince',
  userWard = 'Dharampeth Ward 14',
  impactPoints = 420,
  onOpenReportModal,
  onNavigateToCreateSignal,
  onNavigateLanding,
  onSignOut,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications = [
    {
      id: 'n1',
      title: 'Road Repair Verification Request',
      time: '12m ago',
      unread: true,
      desc: 'Municipal crew completed patching on West Access Road. Confirm resolution?',
    },
    {
      id: 'n2',
      title: 'AI Signal Cluster Alert',
      time: '1h ago',
      unread: true,
      desc: '4 nearby neighbors reported streetlight flickering on Lane 3.',
    },
    {
      id: 'n3',
      title: 'Civic Impact Milestone',
      time: 'Yesterday',
      unread: false,
      desc: 'You reached +420 Impact points and unlocked the Signal Contributor badge.',
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const navLinks: { id: WorkspaceTabId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'explore', label: 'Explore', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'reports', label: 'My Reports', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'community', label: 'Community', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'impact', label: 'Impact', icon: <Award className="w-3.5 h-3.5" /> },
  ];

  const handleTabClick = (tab: WorkspaceTabId) => {
    setMobileMenuOpen(false);
    onSelectTab(tab);
  };

  const handleCreateReportClick = () => {
    setProfileMenuOpen(false);
    if (onNavigateToCreateSignal) {
      onNavigateToCreateSignal();
    } else {
      onOpenReportModal();
    }
  };

  return (
    <>
      <header
        id="workspace-header"
        className="sticky top-0 z-40 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all duration-200"
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Resident Navigation Items */}
          <div className="flex items-center gap-6 lg:gap-8">
            <button
              type="button"
              onClick={() => handleTabClick('home')}
              className="flex items-center group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36] rounded-lg p-0.5"
              aria-label="CiviNest Resident Workspace Home"
            >
              <CiviNestLogo size={28} />
            </button>

            {/* Top Workspace Navigation Tabs */}
            <nav
              className="hidden md:flex items-center gap-5 lg:gap-6 text-[13.5px] font-medium"
              aria-label="Resident Workspace Navigation"
            >
              {navLinks.map((link) => (
                <NavigationLink
                  key={link.id}
                  label={link.label}
                  isActive={activeTab === link.id}
                  onClick={() => handleTabClick(link.id)}
                  ariaLabel={`Go to ${link.label}`}
                />
              ))}
            </nav>
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Action: File Civic Signal */}
            <button
              type="button"
              onClick={handleCreateReportClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Create new civic signal"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>Report Issue</span>
            </button>

            {/* Search Trigger */}
            <NavigationAction
              variant="icon"
              icon={<Search className="w-4 h-4" />}
              onClick={() => setSearchOpen(true)}
              ariaLabel="Search civic reports and signals"
              title="Search reports, wards & signals"
            />

            {/* Notification Center */}
            <div className="relative">
              <NavigationAction
                variant="icon"
                icon={<Bell className="w-4 h-4" />}
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
                ariaLabel="View civic notifications"
                title="Notifications"
                badge={unreadCount > 0 ? unreadCount : undefined}
              />

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <div className="px-4 pb-2.5 border-b border-[#F3F4F6] flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
                      Civic Notifications
                    </span>
                    <span className="text-[11px] font-mono font-medium text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  </div>

                  <div className="divide-y divide-[#F3F4F6] max-h-80 overflow-y-auto">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 hover:bg-[#F9FAFB] transition-colors cursor-pointer text-left ${
                          item.unread ? 'bg-[#F0FDF4]/40' : ''
                        }`}
                        onClick={() => {
                          setNotificationsOpen(false);
                          handleTabClick('reports');
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-[#111827]">{item.title}</h4>
                          <span className="text-[10px] text-[#9CA3AF] whitespace-nowrap">{item.time}</span>
                        </div>
                        <p className="text-[11.5px] text-[#4B5563] mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 pt-2.5 border-t border-[#F3F4F6] text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        handleTabClick('reports');
                      }}
                      className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
                    >
                      View all civic activity →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Help / Guide */}
            <NavigationAction
              variant="icon"
              icon={<HelpCircle className="w-4 h-4" />}
              onClick={() => setHelpOpen(true)}
              ariaLabel="Civic intelligence help guide"
              title="Help & Support"
            />

            {/* User Profile Pill */}
            <div className="relative ml-1">
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-full transition-all duration-150 cursor-pointer border border-[#E5E7EB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36]"
                aria-label="User account menu"
                aria-expanded={profileMenuOpen}
              >
                <span className="text-xs font-semibold tracking-wider uppercase text-[#111827] font-mono">
                  {userName.toUpperCase()}
                </span>
                <div className="w-6 h-6 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <div className="px-4 py-2 border-b border-[#F3F4F6]">
                    <p className="text-xs font-semibold text-[#111827]">{userName}</p>
                    <p className="text-[11px] text-[#6B7280] truncate">{userWard}</p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleTabClick('impact');
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-[#374151] hover:bg-[#F9FAFB] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        <span>Civic Impact Score</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#2563EB] px-1.5 py-0.5 rounded">
                        {impactPoints} pts
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleTabClick('reports');
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-[#374151] hover:bg-[#F9FAFB] flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>My Filings & History</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCreateReportClick}
                      className="w-full px-4 py-2 text-left text-xs text-[#2563EB] font-medium hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>File New Civic Signal</span>
                    </button>
                  </div>

                  <div className="border-t border-[#F3F4F6] pt-1">
                    {onNavigateLanding && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onNavigateLanding();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-[#4B5563] hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>Switch to Public Platform</span>
                      </button>
                    )}

                    {onSignOut && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-[#DC2626] hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#4B5563] hover:text-[#0F1E36] rounded-lg hover:bg-gray-100 cursor-pointer"
                aria-label="Toggle workspace navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Home className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E5E7EB] px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-5 gap-1 text-center">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleTabClick(link.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      isActive
                        ? 'bg-[#0F1E36] text-white'
                        : 'text-[#4B5563] hover:bg-slate-100'
                    }`}
                  >
                    {link.icon}
                    <span className="text-[10px] mt-1">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Global Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                autoFocus
                placeholder="Search civic reports, ward issues, or categories (e.g. 'streetlights', 'Dharampeth', '#CV-8821')..."
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
                Suggested Civic Queries
              </div>
              <div className="space-y-1.5">
                {[
                  { tag: 'Issue', text: 'Streetlight outside Gate 2 (#CV-8821)', target: 'reports' as const },
                  { tag: 'Spatial', text: 'Dharampeth Sector 14 Drainage Map', target: 'explore' as const },
                  { tag: 'Action', text: 'Main Ave Pothole Resurfacing Schedule', target: 'reports' as const },
                  { tag: 'AI Cluster', text: 'Monsoon Water Pressure Drop pattern', target: 'explore' as const },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      handleTabClick(item.target);
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
                    <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E5E7EB] p-6 text-left relative">
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="absolute top-4 right-4 p-1 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Close help"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#111827]">Resident Workspace Guide</h3>
            </div>

            <p className="text-xs text-[#4B5563] leading-relaxed mb-4">
              CiviNest acts as your personal civic intelligence center. You can report neighborhood issues, track their municipal escalation in real time, view local AI pattern detection, and monitor neighborhood civic health.
            </p>

            <div className="space-y-2.5 text-xs text-[#374151] mb-5">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Spatial 3D Map:</strong> Hover and click pins to inspect live neighborhood issues and road repair work orders.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Civic Health Index:</strong> Calculated algorithmically from sensor feeds, verified reports, and resolution turnaround.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Quick Actions:</strong> File issues using camera photos, voice descriptions, or GPS coordinates.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="w-full bg-[#0F1E36] hover:bg-[#1E293B] text-white py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Got it, continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkspaceHeader;
