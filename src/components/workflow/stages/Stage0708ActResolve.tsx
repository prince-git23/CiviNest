import React, { useState } from 'react';
import { ArrowDown, Wrench, CheckCircle2, XCircle, Sparkles, Building2, Send, Check } from 'lucide-react';

export const Stage0708ActResolve: React.FC = () => {
  const [resolutionStatus, setResolutionStatus] = useState<'idle' | 'verified_fixed' | 'reopened'>('idle');

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        
        {/* Stage 07: Act Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-[0_8px_30px_rgba(15,30,54,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0F1E36] text-white font-mono text-xs font-bold">
                07
              </span>
              <h4 className="text-xl font-serif text-[#0F1E36] font-normal">
                Act (Direct Department Routing)
              </h4>
            </div>

            <p className="text-sm text-[#4B5563] leading-relaxed mb-6 font-sans">
              Intelligent routing pushes the synthesized cluster directly to the correct municipal department, bypassing administrative bottlenecks.
            </p>

            {/* Visual Routing Flow */}
            <div className="space-y-3">
              {/* Origin Issue Card */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
                    Validated Cluster
                  </span>
                  <span className="text-sm font-semibold text-[#0F1E36]">
                    Issue #8842 (Lighting Outage)
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold">
                  Priority 92
                </span>
              </div>

              {/* Animated Routing Arrow */}
              <div className="flex items-center justify-center py-1">
                <div className="flex items-center gap-1 text-[11px] font-mono text-[#2563EB]">
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  <span>Automated Work Order Generated</span>
                </div>
              </div>

              {/* Target Municipal Department Card */}
              <div className="bg-[#0F1E36] text-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-300">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-blue-200 uppercase tracking-wider block">
                      Target Dept Dispatch
                    </span>
                    <span className="text-sm font-semibold text-white">
                      Electrical Services • Crew #4
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-emerald-400 block font-semibold">
                    Dispatched
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">ETA 45m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B] font-mono text-[11px]">
            <span>Zero Manual Triaging Delay</span>
            <span className="text-[#0F1E36] font-semibold">Instant API Hook</span>
          </div>
        </div>

        {/* Stage 08: Verify Resolution Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-[0_8px_30px_rgba(15,30,54,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#2563EB] text-white font-mono text-xs font-bold">
                08
              </span>
              <h4 className="text-xl font-serif text-[#0F1E36] font-normal">
                Verify Resolution
              </h4>
            </div>

            <p className="text-sm text-[#4B5563] leading-relaxed mb-6 font-sans">
              The loop isn't closed until the community says so. Reporters are pinged with instant micro-surveys to confirm the fix on the ground.
            </p>

            {/* Interactive Community Feedback Card */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 relative">
              
              {/* Municipal Status update */}
              <div className="flex items-start gap-2.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <p className="text-xs sm:text-sm text-[#374151] font-sans">
                  <strong>Municipal Update:</strong> City workers marked <em>"Lighting Outage at 5th Ave"</em> as completed.
                </p>
              </div>

              {resolutionStatus === 'idle' ? (
                <div>
                  <p className="text-sm font-semibold text-[#0F1E36] mb-3">
                    Is this issue actually fixed in your neighborhood?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setResolutionStatus('reopened')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-[#374151] transition-colors active:scale-98 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>Not Fixed</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolutionStatus('verified_fixed')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0F1E36] hover:bg-slate-800 text-white text-xs font-medium transition-all active:scale-98 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Yes, Fixed</span>
                    </button>
                  </div>
                </div>
              ) : resolutionStatus === 'verified_fixed' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <h5 className="text-sm font-bold text-emerald-900 mb-0.5 font-serif">
                    Community Verified &amp; Closed
                  </h5>
                  <p className="text-xs text-emerald-700 font-mono">
                    98% Community Satisfaction • Ticket Archival Complete
                  </p>
                  <button
                    type="button"
                    onClick={() => setResolutionStatus('idle')}
                    className="mt-3 text-[11px] text-emerald-800 underline font-mono cursor-pointer"
                  >
                    Reset Demo
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto mb-2">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <h5 className="text-sm font-bold text-red-900 mb-0.5 font-serif">
                    Re-Escalated to Supervisor
                  </h5>
                  <p className="text-xs text-red-700 font-mono">
                    Audit Flag Triggered • Quality Review Initiated
                  </p>
                  <button
                    type="button"
                    onClick={() => setResolutionStatus('idle')}
                    className="mt-3 text-[11px] text-red-800 underline font-mono cursor-pointer"
                  >
                    Reset Demo
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B] font-mono text-[11px]">
            <span>Closed-Loop Trust Architecture</span>
            <span className="text-emerald-600 font-semibold">100% Accountable</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Stage0708ActResolve;
