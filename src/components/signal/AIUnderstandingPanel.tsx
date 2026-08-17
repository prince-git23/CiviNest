import React, { useEffect, useRef } from 'react';
import { Sparkles, Brain, Cpu, CheckCircle2, AlertTriangle, Shield, Check, Info } from 'lucide-react';
import { gsap } from 'gsap';
import { ExtractedSignalMetadata } from '../../services/signalAnalysisService';

export type AIAnalysisState = 'idle' | 'analyzing' | 'analyzed' | 'error';

interface AIUnderstandingPanelProps {
  state: AIAnalysisState;
  metadata: ExtractedSignalMetadata | null;
  errorMessage?: string;
}

export const AIUnderstandingPanel: React.FC<AIUnderstandingPanelProps> = ({
  state,
  metadata,
  errorMessage,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state === 'analyzed' && tagsRef.current) {
      gsap.fromTo(
        tagsRef.current.children,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [state, metadata]);

  return (
    <div
      ref={panelRef}
      className={`w-full rounded-2xl border transition-all duration-300 p-4 sm:p-5 ${
        state === 'analyzing'
          ? 'bg-[#F8FAFC] border-blue-200 ring-2 ring-blue-500/10'
          : state === 'analyzed'
          ? 'bg-white border-[#E2E8F0] shadow-xs'
          : state === 'error'
          ? 'bg-amber-50/50 border-amber-200'
          : 'bg-[#F9FAFB]/70 border-[#E5E7EB]'
      }`}
    >
      {/* Header / State Title */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {state === 'analyzing' ? (
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center animate-spin">
              <Cpu className="w-3 h-3" />
            </div>
          ) : state === 'analyzed' ? (
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Check className="w-3 h-3" />
            </div>
          ) : (
            <Brain className="w-4 h-4 text-[#9CA3AF]" />
          )}

          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              state === 'analyzing'
                ? 'text-blue-600'
                : state === 'analyzed'
                ? 'text-[#0F1E36]'
                : 'text-[#6B7280]'
            }`}
          >
            {state === 'analyzing'
              ? 'CIVINEST IS UNDERSTANDING...'
              : state === 'analyzed'
              ? 'CIVIC SIGNAL CONTEXT EXTRACTED'
              : state === 'error'
              ? 'CIVINEST SIGNAL UNDERSTANDING'
              : 'CIVINEST WILL ANALYZE YOUR SIGNAL'}
          </span>
        </div>

        {state === 'analyzed' && metadata && (
          <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
            {metadata.confidence}% AI Confidence
          </span>
        )}
      </div>

      {/* State Body */}
      {state === 'idle' && (
        <div className="flex items-center gap-4 text-xs text-[#9CA3AF] mt-2 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
            Category
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
            Severity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
            Routing Urgency
          </span>
        </div>
      )}

      {state === 'analyzing' && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs text-[#4B5563]">
              Synthesizing natural language against ward municipal ontology...
            </span>
          </div>
          <div className="w-full bg-blue-100/60 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-2/3 animate-[pulse_1s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {state === 'analyzed' && metadata && (
        <div ref={tagsRef} className="mt-3 space-y-3">
          {/* Extracted Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Tag */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#0F1E36] text-white shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              {metadata.categoryLabel}
            </span>

            {/* Severity Tag */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                metadata.severity === 'critical'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : metadata.severity === 'high'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  metadata.severity === 'critical'
                    ? 'bg-red-600'
                    : metadata.severity === 'high'
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
              />
              {metadata.severityLabel}
            </span>

            {/* Subcategory & Issue Type */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs text-[#374151] bg-[#F3F4F6] border border-[#E5E7EB]">
              {metadata.subcategory}
            </span>

            {/* Routing Action */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs text-[#4B5563] bg-[#F9FAFB] border border-[#E5E7EB]">
              {metadata.suggestedDepartment}
            </span>
          </div>

          {/* Context summary row */}
          <div className="text-xs text-[#4B5563] flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 border-t border-[#F1F5F9]">
            <span>
              <strong className="text-[#111827]">Suggested Action:</strong> {metadata.suggestedAction}
            </span>
            <span>
              <strong className="text-[#111827]">Urgency:</strong> {metadata.urgency}
            </span>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="mt-2 text-xs text-amber-800 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            {errorMessage || "We couldn't analyze this signal automatically yet. You can still continue to submit."}
          </span>
        </div>
      )}
    </div>
  );
};
