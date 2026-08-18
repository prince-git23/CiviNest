import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  AlertTriangle,
  Layers,
  ChevronRight,
  FileText,
  Share2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { CivicMap } from '../../components/map/CivicMap';
import type { MapViewport, CivicIssue, IssueCluster } from '../../services/geo/geoTypes';
import { DEFAULT_VIEWPORT } from '../../services/geo/geoTypes';
import {
  getMunicipalDashboard,
  getMunicipalSpatial,
  getMunicipalAIBriefs,
  type MunicipalDashboardData,
  type AIBrief,
} from '../../services/municipalApi';

interface CommandCenterProps {
  onSelectPage?: (page: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onSelectPage }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MunicipalDashboardData | null>(null);
  const [brief, setBrief] = useState<AIBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ dashboard }, spatial, briefRes] = await Promise.all([
        getMunicipalDashboard(),
        getMunicipalSpatial(),
        getMunicipalAIBriefs(),
      ]);
      setData(dashboard);
      setBrief(briefRes);
      const priorityScore = (lvl?: string) =>
        ({ critical: 95, high: 80, medium: 60, low: 40 } as Record<string, number>)[(lvl || 'medium').toLowerCase()] || 60;
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
      setError(e?.message || 'Failed to load the command center.');
    } finally {
      setLoading(false);
    }
  }, []);

  const [mapIssues, setMapIssues] = useState<CivicIssue[]>([]);
  const [mapClusters, setMapClusters] = useState<IssueCluster[]>([]);
  const [mapViewport] = useState<MapViewport>({ ...DEFAULT_VIEWPORT, zoom: 12 });

  useEffect(() => {
    load();
  }, [load]);

  const metricsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<HTMLDivElement>(null);
  const briefRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current || loading) return;

    const ctx = gsap.context(() => {
      if (metricsRef.current) {
        gsap.from(metricsRef.current.children, { y: 20, opacity: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' });
      }
      if (mapRef.current) gsap.from(mapRef.current, { y: 30, opacity: 0, duration: 0.5, delay: 0.2, ease: 'power3.out' });
      if (queueRef.current) gsap.from(queueRef.current, { x: 20, opacity: 0, duration: 0.5, delay: 0.3, ease: 'power2.out' });
      if (briefRef.current) gsap.from(briefRef.current, { x: 20, opacity: 0, duration: 0.5, delay: 0.4, ease: 'power2.out' });
      if (deptRef.current) gsap.from(deptRef.current.children, { y: 15, opacity: 0, duration: 0.4, stagger: 0.08, delay: 0.35, ease: 'power2.out' });
    }, containerRef);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-[#6B7280]">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Loading command center...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-10 text-center">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button
          onClick={load}
          className="px-4 py-2 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const d = data!;
  const metrics = [
    { label: 'CRITICAL ISSUES', value: d.criticalIssues, color: 'red', icon: '⚠️' },
    { label: 'HIGH PRIORITY', value: d.highPriorityIssues, color: 'blue', icon: '❗' },
    { label: 'UNASSIGNED', value: d.unassignedIssues, color: 'gray', icon: '📋' },
    { label: 'IN PROGRESS', value: d.inProgressIssues, color: 'gray', icon: '🔧' },
    { label: 'SLA AT RISK', value: d.slaAtRisk, color: 'orange', icon: '⏰' },
    { label: 'PENDING VERIFY', value: d.pendingVerification, color: 'green', icon: '✅' },
  ];

  const metricColor = (color: string) =>
    color === 'red' ? 'text-red-600' : color === 'orange' ? 'text-orange-600' : color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-emerald-600' : 'text-[#111827]';

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Command Center</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Live operational overview · {d.updatedAt ? new Date(d.updatedAt).toLocaleTimeString() : ''}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Top Metrics Row ── */}
      <div ref={metricsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold tracking-wide text-[#6B7280] uppercase">{metric.label}</span>
              <span className="text-base">{metric.icon}</span>
            </div>
            <span className={`text-2xl font-bold ${metricColor(metric.color)}`}>{metric.value}</span>
          </div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Spatial Map + Department Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div ref={mapRef} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#111827]">Spatial Intelligence</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {d.activeClusters} active clusters · {d.spatialSummary.hotspots.length} hotspots
                </p>
              </div>
              <button
                onClick={() => onSelectPage?.('spatial-intelligence')}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#374151] bg-[#F3F4F6] rounded-lg hover:bg-[#E5E7EB] transition-colors border border-[#E5E7EB]"
              >
                <Layers className="w-3.5 h-3.5" />
                Open Spatial View
              </button>
            </div>

            <div className="relative h-80">
              {mapIssues.length || mapClusters.length ? (
                <CivicMap
                  viewport={mapViewport}
                  issues={mapIssues}
                  clusters={mapClusters}
                  className="w-full h-full"
                  style={{ height: 320 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#9CA3AF]">
                  No civic signals currently visible in this area.
                </div>
              )}
              {d.spatialSummary.hotspots[0] && (
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm font-semibold text-[#111827]">Top Hotspot</span>
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
                    {d.spatialSummary.hotspots[0].title} — priority{' '}
                    {d.spatialSummary.hotspots[0].priority}/100 in {d.spatialSummary.hotspots[0].ward}.
                  </p>
                  <button
                    onClick={() => onSelectPage?.('issue-triage')}
                    className="px-4 py-2 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors"
                  >
                    Review in Triage
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Department Cards */}
          <div ref={deptRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {d.departments.slice(0, 4).map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectPage?.('departments')}
              >
                <span className="text-lg mb-2 block">{dept.icon || '🏛️'}</span>
                <h4 className="text-sm font-semibold text-[#111827] leading-tight mb-3">{dept.name}</h4>
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
          <div ref={queueRef} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#111827]">AI Priority Queue</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">Clustered by severity and proximity</p>
              </div>
              <button
                onClick={() => onSelectPage?.('issue-triage')}
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {d.priorityQueue.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-4 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                  onClick={() => onSelectPage?.('issue-triage')}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-sm font-semibold text-[#111827] leading-tight flex-1">{item.title}</h4>
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
                    {item.ward || 'City-wide'} • {item.reports} Reports {item.clusterCode ? `• ${item.clusterCode}` : ''}
                  </p>
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
                      View Detail <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {d.priorityQueue.length === 0 && (
                <div className="p-8 text-center text-xs text-[#6B7280]">
                  No active civic issues require attention.
                </div>
              )}
            </div>
          </div>

          {/* AI Municipal Brief */}
          <div ref={briefRef} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6B7280]" />
                <h3 className="text-sm font-semibold text-[#111827]">AI Municipal Brief</h3>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {brief ? (
                brief.summary.map((s, i) => (
                  <p key={i} className="text-sm text-[#374151] leading-relaxed">
                    {s}
                  </p>
                ))
              ) : (
                <p className="text-sm text-[#6B7280]">AI analysis unavailable — showing actual metrics.</p>
              )}
            </div>

            <div className="px-5 pb-5 flex items-center gap-3">
              <button
                onClick={() => onSelectPage?.('ai-briefs-analytics')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E293B] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Open Analytics
              </button>
              <button
                onClick={() => onSelectPage?.('ai-briefs-analytics')}
                className="p-2.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                aria-label="Open AI briefs"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
