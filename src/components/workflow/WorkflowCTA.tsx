import React from 'react';
import { ArrowRight, Sparkles, Shield, Users } from 'lucide-react';

interface WorkflowCTAProps {
  onOpenReportModal: () => void;
  onExplorePlatform: () => void;
}

export const WorkflowCTA: React.FC<WorkflowCTAProps> = ({
  onOpenReportModal,
  onExplorePlatform,
}) => {
  return (
    <section className="py-20 sm:py-28 bg-[#FBFBFA] border-t border-[#E5E7EB] relative overflow-hidden">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-[#0F1E36] rounded-3xl p-8 sm:p-12 md:p-16 text-center text-white shadow-[0_20px_50px_rgba(15,30,54,0.18)] relative overflow-hidden">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Full-Stack Civic Intelligence</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight text-white mb-6 leading-tight">
              Ready to transform your city?
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed font-sans">
              Join the municipalities and communities already using CiviNest to
              build smarter, more responsive, and auditable civic environments.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={onOpenReportModal}
                className="w-full sm:w-auto bg-white text-[#0F1E36] hover:bg-slate-100 font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>Get Started with CiviNest</span>
                <ArrowRight className="w-4 h-4 text-[#0F1E36]" />
              </button>

              <button
                type="button"
                onClick={onExplorePlatform}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white font-medium px-6 py-3.5 rounded-xl border border-white/20 transition-all duration-200 active:scale-98 text-sm cursor-pointer"
              >
                Explore Platform Overview
              </button>
            </div>

            {/* Trust Metrics below CTA */}
            <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                  99.9%
                </div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Audit Verifiability
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                  &lt; 0.2s
                </div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Cluster Synthesis
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                  100%
                </div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  PII Privacy Guaranteed
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowCTA;
