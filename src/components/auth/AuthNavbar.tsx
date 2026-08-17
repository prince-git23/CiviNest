import React from 'react';
import { AuthHeader } from '../navigation/AuthHeader';

export interface AuthNavbarProps {
  onBackToCiviNest: () => void;
  onNavigateToOnboarding?: () => void;
  onNavigateToAuth?: () => void;
  onOpenProfile?: () => void;
  currentStepLabel?: string;
}

export const AuthNavbar: React.FC<AuthNavbarProps> = (props) => {
  return <AuthHeader {...props} />;
};

export default AuthNavbar;
