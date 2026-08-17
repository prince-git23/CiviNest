import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, ThumbsUp, XCircle, RotateCcw } from 'lucide-react';
import { ResolutionVerificationInfo } from '../../types';

interface ResolutionVerificationCardProps {
  resolution?: ResolutionVerificationInfo | null;
  reportId: string;
  reportTitle: string;
  onConfirmResolution: (reportId: string) => void;
  onRequestReopen: (reportId: string) => void;
  className?: string;
}

export const ResolutionVerificationCard: React.FC<ResolutionVerificationCardProps> = ({
  resolution,
  reportId,
  reportTitle,
  onConfirmResolution,
  onRequestReopen,
  className = '',
}) => {
  const isConfirmed = resolution?.residentConfirmed || resolution?.isVerifiedByResident;

  if (isConfirmed && resolution?.residentConfirmed) {
    return (
      <div
        className={`rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-left flex items-start gap-3 ${className}`}
      >
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
            Resolution Confirmed by You
          </h4>
          <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
            Thank you for verifying this civic fix. You earned <span className="font-bold">+40 Civic Score</span> points for closing the community feedback loop.
          </p>
          {resolution.verifiedAt && (
            <span className="text-[10.5px] font-mono text-emerald-700 block mt-1">
              Verified on {resolution.verifiedAt}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (resolution?.reopenedReason) {
    return (
      <div
        className={`rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-left flex items-start gap-3 ${className}`}
      >
        <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <RotateCcw className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-rose-950">
            Report Reopened by Resident
          </h4>
          <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
            Reason: "{resolution.reopenedReason}". Municipal field supervisor has been notified for re-inspection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50/50 via-white to-blue-50/30 p-4 sm:p-5 shadow-xs text-left ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">
          Civic Resolution Verification
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-[#0F172A]">
            Is this actually fixed on the ground?
          </h4>
          <p className="text-xs text-[#475569] mt-0.5">
            The municipal contractor marked this signal complete. Your confirmation holds the agency accountable.
          </p>
        </div>

        {/* Verification Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onRequestReopen(reportId)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Still Not Fixed</span>
          </button>

          <button
            onClick={() => onConfirmResolution(reportId)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirm Resolution</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResolutionVerificationCard;
