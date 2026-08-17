import React from 'react';

export interface NavigationActionProps {
  label?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  icon?: React.ReactNode;
  ariaLabel?: string;
  title?: string;
  className?: string;
  badge?: string | number;
  disabled?: boolean;
}

export const NavigationAction: React.FC<NavigationActionProps> = ({
  label,
  onClick,
  variant = 'primary',
  icon,
  ariaLabel,
  title,
  className = '',
  badge,
  disabled = false,
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center transition-all duration-150 rounded-lg font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1E36] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

  let variantClasses = '';

  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.98] text-white text-[13px] px-4 py-2 shadow-xs hover:shadow font-semibold';
      break;
    case 'secondary':
      variantClasses =
        'bg-white hover:bg-slate-50 active:scale-[0.98] text-[#0F172A] border border-[#E2E8F0] text-[13px] px-3.5 py-1.5 shadow-xs font-semibold';
      break;
    case 'ghost':
      variantClasses =
        'text-[#4B5563] hover:text-[#0F1E36] hover:bg-black/5 text-[13px] px-2.5 py-1.5 font-medium';
      break;
    case 'icon':
      variantClasses =
        'p-2 text-[#4B5563] hover:text-[#0F1E36] hover:bg-[#F3F4F6] rounded-lg text-sm';
      break;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || label}
      title={title || label}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {icon && <span className={label ? 'mr-1.5 shrink-0' : 'shrink-0'}>{icon}</span>}
      {label && <span>{label}</span>}
      {badge !== undefined && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
          {badge}
        </span>
      )}
    </button>
  );
};

export default NavigationAction;
