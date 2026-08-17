import React from 'react';
import {
  LayoutGrid,
  Map,
  BarChart3,
  Building2,
  Settings,
  Users,
  ChevronRight,
  ShieldCheck,
  Radio,
  ExternalLink,
  X,
} from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';

export type AdminNavTab = 'dashboard' | 'city-map' | 'analytics' | 'departments' | 'settings';

interface AdminSidebarProps {
  activeTab: AdminNavTab;
  onSelectTab: (tab: AdminNavTab) => void;
  onSwitchToCitizenView?: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onSwitchToCitizenView,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const navItems: {
    id: AdminNavTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
    },
    {
      id: 'city-map',
      label: 'City Map',
      icon: Map,
      badge: 'Live',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      badge: '5 Units',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (id: AdminNavTab) => {
    onSelectTab(id);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  return (
    <aside
      className={`flex flex-col justify-between transition-all duration-200 ${
        isMobileDrawer
          ? 'h-full w-72 bg-[#FBFBFA] p-5 shadow-2xl border-r border-[#E5E7EB]'
          : 'hidden lg:flex w-64 shrink-0 bg-[#FBFBFA] border-r border-[#E5E7EB] p-5 sticky top-0 h-screen overflow-y-auto'
      }`}
      aria-label="Municipal Command Sidebar"
    >
      {/* Top Header & Brand */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden group cursor-pointer"
          >
            <CiviNestLogo size={30} showText={true} />
          </button>

          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Close sidebar drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Command Scope Badge */}
        <div className="px-3 py-1.5 bg-[#0F1E36]/5 rounded-lg border border-[#0F1E36]/10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0F1E36]">
            Municipal Command Node
          </span>
        </div>

        {/* Main Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-[#2B3B52] text-white shadow-md font-semibold'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-150 ${
                      isActive ? 'text-white' : 'text-[#6B7280] group-hover:text-[#111827]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Live'
                        ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
                        : 'bg-[#E5E7EB] text-[#4B5563]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sector Telemetry & Perspective Switcher */}
      <div className="pt-6 space-y-4 border-t border-[#E5E7EB]">
        {/* Real-time Telemetry Status */}
        <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#6B7280] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-500" />
              Sensor Mesh
            </span>
            <span className="text-emerald-700 font-semibold">100% ONLINE</span>
          </div>
          <p className="text-xs font-semibold text-[#111827]">Nagpur Metropolitan Region</p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Central Dispatch HQ · 148 Nodes</p>
        </div>

        {/* Perspective Switcher */}
        {onSwitchToCitizenView && (
          <button
            onClick={onSwitchToCitizenView}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0F1E36] rounded-xl text-xs font-medium transition-colors group cursor-pointer border border-slate-200"
          >
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#0F1E36]" />
              <span>Switch to Citizen View</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
