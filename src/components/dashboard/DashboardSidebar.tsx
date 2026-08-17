import React from 'react';
import {
  LayoutGrid,
  Compass,
  ClipboardList,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export type DashboardViewSection = 'overview' | 'map' | 'filings' | 'discussions' | 'impact';

interface DashboardSidebarProps {
  activeSection: DashboardViewSection;
  onSelectSection: (section: DashboardViewSection) => void;
  localityName?: string;
  wardName?: string;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeSection,
  onSelectSection,
  localityName = 'Green Valley Residency',
  wardName = 'Dharampeth',
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const menuItems: {
    id: DashboardViewSection;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutGrid,
    },
    {
      id: 'map',
      label: 'Map Explorer',
      icon: Compass,
      badge: 'Live',
    },
    {
      id: 'filings',
      label: 'My Filings',
      icon: ClipboardList,
      badge: '3',
    },
    {
      id: 'discussions',
      label: 'Discussions',
      icon: MessageSquare,
    },
    {
      id: 'impact',
      label: 'Impact Score',
      icon: TrendingUp,
    },
  ];

  const handleItemClick = (id: DashboardViewSection) => {
    onSelectSection(id);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  return (
    <aside
      className={`w-64 flex flex-col justify-between transition-all duration-200 ${
        isMobileDrawer ? 'h-full bg-[#FBFBFA] p-4' : 'hidden lg:flex shrink-0 p-5 sticky top-16 h-[calc(100vh-4rem)]'
      }`}
    >
      {/* Top Menu Items */}
      <div className="space-y-6">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-[#3B82F6] text-white shadow-sm font-semibold'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
                }`}
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
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'bg-[#E5E7EB] text-[#4B5563]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Civic Node Quick Status Box */}
        <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#374151]">
              Civic Node Active
            </span>
          </div>
          <p className="text-xs font-semibold text-[#111827] truncate">{localityName}</p>
          <p className="text-[11px] text-[#6B7280] truncate">{wardName} · Sensor Mesh 99.4%</p>
        </div>
      </div>

      {/* Bottom Node Telemetry & Municipal Link */}
      <div className="pt-4 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] mb-1">
          <span>Telemetry Mesh</span>
          <span className="text-[#10B981] font-semibold">ONLINE</span>
        </div>
        <div className="text-[11px] text-[#4B5563]">
          Municipal Response Time: <strong className="text-[#111827]">~4.2 hrs</strong>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
