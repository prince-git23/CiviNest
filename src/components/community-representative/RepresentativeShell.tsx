import React, { useState } from 'react';
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
import { RepresentativeSidebar, RepresentativeSection } from './RepresentativeSidebar';

interface RepresentativeShellProps {
  activeSection: RepresentativeSection;
  onSelectSection: (section: RepresentativeSection) => void;
  children: React.ReactNode;
  communityName?: string;
  wardName?: string;
}

export const RepresentativeShell: React.FC<RepresentativeShellProps> = ({
  activeSection,
  onSelectSection,
  children,
  communityName = 'Green Valley Residency',
  wardName = 'Ward 12, Nagpur',
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
              onClick={() => setSearchOpen(true)}
              className="p-2 text-[#4B5563] hover:text-[#0F1E36] rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => {}}
              className="relative p-2 text-[#4B5563] hover:text-[#0F1E36] rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-full transition-all duration-150 cursor-pointer border border-[#E5E7EB]">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#111827] font-mono hidden sm:block">
                PRINCE
              </span>
              <div className="w-6 h-6 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-xs font-bold">
                <User className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <RepresentativeSidebar
          activeSection={activeSection}
          onSelectSection={onSelectSection}
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
                  onSelectSection(section);
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                autoFocus
                placeholder="Search community issues, members, or reports..."
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
                Quick Navigation
              </div>
              <div className="space-y-1.5">
                {[
                  { text: 'Street Lighting Failure', target: 'issues' as const },
                  { text: 'Community Members List', target: 'members' as const },
                  { text: 'Issue Aggregation Workspace', target: 'aggregation' as const },
                  { text: 'Community Analytics Dashboard', target: 'analytics' as const },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      onSelectSection(item.target);
                    }}
                    className="w-full p-2.5 rounded-lg hover:bg-[#F9FAFB] flex items-center justify-between text-left group transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-[#1F2937] font-medium group-hover:text-[#2563EB]">
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepresentativeShell;
