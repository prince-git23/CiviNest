import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Lightbulb,
  Droplet,
  SlidersHorizontal,
  Trash2,
  Share2,
  ChevronDown,
  ChevronUp,
  Shield,
  ThumbsUp,
  Image as ImageIcon,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { DashboardReportItem } from '../../types';
import ReportStatusBadge from './ReportStatusBadge';
import ReportTimeline from './ReportTimeline';
import CivicClusterCard from './CivicClusterCard';
import GovernmentActionCard from './GovernmentActionCard';
import ResolutionVerificationCard from './ResolutionVerificationCard';

interface ReportCardProps {
  report: DashboardReportItem;
  onConfirmResolution: (reportId: string) => void;
  onRequestReopen: (reportId: string) => void;
  onViewCluster?: (clusterId: string) => void;
  onInspectDetails?: (report: DashboardReportItem) => void;
  className?: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onConfirmResolution,
  onRequestReopen,
  onViewCluster,
  onInspectDetails,
  className = '',
}) => {
  const [showFullTimeline, setShowFullTimeline] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(report.upvotes || 0);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvoted) {
      setUpvoted(false);
      setUpvoteCount((prev) => prev - 1);
    } else {
      setUpvoted(true);
      setUpvoteCount((prev) => prev + 1);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lighting':
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
      case 'water':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'roads':
        return <SlidersHorizontal className="w-4 h-4 text-slate-600" />;
      case 'sanitation':
      default:
        return <Trash2 className="w-4 h-4 text-rose-500" />;
    }
  };

  const isResolved =
    report.status.toLowerCase().includes('resolved') ||
    report.status.toLowerCase().includes('closed');

  return (
    <article
      id={`report-card-${report.id}`}
      className={`rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 text-left space-y-5 ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Category Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 mt-0.5">
            {getCategoryIcon(report.category)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                {report.reportNumber}
              </span>
              <ReportStatusBadge status={report.status} />
              {report.severity === 'critical' && (
                <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 uppercase">
                  Critical Priority
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight leading-snug">
              {report.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] mt-1 font-mono">
              <span className="flex items-center gap-1 text-[#475569]">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                <span className="font-medium">{report.location}</span>
              </span>
              <span>•</span>
              <span>{report.reportedAgo}</span>
            </div>
          </div>
        </div>

        {/* Upvote & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleUpvote}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-colors cursor-pointer border ${
              upvoted
                ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
            title="Community Confirmations"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${upvoted ? 'fill-current' : ''}`} />
            <span>{upvoteCount}</span>
          </button>
        </div>
      </div>

      {/* Narrative Description */}
      {report.description && (
        <p className="text-xs sm:text-sm text-[#334155] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#F1F5F9]">
          {report.description}
        </p>
      )}

      {/* View details action */}
      {onInspectDetails && (
        <div className="pt-1">
          <button
            onClick={() => onInspectDetails(report)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] hover:border-[#CBD5E1] transition-all cursor-pointer group"
          >
            <span className="text-xs font-bold text-[#2563EB] group-hover:underline">
              View Full Report
            </span>
            <ChevronRight className="w-4 h-4 text-[#2563EB]" />
          </button>
        </div>
      )}

      {/* Resolution Verification Card (if report is resolved or was reopened) */}
      {(isResolved || report.status === 'Reopened') && (
        <ResolutionVerificationCard
          resolution={report.resolution}
          reportId={report.id}
          reportTitle={report.title}
          onConfirmResolution={onConfirmResolution}
          onRequestReopen={onRequestReopen}
        />
      )}

      {/* Civic Issue Cluster (if this report belongs to an aggregated cluster) */}
      {report.cluster && (
        <CivicClusterCard
          cluster={report.cluster}
          onViewCluster={onViewCluster}
        />
      )}

      {/* Government Action Card */}
      <GovernmentActionCard action={report.governmentAction} />

      {/* Report Timeline */}
      {report.timeline && report.timeline.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B]">
              Signal Progress & Accountability Timeline
            </h4>
            <button
              onClick={() => setShowFullTimeline(!showFullTimeline)}
              className="text-[11px] font-mono text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {showFullTimeline ? (
                <>
                  <span>Collapse</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>Expand History</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {showFullTimeline && <ReportTimeline events={report.timeline} />}
        </div>
      )}
    </article>
  );
};

export default ReportCard;
