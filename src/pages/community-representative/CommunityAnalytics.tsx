import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart3,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsData {
  timeRange: '30D' | '90D' | 'YTD';
  metrics: {
    avgResponseTime: { value: number; unit: string; trend: 'up' | 'down' | 'stable'; change: number };
    avgResolutionTime: { value: number; unit: string; trend: 'up' | 'down' | 'stable'; change: number };
    citizenVerificationTime: { value: number; unit: string; trend: 'up' | 'down' | 'stable'; change: number };
    slaPerformance: { value: number; unit: string; trend: 'up' | 'down' | 'stable'; change: number };
  };
  recurringProblems: {
    category: string;
    incidents: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  }[];
  resolutionDistribution: {
    departmentResolved: number;
    citizenConfirmed: number;
    reopened: number;
    total: number;
  };
  municipalResponse: {
    responded: number;
    awaiting: number;
    avgResponseHours: number;
    coveragePercent: number;
  };
  communityHealth: {
    score: number;
    activeIssues: number;
    severityIndex: number;
    unresolvedDuration: number;
    recurringIssues: number;
    residentConfirmations: number;
    municipalResponsiveness: number;
    verifiedResolutions: number;
    reopenedIssues: number;
  };
  monthlyTrend: {
    month: string;
    issues: number;
    resolved: number;
    confirmations: number;
  }[];
}

const mockAnalytics: AnalyticsData = {
  timeRange: '30D',
  metrics: {
    avgResponseTime: { value: 4.2, unit: 'hours', trend: 'down', change: 12 },
    avgResolutionTime: { value: 72, unit: 'hours', trend: 'down', change: 8 },
    citizenVerificationTime: { value: 2.5, unit: 'days', trend: 'down', change: 15 },
    slaPerformance: { value: 85, unit: '%', trend: 'up', change: 5 },
  },
  recurringProblems: [
    { category: 'Street Lighting', incidents: 12, trend: 'up', change: 20 },
    { category: 'Drainage', incidents: 8, trend: 'down', change: 10 },
    { category: 'Waste Collection', incidents: 6, trend: 'stable', change: 0 },
    { category: 'Road Damage', incidents: 4, trend: 'down', change: 25 },
  ],
  resolutionDistribution: {
    departmentResolved: 42,
    citizenConfirmed: 31,
    reopened: 6,
    total: 79,
  },
  municipalResponse: {
    responded: 42,
    awaiting: 8,
    avgResponseHours: 4.2,
    coveragePercent: 85,
  },
  communityHealth: {
    score: 82,
    activeIssues: 12,
    severityIndex: 68,
    unresolvedDuration: 3.2,
    recurringIssues: 4,
    residentConfirmations: 126,
    municipalResponsiveness: 85,
    verifiedResolutions: 31,
    reopenedIssues: 6,
  },
  monthlyTrend: [
    { month: 'Jan', issues: 45, resolved: 38, confirmations: 32 },
    { month: 'Feb', issues: 52, resolved: 41, confirmations: 35 },
    { month: 'Mar', issues: 48, resolved: 44, confirmations: 38 },
    { month: 'Apr', issues: 61, resolved: 52, confirmations: 42 },
    { month: 'May', issues: 58, resolved: 55, confirmations: 48 },
    { month: 'Jun', issues: 65, resolved: 58, confirmations: 52 },
    { month: 'Jul', issues: 72, resolved: 62, confirmations: 55 },
    { month: 'Aug', issues: 68, resolved: 65, confirmations: 58 },
  ],
};

export const CommunityAnalytics: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | 'YTD'>('30D');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Staggered entrance for metric cards
      gsap.fromTo(
        '.analytics-metric',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
      );

      // Staggered entrance for chart sections
      gsap.fromTo(
        '.chart-section',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out', delay: 0.5 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'down': return <ArrowDownRight className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-[#9CA3AF]" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isInverted = false) => {
    const effectiveTrend = isInverted ? (trend === 'up' ? 'down' : trend === 'down' ? 'up' : 'stable') : trend;
    switch (effectiveTrend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-[#9CA3AF]';
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1E36]" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Community Analytics
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Understand recurring civic problems and municipal response quality
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-[#E5E7EB] p-1">
          {(['30D', '90D', 'YTD'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                timeRange === range
                  ? 'bg-[#0F1E36] text-white'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="analytics-metric bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor(mockAnalytics.metrics.avgResponseTime.trend, true)}`}>
              {getTrendIcon(mockAnalytics.metrics.avgResponseTime.trend)}
              {mockAnalytics.metrics.avgResponseTime.change}%
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0F1E36] mb-1">
            {mockAnalytics.metrics.avgResponseTime.value} {mockAnalytics.metrics.avgResponseTime.unit}
          </div>
          <div className="text-xs text-[#6B7280]">Avg Response Time</div>
        </div>

        <div className="analytics-metric bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor(mockAnalytics.metrics.avgResolutionTime.trend, true)}`}>
              {getTrendIcon(mockAnalytics.metrics.avgResolutionTime.trend)}
              {mockAnalytics.metrics.avgResolutionTime.change}%
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0F1E36] mb-1">
            {mockAnalytics.metrics.avgResolutionTime.value} {mockAnalytics.metrics.avgResolutionTime.unit}
          </div>
          <div className="text-xs text-[#6B7280]">Avg Resolution Time</div>
        </div>

        <div className="analytics-metric bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor(mockAnalytics.metrics.citizenVerificationTime.trend, true)}`}>
              {getTrendIcon(mockAnalytics.metrics.citizenVerificationTime.trend)}
              {mockAnalytics.metrics.citizenVerificationTime.change}%
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0F1E36] mb-1">
            {mockAnalytics.metrics.citizenVerificationTime.value} {mockAnalytics.metrics.citizenVerificationTime.unit}
          </div>
          <div className="text-xs text-[#6B7280]">Citizen Verification Time</div>
        </div>

        <div className="analytics-metric bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor(mockAnalytics.metrics.slaPerformance.trend)}`}>
              {getTrendIcon(mockAnalytics.metrics.slaPerformance.trend)}
              {mockAnalytics.metrics.slaPerformance.change}%
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0F1E36] mb-1">
            {mockAnalytics.metrics.slaPerformance.value}{mockAnalytics.metrics.slaPerformance.unit}
          </div>
          <div className="text-xs text-[#6B7280]">SLA Performance</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recurring Problems */}
        <div className="chart-section bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[#111827]">Recurring Problems</h2>
            <button className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium cursor-pointer flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
          <div className="space-y-4">
            {mockAnalytics.recurringProblems.map((problem, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#111827]">{problem.category}</div>
                    <div className="text-xs text-[#6B7280]">{problem.incidents} incidents</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full"
                      style={{ width: `${(problem.incidents / 15) * 100}%` }}
                    />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor(problem.trend, true)}`}>
                    {getTrendIcon(problem.trend)}
                    {problem.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Distribution */}
        <div className="chart-section bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[#111827]">Resolution Distribution</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-[#F9FAFB] rounded-xl">
              <div className="text-3xl font-bold text-[#0F1E36]">{mockAnalytics.resolutionDistribution.departmentResolved}</div>
              <div className="text-xs text-[#6B7280] mt-1">Department Marked Resolved</div>
            </div>
            <div className="text-center p-4 bg-[#F9FAFB] rounded-xl">
              <div className="text-3xl font-bold text-[#10B981]">{mockAnalytics.resolutionDistribution.citizenConfirmed}</div>
              <div className="text-xs text-[#6B7280] mt-1">Citizen Confirmed</div>
            </div>
            <div className="text-center p-4 bg-[#F9FAFB] rounded-xl">
              <div className="text-3xl font-bold text-[#EF4444]">{mockAnalytics.resolutionDistribution.reopened}</div>
              <div className="text-xs text-[#6B7280] mt-1">Reopened</div>
            </div>
          </div>
          <div className="p-4 bg-[#F9FAFB] rounded-xl">
            <p className="text-xs text-[#4B5563]">
              <strong>Insight:</strong> {mockAnalytics.resolutionDistribution.citizenConfirmed} issues ({Math.round((mockAnalytics.resolutionDistribution.citizenConfirmed / mockAnalytics.resolutionDistribution.total) * 100)}%) have been verified by residents. 
              {mockAnalytics.resolutionDistribution.reopened} issues were reopened after initial resolution.
            </p>
          </div>
        </div>

        {/* Municipal Response */}
        <div className="chart-section bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[#111827]">Municipal Response</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-[#F9FAFB] rounded-xl">
              <div className="text-3xl font-bold text-[#0F1E36]">{mockAnalytics.municipalResponse.responded}</div>
              <div className="text-xs text-[#6B7280] mt-1">Responded</div>
            </div>
            <div className="text-center p-4 bg-[#F9FAFB] rounded-xl">
              <div className="text-3xl font-bold text-[#F59E0B]">{mockAnalytics.municipalResponse.awaiting}</div>
              <div className="text-xs text-[#6B7280] mt-1">Awaiting Response</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Avg Response Time</span>
              <span className="text-sm font-semibold text-[#111827]">{mockAnalytics.municipalResponse.avgResponseHours} hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Coverage</span>
              <span className="text-sm font-semibold text-[#10B981]">{mockAnalytics.municipalResponse.coveragePercent}%</span>
            </div>
          </div>
        </div>

        {/* Community Civic Health */}
        <div className="chart-section bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[#111827]">Community Civic Health</h2>
            <div className="text-2xl font-bold text-[#0F1E36]">{mockAnalytics.communityHealth.score}/100</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
              <div className="text-lg font-bold text-[#0F1E36]">{mockAnalytics.communityHealth.activeIssues}</div>
              <div className="text-xs text-[#6B7280]">Active Issues</div>
            </div>
            <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
              <div className="text-lg font-bold text-[#0F1E36]">{mockAnalytics.communityHealth.severityIndex}</div>
              <div className="text-xs text-[#6B7280]">Severity Index</div>
            </div>
            <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
              <div className="text-lg font-bold text-[#0F1E36]">{mockAnalytics.communityHealth.unresolvedDuration} days</div>
              <div className="text-xs text-[#6B7280]">Avg Unresolved</div>
            </div>
            <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
              <div className="text-lg font-bold text-[#F59E0B]">{mockAnalytics.communityHealth.recurringIssues}</div>
              <div className="text-xs text-[#6B7280]">Recurring Issues</div>
            </div>
            <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
              <div className="text-lg font-bold text-[#10B981]">{mockAnalytics.communityHealth.residentConfirmations}</div>
              <div className="text-xs text-[#6B7280]">Confirmations</div>
            </div>
            <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
              <div className="text-lg font-bold text-[#2563EB]">{mockAnalytics.communityHealth.municipalResponsiveness}%</div>
              <div className="text-xs text-[#6B7280]">Municipal Response</div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="chart-section bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-[#111827]">Monthly Trend</h2>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#2563EB]" />
              <span className="text-[#6B7280]">Issues</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span className="text-[#6B7280]">Resolved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#8B5CF6]" />
              <span className="text-[#6B7280]">Confirmations</span>
            </div>
          </div>
        </div>
        <div className="relative h-64">
          {/* Simplified bar chart visualization */}
          <div className="flex items-end justify-between h-full gap-2">
            {mockAnalytics.monthlyTrend.map((month, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-1 items-end h-56">
                  <div
                    className="w-3 bg-[#2563EB] rounded-t"
                    style={{ height: `${(month.issues / 80) * 100}%` }}
                    title={`Issues: ${month.issues}`}
                  />
                  <div
                    className="w-3 bg-[#10B981] rounded-t"
                    style={{ height: `${(month.resolved / 80) * 100}%` }}
                    title={`Resolved: ${month.resolved}`}
                  />
                  <div
                    className="w-3 bg-[#8B5CF6] rounded-t"
                    style={{ height: `${(month.confirmations / 80) * 100}%` }}
                    title={`Confirmations: ${month.confirmations}`}
                  />
                </div>
                <span className="text-xs text-[#6B7280]">{month.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityAnalytics;
