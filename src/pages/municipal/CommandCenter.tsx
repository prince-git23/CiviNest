import React from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Layers,
  MapPin,
  ChevronRight,
  FileText,
  Share2,
} from 'lucide-react';
import {
  commandMetrics,
  priorityQueue,
  departments,
  aiBriefData,
  municipalIssues,
} from '../../data/municipalMockData';

interface CommandCenterProps {
  onSelectPage?: (page: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onSelectPage }) => {
  return (
    <div className="space-y-6">
      {/* ── Top Metrics Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {commandMetrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold tracking-wide text-[#6B7280] uppercase">
                {metric.label}
              </span>
              <span className="text-base">{metric.icon}</span>
            </div>
            <span
              className={`text-2xl font-bold ${
                metric.color === 'red'
                  ? 'text-red-600'
                  : metric.color === 'orange'
                  ? 'text-orange-600'
                  : metric.color === 'blue'
                  ? 'text-blue-600'
                  : metric.color === 'green'
                  ? 'text-emerald-600'
                  : 'text-[#111827]'
              }`}
            >
              {metric.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Spatial Intelligence Map + Department Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spatial Intelligence Map */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#111827]">Spatial Intelligence</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Live telemetry from Ward 12-16
                </p>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#374151] bg-[#F3F4F6] rounded-lg hover:bg-[#E5E7EB] transition-colors border border-[#E5E7EB]">
                <Layers className="w-3.5 h-3.5" />
                Toggle Overlays
              </button>
            </div>

            {/* Map Placeholder (dark area) */}
            <div className="relative h-80 bg-[#1A2332] flex items-center justify-center">
              {/* Critical Mass Detection Overlay */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-semibold text-[#111827]">
                    Critical Mass Detection
                  </span>
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                  AI has identified a cluster of 5 water-logging reports within a 200m radius in
                  Manewada. Suggested immediate dispatch of high-capacity pumps.
                </p>
                <button className="px-4 py-2 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors">
                  Dispatch Resources
                </button>
              </div>
            </div>
          </div>

          {/* Department Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {departments.slice(0, 4).map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectPage?.('departments')}
              >
                <span className="text-lg mb-2 block">{dept.icon}</span>
                <h4 className="text-sm font-semibold text-[#111827] leading-tight mb-3">
                  {dept.name}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-[#111827]">{dept.activeIssues}</span>
                  <span className="text-xs text-[#6B7280]">Active</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-red-600">{dept.criticalIssues}</span>
                  <span className="text-xs text-red-600">Critical</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1/3: AI Priority Queue + AI Brief */}
        <div className="space-y-6">
          {/* AI Priority Queue */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#111827]">AI Priority Queue</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Clustered by severity and proximity
              </p>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {priorityQueue.map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-4 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-sm font-semibold text-[#111827] leading-tight flex-1">
                      {item.title}
                    </h4>
                    <span
                      className={`text-sm font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                        item.priority >= 90
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : item.priority >= 80
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-2">
                    {item.ward} • {item.reports} Reports
                  </p>
                  <p className="text-xs text-[#9CA3AF] mb-3">• {item.radius}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#6B7280]" />
                      <span className="text-[11px] text-[#6B7280]">
                        AI Confidence: <strong className="text-[#111827]">{item.confidence}%</strong>
                      </span>
                    </div>
                    <button
                      className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-1"
                      onClick={() => onSelectPage?.('issue-triage')}
                    >
                      View Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Municipal Brief */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6B7280]" />
                <h3 className="text-sm font-semibold text-[#111827]">AI Municipal Brief</h3>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-sm text-[#374151] leading-relaxed">
                <span className="font-semibold">{aiBriefData.greeting}</span>{' '}
                {aiBriefData.highlights[0].text}{' '}
                <span className="text-red-600 font-semibold">
                  {aiBriefData.highlights[1].text}
                </span>
                {aiBriefData.highlights[2].text}
              </p>
              <p className="text-sm text-[#374151] leading-relaxed">
                {aiBriefData.highlights[3].text}
              </p>
            </div>

            <div className="px-5 pb-5 flex items-center gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors">
                <FileText className="w-3.5 h-3.5" />
                Generate Full Report
              </button>
              <button className="p-2.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Re-export Sparkles for inline use
import { Sparkles } from 'lucide-react';

export default CommandCenter;
