import React, { useState } from 'react';
import { MessageSquare, Sparkles, CheckCircle2, ArrowRight, Zap, ChevronRight, Filter } from 'lucide-react';

interface ScenarioData {
  id: string;
  category: string;
  clusterTitle: string;
  clusterLocation: string;
  priorityScore: number;
  aggregatedReports: number;
  aiConfidence: number;
  status: string;
  escalationTarget: string;
  signals: {
    id: string;
    text: string;
    reportNum: string;
    sector: string;
    timeAgo: string;
    nlpTags: string[];
  }[];
}

const scenarios: ScenarioData[] = [
  {
    id: 'lighting',
    category: 'Infrastructure / Public Safety',
    clusterTitle: 'Street Lighting Failure',
    clusterLocation: 'Sector 14 & Main St Area',
    priorityScore: 92,
    aggregatedReports: 25,
    aiConfidence: 91,
    status: 'Verified',
    escalationTarget: 'Escalated to Dept. of Energy & Public Works',
    signals: [
      {
        id: '1',
        text: '"Streetlight near the park is flickering again. Very dark."',
        reportNum: '#442',
        sector: 'Sector 14',
        timeAgo: '2h ago',
        nlpTags: ['streetlight', 'flickering', 'darkness'],
      },
      {
        id: '2',
        text: '"Completely pitch black on Main St. Unsafe to walk."',
        reportNum: '#449',
        sector: 'Main St',
        timeAgo: '4h ago',
        nlpTags: ['pitch black', 'safety hazard', 'pedestrian'],
      },
      {
        id: '3',
        text: '"Bulb burnt out outside my house for 3 days."',
        reportNum: '#451',
        sector: 'Sector 14',
        timeAgo: '1d ago',
        nlpTags: ['bulb burnt out', 'multi-day failure'],
      },
    ],
  },
  {
    id: 'water',
    category: 'Utilities / Water Grid',
    clusterTitle: 'Main Line Pressure Anomaly',
    clusterLocation: 'Sector 09 — West Ridge Quad',
    priorityScore: 88,
    aggregatedReports: 19,
    aiConfidence: 94,
    status: 'Verified',
    escalationTarget: 'Escalated to Municipal Water Authority',
    signals: [
      {
        id: '4',
        text: '"Low water pressure since 7am, barely a trickle from tap."',
        reportNum: '#512',
        sector: 'West Ridge 4B',
        timeAgo: '1h ago',
        nlpTags: ['low pressure', 'potable supply'],
      },
      {
        id: '5',
        text: '"Water looks slightly brownish near 5th ave fire hydrant."',
        reportNum: '#518',
        sector: 'West Ridge 5th',
        timeAgo: '2h ago',
        nlpTags: ['discoloration', 'hydrant leak'],
      },
      {
        id: '6',
        text: '"Rattling pipes in apartment building block 12."',
        reportNum: '#524',
        sector: 'Sector 09',
        timeAgo: '5h ago',
        nlpTags: ['cavitation', 'pipe rattle'],
      },
    ],
  },
];

export const NoiseToContextSection: React.FC = () => {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);

  const current = scenarios[activeScenarioIdx];

  return (
    <section id="platform" className="py-20 md:py-32 bg-[#FBFBFA] border-t border-[#F0F2F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#0F1E36] tracking-tight mb-5 leading-tight">
            Cities don't lack complaints.
            <br />
            <span className="italic font-light">They lack context.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed max-w-2xl mx-auto">
            Raw data is noisy. CiviNest uses AI to find the signal in the noise,
            grouping individual reports into verified community issues.
          </p>

          {/* Interactive Scenario Switcher */}
          <div className="flex items-center justify-center gap-2 mt-7">
            <span className="text-xs font-mono text-[#9CA3AF] uppercase mr-1">Scenario:</span>
            {scenarios.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => {
                  setActiveScenarioIdx(idx);
                  setSelectedSignalId(null);
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  activeScenarioIdx === idx
                    ? 'bg-[#0F1E36] text-white shadow-xs'
                    : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                }`}
              >
                {sc.clusterTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Main Side-by-Side Transformation Card Container */}
        <div className="bg-[#F6F7F8]/80 rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            
            {/* Left Column: Disconnected Signals */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <MessageSquare className="w-4 h-4 text-[#6B7280]" />
                <h3 className="text-xs font-mono font-bold tracking-wider text-[#6B7280] uppercase">
                  Disconnected Signals
                </h3>
              </div>

              <div className="space-y-3">
                {current.signals.map((signal) => {
                  const isSelected = selectedSignalId === signal.id;
                  return (
                    <div
                      key={signal.id}
                      onClick={() => setSelectedSignalId(isSelected ? null : signal.id)}
                      className={`bg-white rounded-xl p-4 border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs ${
                        isSelected
                          ? 'border-[#2563EB] ring-2 ring-blue-100'
                          : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                      }`}
                    >
                      <p className="text-[14px] text-[#1F2937] italic font-serif leading-relaxed mb-2.5">
                        {signal.text}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-[#6B7280] font-sans">
                        <span className="font-medium text-[#4B5563]">
                          Report {signal.reportNum} • {signal.sector} • {signal.timeAgo}
                        </span>
                        {isSelected && (
                          <span className="text-blue-600 font-mono text-[10px] font-semibold">
                            NLP Extracted
                          </span>
                        )}
                      </div>

                      {/* Expanded NLP insight preview */}
                      {isSelected && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-1.5 animate-in fade-in duration-150">
                          {signal.nlpTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded-md border border-blue-200/60"
                            >
                              +{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center Transformation Node */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center py-2 lg:py-0 relative">
              {/* Horizontal / Vertical connection line */}
              <div className="hidden lg:block absolute h-full w-[1px] bg-gradient-to-b from-transparent via-[#CBD5E1] to-transparent" />

              {/* Central Synthesis Badge */}
              <div className="relative z-10 w-11 h-11 rounded-full bg-[#0F1E36] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105">
                <Sparkles className="w-5 h-5 text-blue-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280] mt-2 text-center uppercase tracking-widest">
                AI Synthesis
              </span>
            </div>

            {/* Right Column: Civic Issue Cluster Card */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 pb-2">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-xs font-mono font-bold tracking-wider text-[#6B7280] uppercase">
                  Civic Issue Cluster
                </h3>
              </div>

              <div className="bg-white rounded-xl p-6 sm:p-7 border border-[#E5E7EB] shadow-[0_8px_24px_rgba(15,30,54,0.04)] relative overflow-hidden">
                {/* Accent line at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#0F1E36]" />

                {/* Cluster Header */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-[#0F1E36] tracking-tight">
                      {current.clusterTitle}
                    </h4>
                    <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                      {current.clusterLocation}
                    </p>
                  </div>

                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-red-50 text-red-700 border border-red-200/80 whitespace-nowrap">
                    Priority {current.priorityScore}/100
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="space-y-3.5 mb-6 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Aggregated Reports</span>
                    <span className="font-mono font-semibold text-[#111827]">
                      {current.aggregatedReports}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">AI Confidence</span>
                    <span className="font-mono font-semibold text-[#0F1E36]">
                      {current.aiConfidence}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Status</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{current.status}</span>
                    </span>
                  </div>
                </div>

                {/* Action Progress Rail */}
                <div className="pt-4 border-t border-[#F3F4F6]">
                  <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden mb-2">
                    <div className="bg-[#0F1E36] h-full rounded-full w-4/5 transition-all duration-700" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6B7280] font-sans">
                    <span>Automated Action Pipeline</span>
                    <span className="text-[#0F1E36] font-medium truncate max-w-[220px]">
                      {current.escalationTarget}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default NoiseToContextSection;
