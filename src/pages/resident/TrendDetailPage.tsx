import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Users,
  FileText,
  Gauge,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Layers,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { getTrendById, TrendDetailData } from '../../services/api';
import { CivicMap } from '../../components/map/CivicMap';
import type { MapViewport } from '../../services/geo/geoTypes';

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function TrendBadge({ direction }: { direction: string }) {
  if (direction === 'increasing') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
        <TrendingUp className="w-4 h-4" /> Trend: Increasing
      </span>
    );
  }
  if (direction === 'declining') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
        <TrendingDown className="w-4 h-4" /> Trend: Declining
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
      <Minus className="w-4 h-4" /> Trend: Stable
    </span>
  );
}

export const TrendDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trend, setTrend] = useState<TrendDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getTrendById(id);
      setTrend(res.trend);
    } catch (err: any) {
      setError(err?.message || 'Unable to load this trend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-4 text-sm text-[#6B7280]">Loading trend data...</p>
      </div>
    );
  }

  if (error || !trend) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
          <p className="mt-3 text-sm font-semibold text-red-700">{error || 'Trend not found.'}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1E36] text-white text-sm font-semibold hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
            <Link
              to="/resident/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const viewport: MapViewport = {
    latitude: trend.center.latitude,
    longitude: trend.center.longitude,
    zoom: 14,
  };

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
        <span className="text-xs font-mono font-semibold text-[#6B7280]">{trend.clusterCode}</span>
      </div>

      {/* Title block */}
      <div className="space-y-1 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
            Emerging Trend
          </span>
          <span className="text-xs font-mono text-[#6B7280]">{trend.ward} · {trend.locality || trend.affectedArea}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight font-sans">
          {trend.title}
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">{trend.description}</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
            <FileText className="w-3 h-3" /> Reports
          </div>
          <p className="text-2xl font-extrabold text-[#0F1E36]">{trend.reportCount}</p>
          <p className="text-[11px] text-[#6B7280]">in this cluster</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
            <Users className="w-3 h-3" /> Independent Residents
          </div>
          <p className="text-2xl font-extrabold text-[#0F1E36]">{trend.independentResidents}</p>
          <p className="text-[11px] text-[#6B7280]">distinct contributors</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
            <BrainCircuit className="w-3 h-3" /> Confidence
          </div>
          <p className="text-2xl font-extrabold text-[#0F1E36]">{trend.confidence}%</p>
          <p className="text-[11px] text-[#6B7280]">AI cluster confidence</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
            <Gauge className="w-3 h-3" /> Priority
          </div>
          <p className="text-2xl font-extrabold text-[#0F1E36]">{trend.priority.score}</p>
          <p className="text-[11px] text-[#6B7280] capitalize">{trend.priority.level.toLowerCase()} priority</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
            <Clock className="w-3 h-3" /> First Reported
          </div>
          <p className="text-lg font-extrabold text-[#0F1E36]">{formatDate(trend.firstReported)}</p>
          <p className="text-[11px] text-[#6B7280]">Latest {formatDate(trend.latestReport)}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
            <MapPin className="w-3 h-3" /> Status
          </div>
          <p className="text-lg font-extrabold text-[#0F1E36]">{trend.status}</p>
          <p className="text-[11px] text-[#6B7280]">Affected: {trend.affectedArea}</p>
        </div>
      </div>

      {/* Trend direction + category */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <TrendBadge direction={trend.trendDirection} />
        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#4B5563] bg-[#F3F4F6] px-3 py-1.5 rounded-full border border-[#E5E7EB]">
          <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
          {formatCategory(trend.category)}
        </span>
        {trend.keywords.slice(0, 4).map((kw) => (
          <span key={kw} className="px-2.5 py-1 text-[11px] font-medium text-[#4B5563] bg-[#F9FAFB] border border-[#E5E7EB] rounded-full">
            {kw}
          </span>
        ))}
      </div>

      {/* Real map context */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs mb-6">
        <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Affected Area</span>
          </div>
          <Link
            to={`/resident/explore?cluster=${trend.id}&lat=${trend.center.latitude}&lng=${trend.center.longitude}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
          >
            Explore on Map <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="h-56 relative">
          <CivicMap
            viewport={viewport}
            clusters={[{
              id: trend.id,
              title: trend.title,
              category: (trend.category === 'water_supply' ? 'water-supply' : trend.category === 'street_lighting' ? 'street-lighting' : trend.category === 'roads' ? 'road-maintenance' : trend.category === 'drainage' ? 'drainage' : 'sanitation') as any,
              latitude: trend.center.latitude,
              longitude: trend.center.longitude,
              issueCount: trend.reportCount,
              priority: trend.priority.score,
              confidence: trend.confidence / 100,
              ward: trend.ward,
              locality: trend.locality,
              status: 'active',
            }]}
            className="w-full h-full"
            style={{ height: 224 }}
            compact={true}
            interactive={false}
          />
        </div>
        <div className="px-4 py-3 border-t border-[#F3F4F6] flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6B7280] font-mono">
          <span>{trend.center.latitude.toFixed(5)}° N, {trend.center.longitude.toFixed(5)}° E</span>
          <span>· {trend.radiusMeters}m impact radius</span>
          <span>· {trend.confirmationCount} confirmations</span>
        </div>
      </div>

      {/* Recent reports */}
      {trend.recentReports.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs mb-6">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B7280] mb-3">
            Reports in this trend ({trend.recentReports.length})
          </h3>
          <div className="space-y-2">
            {trend.recentReports.map((r) => (
              <Link
                key={r.id}
                to={`/resident/reports/${r.id}`}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-mono font-bold text-[#2563EB]">{r.reportNumber}</p>
                  <p className="text-sm font-semibold text-[#111827] truncate">{r.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-[#6B7280]">{r.status}</span>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related trends */}
      {trend.relatedTrends.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs mb-6">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B7280] mb-3">
            Nearby Related Issues
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trend.relatedTrends.map((rt) => (
              <Link
                key={rt.id}
                to={`/resident/trends/${rt.id}`}
                className="p-3.5 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
              >
                <p className="text-sm font-semibold text-[#111827] line-clamp-1">{rt.title}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#6B7280] font-mono">
                  <span>{rt.reportCount} reports</span>
                  <span>·</span>
                  <span>{rt.priority.score} priority</span>
                  <span>·</span>
                  <span className="capitalize">{rt.trendDirection}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Privacy note */}
      <p className="text-[11px] text-[#6B7280] text-center flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-emerald-600" />
        Aggregate civic intelligence — no private resident information is shown.
      </p>
    </div>
  );
};

export default TrendDetailPage;
