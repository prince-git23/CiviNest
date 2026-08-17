import React from 'react';
import { LayoutGrid, Sparkles, Users, User, MapPin } from 'lucide-react';

export type MobileTabType = 'hub' | 'insight' | 'civic' | 'me';

interface MobileBottomNavProps {
  activeTab: MobileTabType;
  onSelectTab: (tab: MobileTabType) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToPlatform?: () => void;
  onNavigateToAuth?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab = 'civic',
  onSelectTab,
  onNavigateToDashboard,
  onNavigateToPlatform,
  onNavigateToAuth,
}) => {
  const tabs = [
    {
      id: 'hub' as MobileTabType,
      label: 'HUB',
      icon: LayoutGrid,
      action: onNavigateToDashboard,
    },
    {
      id: 'insight' as MobileTabType,
      label: 'INSIGHT',
      icon: Sparkles,
      action: onNavigateToPlatform,
    },
    {
      id: 'civic' as MobileTabType,
      label: 'CIVIC',
      icon: Users,
      action: () => onSelectTab('civic'),
    },
    {
      id: 'me' as MobileTabType,
      label: 'ME',
      icon: User,
      action: onNavigateToAuth,
    },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FBFBFA]/95 backdrop-blur-lg border-t border-[#E5E7EB] py-2 px-6 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onSelectTab(tab.id);
                if (tab.action) tab.action();
              }}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#0F1E36] font-bold scale-105'
                  : 'text-[#6B7280] hover:text-[#111827] font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-[#0F1E36]' : 'stroke-[1.75px]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0F1E36]" />
                )}
              </div>
              <span className="text-[10px] tracking-wider uppercase font-sans">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
