import React, { useState } from 'react';
import {
  LayoutGrid,
  AlertTriangle,
  Map,
  Building2,
  CheckCircle2,
  Sparkles,
  Users,
  Search,
  HelpCircle,
  X,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';
import { ProfileDropdown } from '../common/ProfileDropdown';
import { NotificationBell } from './NotificationBell';
import type { AuthenticatedUser } from '../../types';

export type MunicipalPage =
  | 'command-center'
  | 'issue-triage'
  | 'spatial-intelligence'
  | 'departments'
  | 'resolution-verification'
  | 'ai-briefs-analytics'
  | 'teams-ward-mgmt'
  | 'notifications';

interface MunicipalShellProps {
  activePage: MunicipalPage;
  onSelectPage: (page: MunicipalPage) => void;
  onSwitchToCitizenView?: () => void;
  authenticatedUser?: AuthenticatedUser;
  children: React.ReactNode;
}

const navItems: {
  id: MunicipalPage;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'command-center', label: 'Command Center', icon: LayoutGrid },
  { id: 'issue-triage', label: 'Issue Triage', icon: AlertTriangle },
  { id: 'spatial-intelligence', label: 'Spatial Intelligence', icon: Map },
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'resolution-verification', label: 'Resolution & Verification', icon: CheckCircle2 },
  { id: 'ai-briefs-analytics', label: 'AI Briefs & Analytics', icon: Sparkles },
  { id: 'teams-ward-mgmt', label: 'Teams & Ward Mgmt', icon: Users },
];

export const MunicipalShell: React.FC<MunicipalShellProps> = ({
  activePage,
  onSelectPage,
  onSwitchToCitizenView,
  authenticatedUser,
  children,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavClick = (id: MunicipalPage) => {
    onSelectPage(id);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans antialiased text-[#111827]">
      {/* ── Mobile Overlay ── */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-64 h-full bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent
              activePage={activePage}
              onSelectPage={handleNavClick}
              onSwitchToCitizenView={onSwitchToCitizenView}
              onClose={() => setMobileDrawerOpen(false)}
              isMobile
              authenticatedUser={authenticatedUser}
            />
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-[#E5E7EB] sticky top-0 h-screen flex-col">
        <SidebarContent
          activePage={activePage}
          onSelectPage={handleNavClick}
          onSwitchToCitizenView={onSwitchToCitizenView}
          authenticatedUser={authenticatedUser}
        />
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Top Header Bar ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile menu + Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 min-w-0">
                <h1 className="text-sm font-semibold tracking-wide text-[#374151] uppercase whitespace-nowrap">
                  Municipal Operations
                </h1>
                <span className="text-[#D1D5DB]">|</span>
                <span className="text-sm font-semibold text-[#374151] whitespace-nowrap">
                  Nagpur
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-emerald-700">Operational</span>
                </span>
              </div>
            </div>

            {/* Right: Search + Icons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search GIS or records..."
                  className="w-56 lg:w-64 pl-9 pr-3 py-2 text-sm bg-[#F3F4F6] border border-transparent focus:border-[#D1D5DB] focus:bg-white rounded-lg text-[#111827] placeholder-[#9CA3AF] outline-none transition-all"
                />
              </div>

              {/* Notification Bell — opens the shared notification panel */}
              <NotificationBell onNavigate={onSelectPage} />

              {/* AI Assistant */}
              <button className="p-2 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors">
                <Sparkles className="w-5 h-5" />
              </button>

              {/* Shared Profile Dropdown */}
              {authenticatedUser ? (
                <ProfileDropdown
                  user={authenticatedUser}
                  onNavigateToMunicipal={() => onSelectPage('command-center')}
                  onNavigateToMyFilings={() => onSelectPage('issue-triage')}
                  onNavigateToNotifications={() => onSelectPage('notifications')}
                  onSignOut={onSwitchToCitizenView}
                />
              ) : (
                <button className="p-2 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors">
                  <HelpCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// ── Sidebar Content (Shared between desktop and mobile) ──

interface SidebarContentProps {
  activePage: MunicipalPage;
  onSelectPage: (page: MunicipalPage) => void;
  onSwitchToCitizenView?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
  authenticatedUser?: AuthenticatedUser;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  activePage,
  onSelectPage,
  onSwitchToCitizenView,
  onClose,
  isMobile = false,
  authenticatedUser,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between">
        <button
          onClick={() => onSelectPage('command-center')}
          className="flex items-center gap-2 focus:outline-none"
        >
          <CiviNestLogo size={28} showText={true} />
        </button>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-[#1E293B] text-white'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#9CA3AF]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom: Officer Info — always from the authenticated session */}
      <div className="p-4 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-xs font-semibold">
            {authenticatedUser?.name ? authenticatedUser.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() : 'MO'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#111827] truncate">{authenticatedUser?.name || 'Municipal Officer'}</p>
            <p className="text-xs text-[#6B7280]">
              {[authenticatedUser?.ward, authenticatedUser?.city].filter(Boolean).join(' • ') || 'Municipal Operations'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MunicipalShell;
