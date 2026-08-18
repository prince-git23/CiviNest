import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  getMunicipalAnalytics,
  getMunicipalAIBriefs,
  getMunicipalSpatial,
  type MunicipalAnalytics,
  type AIBrief,
} from '../../services/municipalApi';
import { CivicMap } from '../../components/map/CivicMap';
import type { MapViewport, CivicIssue, IssueCluster } from '../../services/geo/geoTypes';
import { DEFAULT_VIEWPORT } from '../../services/geo/geoTypes';

export const AIBriefsAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<MunicipalAnalytics | null>(null);
  const [brief, setBrief] = useState<AIBrief | null>(null);
  const [mapIssues, setMapIssues] = useState<CivicIssue[]>([]);
  const [mapClusters, setMapClusters] = useState<IssueCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, briefRes, spatial] = await Promise.all([
        getMunicipalAnalytics(),
        getMunicipalAIBriefs(),
        getMunicipalSpatial(),
      ]);
      setAnalytics(analyticsRes);
      setBrief(briefRes);
      setMapIssues(
        spatial.issues.map((i) => ({
          id: i.id,
          title: i.title,
          category: (i.category || 'infrastructure') as CivicIssue['category'],
          latitude: i.latitude,
          longitude: i.longitude,
          ward: i.ward,
          locality: i.locality,
          priority: i.priority,
          confidence: 0,
          reportCount: i.reportCount,
          confirmationCount: i.confirmationCount,
          status: (i.status.toLowerCase().replace(/\s+/g, '-')) as CivicIssue['status'],
        }))
      );
      setMapClusters(
        spatial.clusters.map((c) => ({
          id: c.id,
          title: c.title,
          category: (c.category || 'infrastructure') as IssueCluster['category'],
          latitude: c.latitude,
          longitude: c.longitude,
          issueCount: c.reportCount,
          priority: c.priority,
          confidence: 0,
          ward: c.ward,
          locality: c.locality,
          status: (c.status.toLowerCase().replace(/\s+/g, '-')) as IssueCluster['status'],
        }))
      );
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mapViewport: MapViewport = { ...DEFAULT_VIEWPORT, zoom: 12 };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-[#6B7280]">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading analytics...
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-10 text-center">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button onClick={load} className="px-4 py-2 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors">Retry</button>
      </div>
    );
  }

  const a = analytics!;
  const pipeline = a.pipeline;

  // SVG line chart from real weekly trend
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 30 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const trend = a.issueVolumeTrend;
  const maxVal = Math.max(1, ...trend.map((d) => d.count));
  const getX = (i: number) => padding.left + (i / Math.max(1, trend.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - (val / maxVal) * innerHeight;
  const path = trend.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.count)}`).join(' ');

  const slaBarColor = (compliance: number) => (compliance >= 90 ? 'bg-emerald-500' : compliance >= 70 ? 'bg-amber-500' : 'bg-red-500');

  const aiPatterns = (brief?.criticalIssues || []).slice(0, 3).map((ci) => ({
    severity: ci.priority >= 90 ? 'Highly Critical' : 'High Priority',
    title: ci.title,
    description: `${ci.reportNumber} in ${ci.ward || 'the city'} at priority ${ci.priority}/100. Status: ${ci.status}.`,
    action: 'REVIEW IN TRIAGE',
  }));

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Civic Intelligence & Analytics</h1>
          <p className="text-sm text-[#6B7280] mt-1 max-w-xl">
            Real-time macro analysis of municipal operations, anomaly detection, and cross-departmental SLA tracking.
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1E293B] rounded-lg hover:bg-[#0F172A] transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* ── Resolution Pipeline Funnel ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Resolution Pipeline Funnel</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#111827]">{pipeline.rawReports.toLocaleString()}</p>
            <p className="text-xs text-[#6B7280] mt-1">Raw Reports</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#111827]">{pipeline.aiClustered.toLocaleString()}</p>
            <p className="text-xs text-[#6B7280] mt-1">AI Clustered</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-[#F3F4F6] rounded text-[11px] text-[#6B7280] font-medium">
              {a.summary.totalClusters} clusters
            </span>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#111827]">{pipeline.verified.toLocaleString()}</p>
            <p className="text-xs text-[#6B7280] mt-1">Confirmations</p>
          </div>
          <div className="text-center bg-blue-50/50 rounded-xl py-3 -my-3 border border-blue-100">
            <p className="text-3xl font-bold text-blue-700">{pipeline.resolved.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1 font-medium">Resolved</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 rounded text-[11px] text-blue-700 font-medium">
              {a.summary.resolutionRate}% Resolution Rate
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Volume Trends */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-[#111827]">Issue Volume Trend (30d)</h2>
              <span className="text-xs text-[#6B7280]">{a.summary.newIssues30d} issues in last 30 days</span>
            </div>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" style={{ maxHeight: 240 }}>
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = padding.top + innerHeight * (1 - pct);
                return <line key={pct} x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="#E5E7EB" strokeWidth={1} />;
              })}
              <path d={path} fill="none" stroke="#3B82F6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {trend.map((d, i) => (
                <React.Fragment key={i}>
                  <circle cx={getX(i)} cy={getY(d.count)} r={3} fill="#3B82F6" />
                  <text x={getX(i)} y={chartHeight - 5} textAnchor="middle" className="text-[10px] fill-[#9CA3AF]">{d.label}</text>
                </React.Fragment>
              ))}
            </svg>
          </div>

          {/* Department SLA Compliance */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#111827]">Department SLA Compliance</h2>
              <span className="text-xs text-[#6B7280]">
                Overall: <strong>{a.sla.compliance}%</strong> ({a.sla.withinTarget}/{a.sla.total} resolved within target)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
              <div className="col-span-2">Department</div>
              <div>Active</div>
              <div className="text-right">Resolution Rate</div>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {(a.departments || []).map((dept) => (
                <div key={dept.name} className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center gap-2 col-span-2">
                    <span className={`w-2 h-2 rounded-full ${dept.resolutionRate >= 80 ? 'bg-emerald-500' : dept.resolutionRate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium text-[#374151]">{dept.name}</span>
                  </div>
                  <div className="text-sm text-[#374151]">{dept.active}</div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${slaBarColor(dept.resolutionRate)}`} style={{ width: `${dept.resolutionRate}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-[#111827] w-9 text-right">{dept.resolutionRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {(a.departments || []).length === 0 && (
                <div className="p-8 text-center text-xs text-[#6B7280]">Not enough historical data to calculate this metric yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1/3: AI Brief + Patterns */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6B7280]" />
                <h3 className="text-sm font-semibold text-[#111827]">AI Pattern Detection</h3>
              </div>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {brief ? (
                brief.summary.map((s, i) => (
                  <div key={i} className="p-5">
                    <p className="text-xs text-[#4B5563] leading-relaxed">{s}</p>
                  </div>
                ))
              ) : (
                <div className="p-5 text-xs text-[#6B7280]">AI analysis unavailable — showing actual metrics.</div>
              )}
              {aiPatterns.map((pattern, i) => (
                <div key={i} className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-red-600">{pattern.severity}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#111827] mb-2">{pattern.title}</h4>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">{pattern.description}</p>
                  <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                    Action Recommended: <span className="text-[#111827]">{pattern.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real predictive map */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">Civic Hotspot Map</h3>
            </div>
            <div className="relative h-64">
              <CivicMap viewport={mapViewport} issues={mapIssues} clusters={mapClusters} className="w-full h-full" style={{ height: 256 }} compact />
              {brief?.topCluster && (
                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#E5E7EB]">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[11px] font-semibold text-[#374151]">{brief.topCluster.clusterCode} · priority {brief.topCluster.priority}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBriefsAnalytics;
