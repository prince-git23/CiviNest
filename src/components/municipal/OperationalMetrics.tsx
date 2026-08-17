import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  AlertTriangle,
  Network,
  Building2,
  Flag,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react';
import { MunicipalMetricsData } from '../../types';

interface OperationalMetricsProps {
  metrics: MunicipalMetricsData;
  activeFilter?: 'all' | 'critical' | 'lowConfidence' | 'overSla' | 'reopened';
  onSelectFlagFilter?: (filter: 'all' | 'critical' | 'lowConfidence' | 'overSla' | 'reopened') => void;
}

export const OperationalMetrics: React.FC<OperationalMetricsProps> = ({
  metrics,
  activeFilter = 'all',
  onSelectFlagFilter,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const criticalRef = useRef<HTMLSpanElement>(null);
  const clustersRef = useRef<HTMLSpanElement>(null);
  const propertiesRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Stagger entrance for 4 cards
      gsap.from('.metric-card-item', {
        opacity: 0,
        y: 18,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
      });

      // Number countup animations
      const counters = [
        { elem: criticalRef.current, end: metrics.criticalIssuesCount },
        { elem: clustersRef.current, end: metrics.activeClustersCount },
        { elem: propertiesRef.current, end: metrics.affectedPropertiesCount },
      ];

      counters.forEach((item) => {
        if (!item.elem) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: item.end,
          duration: 1.2,
          ease: 'power1.out',
          onUpdate: () => {
            if (item.elem) {
              item.elem.textContent = Math.round(obj.val).toLocaleString();
            }
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [metrics]);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
    >
      {/* 1. Critical Issues Card */}
      <div
        onClick={() => onSelectFlagFilter && onSelectFlagFilter(activeFilter === 'critical' ? 'all' : 'critical')}
        className={`metric-card-item bg-white p-5 sm:p-6 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md relative overflow-hidden group ${
          activeFilter === 'critical'
            ? 'border-rose-400 ring-2 ring-rose-500/20 bg-rose-50/10'
            : 'border-[#E5E7EB] hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between text-[#6B7280] mb-3">
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#4B5563]">
            CRITICAL ISSUES
          </span>
          <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline gap-1 my-1">
          <span
            ref={criticalRef}
            className="text-4xl sm:text-5xl font-extrabold text-[#DC2626] font-sans tracking-tight"
          >
            {metrics.criticalIssuesCount}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-3 text-xs font-medium text-rose-600">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>{metrics.criticalIssuesTrend}</span>
        </div>
      </div>

      {/* 2. Active Clusters Card */}
      <div
        onClick={() => onSelectFlagFilter && onSelectFlagFilter('all')}
        className="metric-card-item bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] hover:border-slate-300 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md relative overflow-hidden group"
      >
        <div className="flex items-center justify-between text-[#6B7280] mb-3">
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#4B5563]">
            ACTIVE CLUSTERS
          </span>
          <div className="w-6 h-6 rounded-md bg-slate-100 text-[#0F1E36] flex items-center justify-center">
            <Network className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline gap-1 my-1">
          <span
            ref={clustersRef}
            className="text-4xl sm:text-5xl font-extrabold text-[#0F1E36] font-sans tracking-tight"
          >
            {metrics.activeClustersCount}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-3 text-xs font-medium text-slate-500">
          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
          <span>{metrics.activeClustersTrend}</span>
        </div>
      </div>

      {/* 3. Affected Properties Card */}
      <div className="metric-card-item bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] hover:border-slate-300 transition-all duration-200 shadow-2xs hover:shadow-md relative overflow-hidden group">
        <div className="flex items-center justify-between text-[#6B7280] mb-3">
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#4B5563]">
            AFFECTED PROPERTIES
          </span>
          <div className="w-6 h-6 rounded-md bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline gap-1 my-1">
          <span
            ref={propertiesRef}
            className="text-4xl sm:text-5xl font-extrabold text-[#0F1E36] font-sans tracking-tight"
          >
            {metrics.affectedPropertiesCount.toLocaleString()}
          </span>
        </div>

        <div className="mt-3 text-xs font-medium text-slate-500 font-sans">
          Est. <strong className="text-slate-800">{metrics.estimatedCitizensAffected.toLocaleString()}</strong> Citizens
        </div>
      </div>

      {/* 4. Operational Flags Breakdown Card */}
      <div className="metric-card-item bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs relative flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#6B7280] mb-2">
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#4B5563]">
            OPERATIONAL FLAGS
          </span>
          <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
            <Flag className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="space-y-2 mt-1">
          {/* Flag 1: Low Confidence Cases */}
          <button
            onClick={() =>
              onSelectFlagFilter &&
              onSelectFlagFilter(activeFilter === 'lowConfidence' ? 'all' : 'lowConfidence')
            }
            className={`w-full flex items-center justify-between py-1 px-2 rounded-lg text-xs transition-colors cursor-pointer group ${
              activeFilter === 'lowConfidence'
                ? 'bg-slate-100 font-semibold'
                : 'hover:bg-slate-50 text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            <span className="truncate">Low Confidence Cases</span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
              {metrics.lowConfidenceCount}
            </span>
          </button>

          {/* Flag 2: Over SLA */}
          <button
            onClick={() =>
              onSelectFlagFilter &&
              onSelectFlagFilter(activeFilter === 'overSla' ? 'all' : 'overSla')
            }
            className={`w-full flex items-center justify-between py-1 px-2 rounded-lg text-xs transition-colors cursor-pointer group ${
              activeFilter === 'overSla'
                ? 'bg-rose-100/60 font-semibold'
                : 'hover:bg-rose-50/50 text-[#4B5563] hover:text-rose-700'
            }`}
          >
            <span className="text-rose-700 font-medium">Over SLA</span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              {metrics.overSlaCount}
            </span>
          </button>

          {/* Flag 3: Reopened Issues */}
          <button
            onClick={() =>
              onSelectFlagFilter &&
              onSelectFlagFilter(activeFilter === 'reopened' ? 'all' : 'reopened')
            }
            className={`w-full flex items-center justify-between py-1 px-2 rounded-lg text-xs transition-colors cursor-pointer group ${
              activeFilter === 'reopened'
                ? 'bg-blue-100/60 font-semibold'
                : 'hover:bg-blue-50/50 text-[#4B5563] hover:text-[#2563EB]'
            }`}
          >
            <span className="text-[#2563EB] font-medium">Reopened Issues</span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200">
              {metrics.reopenedCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperationalMetrics;
