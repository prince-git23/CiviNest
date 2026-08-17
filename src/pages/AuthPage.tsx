import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { AuthNavbar } from '../components/auth/AuthNavbar';
import { RoleSelection } from '../components/auth/RoleSelection';
import { LoginForm } from '../components/auth/LoginForm';
import { AuthCivicNetworkScene } from '../components/auth/AuthCivicNetworkScene';
import { NetworkStatusPanel } from '../components/auth/NetworkStatusPanel';
import { UserRoleConfig } from '../types';
import { USER_ROLES } from '../components/auth/rolesData';

interface AuthPageProps {
  onBackToCiviNest: () => void;
  onNavigateToOnboarding?: () => void;
  onNavigateToCreateAccount?: () => void;
  onLoginSuccess?: (role: UserRoleConfig) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onBackToCiviNest,
  onNavigateToOnboarding,
  onNavigateToCreateAccount,
  onLoginSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRoleConfig | null>(null);
  const [hoverRole, setHoverRole] = useState<UserRoleConfig | null>(null);
  const [authStep, setAuthStep] = useState<'select-role' | 'login-form'>('select-role');

  const contentPanelRef = useRef<HTMLDivElement>(null);

  // Handle Select Role -> transition to Login Form
  const handleSelectRole = (role: UserRoleConfig) => {
    setSelectedRole(role);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !contentPanelRef.current) {
      setAuthStep('login-form');
      return;
    }

    // GSAP Exit animation
    gsap.to(contentPanelRef.current, {
      opacity: 0,
      x: -24,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        setAuthStep('login-form');
        // GSAP Enter animation for login form
        gsap.fromTo(
          contentPanelRef.current,
          { opacity: 0, x: 24 },
          { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
        );
      },
    });
  };

  // Handle Change Role -> transition back to Role Selection
  const handleChangeRole = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !contentPanelRef.current) {
      setAuthStep('select-role');
      setSelectedRole(null);
      return;
    }

    gsap.to(contentPanelRef.current, {
      opacity: 0,
      x: 24,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        setAuthStep('select-role');
        setSelectedRole(null);
        gsap.fromTo(
          contentPanelRef.current,
          { opacity: 0, x: -24 },
          { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
        );
      },
    });
  };

  const handleResetCamera = () => {
    setSelectedRole(null);
    setHoverRole(null);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col selection:bg-[#0F1E36] selection:text-white">
      {/* Top Lightweight Auth Navbar */}
      <AuthNavbar
        onBackToCiviNest={onBackToCiviNest}
        onNavigateToOnboarding={onNavigateToCreateAccount}
      />

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* Left Side: Authentication & Role Selection Panel */}
        <div className="w-full lg:w-[48%] xl:w-[45%] bg-[#FBFBFA] border-r border-[#E5E7EB] flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-8 lg:py-12 z-10">
          <div className="max-w-md w-full mx-auto" ref={contentPanelRef}>
            {authStep === 'select-role' ? (
              <RoleSelection
                selectedRole={selectedRole}
                onSelectRole={handleSelectRole}
                onHoverRole={setHoverRole}
                onNavigateToOnboarding={onNavigateToCreateAccount}
              />
            ) : selectedRole ? (
              <LoginForm
                role={selectedRole}
                onChangeRole={handleChangeRole}
                onLoginSuccess={(role) => {
                  if (onLoginSuccess) {
                    onLoginSuccess(role);
                  } else {
                    onBackToCiviNest();
                  }
                }}
              />
            ) : null}
          </div>
        </div>

        {/* Right Side: 3D Civic Network Visualization Viewport */}
        <div className="w-full lg:w-[52%] xl:w-[55%] min-h-[420px] lg:min-h-[calc(100vh-61px)] relative bg-[#0A111F] flex flex-col">
          {/* 3D WebGL Canvas */}
          <div className="absolute inset-0">
            <AuthCivicNetworkScene
              activeRole={selectedRole}
              hoverRole={hoverRole}
            />
          </div>

          {/* Floating Status & Telemetry Overlay Panel */}
          <div className="absolute bottom-6 right-6 left-6 sm:left-auto sm:max-w-sm pointer-events-auto z-20">
            <NetworkStatusPanel
              activeRole={selectedRole || hoverRole}
              onSelectRole={(role) => {
                if (authStep === 'select-role') {
                  handleSelectRole(role);
                } else {
                  setSelectedRole(role);
                }
              }}
              onResetView={handleResetCamera}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
