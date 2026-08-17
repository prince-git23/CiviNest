import React, { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, PlusCircle, Users, Clock, MapPin, ArrowRight, Shield } from 'lucide-react';
import { gsap } from 'gsap';
import { DuplicateIssueMatch } from '../../services/signalAnalysisService';

interface DuplicateIssuePanelProps {
  duplicate: DuplicateIssueMatch;
  decision: 'none' | 'merged' | 'new_confirmed';
  onConfirmSameIssue: () => void;
  onConfirmCreateNew: () => void;
}

export const DuplicateIssuePanel: React.FC<DuplicateIssuePanelProps> = ({
  duplicate,
  decision,
  onConfirmSameIssue,
  onConfirmCreateNew,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 12, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [duplicate.id]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl border border-blue-200 bg-linear-to-b from-blue-50/70 to-white p-4 sm:p-5 shadow-xs transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-[#0F1E36] uppercase tracking-wide">
            Similar Issue Found
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200">
          {duplicate.similarityScore}% Signal Match
        </span>
      </div>

      {/* Duplicate Report Card */}
      <div className="bg-white rounded-xl border border-blue-100 p-3.5 mb-4 shadow-2xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-700">{duplicate.reportNumber}</span>
              <span className="text-[11px] text-[#6B7280]">·</span>
              <span className="text-xs text-[#6B7280] font-medium">{duplicate.category}</span>
            </div>
            <h5 className="text-sm font-semibold text-[#111827]">{duplicate.title}</h5>
            <p className="text-xs text-[#4B5563] mt-1 line-clamp-2 leading-relaxed">
              {duplicate.description}
            </p>
          </div>
        </div>

        {/* Telemetry metadata tags */}
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-2.5 border-t border-[#F1F5F9] text-xs text-[#6B7280]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
            {duplicate.reportedAgo}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            {duplicate.distance}
          </span>
          <span className="flex items-center gap-1 font-medium text-[#0F1E36]">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            {duplicate.supportCount} neighboring reports merged
          </span>
        </div>
      </div>

      {/* Decision CTAs */}
      {decision === 'none' && (
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            id="btn-confirm-same-issue"
            onClick={onConfirmSameIssue}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-[#0F1E36] hover:bg-[#1E293B] active:scale-98 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Yes, same issue (+10 Impact pts)</span>
          </button>
          <button
            type="button"
            id="btn-confirm-create-new"
            onClick={onConfirmCreateNew}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-white hover:bg-[#F9FAFB] active:scale-98 text-[#374151] border border-[#D1D5DB] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer"
          >
            <span>No, create new signal</span>
          </button>
        </div>
      )}

      {decision === 'merged' && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Signal linked to <strong>{duplicate.reportNumber}</strong>! Your voice increases priority weight and prevents duplicate ticket fragmentation.
          </span>
        </div>
      )}

      {decision === 'new_confirmed' && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl text-[#374151] text-xs font-medium animate-in fade-in">
          <PlusCircle className="w-4 h-4 text-[#0F1E36] shrink-0" />
          <span>
            Marked as a distinct new civic signal. Will be processed and logged as a new ticket.
          </span>
        </div>
      )}
    </div>
  );
};
