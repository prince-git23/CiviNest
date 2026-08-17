import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Award, ArrowRight, MapPin, Clock, ShieldCheck, Share2, PlusCircle, ExternalLink } from 'lucide-react';
import { gsap } from 'gsap';
import { CivicSignalSubmission } from '../../services/signalAnalysisService';

interface SignalSuccessViewProps {
  submission: CivicSignalSubmission;
  onReturnToDashboard: () => void;
  onCreateAnother: () => void;
}

export const SignalSuccessView: React.FC<SignalSuccessViewProps> = ({
  submission,
  onReturnToDashboard,
  onCreateAnother,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="max-w-2xl mx-auto my-8 p-6 sm:p-8 bg-white border border-[#E5E7EB] rounded-3xl shadow-xl text-left"
    >
      {/* Success Badge & Headline */}
      <div className="flex items-center gap-3.5 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 mb-1 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
            Civic Signal Broadcasted
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F1E36] tracking-tight">
            Signal Ingested & Routed
          </h2>
        </div>
      </div>

      {/* Ticket Details Card */}
      <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3.5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Ticket Number
            </span>
            <div className="text-base font-mono font-bold text-[#0F1E36]">
              {submission.reportNumber}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Status
            </span>
            <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Verified & Ward Queued
            </div>
          </div>
        </div>

        {/* Location & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#4B5563]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{submission.location.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{submission.timestamp}</span>
          </div>
        </div>

        {/* Description snippet */}
        <div className="text-xs text-[#374151] bg-white p-3.5 rounded-xl border border-[#E5E7EB] leading-relaxed">
          "{submission.description}"
        </div>

        {/* AI Triage & Department Routing */}
        {submission.analysis && (
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-[#0F1E36]">
              <span>Assigned Agency:</span>
              <span className="text-blue-700">{submission.analysis.suggestedDepartment}</span>
            </div>
            <div className="flex items-center justify-between text-[#4B5563]">
              <span>Triage Classification:</span>
              <span>{submission.analysis.categoryLabel} ({submission.analysis.severityLabel})</span>
            </div>
          </div>
        )}
      </div>

      {/* Impact Reward Card */}
      <div className="flex items-center justify-between p-4 bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Civic Impact Earned
            </div>
            <div className="text-xs text-amber-700">
              Your signal validated municipal mesh telemetry
            </div>
          </div>
        </div>
        <div className="text-right font-mono font-extrabold text-lg text-amber-800">
          +25 PTS
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onReturnToDashboard}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-[#0F1E36] hover:bg-[#1E293B] active:scale-98 text-white px-5 py-3.5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
        >
          <span>Return to Resident Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onCreateAnother}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:scale-98 text-[#374151] border border-[#D1D5DB] px-4 py-3.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Another Issue</span>
        </button>
      </div>
    </div>
  );
};
