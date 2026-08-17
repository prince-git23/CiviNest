import React, { useState } from 'react';
import { Search, Bell, HelpCircle, User, Check, X, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';

interface DashboardHeaderProps {
  activeTab: 'home' | 'explore' | 'reports' | 'community' | 'impact';
  onSelectTab: (tab: 'home' | 'explore' | 'reports' | 'community' | 'impact') => void;
  userName: string;
  onOpenReportModal: () => void;
  onNavigateLanding?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  onSelectTab,
  userName,
  onOpenReportModal,
  onNavigateLanding,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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

  const navLinks: { id: 'home' | 'explore' | 'reports' | 'community' | 'impact'; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'reports', label: 'My Reports' },
    { id: 'community', label: 'Community' },
    { id: 'impact', label: 'Impact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all duration-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Context */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                if (onNavigateLanding) onNavigateLanding();
                else onSelectTab('home');
              }}
              className="flex items-center group cursor-pointer"
              aria-label="CiviNest Home"
            >
              <CiviNestLogo size={28} />
            </button>

            {/* Top Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-[13.5px] font-medium text-[#4B5563]">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onSelectTab(link.id)}
                    className={`relative py-1.5 transition-colors duration-150 hover:text-[#0F1E36] cursor-pointer ${
                      isActive ? 'text-[#0F1E36] font-semibold' : ''
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0F1E36] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-[#4B5563] hover:text-[#0F1E36] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
              aria-label="Search civic reports"
              title="Search reports, wards & signals"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
                className="relative p-2 text-[#4B5563] hover:text-[#0F1E36] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-[#FBFBFA]" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
                        onClick={() => setNotificationsOpen(false)}
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
                      onClick={() => {
                        setNotificationsOpen(false);
                        onSelectTab('reports');
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
            <button
              onClick={() => setHelpOpen(true)}
              className="p-2 text-[#4B5563] hover:text-[#0F1E36] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
              aria-label="Civic intelligence help"
              title="Help & Support"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User Profile Pill */}
            <div className="relative ml-1">
              <button
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-full transition-all duration-150 cursor-pointer border border-[#E5E7EB]"
                aria-label="User menu"
              >
                <span className="text-xs font-semibold tracking-wider uppercase text-[#111827] font-mono">
                  {userName.toUpperCase() || 'PRINCE'}
                </span>
                <div className="w-6 h-6 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-[#F3F4F6]">
                    <p className="text-xs font-semibold text-[#111827]">{userName || 'Prince'}</p>
                    <p className="text-[11px] text-[#6B7280]">Verified Resident · Dharampeth</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onSelectTab('impact');
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-[#374151] hover:bg-[#F9FAFB] flex items-center justify-between"
                    >
                      <span>Civic Impact Score</span>
                      <span className="text-[10px] font-mono bg-blue-50 text-[#2563EB] px-1.5 py-0.5 rounded">
                        420 pts
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onSelectTab('reports');
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-[#374151] hover:bg-[#F9FAFB]"
                    >
                      My Filings & History
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onOpenReportModal();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-[#2563EB] font-medium hover:bg-blue-50"
                    >
                      + File New Report
                    </button>
                  </div>

                  <div className="border-t border-[#F3F4F6] pt-1">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        if (onNavigateLanding) onNavigateLanding();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-[#DC2626] hover:bg-red-50"
                    >
                      Switch to Public Platform
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
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
                onClick={() => setSearchOpen(false)}
                className="p-1 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-72 overflow-y-auto text-left">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280] mb-2">
                Suggested Searches
              </div>
              <div className="space-y-1.5">
                {[
                  { tag: 'Issue', text: 'Streetlight outside Gate 2 (#CV-8821)' },
                  { tag: 'Ward', text: 'Dharampeth Sector 14 Drainage' },
                  { tag: 'Action', text: 'Main Ave Pothole Resurfacing Schedule' },
                  { tag: 'AI Cluster', text: 'Monsoon Water Pressure Drop pattern' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchOpen(false);
                      onSelectTab('explore');
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E5E7EB] p-6 text-left relative">
            <button
              onClick={() => setHelpOpen(false)}
              className="absolute top-4 right-4 p-1 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#111827]">Resident Dashboard Help</h3>
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

export default DashboardHeader;
