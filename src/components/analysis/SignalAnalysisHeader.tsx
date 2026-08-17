import React from 'react';
import { Sparkles, Edit3, ShieldCheck, Check } from 'lucide-react';

interface SignalAnalysisHeaderProps {
  onEditReport: () => void;
  onConfirmContinue: () => void;
  isConfirming?: boolean;
}

export const SignalAnalysisHeader: React.FC<SignalAnalysisHeaderProps> = ({
  onEditReport,
  onConfirmContinue,
  isConfirming = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 sm:mb-8 text-left">
      <div className="space-y-1.5 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4B5563]">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>AI-ASSISTED ANALYSIS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F1E36] tracking-tight font-sans">
          Here’s what CiviNest understood.
        </h1>
        <p className="text-sm text-[#4B5563] leading-relaxed pt-1">
          Our AI has processed your civic signal. Review the structured data, confidence metrics, and contextual correlations before finalizing your report.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 shrink-0 pt-1">
        <button
          type="button"
          onClick={onEditReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D1D5DB] bg-white hover:bg-gray-50 active:scale-98 text-xs font-semibold text-[#374151] transition-all shadow-2xs cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#6B7280]" />
          <span>Edit Report</span>
        </button>

        <button
          type="button"
          onClick={onConfirmContinue}
          disabled={isConfirming}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] active:scale-98 text-xs font-bold text-white transition-all shadow-sm cursor-pointer disabled:opacity-75"
        >
          {isConfirming ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Finalizing...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Confirm & Continue</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
