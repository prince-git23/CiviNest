import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, BarChart3, TrendingUp } from 'lucide-react';

export const Stage06Prioritize: React.FC = () => {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        
        {/* Left: Stage 06 Narrative */}
        <div className="lg:col-span-6 flex justify-start lg:justify-end">
          <div className="max-w-md text-left lg:text-right">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2563EB] mb-3 block">
              PRIORITIZE
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#0F1E36] tracking-tight mb-3">
              Data-driven urgency.
            </h3>
            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-sans">
              Not all issues are created equal. The system calculates an objective
              priority score based on safety risks, location vulnerability, and duration.
            </p>
          </div>
        </div>

        {/* Right: Objective Priority Score Card */}
        <div className="lg:col-span-6 flex justify-start">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_8px_28px_rgba(15,30,54,0.04)] p-6 sm:p-7 relative transition-all duration-300 hover:shadow-[0_12px_36px_rgba(15,30,54,0.07)]">
            
            {/* Top Score Summary */}
            <div className="flex items-center justify-between pb-5 border-b border-[#F1F5F9]">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#6B7280] tracking-wider block mb-1">
                  Composite Priority Score
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-mono font-bold text-[#0F1E36] tracking-tight">
                    92
                  </span>
                  <span className="text-lg font-mono text-[#9CA3AF]">/100</span>
                </div>
              </div>

              {/* Critical Priority Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold font-mono tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>Critical Priority</span>
              </div>
            </div>

            {/* Breakdown Metric Rows */}
            <div className="space-y-4 pt-5">
              
              {/* Metric 1: Safety Risk */}
              <div>
                <div className="flex justify-between text-xs font-medium text-[#374151] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                    <span>Safety Risk (Pedestrian Crossing)</span>
                  </span>
                  <span className="font-mono font-bold text-red-600">95%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full w-[95%]" />
                </div>
              </div>

              {/* Metric 2: Vulnerability Index */}
              <div>
                <div className="flex justify-between text-xs font-medium text-[#374151] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Vulnerability Index (School Zone)</span>
                  </span>
                  <span className="font-mono font-bold text-blue-600">4.0x Weight</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0F1E36] rounded-full w-[90%]" />
                </div>
              </div>

              {/* Metric 3: Duration */}
              <div>
                <div className="flex justify-between text-xs font-medium text-[#374151] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Outage Duration (Unresolved)</span>
                  </span>
                  <span className="font-mono font-bold text-amber-700">72+ Hrs</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[82%]" />
                </div>
              </div>

            </div>

            {/* Card Footer */}
            <div className="mt-5 pt-3.5 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#6B7280] font-mono">
              <span>SLA Target: &lt; 4 Hours</span>
              <span className="text-[#0F1E36] font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-red-500" />
                <span>Auto-Escalated</span>
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Stage06Prioritize;
