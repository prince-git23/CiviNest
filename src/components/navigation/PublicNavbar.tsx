import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, LogIn, UserPlus } from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';
import { NavigationLink } from './NavigationLink';
import { NavigationAction } from './NavigationAction';

export interface PublicNavbarProps {
  currentPage?: 'platform' | 'how-it-works';
  onNavigateLanding?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigateHowItWorks?: () => void;
  onNavigateSignIn?: () => void;
  onNavigateGetStarted?: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentPage = 'platform',
  onNavigateLanding,
  onNavigateSection,
  onNavigateHowItWorks,
  onNavigateSignIn,
  onNavigateGetStarted,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    if (onNavigateLanding) {
      onNavigateLanding();
    } else if (onNavigateSection) {
      onNavigateSection('hero');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlatformClick = () => {
    setMobileMenuOpen(false);
    if (currentPage !== 'platform' && onNavigateLanding) {
      onNavigateLanding();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHowItWorksClick = () => {
    setMobileMenuOpen(false);
    if (onNavigateHowItWorks) {
      onNavigateHowItWorks();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignInClick = () => {
    setMobileMenuOpen(false);
    if (onNavigateSignIn) {
      onNavigateSignIn();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetStartedClick = () => {
    setMobileMenuOpen(false);
    if (onNavigateGetStarted) {
      onNavigateGetStarted();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      id="public-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-250 ${
        isScrolled
          ? 'bg-[#FBFBFA]/92 backdrop-blur-md border-b border-[#E5E7EB] py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="group flex items-center transition-transform active:scale-[0.98] text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36] rounded-lg p-0.5"
          aria-label="CiviNest Home"
        >
          <CiviNestLogo size={32} />
        </button>

        {/* Desktop Public Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-7 text-[13.5px] font-medium"
          aria-label="Public site navigation"
        >
          <NavigationLink
            label="Platform"
            isActive={currentPage === 'platform'}
            onClick={handlePlatformClick}
            ariaLabel="CiviNest Platform overview"
          />
          <NavigationLink
            label="How It Works"
            isActive={currentPage === 'how-it-works'}
            onClick={handleHowItWorksClick}
            ariaLabel="How CiviNest civic intelligence works"
          />
        </nav>

        {/* Public Action Controls */}
        <div className="hidden sm:flex items-center gap-3.5 text-sm font-medium">
          <NavigationAction
            label="Sign In"
            variant="ghost"
            onClick={handleSignInClick}
            ariaLabel="Sign in to resident portal"
          />

          <NavigationAction
            label="Get Started"
            variant="primary"
            onClick={handleGetStartedClick}
            ariaLabel="Get started with CiviNest onboarding"
          />
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#374151] hover:text-[#0F1E36] rounded-lg hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36] cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="public-mobile-drawer"
          className="md:hidden bg-[#FBFBFA] border-b border-[#E5E7EB] px-6 py-5 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handlePlatformClick}
              className={`text-left text-sm py-2.5 px-3 rounded-lg font-medium transition-colors cursor-pointer ${
                currentPage === 'platform'
                  ? 'bg-slate-100/90 text-[#0F1E36] font-bold'
                  : 'text-[#4B5563] hover:text-[#0F1E36] hover:bg-slate-50'
              }`}
            >
              Platform
            </button>

            <button
              type="button"
              onClick={handleHowItWorksClick}
              className={`text-left text-sm py-2.5 px-3 rounded-lg font-medium transition-colors cursor-pointer ${
                currentPage === 'how-it-works'
                  ? 'bg-slate-100/90 text-[#0F1E36] font-bold'
                  : 'text-[#4B5563] hover:text-[#0F1E36] hover:bg-slate-50'
              }`}
            >
              How It Works
            </button>

            <div className="pt-4 mt-2 border-t border-gray-200 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleGetStartedClick}
                className="w-full bg-[#0F1E36] text-white py-2.5 px-4 rounded-lg text-sm font-semibold text-center shadow-xs cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </button>

              <button
                type="button"
                onClick={handleSignInClick}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold text-center cursor-pointer active:scale-98 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
