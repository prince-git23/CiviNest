import React, { useState, useEffect } from 'react';
import { User, Menu, X, ArrowUpRight } from 'lucide-react';
import { CiviNestLogo } from './common/CiviNestLogo';

interface NavbarProps {
  currentPage?: 'platform' | 'how-it-works' | 'auth' | 'onboarding' | 'dashboard' | 'create-signal' | 'signal-analysis' | 'my-reports' | 'verification' | 'cluster-detection';
  onSelectPage?: (page: 'platform' | 'how-it-works' | 'auth' | 'onboarding' | 'dashboard' | 'create-signal' | 'signal-analysis' | 'my-reports' | 'verification' | 'cluster-detection') => void;
  onOpenReportModal: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage = 'platform',
  onSelectPage,
  onOpenReportModal,
  onNavigateSection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Platform', id: 'platform', page: 'platform' as const },
    { label: 'Cluster Detection', id: 'cluster-detection', page: 'cluster-detection' as const },
    { label: 'Create Signal', id: 'create-signal', page: 'create-signal' as const },
    { label: 'AI Review', id: 'signal-analysis', page: 'signal-analysis' as const },
    { label: 'My Reports', id: 'my-reports', page: 'my-reports' as const },
    { label: 'Resident Dashboard', id: 'dashboard', page: 'dashboard' as const },
    { label: 'How It Works', id: 'how-it-works', page: 'how-it-works' as const },
  ];

  const handleLinkClick = (item: typeof navLinks[0]) => {
    setMobileMenuOpen(false);
    if (item.page === 'how-it-works') {
      if (onSelectPage) onSelectPage('how-it-works');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.page === 'cluster-detection') {
      if (onSelectPage) onSelectPage('cluster-detection');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.page === 'dashboard') {
      if (onSelectPage) onSelectPage('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.page === 'my-reports') {
      if (onSelectPage) onSelectPage('my-reports');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.page === 'create-signal') {
      if (onSelectPage) onSelectPage('create-signal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.page === 'signal-analysis') {
      if (onSelectPage) onSelectPage('signal-analysis');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (onSelectPage && currentPage !== 'platform') {
        onSelectPage('platform');
        setTimeout(() => {
          onNavigateSection(item.id);
        }, 80);
      } else {
        onNavigateSection(item.id);
      }
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#E5E7EB] py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigateSection('hero')}
          className="group flex items-center transition-transform active:scale-98 text-left"
          aria-label="CiviNest Home"
        >
          <CiviNestLogo size={32} />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-[13.5px] font-medium text-[#4B5563]">
          {navLinks.map((link) => {
            const isActive = currentPage === link.page;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className={`transition-colors duration-150 relative py-1 hover:text-[#0F1E36] cursor-pointer ${
                  isActive ? 'text-[#0F1E36] font-semibold' : ''
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0F1E36] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
          <button
            onClick={() => onSelectPage && onSelectPage('auth')}
            className="text-[#4B5563] hover:text-[#0F1E36] transition-colors px-2 py-1.5 cursor-pointer"
          >
            Sign In
          </button>
          
          <button
            onClick={() => onSelectPage && onSelectPage('onboarding')}
            className="bg-[#0F1E36] hover:bg-[#1E293B] text-white px-4 py-2 rounded-[6px] transition-all duration-200 shadow-sm hover:shadow active:scale-98 text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <span>Get Started</span>
          </button>

          <button
            onClick={() => onSelectPage && onSelectPage('auth')}
            className="w-8 h-8 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center text-[#374151] transition-colors cursor-pointer"
            aria-label="User Profile"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#374151] hover:text-[#0F1E36] rounded-lg hover:bg-black/5"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FBFBFA] border-b border-[#E5E7EB] px-6 py-5 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-3.5">
            {navLinks.map((link) => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link)}
                  className={`text-left text-sm py-2 px-1 font-medium transition-colors cursor-pointer ${
                    isActive ? 'text-[#0F1E36] font-bold bg-slate-100/70 rounded-md px-2' : 'text-[#4B5563]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onSelectPage) onSelectPage('onboarding');
                }}
                className="w-full bg-[#0F1E36] text-white py-2.5 rounded-[6px] text-sm font-medium text-center cursor-pointer"
              >
                Get Started
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onSelectPage) onSelectPage('auth');
                }}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-[6px] text-sm font-medium text-center cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
