import React from 'react';
import { WorkspaceHeader, WorkspaceTabId } from '../navigation/WorkspaceHeader';

export interface DashboardHeaderProps {
  activeTab: 'home' | 'explore' | 'reports' | 'community' | 'impact';
  onSelectTab: (tab: 'home' | 'explore' | 'reports' | 'community' | 'impact') => void;
  userName: string;
  userWard?: string;
  impactPoints?: number;
  onOpenReportModal: () => void;
  onNavigateToCreateSignal?: () => void;
  onNavigateLanding?: () => void;
  onNavigateToMunicipal?: () => void;
  onSignOut?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  onSelectTab,
  userName,
  userWard,
  impactPoints,
  onOpenReportModal,
  onNavigateToCreateSignal,
  onNavigateLanding,
  onNavigateToMunicipal,
  onSignOut,
}) => {
  return (
    <WorkspaceHeader
      activeTab={activeTab as WorkspaceTabId}
      onSelectTab={(tab) => onSelectTab(tab as 'home' | 'explore' | 'reports' | 'community' | 'impact')}
      userName={userName}
      userWard={userWard}
      impactPoints={impactPoints}
      onOpenReportModal={onOpenReportModal}
      onNavigateToCreateSignal={onNavigateToCreateSignal}
      onNavigateLanding={onNavigateLanding}
      onNavigateToMunicipal={onNavigateToMunicipal}
      onSignOut={onSignOut}
    />
  );
};

export default DashboardHeader;
