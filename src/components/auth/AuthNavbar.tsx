import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';

interface AuthNavbarProps {
  onBackToCiviNest: () => void;
  onNavigateToOnboarding?: () => void;
  onOpenProfile?: () => void;
}

export const AuthNavbar: React.FC<AuthNavbarProps> = ({
  onBackToCiviNest,
  onNavigateToOnboarding,
  onOpenProfile,
}) => {
  return (
    <header className="w-full bg-[#FBFBFA] border-b border-[#E5E7EB] py-3.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Logo */}
      <button
        type="button"
        onClick={onBackToCiviNest}
        className="flex items-center gap-2 text-left cursor-pointer transition-opacity hover:opacity-85"
        aria-label="CiviNest Home"
      >
        <CiviNestLogo size={30} />
      </button>

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

        <button
          type="button"
          onClick={onBackToCiviNest}
          className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium text-[#374151] hover:text-[#0F1E36] transition-colors py-1.5 px-2 rounded-lg hover:bg-black/5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CiviNest</span>
        </button>

        <button
          type="button"
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
          aria-label="Account status"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default AuthNavbar;
