import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart3,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { getCommunityAnalytics } from '../../services/communityApi';
import type { CommunityAnalytics as CommunityAnalyticsData } from '../../services/communityApi';

export const CommunityAnalytics: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | 'YTD'>('30D');
  const [data, setData] = useState<CommunityAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (range: '30D' | '90D' | 'YTD') => {
    setLoading(true);
    setError(null);
    try {
      const { analytics } = await getCommunityAnalytics(range);
      setData(analytics);
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(timeRange);
  }, [load, timeRange]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.analytics-metric', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 });
      gsap.fromTo('.chart-section', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out', delay: 0.5 });
    }, containerRef);
    return () => ctx.revert();
  }, [data]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'down': return <ArrowDownRight className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-[#9CA3AF]" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isInverted = false) => {
    const effective = isInverted ? (trend === 'up' ? 'down' : trend === 'down' ? 'up' : 'stable') : trend;
    switch (effective) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-[#9CA3AF]';
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-10 rounded-xl bg-[#E5E7EB]/60 animate-pulse w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#E5E7EB]/60 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl bg-[#E5E7EB]/60 animate-pulse" />
          <div className="h-72 rounded-2xl bg-[#E5E7EB]/60 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-bold text-[#0F1E36] mb-1">Unable to load analytics</h2>
        <p className="text-sm text-[#6B7280] mb-6">{error}</p>
        <button
          type="button"
          onClick={() => load(timeRange)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F1E36] text-white text-xs font-semibold rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const hasActivity = data.totals.totalIssues > 0;

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

        <div className="flex items-center gap-2 bg-white rounded-xl border border-[#E5E7EB] p-1">
          {(['30D', '90D', 'YTD'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                timeRange === range ? 'bg-[#0F1E36] text-white' : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'
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
          </div>
          <div className="text-2xl font-bold text-[#0F1E36] mb-1">
            {data.municipalResponse.avgResponseHours != null ? `${data.municipalResponse.avgResponseHours} hrs` : '—'}
          </div>
          <div className="text-xs text-[#6B7280]">Avg Municipal Response</div>
          {data.municipalResponse.avgResponseHours == null && (
            <p className="text-[10px] text-[#9CA3AF] mt-1">Not enough civic activity to estimate yet</p>
          )}
        </div>

        <div className="analytics-metric bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0F1E36] mb-1">{data.resolution.resolutionRate}%</div>
          <div className="text-xs text-[#6B7280]">Resolution Rate</div>
          <p className="text-[10px] text-[#9CA3AF] mt-1">{data.resolution.departmentResolved} of {data.resolution.total} issues resolved</p>
        </div>

        <div className="analytics-metric bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0F1E36] mb-1">{data.totals.activeIssues}</div>
          <div className="text-xs text-[#6B7280]">Active Issues</div>
          <p className="text-[10px] text-[#9CA3AF] mt-1">{data.totals.reopenedIssues} reopened</p>
        </div>

        <div className="analytics-metric bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#8B5CF6]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0F1E36] mb-1">{data.municipalResponse.coveragePercent}%</div>
          <div className="text-xs text-[#6B7280]">Response Coverage</div>
          <p className="text-[10px] text-[#9CA3AF] mt-1">{data.municipalResponse.responded} responded · {data.municipalResponse.awaiting} awaiting</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recurring Problems */}
        <div className="chart-section bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[#111827]">Recurring Problems</h2>
            <button
              type="button"
              onClick={() => load(timeRange)}
              className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
          {data.recurringProblems.length === 0 ? (
            <p className="text-center text-xs text-[#6B7280] py-8">Not enough civic activity to generate this metric yet.</p>
          ) : (
            <div className="space-y-4">
              {data.recurringProblems.slice(0, 6).map((problem, idx) => {
                const max = Math.max(...data.recurringProblems.map((p) => p.incidents), 1);
                return (
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
                        <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${(problem.incidents / max) * 100}%` }} />
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor(problem.trend, true)}`}>
                        {getTrendIcon(problem.trend)}
                        {Math.abs(problem.change)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resolution Distribution */}
        <div className="chart-section bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[#111827]">Resolution Distribution</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-[#F9FAFB] rounded-xl">
              <div className="text-3xl font-bold text-[#0F1E36]">{data.resolution.departmentResolved}</div>
              <div className="text-xs text-[#6B7280] mt-1">Resolved</div>
            </div>
            <div className="text-center p-4 bg-[#F9FAFB] rounded-xl">
              <div className="text-3xl font-bold text-[#10B981]">{data.resolution.citizenConfirmed}</div>
              <div className="text-xs text-[#6B7280] mt-1">Citizen Confirmed</div>
            </div>
            <div className="text-center p-4 bg-[#F9FAFB] rounded-xl">
              <div className="text-3xl font-bold text-[#EF4444]">{data.resolution.reopened}</div>
              <div className="text-xs text-[#6B7280] mt-1">Reopened</div>
            </div>
          </div>
          {hasActivity ? (
            <div className="p-4 bg-[#F9FAFB] rounded-xl">
              <p className="text-xs text-[#4B5563]">
                <strong>Insight:</strong> {data.resolution.resolutionRate}% of issues are resolved. {data.resolution.reopened} issues were
                reopened after initial resolution.
              </p>
            </div>
          ) : (
            <p className="text-center text-xs text-[#6B7280] py-6">Not enough civic activity to generate this metric yet.</p>
          )}
        </div>

        {/* Municipal Response */}
        <div className="chart-section bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[#111827]">Municipal Response</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-[#F9FAFB] rounded-xl">
              <div className="text-3xl font-bold text-[#0F1E36]">{data.municipalResponse.responded}</div>
              <div className="text-xs text-[#6B7280] mt-1">Responded</div>
            </div>
            <div className="text-center p-4 bg-[#F9FAFB] rounded-xl">
              <div className="text-3xl font-bold text-[#F59E0B]">{data.municipalResponse.awaiting}</div>
              <div className="text-xs text-[#6B7280] mt-1">Awaiting Response</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Avg Response Time</span>
              <span className="text-sm font-semibold text-[#111827]">
                {data.municipalResponse.avgResponseHours != null ? `${data.municipalResponse.avgResponseHours} hours` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Coverage</span>
              <span className="text-sm font-semibold text-[#10B981]">{data.municipalResponse.coveragePercent}%</span>
            </div>
          </div>
        </div>

        {/* Community Participation */}
        <div className="chart-section bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[#111827]">Community Participation</h2>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#2563EB]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
              <div className="text-lg font-bold text-[#0F1E36]">{data.participation.registeredResidents}</div>
              <div className="text-xs text-[#6B7280]">Registered</div>
            </div>
            <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
              <div className="text-lg font-bold text-[#10B981]">{data.participation.activeContributors}</div>
              <div className="text-xs text-[#6B7280]">Active (30d)</div>
            </div>
            <div className="text-center p-3 bg-[#F9FAFB] rounded-xl">
              <div className="text-lg font-bold text-[#8B5CF6]">{data.participation.confirmationsThisMonth}</div>
              <div className="text-xs text-[#6B7280]">Confirmations</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
            <span className="text-xs text-[#6B7280]">Reports submitted ({timeRange})</span>
            <span className="text-sm font-bold text-[#0F1E36]">{data.participation.reportsSubmitted}</span>
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
        {data.monthlyTrend.length === 0 ? (
          <p className="text-center text-xs text-[#6B7280] py-12">Not enough civic activity to generate this metric yet.</p>
        ) : (
          <div className="relative h-64">
            <div className="flex items-end justify-between h-full gap-2">
              {data.monthlyTrend.map((month, idx) => {
                const max = Math.max(...data.monthlyTrend.map((m) => Math.max(m.issues, m.resolved, m.confirmations)), 1);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex gap-1 items-end h-56">
                      <div className="w-3 bg-[#2563EB] rounded-t" style={{ height: `${(month.issues / max) * 100}%` }} title={`Issues: ${month.issues}`} />
                      <div className="w-3 bg-[#10B981] rounded-t" style={{ height: `${(month.resolved / max) * 100}%` }} title={`Resolved: ${month.resolved}`} />
                      <div className="w-3 bg-[#8B5CF6] rounded-t" style={{ height: `${(month.confirmations / max) * 100}%` }} title={`Confirmations: ${month.confirmations}`} />
                    </div>
                    <span className="text-xs text-[#6B7280]">{month.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 7-day trend */}
      <div className="chart-section bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-[#111827]">Last 7 Days</h2>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
            <span className="text-xs text-[#6B7280]">Daily civic activity</span>
          </div>
        </div>
        {data.trend7d.length === 0 || data.trend7d.every((t) => t.issues === 0 && t.resolved === 0) ? (
          <p className="text-center text-xs text-[#6B7280] py-10">No civic activity recorded in the last 7 days.</p>
        ) : (
          <div className="flex items-end justify-between gap-2 h-40">
            {data.trend7d.map((point, idx) => {
              const max = Math.max(...data.trend7d.map((p) => p.issues), 1);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-[#6B7280]">{point.issues || ''}</span>
                  <div className="w-full max-w-10 bg-[#2563EB]/15 rounded-t" style={{ height: `${(point.issues / max) * 100}%`, minHeight: point.issues > 0 ? 8 : 2 }}>
                    <div className="w-full bg-[#2563EB] rounded-t" style={{ height: point.issues > 0 ? '100%' : 0 }} />
                  </div>
                  <span className="text-[10px] text-[#9CA3AF]">{point.label.split(' ')[1]}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityAnalytics;
