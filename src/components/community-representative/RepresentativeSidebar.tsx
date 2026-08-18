import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  GitMerge,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';

export type RepresentativeSection =
  | 'dashboard'
  | 'issues'
  | 'aggregation'
  | 'members'
  | 'analytics'
  | 'settings'
  | 'support'
  | 'profile'
  | 'notifications';

interface RepresentativeSidebarProps {
  activeSection: RepresentativeSection;
  onSelectSection: (section: RepresentativeSection) => void;
  communityName?: string;
  wardName?: string;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const RepresentativeSidebar: React.FC<RepresentativeSidebarProps> = ({
  activeSection,
  onSelectSection,
  communityName = 'Green Valley Residency',
  wardName = 'Ward 12, Nagpur',
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const menuItems: {
    id: RepresentativeSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'issues', label: 'Community Issues', icon: AlertTriangle },
    { id: 'aggregation', label: 'Issue Aggregation', icon: GitMerge },
    { id: 'members', label: 'Community Members', icon: Users },
    { id: 'analytics', label: 'Community Analytics', icon: BarChart3 },
  ];

  const handleItemClick = (id: RepresentativeSection) => {
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
        {/* Community Representative Badge */}
        <div className="bg-gradient-to-r from-[#0F1E36] to-[#1E293B] rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CiviNestLogo size={20} showText={false} />
            <span className="text-xs font-semibold uppercase tracking-wider text-white/90">
              Community Representative
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <MapPin className="w-3 h-3" />
            <span>{wardName}</span>
          </div>
        </div>

        {/* Navigation Menu */}
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
                        : 'bg-[#E5E7EB] text-[#4B5563]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <ChevronRight className="w-4 h-4 text-white/80" />
                )}
              </button>
            );
          })}
        </div>

        {/* Community Status Box */}
        <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#374151]">
              Community Active
            </span>
          </div>
          <p className="text-xs font-semibold text-[#111827] truncate">{communityName}</p>
          <p className="text-[11px] text-[#6B7280] truncate">428 residents · 74 active contributors</p>
        </div>
      </div>

      {/* Bottom Utility Links */}
      <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
        {(
          [
            { id: 'settings' as const, label: 'Settings', icon: Settings },
            { id: 'support' as const, label: 'Support Center', icon: HelpCircle },
          ]
        ).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#3B82F6] text-white shadow-sm font-semibold'
                  : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform duration-150 ${
                  isActive ? 'text-white' : 'text-[#6B7280]'
                }`}
              />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 text-white/80 ml-auto" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default RepresentativeSidebar;
