import React from 'react';
import { ArrowRight } from 'lucide-react';
import { UserRoleConfig } from '../../types';

interface RoleCardProps {
  role: UserRoleConfig;
  isSelected: boolean;
  onSelect: (role: UserRoleConfig) => void;
  onHover?: (role: UserRoleConfig | null) => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  isSelected,
  onSelect,
  onHover,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      onMouseEnter={() => onHover && onHover(role)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group w-full text-left p-5 sm:p-5.5 rounded-2xl border transition-all duration-250 relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 ${
        isSelected
          ? 'bg-white border-[#2563EB] shadow-[0_10px_28px_rgba(37,99,235,0.08)] ring-1 ring-[#2563EB]'
          : 'bg-[#F4F5F7]/80 hover:bg-white border-[#E5E7EB] hover:border-[#CBD5E1] shadow-xs hover:shadow-[0_8px_24px_rgba(15,30,54,0.04)] hover:-translate-y-0.5'
      }`}
      aria-label={`Select role: ${role.title} (${role.label})`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* Eyebrow Label */}
          <span
            className={`text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase block mb-1 font-mono transition-colors ${
              isSelected
                ? 'text-[#2563EB]'
                : 'text-[#4B5563] group-hover:text-[#2563EB]'
            }`}
          >
            {role.label}
          </span>

          {/* Role Title */}
          <h3 className="text-lg sm:text-xl font-medium text-[#0F1E36] tracking-tight font-serif mb-1">
            {role.title}
          </h3>

          {/* Role Description */}
          <p className="text-xs sm:text-[13.5px] text-[#64748B] leading-relaxed font-sans max-w-sm">
            {role.description}
          </p>
        </div>

        {/* Top-Right Action Arrow */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
            isSelected
              ? 'bg-[#2563EB] text-white'
              : 'text-[#94A3B8] group-hover:text-[#0F1E36] group-hover:translate-x-1'
          }`}
        >
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
};

export default RoleCard;
