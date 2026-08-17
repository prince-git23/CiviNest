import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Activity, TrendingUp, ShieldCheck } from 'lucide-react';
import { CommunityPulseData } from '../../types';

interface CommunityPulseProps {
  data: CommunityPulseData;
}

export const CommunityPulse: React.FC<CommunityPulseProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const primaryBarRef = useRef<HTMLDivElement>(null);
  const benchmarkBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (primaryBarRef.current) primaryBarRef.current.style.width = `${data.primaryCommunity.score}%`;
      if (benchmarkBarRef.current) benchmarkBarRef.current.style.width = `${data.sectorBenchmark.score}%`;
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        primaryBarRef.current,
        { width: '0%' },
        { width: `${data.primaryCommunity.score}%`, duration: 1.2, ease: 'power2.out', delay: 0.1 }
      );

      gsap.fromTo(
        benchmarkBarRef.current,
        { width: '0%' },
        { width: `${data.sectorBenchmark.score}%`, duration: 1.2, ease: 'power2.out', delay: 0.25 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs transition-all duration-200 hover:shadow-md text-left flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#0F1E36]">Community Pulse</h3>
          <div className="w-6 h-6 rounded-lg bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Primary Community Bar */}
        <div className="space-y-4 mb-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#111827] mb-1.5">
              <span>{data.primaryCommunity.name}</span>
              <span className="font-mono text-[#2563EB]">
                {data.primaryCommunity.score}/100
              </span>
            </div>
            <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div
                ref={primaryBarRef}
                className="h-full bg-[#2563EB] rounded-full"
                style={{ width: '0%' }}
              />
            </div>
          </div>

          {/* Benchmark Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-[#6B7280] mb-1.5">
              <span>{data.sectorBenchmark.name}</span>
              <span className="font-mono text-[#4B5563]">
                {data.sectorBenchmark.score}/100
              </span>
            </div>
            <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div
                ref={benchmarkBarRef}
                className="h-full bg-[#64748B] rounded-full"
                style={{ width: '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="pt-3 border-t border-[#F3F4F6]">
        <p className="text-[11.5px] text-[#4B5563] italic leading-relaxed">
          {data.trendSummary}
        </p>
      </div>
    </div>
  );
};

export default CommunityPulse;
