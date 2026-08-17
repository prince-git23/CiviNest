import React from 'react';
import { Check, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { ReportTimelineEvent } from '../../types';

interface ReportTimelineProps {
  events: ReportTimelineEvent[];
  className?: string;
}

export const ReportTimeline: React.FC<ReportTimelineProps> = ({
  events = [],
  className = '',
}) => {
  if (!events || events.length === 0) return null;

  return (
    <div className={`space-y-0 relative py-2 ${className}`}>
      {/* Background connecting track */}
      <div className="absolute left-[13px] top-3.5 bottom-3.5 w-0.5 bg-[#E2E8F0]" />

      {events.map((event, idx) => {
        const isCompleted = event.completed ?? false;
        const isCurrent = event.current ?? false;
        const isFuture = !isCompleted && !isCurrent;

        return (
          <div key={idx} className="relative flex items-start gap-3.5 pb-4 last:pb-0 group">
            {/* Node Icon Indicator */}
            <div className="relative z-10 shrink-0 mt-0.5">
              {isCompleted ? (
                <div className="w-6.5 h-6.5 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs ring-4 ring-white">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              ) : isCurrent ? (
                <div className="w-6.5 h-6.5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs ring-4 ring-blue-100 animate-pulse">
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              ) : (
                <div className="w-6.5 h-6.5 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] text-[#94A3B8] flex items-center justify-center ring-4 ring-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
                </div>
              )}
            </div>

            {/* Event Content Box */}
            <div
              className={`flex-1 rounded-xl p-3 border transition-all text-left ${
                isCurrent
                  ? 'bg-blue-50/60 border-blue-200/80 shadow-xs'
                  : isCompleted
                  ? 'bg-white border-[#E2E8F0]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0]/60 opacity-70'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold tracking-tight ${
                      isCurrent
                        ? 'text-[#1E40AF]'
                        : isCompleted
                        ? 'text-[#0F172A]'
                        : 'text-[#64748B]'
                    }`}
                  >
                    {event.status}
                  </span>
                  {event.actor && (
                    <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                      {event.actor}
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-mono text-[#64748B] font-medium">
                  {event.timestamp}
                </span>
              </div>

              <p className="text-xs text-[#475569] leading-relaxed mt-0.5">
                {event.note}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportTimeline;
