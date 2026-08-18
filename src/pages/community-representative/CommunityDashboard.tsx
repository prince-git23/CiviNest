import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  AlertTriangle,
  Users,
  FileText,
  CheckCircle,
  MapPin,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { CivicMetricCard } from '../../components/community/CivicMetricCard';
import { CommunityContextHeader } from '../../components/community/CommunityContextHeader';
import { CommunityHealthCard } from '../../components/community/CommunityHealthCard';
import { CivicMap } from '../../components/map/CivicMap';
import type { CivicIssue, IssueCluster } from '../../services/geo/geoTypes';
import { DEFAULT_VIEWPORT } from '../../services/geo/geoTypes';
import { getCommunityDashboard, getCommunityMapData, getCommunityIssue } from '../../services/communityApi';
import type { CommunityDashboardData, CommunityIssue } from '../../services/communityApi';

interface CommunityDashboardProps {
  onNavigateToIssues?: () => void;
  onNavigateToAggregation?: () => void;
}

export const CommunityDashboard: React.FC<CommunityDashboardProps> = ({
  onNavigateToIssues,
  onNavigateToAggregation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<CommunityDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapIssues, setMapIssues] = useState<CivicIssue[]>([]);
  const [mapClusters, setMapClusters] = useState<IssueCluster[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CommunityIssue | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<{ id: string; title: string; category: string; severity: string; priorityScore: number; reportCount: number; confirmationCount: number; ward: string; locality: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { dashboard } = await getCommunityDashboard();
      setData(dashboard);
      const map = await getCommunityMapData();
      const priorityScore = (lvl?: string) =>
        ({ critical: 95, high: 80, medium: 60, low: 40 } as Record<string, number>)[(lvl || 'medium').toLowerCase()] || 60;
      setMapIssues(
        map.issues.map((i) => ({
          id: i.id,
          title: i.title,
          category: (i.category || 'infrastructure') as CivicIssue['category'],
          latitude: i.latitude,
          longitude: i.longitude,
          ward: i.ward,
          locality: i.locality,
          priority: priorityScore(i.priority),
          confidence: 0,
          reportCount: i.reportCount,
          confirmationCount: i.confirmationCount,
          status: (i.status.toLowerCase().replace(/\s+/g, '-')) as CivicIssue['status'],
        }))
      );
      setMapClusters(
        map.clusters.map((c) => ({
          id: c.id,
          title: c.title,
          category: (c.category || 'infrastructure') as IssueCluster['category'],
          latitude: c.center.latitude,
          longitude: c.center.longitude,
          issueCount: c.reportCount,
          priority: c.priority.score,
          confidence: 0,
          ward: c.ward,
          locality: c.locality,
          status: (c.status.toLowerCase().replace(/\s+/g, '-')) as IssueCluster['status'],
        }))
      );
    } catch (e: any) {
      setError(e?.message || 'Failed to load the community dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current || !data) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.metric-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.3 });
      gsap.fromTo('.health-card', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', delay: 0.5 });
      gsap.fromTo('.issue-item', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.7 });
    }, containerRef);
    return () => ctx.revert();
  }, [data]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Assigned': return 'bg-yellow-100 text-yellow-700';
      case 'Reopened': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const openIssueDetail = async (issue: CommunityIssue) => {
    setSelectedIssue(issue);
    try {
      const { issue: detail } = await getCommunityIssue(issue.id);
      setSelectedIssue(detail);
    } catch {
      // Keep the list-level data — the drawer still renders from it.
    }
  };

  // ── Loading ──
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-40 rounded-2xl bg-[#E5E7EB]/60 animate-pulse" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="h-[400px] rounded-2xl bg-[#E5E7EB]/60 animate-pulse" />
            <div className="h-64 rounded-2xl bg-[#E5E7EB]/60 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-[#E5E7EB]/60 animate-pulse" />
              ))}
            </div>
            <div className="h-80 rounded-2xl bg-[#E5E7EB]/60 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-bold text-[#0F1E36] mb-1">Unable to load the community dashboard</h2>
        <p className="text-sm text-[#6B7280] mb-6">{error}</p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F1E36] text-white text-xs font-semibold rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const hasIssues = data.activeIssues.length > 0;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Community Context Header */}
      <div className="health-card">
        <CommunityContextHeader data={data.community} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Map & Health */}
        <div className="xl:col-span-2 space-y-6">
          {/* Community Spatial View */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2563EB]" />
                  Community Spatial View
                </h2>
                <p className="text-xs text-[#6B7280] mt-1">
                  Real civic issue and cluster locations from your community
                </p>
              </div>
              {mapIssues.length === 0 && mapClusters.length === 0 && (
                <span className="text-[11px] font-mono text-[#6B7280]">No civic signals visible in this area</span>
              )}
            </div>
            <div className="h-[400px] relative">
              <CivicMap
                viewport={{ ...DEFAULT_VIEWPORT, zoom: 13.5 }}
                issues={mapIssues}
                clusters={mapClusters}
                className="w-full h-full"
                style={{ height: 400 }}
                onSelectIssue={(issue) => {
                  const match = data.activeIssues.find((a) => a.id === issue.id);
                  if (match) openIssueDetail(match);
                }}
                onSelectCluster={(cluster) => {
                  const match = data.activeClusters.find((c) => c.id === cluster.id);
                  if (match) {
                    setSelectedCluster({
                      id: match.id,
                      title: match.title,
                      category: match.category,
                      severity: match.severity,
                      priorityScore: match.priority.score,
                      reportCount: match.reportCount,
                      confirmationCount: match.confirmationCount,
                      ward: match.ward,
                      locality: match.locality,
                    });
                  }
                }}
              />
            </div>
            {selectedCluster && (
              <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">{selectedCluster.title}</h3>
                    <p className="text-xs text-[#6B7280]">
                      {selectedCluster.category} · {selectedCluster.ward}
                      {selectedCluster.locality ? ` · ${selectedCluster.locality}` : ''}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedCluster.severity)}`}>
                    {selectedCluster.severity}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">{selectedCluster.reportCount}</div>
                    <div className="text-xs text-[#6B7280]">Reports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">{selectedCluster.confirmationCount}</div>
                    <div className="text-xs text-[#6B7280]">Confirmations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">{selectedCluster.priorityScore}/100</div>
                    <div className="text-xs text-[#6B7280]">Priority</div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={onNavigateToAggregation}
                    className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
                  >
                    Review in Aggregation →
                  </button>
                </div>
              </div>
            )}
            {selectedIssue && (
              <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">{selectedIssue.title}</h3>
                    <p className="text-xs text-[#6B7280]">{selectedIssue.categoryLabel || selectedIssue.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedIssue.severity)}`}>
                      {selectedIssue.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">{selectedIssue.reportCount}</div>
                    <div className="text-xs text-[#6B7280]">Reports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">{selectedIssue.confirmationCount}</div>
                    <div className="text-xs text-[#6B7280]">Confirmations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">{selectedIssue.priorityScore}/100</div>
                    <div className="text-xs text-[#6B7280]">Priority</div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={onNavigateToIssues}
                    className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
                  >
                    View Full Issue →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Community Health Card */}
          <div className="health-card">
            <CommunityHealthCard
              data={{
                score: data.health.score,
                maxScore: data.health.maxScore,
                status: data.health.status as CommunityHealthCardStatus,
                explanation: data.health.explanation,
                activeClusters: data.health.activeClusters,
                trend: data.health.trend,
                segments: data.health.segments,
              }}
              onClusterClick={onNavigateToAggregation}
            />
          </div>
        </div>

        {/* Right Column: Metrics & Issues */}
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="metric-card">
              <CivicMetricCard
                title="Active Issues"
                value={data.metrics.activeIssues.count}
                icon={AlertTriangle}
                trend={data.metrics.activeIssues.trend}
                trendValue={data.metrics.activeIssues.change}
                secondaryLabel="issues requiring attention"
              />
            </div>
            <div className="metric-card">
              <CivicMetricCard
                title="Confirmations"
                value={data.metrics.confirmations.count}
                icon={CheckCircle}
                secondaryLabel={`from ${data.metrics.confirmations.issueCount} clusters`}
              />
            </div>
            <div className="metric-card">
              <CivicMetricCard
                title="Open Cases"
                value={data.metrics.openCases.count}
                icon={FileText}
                secondaryLabel={`${data.metrics.openCases.awaitingCount} awaiting response`}
              />
            </div>
            <div className="metric-card">
              <CivicMetricCard
                title="Municipal Response"
                value={data.metrics.municipalResponse.coveragePercent}
                icon={Activity}
                suffix="%"
                secondaryLabel={`${data.metrics.municipalResponse.count} issues responded`}
              />
            </div>
          </div>

          {/* Top Priority Issues */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111827]">Top Priority Issues</h3>
              {hasIssues && (
                <button
                  type="button"
                  onClick={onNavigateToIssues}
                  className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium cursor-pointer"
                >
                  View All →
                </button>
              )}
            </div>
            {hasIssues ? (
              <div className="space-y-3">
                {data.activeIssues.slice(0, 4).map((issue) => (
                  <div
                    key={issue.id}
                    className="issue-item p-3 rounded-xl border border-[#E5E7EB] hover:border-[#2563EB] hover:shadow-sm transition-all duration-200 cursor-pointer"
                    onClick={() => openIssueDetail(issue)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-[#111827]">{issue.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {issue.reportCount} reports
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {issue.confirmationCount} confirmations
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-mono font-bold text-[#0F1E36]">{issue.priorityScore}/100</span>
                      <span className="text-xs text-[#6B7280]">{issue.categoryLabel || issue.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
                <p className="text-sm text-[#6B7280]">No active civic issues have been recorded in your community.</p>
              </div>
            )}
          </div>

          {/* Municipal Cases */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111827]">Municipal Cases</h3>
            </div>
            {data.municipalCases.length > 0 ? (
              <div className="space-y-3">
                {data.municipalCases.slice(0, 5).map((mCase) => (
                  <div
                    key={mCase.id}
                    className="p-3 rounded-xl border border-[#E5E7EB] hover:border-[#2563EB] hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-semibold text-[#0F1E36]">{mCase.caseId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(mCase.status)}`}>
                        {mCase.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-[#111827]">{mCase.issue}</h4>
                    <p className="text-xs text-[#6B7280] mt-1">{mCase.department}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-[#6B7280] py-6">No municipal cases yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Response Distribution */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
        <h3 className="text-sm font-semibold text-[#111827] mb-4">Municipal Response Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#0F1E36]">{data.responseDistribution.responded}</div>
            <div className="text-sm text-[#6B7280]">Responded</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#F59E0B]">{data.responseDistribution.awaiting}</div>
            <div className="text-sm text-[#6B7280]">Awaiting</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#10B981]">{data.responseDistribution.resolved}</div>
            <div className="text-sm text-[#6B7280]">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#EF4444]">{data.responseDistribution.reopened}</div>
            <div className="text-sm text-[#6B7280]">Reopened</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-[#F9FAFB] rounded-lg">
          <p className="text-xs text-[#4B5563]">{data.responseDistribution.insight}</p>
        </div>
      </div>
    </div>
  );
};

type CommunityHealthCardStatus = 'Stable' | 'Improving' | 'Needs Attention' | 'At Risk';

export default CommunityDashboard;
