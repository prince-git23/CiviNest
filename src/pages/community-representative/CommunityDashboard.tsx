import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  AlertTriangle,
  Users,
  FileText,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  MapPin,
  Clock,
  Activity,
} from 'lucide-react';
import { CivicMetricCard } from '../../components/community/CivicMetricCard';
import { CommunityContextHeader } from '../../components/community/CommunityContextHeader';
import { CommunityHealthCard } from '../../components/community/CommunityHealthCard';
import { CivicMap } from '../../components/map/CivicMap';
import { MapSearch } from '../../components/map/MapSearch';
import type { MapViewport } from '../../services/geo/geoTypes';
import { DEFAULT_VIEWPORT } from '../../services/geo/geoTypes';
import { getIssuesForViewport } from '../../services/geo/mapDataService';
import type {
  CommunityContext,
  CommunityHealthData,
  CivicMetrics,
  PrioritizedIssue,
  ConsensusCategory,
  MunicipalCase,
  ResponseDistributionData,
} from '../../types';

// Mock data for Community Dashboard
const mockCommunityData: {
  community: CommunityContext;
  health: CommunityHealthData;
  metrics: CivicMetrics;
  activeIssues: PrioritizedIssue[];
  consensus: ConsensusCategory[];
  municipalCases: MunicipalCase[];
  responseDistribution: ResponseDistributionData;
} = {
  community: {
    name: 'Green Valley Residency',
    role: 'Community Representative',
    location: 'Ward 12, Nagpur',
    city: 'Nagpur',
    lastUpdated: 'Updated 5 mins ago',
  },
  health: {
    score: 82,
    maxScore: 100,
    status: 'Improving',
    explanation: 'Community health is trending positive with 3 resolved issues this week and increased resident participation.',
    activeClusters: 4,
    trend: 'up',
    segments: [
      { category: 'Infrastructure', score: 78, color: '#3B82F6' },
      { category: 'Safety', score: 85, color: '#10B981' },
      { category: 'Sanitation', score: 72, color: '#F59E0B' },
      { category: 'Community', score: 91, color: '#8B5CF6' },
    ],
  },
  metrics: {
    activeIssues: { count: 12, change: 3, trend: 'up' },
    confirmations: { count: 28, issueCount: 8 },
    openCases: { count: 8, awaitingCount: 3 },
    municipalResponse: { count: 15, coveragePercent: 85 },
  },
  activeIssues: [
    {
      id: 'issue-1',
      title: 'Street Lighting Failure',
      reportCount: 25,
      confirmationCount: 8,
      priorityScore: 92,
      severity: 'high',
      category: 'Infrastructure',
    },
    {
      id: 'issue-2',
      title: 'Drainage Overflow',
      reportCount: 14,
      confirmationCount: 6,
      priorityScore: 78,
      severity: 'medium',
      category: 'Sanitation',
    },
    {
      id: 'issue-3',
      title: 'Road Damage',
      reportCount: 18,
      confirmationCount: 12,
      priorityScore: 85,
      severity: 'high',
      category: 'Infrastructure',
    },
    {
      id: 'issue-4',
      title: 'Water Pressure Drop',
      reportCount: 6,
      confirmationCount: 4,
      priorityScore: 62,
      severity: 'low',
      category: 'Water',
    },
  ],
  consensus: [
    { category: 'Infrastructure', confirmations: 45, percentage: 42, color: '#3B82F6' },
    { category: 'Sanitation', confirmations: 28, percentage: 26, color: '#F59E0B' },
    { category: 'Safety', confirmations: 20, percentage: 19, color: '#10B981' },
    { category: 'Water', confirmations: 14, percentage: 13, color: '#06B6D4' },
  ],
  municipalCases: [
    { id: 'case-1', caseId: 'NMC-2026-014', issue: 'Street Lighting', department: 'Electricity', status: 'In Progress' },
    { id: 'case-2', caseId: 'NMC-2026-019', issue: 'Drainage', department: 'Sanitation', status: 'Assigned' },
    { id: 'case-3', caseId: 'NMC-2026-023', issue: 'Road Repair', department: 'PWD', status: 'Resolved' },
  ],
  responseDistribution: {
    responded: 42,
    awaiting: 8,
    resolved: 31,
    reopened: 6,
    insight: '82% of issues have received municipal response within SLA targets.',
  },
};

export const CommunityDashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIssue, setSelectedIssue] = useState<PrioritizedIssue | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Staggered entrance for metric cards
      gsap.fromTo(
        '.metric-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
      );

      // Community health card entrance
      gsap.fromTo(
        '.health-card',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', delay: 0.5 }
      );

      // Issues list entrance
      gsap.fromTo(
        '.issue-item',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.7 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

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

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Community Context Header */}
      <div className="health-card">
        <CommunityContextHeader data={mockCommunityData.community} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: 3D Map & Health */}
        <div className="xl:col-span-2 space-y-6">
          {/* 3D Community Map */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB]">
              <h2 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2563EB]" />
                Community Spatial View
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Interactive 3D visualization of community issues and infrastructure
              </p>
            </div>
            <div className="h-[400px] relative">
              <CivicMap
                viewport={{ ...DEFAULT_VIEWPORT, zoom: 14 }}
                issues={getIssuesForViewport({ ...DEFAULT_VIEWPORT, zoom: 14 })}
                className="w-full h-full"
                style={{ height: 400 }}
              />
            </div>
            {selectedIssue && (
              <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">{selectedIssue.title}</h3>
                    <p className="text-xs text-[#6B7280]">{selectedIssue.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedIssue.severity)}`}>
                      {selectedIssue.severity}
                    </span>
                    <span className="text-sm font-bold text-[#0F1E36]">{selectedIssue.priorityScore}/100</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">{selectedIssue.reportCount}</div>
                    <div className="text-xs text-[#6B7280]">Reports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">{selectedIssue.confirmationCount}</div>
                    <div className="text-xs text-[#6B7280]">Confirmations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">91%</div>
                    <div className="text-xs text-[#6B7280]">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#0F1E36]">14</div>
                    <div className="text-xs text-[#6B7280]">Affected</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Community Health Card */}
          <div className="health-card">
            <CommunityHealthCard 
              data={mockCommunityData.health}
              onClusterClick={() => {}}
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
                value={mockCommunityData.metrics.activeIssues.count}
                icon={AlertTriangle}
                trend={mockCommunityData.metrics.activeIssues.trend}
                trendValue={mockCommunityData.metrics.activeIssues.change}
                secondaryLabel="issues requiring attention"
              />
            </div>
            <div className="metric-card">
              <CivicMetricCard
                title="Confirmations"
                value={mockCommunityData.metrics.confirmations.count}
                icon={CheckCircle}
                secondaryLabel={`from ${mockCommunityData.metrics.confirmations.issueCount} issues`}
              />
            </div>
            <div className="metric-card">
              <CivicMetricCard
                title="Open Cases"
                value={mockCommunityData.metrics.openCases.count}
                icon={FileText}
                secondaryLabel={`${mockCommunityData.metrics.openCases.awaitingCount} awaiting response`}
              />
            </div>
            <div className="metric-card">
              <CivicMetricCard
                title="Municipal Response"
                value={mockCommunityData.metrics.municipalResponse.coveragePercent}
                icon={Activity}
                suffix="%"
                secondaryLabel={`${mockCommunityData.metrics.municipalResponse.count} departments active`}
              />
            </div>
          </div>

          {/* Active Issues List */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111827]">Top Priority Issues</h3>
              <button className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium cursor-pointer">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {mockCommunityData.activeIssues.slice(0, 4).map((issue) => (
                <div
                  key={issue.id}
                  className="issue-item p-3 rounded-xl border border-[#E5E7EB] hover:border-[#2563EB] hover:shadow-sm transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedIssue(issue)}
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
                    <span className="text-xs text-[#6B7280]">{issue.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Municipal Cases */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111827]">Municipal Cases</h3>
              <button className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium cursor-pointer">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {mockCommunityData.municipalCases.map((mCase) => (
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
          </div>
        </div>
      </div>

      {/* Response Distribution */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
        <h3 className="text-sm font-semibold text-[#111827] mb-4">Municipal Response Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#0F1E36]">{mockCommunityData.responseDistribution.responded}</div>
            <div className="text-sm text-[#6B7280]">Responded</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#F59E0B]">{mockCommunityData.responseDistribution.awaiting}</div>
            <div className="text-sm text-[#6B7280]">Awaiting</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#10B981]">{mockCommunityData.responseDistribution.resolved}</div>
            <div className="text-sm text-[#6B7280]">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#EF4444]">{mockCommunityData.responseDistribution.reopened}</div>
            <div className="text-sm text-[#6B7280]">Reopened</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-[#F9FAFB] rounded-lg">
          <p className="text-xs text-[#4B5563]">{mockCommunityData.responseDistribution.insight}</p>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;
