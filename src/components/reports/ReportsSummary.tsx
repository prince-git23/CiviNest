import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Radio, Clock, CheckCircle2, RotateCcw, Activity } from 'lucide-react';
import { DashboardReportItem } from '../../types';

interface ReportsSummaryProps {
  reports: DashboardReportItem[];
  className?: string;
  onSelectFilter?: (status: string) => void;
  activeFilter?: string;
}

export const ReportsSummary: React.FC<ReportsSummaryProps> = ({
  reports = [],
  className = '',
  onSelectFilter,
  activeFilter = 'all',
}) => {
  // Calculate dynamic metric values from real reports dataset
  const activeCount = reports.filter((r) => {
    const s = r.status.toLowerCase();
    return s.includes('in progress') || s.includes('assigned') || s.includes('active');
  }).length;

  const awaitingCount = reports.filter((r) => {
    const s = r.status.toLowerCase();
    return s.includes('awaiting') || s.includes('under review') || s.includes('verification');
  }).length;

  const resolvedCount = reports.filter((r) => {
    const s = r.status.toLowerCase();
    return s.includes('resolved') || s.includes('closed');
  }).length;

  const reopenedCount = reports.filter((r) => {
    const s = r.status.toLowerCase();
    return s.includes('reopened');
  }).length;

  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const targets = [
      { count: activeCount, idx: 0 },
      { count: awaitingCount, idx: 1 },
      { count: resolvedCount, idx: 2 },
      { count: reopenedCount, idx: 3 },
    ];

    targets.forEach(({ count, idx }) => {
      const el = numRefs.current[idx];
      if (!el) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: count,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => {
          if (el) {
            el.textContent = Math.round(obj.val).toString().padStart(2, '0');
          }
        },
      });
    });
  }, [activeCount, awaitingCount, resolvedCount, reopenedCount]);

  const cards = [
    {
      id: 'active',
      label: 'Active',
      description: 'Under municipal action',
      icon: Activity,
      color: 'text-[#2563EB]',
      border: 'border-blue-200',
      bg: 'bg-blue-50/50',
      count: activeCount,
    },
    {
      id: 'awaiting',
      label: 'Awaiting Review',
      description: 'In verification queue',
      icon: Clock,
      color: 'text-amber-600',
      border: 'border-amber-200',
      bg: 'bg-amber-50/50',
      count: awaitingCount,
    },
    {
      id: 'resolved',
      label: 'Resolved',
      description: 'Completed signals',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/50',
      count: resolvedCount,
    },
    {
      id: 'reopened',
      label: 'Reopened',
      description: 'Requiring re-action',
      icon: RotateCcw,
      color: 'text-rose-600',
      border: 'border-rose-200',
      bg: 'bg-rose-50/50',
      count: reopenedCount,
    },
  ];

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 ${className}`}
      aria-label="Civic Signal Tracking Metrics Summary"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isSelected = activeFilter.toLowerCase().includes(card.id);

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter && onSelectFilter(card.id)}
            className={`p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer bg-white shadow-2xs hover:shadow-xs group ${
              isSelected
                ? `${card.border} ${card.bg} ring-2 ring-blue-500/20`
                : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B]">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span
                ref={(el) => {
                  numRefs.current[idx] = el;
                }}
                className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${card.color}`}
              >
                {card.count.toString().padStart(2, '0')}
              </span>
            </div>

            <p className="text-[11px] text-[#64748B] mt-1 line-clamp-1">
              {card.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default ReportsSummary;
