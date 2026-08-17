import React from 'react';
import { Lock, FileText, ShieldCheck } from 'lucide-react';

export const TrustIndicators: React.FC<{ className?: string }> = ({ className = '' }) => {
  const indicators = [
    {
      icon: Lock,
      label: 'Secure Access',
      tooltip: 'TLS 1.3 encrypted authentication channel',
    },
    {
      icon: FileText,
      label: 'Auditable',
      tooltip: 'Cryptographic immutable activity log',
    },
    {
      icon: ShieldCheck,
      label: 'Privacy-aware',
      tooltip: 'Zero-knowledge verification & data isolation',
    },
  ];

  return (
    <div
      className={`border-t border-[#E5E7EB] pt-4 pb-2 flex items-center justify-between gap-3 text-xs text-[#64748B] select-none ${className}`}
    >
      {indicators.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="flex items-center gap-1.5 hover:text-[#0F1E36] transition-colors"
            title={item.tooltip}
          >
            <Icon className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <span className="font-medium text-[11.5px] sm:text-xs">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default TrustIndicators;
