import React from 'react';
import {
  ClipboardList,
  ChevronRight,
  Lightbulb,
  Droplet,
  SlidersHorizontal,
  Trash2,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { DashboardReportItem } from '../../types';

interface ActiveReportsProps {
  reports: DashboardReportItem[];
  onSelectReport: (report: DashboardReportItem) => void;
  onViewAll?: () => void;
}

export const ActiveReports: React.FC<ActiveReportsProps> = ({
  reports,
  onSelectReport,
  onViewAll,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lighting':
        return <Lightbulb className="w-4 h-4 text-[#F59E0B]" />;
      case 'water':
        return <Droplet className="w-4 h-4 text-[#2563EB]" />;
      case 'roads':
        return <SlidersHorizontal className="w-4 h-4 text-[#4B5563]" />;
      case 'sanitation':
      default:
        return <Trash2 className="w-4 h-4 text-[#EF4444]" />;
    }
  };

  const getStatusBadge = (status: DashboardReportItem['status']) => {
    switch (status) {
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-medium tracking-wide uppercase bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
            Under Review
          </span>
        );
      case 'Verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-semibold tracking-wide uppercase bg-blue-50 text-[#2563EB] border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            Verification
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-medium tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Resolved
          </span>
        );
      case 'Assigned':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-medium tracking-wide uppercase bg-purple-50 text-purple-700 border border-purple-100">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            Assigned
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs transition-all duration-200 hover:shadow-md text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#0F1E36]" />
            <h3 className="text-base font-semibold text-[#0F1E36]">My Active Filings</h3>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">Status of issues you've reported.</p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer"
          >
            View All
          </button>
        )}
      </div>

      {/* Reports List */}
      <div className="divide-y divide-[#F3F4F6]">
        {reports.map((report) => (
          <div
            key={report.id}
            onClick={() => onSelectReport(report)}
            className="py-3.5 flex items-center justify-between gap-4 group cursor-pointer hover:bg-[#F9FAFB]/70 px-2 -mx-2 rounded-xl transition-all duration-150"
          >
            {/* Left Category Icon & Report Metadata */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 group-hover:border-[#CBD5E1] transition-colors">
                {getCategoryIcon(report.category)}
              </div>

              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors truncate">
                  {report.title}
                </h4>
                <p className="text-xs text-[#6B7280] font-mono mt-0.5 truncate">
                  {report.reportedAgo} · {report.reportNumber}
                </p>
              </div>
            </div>

            {/* Right Status Badge & Arrow */}
            <div className="flex items-center gap-2 shrink-0">
              {getStatusBadge(report.status)}
              <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#0F1E36] group-hover:translate-x-0.5 transition-all duration-150" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveReports;
