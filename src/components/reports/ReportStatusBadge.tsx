import React from 'react';
import { ReportStatusType } from '../../types';

interface ReportStatusBadgeProps {
  status: ReportStatusType | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const norm = (status || '').toLowerCase().trim();

  let badgeStyle = {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    label: status,
    pulse: false,
  };

  if (norm.includes('in progress') || norm === 'in_progress' || norm === 'active') {
    badgeStyle = {
      bg: 'bg-blue-50',
      text: 'text-[#2563EB]',
      border: 'border-blue-200',
      dot: 'bg-[#2563EB]',
      label: 'IN PROGRESS',
      pulse: true,
    };
  } else if (norm.includes('awaiting') || norm === 'awaiting_review') {
    badgeStyle = {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      label: 'AWAITING REVIEW',
      pulse: true,
    };
  } else if (norm.includes('under review') || norm === 'under_review' || norm === 'verification') {
    badgeStyle = {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
      label: 'UNDER REVIEW',
      pulse: false,
    };
  } else if (norm.includes('assigned')) {
    badgeStyle = {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      dot: 'bg-purple-600',
      label: 'ASSIGNED',
      pulse: false,
    };
  } else if (norm.includes('resolved') || norm === 'closed') {
    badgeStyle = {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-600',
      label: 'RESOLVED',
      pulse: false,
    };
  } else if (norm.includes('reopened')) {
    badgeStyle = {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-600',
      label: 'REOPENED',
      pulse: true,
    };
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-[11px]',
    lg: 'px-3 py-1.5 text-xs',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wider uppercase rounded-full border shadow-2xs whitespace-nowrap select-none ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} ${sizeClasses} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${badgeStyle.dot} ${
          badgeStyle.pulse ? 'animate-pulse' : ''
        }`}
      />
      {badgeStyle.label}
    </span>
  );
};

export default ReportStatusBadge;
