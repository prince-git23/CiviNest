import React from 'react';
import { Building2, Shield, Clock, Users2, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { GovernmentActionInfo } from '../../types';

interface GovernmentActionCardProps {
  action?: GovernmentActionInfo | null;
  className?: string;
}

export const GovernmentActionCard: React.FC<GovernmentActionCardProps> = ({
  action,
  className = '',
}) => {
  if (!action) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4 text-left ${className}`}
      >
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#64748B] mb-1">
          <Building2 className="w-3.5 h-3.5" />
          <span>GOVERNMENT ACTION</span>
        </div>
        <p className="text-xs text-[#64748B]">
          Awaiting department assignment. Municipal triage queue estimated in 2-4 hours.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-xs text-left ${className}`}
    >
      {/* Header Eyebrow */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0F172A]">
          <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Government Action & Accountability</span>
        </div>

        {action.sla && (
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            SLA: {action.sla}
          </span>
        )}
      </div>

      {/* Department & Assigned Team */}
      <div className="mb-2.5">
        <h4 className="text-sm sm:text-base font-bold text-[#0F172A]">
          {action.department}
        </h4>
        {action.assignedTeam && (
          <p className="text-xs text-[#475569] font-medium mt-0.5 flex items-center gap-1.5">
            <Users2 className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Assigned: {action.assignedTeam}</span>
          </p>
        )}
      </div>

      {/* Action Description & Status */}
      {action.actionDescription && (
        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] text-xs text-[#334155] leading-relaxed mb-3">
          {action.actionDescription}
        </div>
      )}

      {/* Footer Info: Last Updated & Expected Next Step */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9] font-mono">
        {action.lastUpdated && <span>Updated: {action.lastUpdated}</span>}
        {action.expectedNextStep && (
          <span className="text-[#0F172A] font-medium">Next: {action.expectedNextStep}</span>
        )}
      </div>
    </div>
  );
};

export default GovernmentActionCard;
