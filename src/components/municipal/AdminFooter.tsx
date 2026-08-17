import React from 'react';

interface AdminFooterProps {
  onNavigateToPlatform?: () => void;
  onNavigateToHowItWorks?: () => void;
}

export const AdminFooter: React.FC<AdminFooterProps> = ({
  onNavigateToPlatform,
  onNavigateToHowItWorks,
}) => {
  return (
    <footer className="w-full bg-[#FBFBFA] border-t border-[#E5E7EB] px-6 sm:px-8 py-5 mt-10 text-xs text-[#6B7280]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Authority Tag */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span>© 2026 CiviNest Infrastructure • Municipal Command Authority</span>
        </div>

        {/* Right Compliance Links */}
        <div className="flex items-center gap-5 text-[11px] font-sans">
          <button
            onClick={onNavigateToHowItWorks}
            className="hover:text-[#111827] transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#111827] transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#terms"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#111827] transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#support"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#111827] transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
