import React from 'react';

export interface NavigationLinkProps {
  label: string;
  isActive?: boolean;
  onClick: () => void;
  badge?: string | number;
  icon?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  label,
  isActive = false,
  onClick,
  badge,
  icon,
  className = '',
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel || label}
      className={`relative inline-flex items-center gap-2 py-1.5 px-1 text-[13.5px] font-medium transition-colors duration-150 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36] cursor-pointer select-none ${
        isActive
          ? 'text-[#0F1E36] font-semibold'
          : 'text-[#4B5563] hover:text-[#0F1E36]'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {badge !== undefined && (
        <span
          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
            isActive
              ? 'bg-[#0F1E36] text-white'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {badge}
        </span>
      )}
      {isActive && (
        <span
          className="absolute bottom-0 left-1 right-1 h-[2px] bg-[#0F1E36] rounded-full transition-all duration-200"
          aria-hidden="true"
        />
      )}
    </button>
  );
};

export default NavigationLink;
