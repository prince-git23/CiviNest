import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, Layers, Network, Sparkles, Users } from 'lucide-react';

export const Stage0405VerifyConnect: React.FC = () => {
  const [pulseCount, setPulseCount] = useState(25);
  const [activeTab, setActiveTab] = useState<'all' | 'verified'>('all');

  const corroboratingReports = [
    {
      id: 'rep-1',
      text: 'Dark intersection at 5th & Elm',
      time: '2 mins ago',
      verified: true,
      userTag: 'Resident #41',
    },
    {
      id: 'rep-2',
      text: 'Lights out by the school crossing',
      time: '15 mins ago',
      verified: true,
      userTag: 'Parent Group',
    },
    {
      id: 'rep-3',
      text: 'Broken streetlight, dangerous for kids',
      time: '1 hour ago',
      verified: true,
      userTag: 'School Crossing Guard',
    },
  ];

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2563EB] mb-3 inline-block">
          VERIFY & CONNECT
        </span>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-[#0F1E36] tracking-tight mb-4">
          From isolated complaints to undeniable civic truths.
        </h3>
        <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed max-w-2xl mx-auto font-sans">
          One complaint can be ignored. Twenty-five geo-verified signals at the same
          school crossing trigger immediate municipal attention.
        </p>
      </div>

      {/* Dual Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Card 04: Verify (Light Card) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-[0_8px_30px_rgba(15,30,54,0.04)] flex flex-col justify-between">
          <div>
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2FE] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold uppercase tracking-wider mb-4">
              <span>04 Verify</span>
            </div>

            <h4 className="text-xl font-serif text-[#0F1E36] mb-2 font-normal">
              Corroboration Engine
            </h4>
            <p className="text-sm text-[#4B5563] leading-relaxed mb-6 font-sans">
              Cross-referencing multiple reports builds trust, verifies facts, and establishes community urgency.
            </p>

            {/* List of Corroborating Reports */}
            <div className="space-y-3">
              {corroboratingReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex items-start justify-between gap-3 hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-serif italic text-[#1F2937]">
                      "{report.text}"
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#64748B] font-mono">
                      <span>{report.userTag}</span>
                      <span>•</span>
                      <span>{report.time}</span>
                    </div>
                  </div>
                  
                  {/* Verified Check Badge */}
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-mono text-[11px]">3 Corroborations in 60 min</span>
            <span className="text-blue-600 font-semibold font-mono text-[11px]">
              Deduplication Active
            </span>
          </div>
        </div>

        {/* Card 05: Connect (Deep Navy Constellation Card) */}
        <div className="lg:col-span-7 bg-[#0F1E36] text-white rounded-3xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(15,30,54,0.18)] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E293B] border border-slate-700 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <span>05 Connect</span>
            </div>

            <h4 className="text-xl font-serif text-white mb-2 font-normal">
              Civic Issue Node Synthesis
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl font-sans mb-6">
              25 isolated reports seamlessly cluster into a single, massive Civic Issue Node with verified spatial bounds.
            </p>

            {/* Interactive Network Constellation Visualizer */}
            <div className="relative w-full h-[220px] bg-[#0A1426]/70 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
              {/* Radial Coordinate Lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220">
                <circle cx="200" cy="110" r="90" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeDasharray="3,3" />
                <circle cx="200" cy="110" r="55" fill="none" stroke="rgba(59, 130, 246, 0.25)" />
                
                {/* Connecting Lines */}
                {[
                  [70, 60], [90, 160], [130, 40], [140, 180],
                  [270, 40], [280, 180], [330, 60], [320, 160]
                ].map(([x, y], idx) => (
                  <g key={idx}>
                    <line
                      x1={x}
                      y1={y}
                      x2="200"
                      y2="110"
                      stroke="rgba(59, 130, 246, 0.4)"
                      strokeWidth="1.2"
                    />
                    {/* Pulsing signal packet along line */}
                    <circle cx={x} cy={y} r="4" fill="#3B82F6" className="animate-pulse" />
                  </g>
                ))}
              </svg>

              {/* Central Master Cluster Node */}
              <div className="relative z-10 flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 shadow-[0_0_30px_rgba(59,130,246,0.6)] border-2 border-blue-300 animate-pulse">
                <span className="text-2xl font-bold font-mono tracking-tight text-white">
                  {pulseCount}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-blue-100 font-mono">
                  Signals
                </span>
              </div>

              {/* Tag Overlays */}
              <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400">
                Spatial Radius: 250m
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Single Actionable Item</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">Cluster ID #CK-4091</span>
            <span className="text-blue-400 font-medium font-mono text-[11px]">
              Ready for Prioritization
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Stage0405VerifyConnect;
