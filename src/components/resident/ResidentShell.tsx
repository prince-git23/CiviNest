import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Plus,
  ClipboardList,
  Compass,
  MessageSquare,
  TrendingUp,
  User,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  Radio,
  BrainCircuit,
} from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';
import type { AuthenticatedUser } from '../../types';

interface ResidentShellProps {
  authenticatedUser?: AuthenticatedUser;
  onSignOut?: () => void;
}

const NAV_ITEMS = [
  { to: '/resident/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/resident/report', label: 'Report Issue', icon: Plus },
  { to: '/resident/signal-intake', label: 'Signal Intake', icon: Radio, badge: 'AI' },
  { to: '/resident/reports', label: 'My Reports', icon: ClipboardList },
  { to: '/resident/explore', label: 'Explore', icon: Compass, badge: 'Live' },
  { to: '/resident/insights', label: 'Insights', icon: BrainCircuit },
  { to: '/resident/community', label: 'Community', icon: MessageSquare },
  { to: '/resident/impact', label: 'Impact', icon: TrendingUp },
  { to: '/resident/profile', label: 'Profile', icon: User },
];

export const ResidentShell: React.FC<ResidentShellProps> = ({
  authenticatedUser,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const userName = authenticatedUser?.name || 'Resident';
  const userWard = authenticatedUser?.ward || 'Ward 14';
  const userLocality = authenticatedUser?.locality || 'Dharampeth';

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col selection:bg-[#0F1E36] selection:text-white font-sans">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#F3F4F6] text-[#374151] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <NavLink to="/resident/dashboard" className="flex items-center gap-2">
            <CiviNestLogo size={28} showText={true} />
          </NavLink>

          <span className="hidden sm:block text-[#D1D5DB]">|</span>
          <span className="hidden sm:block text-xs font-semibold text-[#6B7280]">
            Resident Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs text-[#6B7280] hover:bg-[#F3F4F6] transition-colors cursor-pointer">
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Search</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] cursor-pointer">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-xs font-bold">
                {userName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[#111827] leading-tight">{userName}</p>
                <p className="text-[10px] text-[#6B7280] leading-tight">{userLocality}</p>
              </div>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[#E5E7EB] shadow-lg z-50 py-2">
                  <div className="px-4 py-2 border-b border-[#F3F4F6]">
                    <p className="text-sm font-semibold text-[#111827]">{userName}</p>
                    <p className="text-xs text-[#6B7280]">{userWard} · {userLocality}</p>
                  </div>
                  <NavLink
                    to="/resident/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </NavLink>
                  <NavLink
                    to="/resident/impact"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Impact Score</span>
                  </NavLink>
                  <div className="border-t border-[#F3F4F6] mt-1 pt-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onSignOut?.();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar (Desktop) ── */}
        <aside className="hidden lg:flex w-60 flex-col justify-between shrink-0 bg-white border-r border-[#E5E7EB] sticky top-16 h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#3B82F6] text-white shadow-sm font-semibold'
                        : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#E5E7EB]">
            <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#374151]">
                  Civic Node Active
                </span>
              </div>
              <p className="text-xs font-semibold text-[#111827]">{userLocality}</p>
              <p className="text-[10px] text-[#6B7280]">{userWard}</p>
            </div>
          </div>
        </aside>

        {/* ── Mobile Drawer ── */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
                <CiviNestLogo size={24} showText={true} />
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-[#F3F4F6] cursor-pointer">
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>
              <nav className="p-4 space-y-1 flex-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-[#3B82F6] text-white font-semibold'
                            : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ResidentShell;
