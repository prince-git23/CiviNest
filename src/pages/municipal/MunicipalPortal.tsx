import React, { useState } from 'react';
import { MunicipalShell, type MunicipalPage } from '../../components/municipal-new/MunicipalShell';
import { CommandCenter } from './CommandCenter';
import { IssueTriage } from './IssueTriage';
import { SpatialIntelligence } from './SpatialIntelligence';
import { DepartmentOperations } from './DepartmentOperations';
import { ResolutionVerification } from './ResolutionVerification';
import { AIBriefsAnalytics } from './AIBriefsAnalytics';
import { TeamsWardManagement } from './TeamsWardManagement';
import type { AuthenticatedUser } from '../../types';

interface MunicipalPortalProps {
  onSwitchToCitizenView?: () => void;
  authenticatedUser?: AuthenticatedUser;
}

export const MunicipalPortal: React.FC<MunicipalPortalProps> = ({ onSwitchToCitizenView, authenticatedUser }) => {
  const [activePage, setActivePage] = useState<MunicipalPage>('command-center');

  const handleSelectPage = (page: MunicipalPage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (activePage) {
      case 'command-center':
        return <CommandCenter onSelectPage={(p) => setActivePage(p as MunicipalPage)} />;
      case 'issue-triage':
        return <IssueTriage />;
      case 'spatial-intelligence':
        return <SpatialIntelligence onSelectPage={(p) => setActivePage(p as MunicipalPage)} />;
      case 'departments':
        return <DepartmentOperations />;
      case 'resolution-verification':
        return <ResolutionVerification />;
      case 'ai-briefs-analytics':
        return <AIBriefsAnalytics />;
      case 'teams-ward-mgmt':
        return <TeamsWardManagement />;
      default:
        return <CommandCenter onSelectPage={(p) => setActivePage(p as MunicipalPage)} />;
    }
  };

  return (
    <MunicipalShell
      activePage={activePage}
      onSelectPage={handleSelectPage}
      onSwitchToCitizenView={onSwitchToCitizenView}
      authenticatedUser={authenticatedUser}
    >
      {renderPage()}
    </MunicipalShell>
  );
};

export default MunicipalPortal;
