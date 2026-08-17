import React from 'react';
import { PublicNavbar } from './navigation/PublicNavbar';

export interface NavbarProps {
  currentPage?: string;
  onSelectPage?: (page: any) => void;
  onOpenReportModal?: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage = 'platform',
  onSelectPage,
  onOpenReportModal,
  onNavigateSection,
}) => {
  return (
    <PublicNavbar
      currentPage={currentPage === 'how-it-works' ? 'how-it-works' : 'platform'}
      onNavigateLanding={() => {
        if (onSelectPage) onSelectPage('platform');
        onNavigateSection('hero');
      }}
      onNavigateSection={onNavigateSection}
      onNavigateHowItWorks={() => {
        if (onSelectPage) onSelectPage('how-it-works');
      }}
      onNavigateSignIn={() => {
        if (onSelectPage) onSelectPage('auth');
      }}
      onNavigateGetStarted={() => {
        if (onSelectPage) onSelectPage('onboarding');
      }}
    />
  );
};

export default Navbar;
