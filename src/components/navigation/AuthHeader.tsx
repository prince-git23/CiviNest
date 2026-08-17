import React from 'react';
import { ArrowLeft, User, Shield } from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';
import { NavigationAction } from './NavigationAction';

export interface AuthHeaderProps {
  onBackToCiviNest: () => void;
  onNavigateToOnboarding?: () => void;
  onNavigateToAuth?: () => void;
  onOpenProfile?: () => void;
  currentStepLabel?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  onBackToCiviNest,
  onNavigateToOnboarding,
  onNavigateToAuth,
  onOpenProfile,
  currentStepLabel,
}) => {
  return (
    <header className="w-full bg-[#FBFBFA]/95 backdrop-blur-md border-b border-[#E5E7EB] py-3.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Logo */}
      <button
        type="button"
        onClick={onBackToCiviNest}
        className="flex items-center gap-2 text-left cursor-pointer transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36] rounded-lg p-0.5"
        aria-label="CiviNest Public Home"
      >
        <CiviNestLogo size={30} />
      </button>

      {/* Center step indicator if provided */}
      {currentStepLabel && (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-medium text-slate-700">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>{currentStepLabel}</span>
        </div>
      )}

      {/* Right Action Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onNavigateToOnboarding && (
          <button
            type="button"
            onClick={onNavigateToOnboarding}
            className="text-xs sm:text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors py-1.5 px-2.5 rounded-lg hover:bg-blue-50 cursor-pointer"
          >
            Create Profile →
          </button>
        )}

        {onNavigateToAuth && (
          <button
            type="button"
            onClick={onNavigateToAuth}
            className="text-xs sm:text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors py-1.5 px-2.5 rounded-lg hover:bg-blue-50 cursor-pointer"
          >
            Sign In →
          </button>
        )}

        <button
          type="button"
          onClick={onBackToCiviNest}
          className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-[#374151] hover:text-[#0F1E36] transition-colors py-1.5 px-2.5 rounded-lg hover:bg-black/5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CiviNest</span>
        </button>

        {onOpenProfile && (
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
            aria-label="Account status"
          >
            <User className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

export default AuthHeader;
