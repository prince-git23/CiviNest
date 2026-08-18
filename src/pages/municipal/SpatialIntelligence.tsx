import React, { useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import {
  Search,
  SlidersHorizontal,
  X,
  Crosshair,
  TrendingUp,
  TrendingDown,
  Sparkles,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { getMunicipalSpatial, type SpatialData } from '../../services/municipalApi';
import { CivicMap } from '../../components/map/CivicMap';
import type { MapViewport, CivicIssue, IssueCluster } from '../../services/geo/geoTypes';
import { DEFAULT_VIEWPORT } from '../../services/geo/geoTypes';

interface SpatialIntelligenceProps {
  onSelectPage?: (page: string) => void;
}

export const SpatialIntelligence: React.FC<SpatialIntelligenceProps> = ({ onSelectPage }) => {
  const [data, setData] = useState<SpatialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const spatial = await getMunicipalSpatial({
        category: categoryFilter || undefined,
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
      });
      setData(spatial);
      setSelectedWard((prev) => prev || (spatial.wards[0]?.name ?? null));
    } catch (e: any) {
      setError(e?.message || 'Failed to load spatial intelligence.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, severityFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const panels = document.querySelectorAll('[data-animate="panel"]');
    gsap.fromTo(panels, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' });
  }, [loading]);

  const mapViewport: MapViewport = { ...DEFAULT_VIEWPORT, zoom: 13 };

  const mapIssues: CivicIssue[] = (data?.issues || []).map((i) => ({
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
  }));

  const mapClusters: IssueCluster[] = (data?.clusters || []).map((c) => ({
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
  }));

  const selectedWardData = data?.wards.find((w) => w.name === selectedWard);
  const adjacentWards = (data?.wards || []).filter((w) => w.name !== selectedWard).slice(0, 4);

  const categoryCounts: Record<string, number> = {};
  for (const i of data?.issues || []) {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  }
  const topCategories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxCatCount = Math.max(1, ...topCategories.map((c) => c.count));

  const layers = [
    { id: 'issues', name: 'Issue Markers', active: true },
    { id: 'clusters', name: 'Civic Clusters', active: true },
    { id: 'wards', name: 'Ward Density', active: true },
  ];

  return (
    <div className="space-y-4">
      {/* ── Search Bar ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-3">
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter issues by title or report ID..."
            className="flex-1 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none bg-transparent"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={load}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#F3F4F6]">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-1.5 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#374151] outline-none cursor-pointer">
              <option value="">All Categories</option>
              {[...new Set((data?.issues || []).map((i) => i.category))].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="px-3 py-1.5 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#374151] outline-none cursor-pointer">
              <option value="">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#374151] outline-none cursor-pointer">
              <option value="">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Verification">Verification</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
            </select>
            {error && <span className="text-xs text-red-600 ml-auto">{error}</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Left Panel: Layers ── */}
        <div className="space-y-4">
          <div data-animate="panel" className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Active Layers</h3>
              <span className="text-xs font-semibold text-[#2563EB]">{loading ? '...' : `${(data?.clusters || []).length} clusters`}</span>
            </div>
            <div className="space-y-3">
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${layer.active ? 'bg-[#1E293B]' : 'bg-[#D1D5DB]'}`} />
                    <span className="text-sm text-[#374151]">{layer.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hotspots */}
          <div data-animate="panel" className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6B7280]" />
                <h3 className="text-sm font-semibold text-[#111827]">Hotspots</h3>
              </div>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {(data?.hotspots || []).map((h) => (
                <button
                  key={h.clusterId}
                  onClick={() => onSelectPage?.('issue-triage')}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors cursor-pointer text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{h.title}</p>
                    <p className="text-[11px] text-[#6B7280]">{h.clusterCode} · {h.ward} · {h.reportCount} reports</p>
                  </div>
                  <span className="text-sm font-bold px-2 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 shrink-0 ml-2">
                    {h.priority}
                  </span>
                </button>
              ))}
              {(data?.hotspots || []).length === 0 && (
                <div className="p-8 text-center text-xs text-[#6B7280]">
                  No active civic clusters in the selected area.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Center: Real Geographic Map ── */}
        <div data-animate="panel" className="lg:col-span-1 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden min-h-[500px] relative">
          <CivicMap
            viewport={mapViewport}
            issues={mapIssues}
            clusters={mapClusters}
            className="w-full h-full"
            style={{ minHeight: 500 }}
          />
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm text-[#6B7280]">
              Loading map data...
            </div>
          )}
        </div>

        {/* ── Right Panel: Ward Analysis ── */}
        <div className="space-y-4">
          {selectedWardData && (
            <div data-animate="panel" className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">{selectedWardData.name} Analysis</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {selectedWardData.activeIssues} active · {selectedWardData.resolvedIssues} resolved
                  </p>
                </div>
                <button onClick={() => setSelectedWard(null)} className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F9FAFB] rounded-xl p-4">
                    <p className="text-xs text-[#6B7280] mb-1">Active Issues</p>
                    <p className="text-3xl font-bold text-[#111827]">{selectedWardData.activeIssues}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-[11px] text-emerald-600 font-medium">Live count</span>
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="text-xs text-red-600 mb-1 font-medium">Critical Priority</p>
                    <p className="text-3xl font-bold text-red-700">{selectedWardData.criticalIssues}</p>
                    <p className="text-[11px] text-red-600 mt-1 font-medium">Require immediate action</p>
                  </div>
                </div>

                <div className="bg-[#F9FAFB] rounded-xl p-4">
                  <p className="text-xs text-[#6B7280] mb-1">Over SLA</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-[#111827]">{selectedWardData.overSla}</p>
                    <span className="text-sm text-[#6B7280]">issues</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Top Categories</p>
                  {topCategories.length ? (
                    <div className="space-y-3">
                      {topCategories.map((cat) => (
                        <div key={cat.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-[#374151]">{cat.name}</span>
                            <span className="text-sm font-semibold text-[#111827]">{cat.count}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div className="h-full bg-[#1E293B] rounded-full" style={{ width: `${(cat.count / maxCatCount) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#6B7280]">Not enough civic activity to generate this metric yet.</p>
                  )}
                </div>

                <button
                  onClick={() => onSelectPage?.('ai-briefs-analytics')}
                  className="w-full py-2.5 bg-[#1E293B] text-white text-sm font-semibold rounded-lg hover:bg-[#0F172A] transition-colors"
                >
                  Generate AI Brief for {selectedWardData.name}
                </button>
              </div>
            </div>
          )}

          {/* Ward Load */}
          <div data-animate="panel" className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#111827]">Ward Load</h3>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-[#F9FAFB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                <div className="col-span-2">Ward</div>
                <div className="text-right">Active</div>
                <div className="text-right">Critical</div>
              </div>
              {(data?.wards || []).map((ward) => (
                <div
                  key={ward.id}
                  className={`grid grid-cols-4 gap-4 px-5 py-3 items-center cursor-pointer transition-colors ${
                    selectedWard === ward.name ? 'bg-blue-50/60' : 'hover:bg-[#F9FAFB]'
                  }`}
                  onClick={() => setSelectedWard(ward.name)}
                >
                  <div className="col-span-2 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ward.status === 'CRITICAL' ? 'bg-red-500' : ward.status === 'ELEVATED' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span className="text-sm text-[#374151]">{ward.name}</span>
                  </div>
                  <div className="text-right text-sm text-[#374151]">{ward.activeIssues}</div>
                  <div className={`text-right text-sm font-semibold ${ward.criticalIssues > 0 ? 'text-red-600' : 'text-[#374151]'}`}>
                    {ward.criticalIssues}
                  </div>
                </div>
              ))}
              {(data?.wards || []).length === 0 && (
                <div className="p-8 text-center text-xs text-[#6B7280]">
                  No ward data available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpatialIntelligence;
