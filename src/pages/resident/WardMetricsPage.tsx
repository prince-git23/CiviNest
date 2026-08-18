import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Droplet,
  Lightbulb,
  SlidersHorizontal,
  Trash2,
  Activity,
  Clock,
  Radio,
  RefreshCw,
  AlertTriangle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Compass,
  ChevronRight,
} from 'lucide-react';
import { getWardMetrics, WardMetricsData } from '../../services/api';

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string; bar: string }> = {
  water_supply: {
    label: 'Water Supply',
    icon: <Droplet className="w-4 h-4 text-[#2563EB]" />,
    color: 'text-[#2563EB]',
    bar: 'bg-[#3B82F6]',
  },
  street_lighting: {
    label: 'Street Lighting',
    icon: <Lightbulb className="w-4 h-4 text-[#F59E0B]" />,
    color: 'text-[#F59E0B]',
    bar: 'bg-[#F59E0B]',
  },
  roads: {
    label: 'Roads & Infrastructure',
    icon: <SlidersHorizontal className="w-4 h-4 text-[#4B5563]" />,
    color: 'text-[#4B5563]',
    bar: 'bg-[#64748B]',
  },
  drainage: {
    label: 'Drainage & Sanitation',
    icon: <Trash2 className="w-4 h-4 text-[#EF4444]" />,
    color: 'text-[#EF4444]',
    bar: 'bg-[#F87171]',
  },
  waste: {
    label: 'Waste Collection',
    icon: <Trash2 className="w-4 h-4 text-[#EF4444]" />,
    color: 'text-[#EF4444]',
    bar: 'bg-[#F87171]',
  },
  electricity: {
    label: 'Power Grid',
    icon: <Lightbulb className="w-4 h-4 text-[#8B5CF6]" />,
    color: 'text-[#8B5CF6]',
    bar: 'bg-[#8B5CF6]',
  },
};

const STATUS_META: Record<string, { label: string; chip: string; dot: string }> = {
  healthy: { label: 'Healthy', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  moderate: { label: 'Moderate', chip: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  attention: { label: 'Needs Attention', chip: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  critical: { label: 'Critical', chip: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
};

function barColor(score: number): string {
  if (score >= 80) return 'bg-[#3B82F6]';
  if (score >= 70) return 'bg-[#94A3B8]';
  return 'bg-[#FCA5A5]';
}

function timeAgo(iso?: string): string {
  if (!iso) return 'Recently';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function TrendChip({ trend }: { trend: string }) {
  if (trend === 'improving') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
        <TrendingUp className="w-3 h-3" /> Improving
      </span>
    );
  }
  if (trend === 'declining') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
        <TrendingDown className="w-3 h-3" /> Declining
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
      <Minus className="w-3 h-3" /> Stable
    </span>
  );
}

export const WardMetricsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<WardMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWardMetrics();
      setMetrics(res.metrics);
    } catch (err: any) {
      setError(err?.message || 'Unable to load ward sensor metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/resident/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4B5563] hover:text-[#0F1E36] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Link
          to="/resident/explore"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          <Compass className="w-4 h-4" />
          Explore Spatial Map
        </Link>
      </div>

      <div className="space-y-1 mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Ward Sensor Metrics</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F1E36] tracking-tight font-sans">
          Local civic health, live
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Sensor-derived and report-derived signals for your ward and locality.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-[#6B7280]">Loading ward metrics...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
          <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1E36] text-white text-sm font-semibold hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : !metrics ? (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-10 text-center">
          <Activity className="w-8 h-8 mx-auto text-[#9CA3AF]" />
          <p className="mt-3 text-sm font-semibold text-[#111827]">No ward metrics available yet</p>
          <p className="text-xs text-[#6B7280] mt-1">
            Once civic signals are processed in your ward, telemetry will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Context bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">
                  {metrics.ward} · {metrics.locality}
                </p>
                <p className="text-[11px] text-[#6B7280] font-mono">
                  {metrics.city} · Updated {timeAgo(metrics.updatedAt)}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border ${
                metrics.source === 'live'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${metrics.source === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {metrics.source === 'live' ? 'Live Data' : 'Demo Data'}
            </span>
          </div>

          {/* Overall score */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono font-semibold tracking-wider text-[#6B7280] uppercase">
                Overall Civic Health
              </span>
              <span className="text-xs font-mono text-[#9CA3AF]">/100</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#F3F4F6" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={metrics.overallScore >= 70 ? '#3B82F6' : metrics.overallScore >= 55 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(metrics.overallScore / 100) * 264} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-extrabold font-serif text-[#0F1E36]">{metrics.overallScore}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#111827]">
                  {metrics.overallScore >= 80 ? 'Healthy neighborhood' :
                   metrics.overallScore >= 70 ? 'Generally healthy' :
                   metrics.overallScore >= 55 ? 'Needs attention' : 'Critical condition'}
                </p>
                <p className="text-xs text-[#6B7280] leading-relaxed max-w-md">
                  Composite score from {metrics.metrics.length} civic categories in {metrics.ward}, {metrics.locality}.
                </p>
              </div>
            </div>
          </div>

          {/* Metric rows */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-mono font-semibold tracking-wider text-[#6B7280] uppercase">
                Category Metrics
              </span>
              <span className="text-[11px] font-mono text-[#9CA3AF]">Sensor · Report derived</span>
            </div>
            <div className="space-y-5">
              {metrics.metrics.map((m) => {
                const meta = CATEGORY_META[m.category] || {
                  label: m.label,
                  icon: <Activity className="w-4 h-4 text-[#6B7280]" />,
                  color: 'text-[#6B7280]',
                  bar: 'bg-[#94A3B8]',
                };
                const status = STATUS_META[m.status] || STATUS_META.moderate;
                return (
                  <div key={m.category} className="border-b border-[#F3F4F6] pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                          {meta.icon}
                        </div>
                        <span className="text-sm font-semibold text-[#111827]">{meta.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendChip trend={m.trend} />
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${status.chip}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor(m.score)} transition-all duration-700`}
                          style={{ width: `${m.score}%` }}
                        />
                      </div>
                      <span className="w-9 text-right font-mono text-sm font-bold text-[#111827]">{m.score}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-[#6B7280]">
                      <span className="inline-flex items-center gap-1">
                        <Activity className="w-3 h-3" /> {m.activeIssues} active issue{m.activeIssues === 1 ? '' : 's'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Updated {timeAgo(m.lastUpdated)}
                      </span>
                      <span className="text-[#9CA3AF]">{m.detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sensor status */}
          {metrics.sensors.length > 0 && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-4 h-4 text-[#2563EB]" />
                <span className="text-[11px] font-mono font-semibold tracking-wider text-[#6B7280] uppercase">
                  Sensor Status
                </span>
                <span className="ml-auto text-[11px] font-mono text-[#9CA3AF]">Last pinged {timeAgo(metrics.updatedAt)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {metrics.sensors.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        s.status === 'operational' ? 'bg-emerald-500' : s.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#111827] truncate">{s.name}</p>
                      <p className="text-[10px] text-[#6B7280] font-mono">
                        {s.status} · updated {timeAgo(s.lastUpdated)}
                      </p>
                    </div>
                    <span className="text-sm font-mono font-bold text-[#0F1E36] shrink-0">
                      {s.value} <span className="text-[10px] font-medium text-[#9CA3AF]">{s.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              to="/resident/explore"
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white px-5 py-3.5 rounded-xl text-sm font-semibold shadow-xs transition-all"
            >
              <Compass className="w-4 h-4 text-blue-400" />
              Explore Issues on the Spatial Map
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/resident/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:scale-[0.99] text-[#374151] border border-[#D1D5DB] px-5 py-3.5 rounded-xl text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardMetricsPage;
