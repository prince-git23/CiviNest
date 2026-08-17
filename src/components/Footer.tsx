import React from 'react';
import { Globe } from 'lucide-react';
import { CiviNestLogo, CiviNestLogoMark } from './common/CiviNestLogo';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenReportModal: () => void;
  onSelectPage?: (page: 'platform' | 'how-it-works' | 'auth' | 'onboarding') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  onOpenReportModal,
  onSelectPage,
}) => {
  return (
    <footer className="bg-[#FBFBFA] border-t border-[#E5E7EB]">
      {/* Iconic Centered Brand Emblem Container (as in reference design) */}
      <div className="pt-20 pb-16 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,30,54,0.06)] hover:scale-[1.02] cursor-pointer group">
          <CiviNestLogoMark size={72} className="text-[#0F1E36] mb-3 group-hover:rotate-6 transition-transform duration-500" />
          <span className="font-semibold text-xl tracking-tight text-[#0F1E36] font-sans">
            CiviNest
          </span>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 border-t border-[#EEF0F2]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Left Column: Brand & Mission */}
          <div className="md:col-span-5 lg:col-span-5 space-y-4">
            <CiviNestLogo size={28} />
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-sm">
              Intelligence for modern civic governance and resilient communities.
              We turn noise into verified action.
            </p>
          </div>

          {/* Right Columns: Navigation Links */}
          <div className="md:col-span-7 lg:col-span-7 grid grid-cols-3 gap-6 sm:gap-8 text-xs sm:text-sm">
            {/* PLATFORM */}
            <div>
              <h4 className="font-mono text-[11px] font-bold tracking-wider text-[#111827] uppercase mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-[#6B7280]">
                <li>
                  <button
                    onClick={() => onNavigateSection('intelligence')}
                    className="hover:text-[#0F1E36] transition-colors"
                  >
                    Capabilities
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigateSection('process')}
                    className="hover:text-[#0F1E36] transition-colors"
                  >
                    Integrations
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigateSection('trust')}
                    className="hover:text-[#0F1E36] transition-colors"
                  >
                    Security
                  </button>
                </li>
              </ul>
            </div>

            {/* COMPANY */}
            <div>
              <h4 className="font-mono text-[11px] font-bold tracking-wider text-[#111827] uppercase mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-[#6B7280]">
                <li>
                  <button
                    onClick={() => onNavigateSection('stakeholders')}
                    className="hover:text-[#0F1E36] transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenReportModal}
                    className="hover:text-[#0F1E36] transition-colors"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h4 className="font-mono text-[11px] font-bold tracking-wider text-[#111827] uppercase mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5 text-[#6B7280]">
                <li>
                  <button
                    onClick={onOpenReportModal}
                    className="hover:text-[#0F1E36] transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenReportModal}
                    className="hover:text-[#0F1E36] transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Language */}
        <div className="pt-12 mt-12 border-t border-[#EEF0F2] flex items-center justify-between text-xs text-[#9CA3AF]">
          <p>© 2024 CiviNest Platform. All rights reserved.</p>
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 hover:text-[#0F1E36] transition-colors"
            aria-label="Language selector"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
