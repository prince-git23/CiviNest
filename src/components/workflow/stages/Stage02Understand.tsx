import React from 'react';
import { ArrowDown, GraduationCap, ShieldAlert, Tag, Sparkles } from 'lucide-react';

export const Stage02Understand: React.FC = () => {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        
        {/* Left: Stage 02 Narrative */}
        <div className="lg:col-span-6 flex justify-start lg:justify-end">
          <div className="max-w-md text-left lg:text-right">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2563EB] mb-3 block">
              UNDERSTAND
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#0F1E36] tracking-tight mb-3">
              AI extracts the structure.
            </h3>
            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-sans">
              Our intelligence engine instantly translates unstructured resident
              language into standardized municipal data fields, categorizing severity
              and context.
            </p>
          </div>
        </div>

        {/* Right: Structured Entity Extraction Card */}
        <div className="lg:col-span-6 flex justify-start">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_8px_28px_rgba(15,30,54,0.04)] p-6 sm:p-7 relative transition-all duration-300 hover:shadow-[0_12px_36px_rgba(15,30,54,0.07)]">
            
            {/* Raw Citizen Input Quote Box */}
            <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E5E7EB] mb-3 relative">
              <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider block mb-1">
                Raw Citizen Input
              </span>
              <p className="text-sm sm:text-[14px] text-[#1F2937] italic font-serif leading-relaxed">
                "Street light outside school has been off for three days."
              </p>
            </div>

            {/* AI Extraction Arrow Indicator */}
            <div className="flex items-center justify-center my-2 text-[#2563EB]">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#2563EB]">
                <ArrowDown className="w-4 h-4 animate-bounce" />
                <span className="text-[10px] uppercase font-semibold">NLP Entity Extraction</span>
              </div>
            </div>

            {/* Extracted Data Fields Grid */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Category Card */}
                <div className="bg-[#0F1E36] text-white rounded-xl p-3.5 shadow-xs">
                  <span className="text-[10px] font-mono text-blue-200 uppercase tracking-wider block mb-1">
                    Category
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-300" />
                    <span className="text-sm font-semibold tracking-tight">Lighting</span>
                  </div>
                </div>

                {/* Severity Card */}
                <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-xl p-3.5">
                  <span className="text-[10px] font-mono text-[#991B1B] uppercase tracking-wider block mb-1">
                    Severity
                  </span>
                  <div className="flex items-center gap-1.5 text-[#DC2626]">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span className="text-sm font-bold tracking-tight">High</span>
                  </div>
                </div>
              </div>

              {/* Location Context Full Width Box */}
              <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider block mb-0.5">
                    Location Context
                  </span>
                  <span className="text-sm font-semibold text-[#1F2937]">
                    Near School Zone
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#2563EB]">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-[11px] text-[#6B7280] font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Confidence: 96.8%</span>
              </span>
              <span className="text-emerald-600 font-medium">PII Stripped</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Stage02Understand;
