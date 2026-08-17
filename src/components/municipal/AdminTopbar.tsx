import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  User,
  Shield,
  Activity,
  Radio,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ExternalLink,
  ChevronDown,
  X,
  Menu,
  Sparkles,
} from 'lucide-react';
import { municipalService, CityAssetSearchResult } from '../../services/municipalService';
import { MunicipalSystemStatusData } from '../../types';

interface AdminTopbarProps {
  systemStatus?: MunicipalSystemStatusData;
  userName?: string;
  userRole?: string;
  userOrganization?: string;
  onOpenMobileMenu?: () => void;
  onSelectSearchResult?: (result: CityAssetSearchResult) => void;
  onSignOut?: () => void;
  onSwitchRole?: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  systemStatus = {
    status: 'Operational',
    latencyMs: 24,
    uptimePercentage: 99.98,
    activeMeshNodes: 148,
    totalMeshNodes: 148,
    lastHeartbeat: 'Live — 4s ago',
    telemetryStreamActive: true,
  },
  userName = 'Admin User',
  userRole = 'Municipal Director',
  userOrganization = 'Central HQ',
  onOpenMobileMenu,
  onSelectSearchResult,
  onSignOut,
  onSwitchRole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityAssetSearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const mockNotifications = [
    {
      id: 'alert-1',
      type: 'critical',
      title: 'Water Main Line Rupture Escalated',
      desc: 'WT-4492 in Downtown District crossed 1,200 affected households threshold.',
      time: '12m ago',
      unread: true,
    },
    {
      id: 'alert-2',
      type: 'sla',
      title: 'SLA Breach Warning — West Access Road',
      desc: 'RD-3048 road subsidence is now overdue by 25 minutes without assigned contractor.',
      time: '24m ago',
      unread: true,
    },
    {
      id: 'alert-3',
      type: 'cluster',
      title: 'New Spatial Cluster Synthesized',
      desc: 'Drainage Culvert 4B aggregated 18 corroborating signals from Ward 8.',
      time: '48m ago',
      unread: false,
    },
  ];

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  // Handle outside clicks to close popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 0) {
      const results = municipalService.searchCityAssets(val);
      setSearchResults(results);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const handleSelectResult = (result: CityAssetSearchResult) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (onSelectSearchResult) {
      onSelectSearchResult(result);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Drawer Trigger & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Global Search Bar */}
          <div className="relative flex-1" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-[#6B7280] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setIsSearchOpen(true);
                }}
                placeholder="Search city assets..."
                className="w-full pl-9.5 pr-8 py-2 bg-[#F3F4F6] hover:bg-[#EBEEF2] focus:bg-white text-sm text-[#111827] placeholder-[#6B7280] rounded-full border border-transparent focus:border-[#94A3B8] focus:ring-2 focus:ring-[#0F1E36]/10 transition-all font-sans outline-hidden shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Autocomplete Dropdown */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280] font-mono">
                  <span>SEARCH RESULTS ({searchResults.length})</span>
                  <span className="text-[11px] text-[#9CA3AF]">ESC to close</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelectResult(item)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-start justify-between gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-[#0F1E36]/5 text-[#0F1E36] border border-[#0F1E36]/10">
                              {item.code}
                            </span>
                            <h4 className="text-xs font-semibold text-[#111827] truncate group-hover:text-[#2563EB]">
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-[#6B7280] truncate">{item.location}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.meta}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No matching civic assets, issues, or departments found for "{searchQuery}".
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Command Elements */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* 1. Live System Status Indicator */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] hover:border-slate-300 text-xs font-mono text-[#374151] shadow-2xs transition-all cursor-pointer"
              title="System Status: Operational. Click for telemetry details."
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium whitespace-nowrap">
                System: <strong className="text-[#111827] font-semibold">{systemStatus.status}</strong>
              </span>
            </button>

            {statusMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-[#111827]">Municipal Grid Status</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 font-semibold">ALL OPERATIONAL</span>
                </div>

                <div className="space-y-2.5 py-3 text-xs text-[#4B5563]">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Telemetry Mesh Latency:</span>
                    <strong className="font-mono text-[#111827]">{systemStatus.latencyMs} ms</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">System Availability SLA:</span>
                    <strong className="font-mono text-[#111827]">{systemStatus.uptimePercentage}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Active IoT Grid Nodes:</span>
                    <strong className="font-mono text-[#111827]">
                      {systemStatus.activeMeshNodes} / {systemStatus.totalMeshNodes}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Heartbeat Sync:</span>
                    <span className="text-[11px] text-slate-500">{systemStatus.lastHeartbeat}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                  AI Sentinel active on Nagpur municipal feeder clusters.
                </div>
              </div>
            )}
          </div>

          {/* 2. Notifications Bell Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-full bg-white border border-[#E5E7EB] hover:border-slate-300 text-[#4B5563] hover:text-[#111827] transition-all shadow-2xs cursor-pointer"
              aria-label="Municipal notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111827]">Operations Alerts</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">
                      {unreadCount} CRITICAL
                    </span>
                  </div>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-[11px] text-[#2563EB] hover:underline"
                  >
                    Mark read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {mockNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 text-xs transition-colors ${
                        notif.unread ? 'bg-amber-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-[#111827]">{notif.title}</span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-[#4B5563] leading-relaxed">{notif.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Administrator Identity Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer text-left"
            >
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-[#111827] leading-tight">{userName}</p>
                <p className="text-[10px] font-mono text-[#6B7280] leading-tight">{userOrganization}</p>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center shadow-xs font-mono font-semibold text-xs border border-white/20">
                <User className="w-4 h-4" />
              </div>
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-[#111827]">{userName}</p>
                  <p className="text-[11px] font-mono text-[#2563EB]">{userRole}</p>
                  <p className="text-[10px] text-slate-400">{userOrganization}</p>
                </div>

                <div className="py-1 space-y-0.5">
                  {onSwitchRole && (
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onSwitchRole();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-[#374151] hover:text-[#111827] hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#6B7280]" />
                      <span>Switch Role Context</span>
                    </button>
                  )}

                  {onSignOut && (
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
