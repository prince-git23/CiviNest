import React from 'react';
import { Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  className = '',
  size = 'md',
}) => {
  const isHigh = confidence >= 85;
  const isModerate = confidence >= 60 && confidence < 85;
  const isLow = confidence < 60;

  const colorClasses = isHigh
    ? 'text-[#0F1E36] bg-[#F3F4F6] border-[#E5E7EB]'
    : isModerate
    ? 'text-amber-800 bg-amber-50 border-amber-200'
    : 'text-rose-700 bg-rose-50 border-rose-200';

  const iconClasses = isHigh
    ? 'text-[#0F1E36]'
    : isModerate
    ? 'text-amber-600'
    : 'text-rose-600';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-medium tracking-tight shadow-2xs transition-colors ${colorClasses} ${className}`}
      title={`AI Confidence: ${confidence}%. Calculated via multi-signal spatial & sensory corroboration.`}
    >
      <span className="flex items-center justify-center">
        {isHigh ? (
          <Sparkles className={`w-3.5 h-3.5 ${iconClasses}`} />
        ) : isModerate ? (
          <ShieldCheck className={`w-3.5 h-3.5 ${iconClasses}`} />
        ) : (
          <AlertCircle className={`w-3.5 h-3.5 ${iconClasses}`} />
        )}
      </span>
      <span>{confidence}% CONFIDENCE</span>
    </div>
  );
};

export default ConfidenceBadge;
