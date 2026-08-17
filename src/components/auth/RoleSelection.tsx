import React from 'react';
import { USER_ROLES } from './rolesData';
import { RoleCard } from './RoleCard';
import { TrustIndicators } from './TrustIndicators';
import { UserRoleConfig } from '../../types';

interface RoleSelectionProps {
  selectedRole: UserRoleConfig | null;
  onSelectRole: (role: UserRoleConfig) => void;
  onHoverRole: (role: UserRoleConfig | null) => void;
  onNavigateToOnboarding?: () => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({
  selectedRole,
  onSelectRole,
  onHoverRole,
  onNavigateToOnboarding,
}) => {
  return (
    <div className="w-full flex flex-col justify-between min-h-[580px]">
      <div>
        {/* Eyebrow */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#4B5563] uppercase font-mono">
            Welcome to CiviNest
          </span>
          {onNavigateToOnboarding && (
            <button
              type="button"
              onClick={onNavigateToOnboarding}
              className="text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] underline cursor-pointer"
            >
              New to CiviNest? Create Account →
            </button>
          )}
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0F1E36] tracking-tight leading-[1.1] mb-2 font-serif">
          Connect to your{' '}
          <span className="text-[#2563EB] block sm:inline">civic network.</span>
        </h1>

        {/* Supporting text */}
        <p className="text-sm sm:text-base text-[#64748B] mb-6 font-sans">
          How will you use CiviNest?
        </p>

        {/* Role Cards List — Admin is excluded from public onboarding */}
        <div className="space-y-3">
          {USER_ROLES.filter((r) => !r.hiddenFromOnboarding).map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isSelected={selectedRole?.id === role.id}
              onSelect={onSelectRole}
              onHover={onHoverRole}
            />
          ))}
        </div>
      </div>

      {/* Trust Strip */}
      <div className="mt-8">
        <TrustIndicators />
      </div>
    </div>
  );
};

export default RoleSelection;
