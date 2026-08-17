import React from 'react';
import {
  ArrowRight,
  UserCheck,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { MunicipalIssueItem } from '../../types';
import { ConfidenceBadge } from './ConfidenceBadge';

interface IssueCardProps {
  issue: MunicipalIssueItem;
  onAssignTeam: (issue: MunicipalIssueItem) => void;
  onViewTelemetry: (issue: MunicipalIssueItem) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onAssignTeam,
  onViewTelemetry,
}) => {
  // Severity styling for Priority Score
  const isCriticalPriority = issue.priorityScore >= 90;
  const isHighPriority = issue.priorityScore >= 75 && issue.priorityScore < 90;

  const priorityBadgeClasses = isCriticalPriority
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : isHighPriority
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-blue-50 text-blue-700 border-blue-200';

  const leftBarColor = isCriticalPriority
    ? 'bg-[#DC2626]'
    : isHighPriority
    ? 'bg-[#F59E0B]'
    : 'bg-[#2563EB]';

  return (
    <div className="relative bg-white rounded-2xl border border-[#E5E7EB] hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Left Critical Indicator Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${leftBarColor}`} />

      <div className="pl-6 pr-5 sm:px-6 py-5 sm:py-6 space-y-4">
        {/* Top Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Score Badge */}
            <span
              className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border tracking-wider uppercase ${priorityBadgeClasses}`}
            >
              PRIORITY {issue.priorityScore}
            </span>

            {/* Issue ID */}
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              ID: {issue.issueCode}
            </span>

            {/* Operational Flags Badges */}
            {issue.isOverSla && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                OVER SLA
              </span>
            )}

            {issue.isReopened && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                REOPENED
              </span>
            )}

            {issue.assignedTeam && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                {issue.assignedTeam.teamName}
              </span>
            )}
          </div>

          {/* Right Metadata: Reported Ago & Confidence */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6B7280] font-sans">
              Reported {issue.reportedAgo}
            </span>
            <ConfidenceBadge confidence={issue.aiConfidence} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight group-hover:text-[#2563EB] transition-colors">
            {issue.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-sans">
            {issue.description}
          </p>
        </div>

        {/* 3 Metric Mini-Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-1">
          {/* 1. Affected Properties */}
          <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#F3F4F6]">
            <span className="text-[10px] font-mono font-semibold text-[#6B7280] tracking-wider uppercase block truncate">
              AFFECTED PROPS
            </span>
            <span className="text-base sm:text-lg font-bold text-[#111827] font-sans">
              {issue.affectedProperties.toLocaleString()}
            </span>
          </div>

          {/* 2. Number of Reports */}
          <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#F3F4F6]">
            <span className="text-[10px] font-mono font-semibold text-[#6B7280] tracking-wider uppercase block truncate">
              REPORTS
            </span>
            <span className="text-base sm:text-lg font-bold text-[#111827] font-sans">
              {issue.reportCount}
            </span>
          </div>

          {/* 3. Department */}
          <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#F3F4F6]">
            <span className="text-[10px] font-mono font-semibold text-[#6B7280] tracking-wider uppercase block truncate">
              DEPARTMENT
            </span>
            <span className="text-base sm:text-lg font-bold text-[#111827] font-sans truncate block">
              {issue.department}
            </span>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {/* Action 1: Assign Team */}
          <button
            onClick={() => onAssignTeam(issue)}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#374151] hover:text-[#111827] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            {issue.assignedTeam ? 'Reassign Team' : 'Assign Team'}
          </button>

          {/* Action 2: View Full Telemetry */}
          <button
            onClick={() => onViewTelemetry(issue)}
            className="px-4.5 py-2.5 bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer group/btn"
          >
            <span>View Full Telemetry</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
