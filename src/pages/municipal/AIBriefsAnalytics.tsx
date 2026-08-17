import React, { useState } from 'react';
import {
  Calendar,
  Download,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import { analyticsData } from '../../data/municipalMockData';

export const AIBriefsAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const { pipeline, issueVolumeTrends, departmentSLACompliance, aiPatterns } = analyticsData;

  // Simple SVG line chart for issue volume trends
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 20 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const allValues = issueVolumeTrends.flatMap((d) => [d.water, d.roads, d.sanitation]);
  const maxVal = Math.max(...allValues);
  const minVal = Math.min(...allValues) * 0.8;

  const getX = (i: number) => padding.left + (i / (issueVolumeTrends.length - 1)) * innerWidth;
  const getY = (val: number) =>
    padding.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;

  const makePath = (key: 'water' | 'roads' | 'sanitation') =>
    issueVolumeTrends
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[key])}`)
      .join(' ');

  const getSlaBarColor = (status: string) => {
    if (status === 'good') return 'bg-emerald-500';
    if (status === 'warning') return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Civic Intelligence & Analytics</h1>
          <p className="text-sm text-[#6B7280] mt-1 max-w-xl">
            Real-time macro analysis of municipal operations, anomaly detection, and cross-departmental
            SLA tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1E293B] rounded-lg hover:bg-[#0F172A] transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* ── Resolution Pipeline Funnel ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
            Resolution Pipeline Funnel
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {/* Raw Reports */}
          <div className="text-center">
            <p className="text-3xl font-bold text-[#111827]">
              {pipeline.rawReports.toLocaleString()}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">Raw Reports</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[11px] text-emerald-600 font-medium">
                {pipeline.rawReportsChange}
              </span>
            </div>
          </div>

          {/* AI Clustered */}
          <div className="text-center">
            <p className="text-3xl font-bold text-[#111827]">
              {pipeline.aiClustered.toLocaleString()}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">AI Clustered</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-[#F3F4F6] rounded text-[11px] text-[#6B7280] font-medium">
              {pipeline.volumeReduction}
            </span>
          </div>

          {/* Verified */}
          <div className="text-center">
            <p className="text-3xl font-bold text-[#111827]">
              {pipeline.verified.toLocaleString()}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">Verified</p>
            <span className="inline-flex items-center gap-1 mt-2 text-[11px] text-[#6B7280]">
              <Clock className="w-3 h-3" />
              {pipeline.avgTime}
            </span>
          </div>

          {/* Resolved */}
          <div className="text-center bg-blue-50/50 rounded-xl py-3 -my-3 border border-blue-100">
            <p className="text-3xl font-bold text-blue-700">
              {pipeline.resolved.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600 mt-1 font-medium">Resolved</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 rounded text-[11px] text-blue-700 font-medium">
              {pipeline.resolutionRate}
            </span>
          </div>

          {/* Citizen Confirmed */}
          <div className="text-center">
            <p className="text-3xl font-bold text-[#111827]">
              {pipeline.citizenConfirmed.toLocaleString()}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">Citizen Confirmed</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-[#F3F4F6] rounded text-[11px] text-[#6B7280] font-medium">
              {pipeline.satisfaction}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Charts + Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Volume Trends */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-[#111827]">Issue Volume Trends</h2>
              <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Water
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Roads
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Sanitation
                </span>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto"
              style={{ maxHeight: 240 }}
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = padding.top + innerHeight * (1 - pct);
                return (
                  <line
                    key={pct}
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Lines */}
              <path d={makePath('water')} fill="none" stroke="#3B82F6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              <path d={makePath('roads')} fill="none" stroke="#6366F1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              <path d={makePath('sanitation')} fill="none" stroke="#94A3B8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

              {/* Data points */}
              {issueVolumeTrends.map((d, i) => (
                <React.Fragment key={i}>
                  <circle cx={getX(i)} cy={getY(d.water)} r={3} fill="#3B82F6" />
                  <circle cx={getX(i)} cy={getY(d.roads)} r={3} fill="#6366F1" />
                  <circle cx={getX(i)} cy={getY(d.sanitation)} r={3} fill="#94A3B8" />
                </React.Fragment>
              ))}

              {/* X-axis labels */}
              {issueVolumeTrends.map((d, i) => (
                <text
                  key={i}
                  x={getX(i)}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  className="text-[10px] fill-[#9CA3AF]"
                >
                  {d.month}
                </text>
              ))}
            </svg>
          </div>

          {/* Department SLA Compliance */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-sm font-semibold text-[#111827]">Department SLA Compliance</h2>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
              <div>Department</div>
              <div>Compliance (Target 90%)</div>
              <div className="text-right">Avg Resp.</div>
              <div className="text-right">Avg Res.</div>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {departmentSLACompliance.map((dept) => (
                <div
                  key={dept.name}
                  className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        dept.status === 'good'
                          ? 'bg-blue-500'
                          : dept.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm font-medium text-[#374151]">{dept.name}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getSlaBarColor(dept.status)}`}
                          style={{ width: `${dept.compliance}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#111827] w-8 text-right">
                        {dept.compliance}%
                      </span>
                    </div>
                  </div>

                  <div
                    className={`text-right text-sm font-medium ${
                      dept.status === 'critical' ? 'text-red-600' : 'text-[#374151]'
                    }`}
                  >
                    {dept.avgResp}
                  </div>

                  <div className="text-right text-sm text-[#374151]">{dept.avgRes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1/3: AI Pattern Detection + Predictive Map */}
        <div className="space-y-6">
          {/* AI Pattern Detection */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6B7280]" />
                <h3 className="text-sm font-semibold text-[#111827]">AI Pattern Detection</h3>
              </div>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {aiPatterns.map((pattern, i) => (
                <div key={i} className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {pattern.severity === 'Highly Critical' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide ${
                        pattern.severity === 'Highly Critical'
                          ? 'text-red-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {pattern.severity}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-[#111827] mb-2">{pattern.title}</h4>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    {pattern.description}
                  </p>

                  <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                    Action Recommended:{' '}
                    <span className="text-[#111827]">{pattern.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Predictive Map */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                Active Predictive Map
              </h3>
            </div>

            <div className="relative h-64 bg-[#E8F0E8] flex items-center justify-center">
              {/* Simplified map representation */}
              <div className="absolute inset-0 opacity-30">
                <svg viewBox="0 0 400 250" className="w-full h-full">
                  {/* Roads */}
                  <line x1="0" y1="125" x2="400" y2="125" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="200" y1="0" x2="200" y2="250" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="100" y1="0" x2="100" y2="250" stroke="#CBD5E1" strokeWidth="1" />
                  <line x1="300" y1="0" x2="300" y2="250" stroke="#CBD5E1" strokeWidth="1" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#CBD5E1" strokeWidth="1" />
                  <line x1="0" y1="170" x2="400" y2="170" stroke="#CBD5E1" strokeWidth="1" />
                </svg>
              </div>

              {/* High Priority Zone */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                </div>
              </div>

              {/* Label */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#E5E7EB]">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[11px] font-semibold text-[#374151]">High Priority Zone</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBriefsAnalytics;
