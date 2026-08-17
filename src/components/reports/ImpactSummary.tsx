import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Award, ThumbsUp, CheckCircle2, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';
import { DashboardReportItem, DashboardImpactScore } from '../../types';

interface ImpactSummaryProps {
  reports: DashboardReportItem[];
  impact?: DashboardImpactScore;
  className?: string;
}

export const ImpactSummary: React.FC<ImpactSummaryProps> = ({
  reports = [],
  impact,
  className = '',
}) => {
  const totalFilings = reports.length;
  const communityUpvotes = reports.reduce((acc, r) => acc + (r.upvotes || 0), 0);
  const resolvedCount = reports.filter((r) => r.status.toLowerCase().includes('resolved')).length;
  const resolutionRate = totalFilings > 0 ? Math.round((resolvedCount / totalFilings) * 100) : 0;
  const civicScore = (impact?.points || 420) + (resolvedCount * 40);

  const filingsRef = useRef<HTMLSpanElement>(null);
  const upvotesRef = useRef<HTMLSpanElement>(null);
  const rateRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const anim = [
      { el: filingsRef.current, val: totalFilings, suffix: '' },
      { el: upvotesRef.current, val: communityUpvotes, suffix: '' },
      { el: rateRef.current, val: resolutionRate, suffix: '%' },
      { el: scoreRef.current, val: civicScore, suffix: '' },
    ];

    anim.forEach(({ el, val, suffix }) => {
      if (!el) return;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: val,
        duration: 1.0,
        ease: 'power2.out',
        onUpdate: () => {
          if (el) {
            el.textContent = `${Math.round(obj.v)}${suffix}`;
          }
        },
      });
    });
  }, [totalFilings, communityUpvotes, resolutionRate, civicScore]);

  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs text-left space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A]">
            Civic Contribution Impact
          </h3>
        </div>
        <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] font-semibold">
          Sector 14
        </span>
      </div>

      {/* 2x2 Metric Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Filings */}
        <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <span className="text-[11px] font-mono text-[#64748B] block mb-0.5">
            Total Filings
          </span>
          <span
            ref={filingsRef}
            className="text-xl font-extrabold font-mono text-[#0F172A]"
          >
            {totalFilings}
          </span>
        </div>

        {/* Community Upvotes */}
        <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <span className="text-[11px] font-mono text-[#64748B] block mb-0.5">
            Community Upvotes
          </span>
          <span
            ref={upvotesRef}
            className="text-xl font-extrabold font-mono text-[#2563EB]"
          >
            {communityUpvotes}
          </span>
        </div>

        {/* Resolution Rate */}
        <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <span className="text-[11px] font-mono text-[#64748B] block mb-0.5">
            Resolution Rate
          </span>
          <span
            ref={rateRef}
            className="text-xl font-extrabold font-mono text-emerald-600"
          >
            {resolutionRate}%
          </span>
        </div>

        {/* Civic Score */}
        <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <span className="text-[11px] font-mono text-[#64748B] block mb-0.5">
            Civic Score
          </span>
          <span
            ref={scoreRef}
            className="text-xl font-extrabold font-mono text-purple-600"
          >
            {civicScore}
          </span>
        </div>
      </div>

      {/* Progress Bar for Resolution Rate */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <span>Ward Action Efficiency</span>
          <span className="font-mono font-bold text-[#0F172A]">{resolutionRate}% resolved</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${Math.max(resolutionRate, 5)}%` }}
          />
        </div>
      </div>

      {/* Civic Tier Badge */}
      <div className="p-3 bg-linear-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100 flex items-center gap-2.5">
        <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-[#1E40AF]">Top 15% Contributor</span>
          <p className="text-[11px] text-[#475569] mt-0.5">
            Your photographic verification helped fast-track 3 municipal repairs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImpactSummary;
