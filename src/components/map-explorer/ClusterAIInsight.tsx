import React from 'react';
import { Sparkles, BrainCircuit, Activity, CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { MapClusterItem } from '../../services/mapExplorerService';

interface ClusterAIInsightProps {
  cluster: MapClusterItem;
}

export const ClusterAIInsight: React.FC<ClusterAIInsightProps> = ({ cluster }) => {
  return (
    <div className="space-y-4 text-left">
      {/* Eyebrow and Confidence Banner */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <BrainCircuit className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2563EB]">
            AI PATTERN INSIGHT
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>{cluster.aiConfidence}% Correlation Confidence</span>
        </div>
      </div>

      {/* Rationale Synthesis Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
        <p className="text-xs sm:text-[13px] text-[#334155] leading-relaxed font-medium">
          {cluster.aiClusterRationale}
        </p>

        {/* Root Cause Hypothesis Box */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#0F172A] uppercase">
            <Activity className="w-3 h-3 text-blue-600" />
            <span>Root Cause Analysis</span>
          </div>
          <p className="text-xs text-[#475569] leading-normal font-sans">
            {cluster.rootCauseHypothesis}
          </p>
        </div>

        {/* Recommended Action */}
        <div className="flex items-start gap-2 pt-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-mono font-bold text-[#0F172A] uppercase block">
              Suggested Municipal Action
            </span>
            <p className="text-xs text-[#64748B] mt-0.5">
              {cluster.recommendedResolution}
            </p>
          </div>
        </div>
      </div>

      {/* Contributing Citizen Signals Feed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-semibold text-[#64748B] px-1">
          <span>Contributing Signals ({cluster.contributingSignals.length})</span>
          <span>Temporal Alignment</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {cluster.contributingSignals.map((sig) => (
            <div
              key={sig.id}
              className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-xs space-y-1 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#0F172A] flex items-center gap-1">
                  {sig.user}
                  {sig.verified && (
                    <ShieldCheck className="w-3 h-3 text-emerald-600" aria-label="Verified Citizen" />
                  )}
                </span>
                <span className="font-mono text-[#64748B]">{sig.time} · {sig.distance}</span>
              </div>
              <p className="text-[#475569] text-xs leading-relaxed">
                "{sig.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
