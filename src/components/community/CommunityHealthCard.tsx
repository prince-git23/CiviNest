import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CommunityHealthData } from '../../types';

interface CommunityHealthCardProps {
  data: CommunityHealthData;
  onClusterClick?: () => void;
}

export const CommunityHealthCard: React.FC<CommunityHealthCardProps> = ({
  data,
  onClusterClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (scoreRef.current) scoreRef.current.textContent = data.score.toString();
      const bars = barsRef.current?.querySelectorAll<HTMLElement>('.health-segment-fill');
      bars?.forEach((bar) => {
        bar.style.width = bar.getAttribute('data-target-width') || '0%';
      });
      return;
    }

    const ctx = gsap.context(() => {
      // Container entrance
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.15 }
      );

      // Score count-up
      const scoreObj = { val: 0 };
      gsap.to(scoreObj, {
        val: data.score,
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.3,
        onUpdate: () => {
          if (scoreRef.current) {
            scoreRef.current.textContent = Math.round(scoreObj.val).toString();
          }
        },
      });

      // Segmented bars
      const bars = barsRef.current?.querySelectorAll('.health-segment-fill');
      if (bars) {
        gsap.fromTo(
          bars,
          { width: '0%' },
          {
            width: (_i: number, target: HTMLElement) => target.getAttribute('data-target-width') || '0%',
            duration: 1.0,
            stagger: 0.1,
            ease: 'power2.out',
            delay: 0.5,
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [data]);

  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;

  const statusColor = {
    'Stable': 'text-emerald-600',
    'Improving': 'text-blue-600',
    'Needs Attention': 'text-amber-600',
    'At Risk': 'text-red-600',
  }[data.status] || 'text-[#4B5563]';

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow duration-200 text-left flex flex-col justify-between"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono font-semibold tracking-wider text-[#6B7280] uppercase">
            Community Health Index
          </span>
          <TrendIcon className={`w-4 h-4 ${statusColor}`} aria-hidden="true" />
        </div>

        {/* Score */}
        <div className="flex items-baseline gap-1 mb-3">
          <span
            ref={scoreRef}
            className="text-4xl sm:text-5xl font-bold text-[#0F1E36] tracking-tight"
            style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
            aria-label={`Health score ${data.score} out of ${data.maxScore}`}
          >
            0
          </span>
          <span className="text-base font-semibold text-[#9CA3AF]">/ {data.maxScore}</span>
        </div>

        {/* Status explanation */}
        <p className="text-xs text-[#4B5563] leading-relaxed mb-4">
          {data.explanation}
        </p>

        {/* Segmented health bar */}
        <div ref={barsRef} className="flex gap-1 mb-4 h-2 rounded-full overflow-hidden bg-[#F3F4F6]">
          {data.segments.map((seg, i) => {
            const widthPercent = Math.max((seg.score / data.maxScore) * (100 / data.segments.length), 2);
            return (
              <div
                key={i}
                className="health-segment-fill h-full rounded-full transition-colors"
                data-target-width={`${widthPercent}%`}
                style={{ width: '0%', backgroundColor: seg.color }}
                role="meter"
                aria-label={`${seg.category}: ${seg.score}%`}
                aria-valuenow={seg.score}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            );
          })}
        </div>
      </div>

      {/* Cluster warning */}
      <div className="pt-3 border-t border-[#F3F4F6]">
        {data.activeClusters > 0 ? (
          <button
            type="button"
            onClick={onClusterClick}
            className="flex items-center gap-2 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer group w-full text-left"
            aria-label={`${data.activeClusters} active clusters require attention`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>{data.activeClusters} active cluster{data.activeClusters !== 1 ? 's' : ''} require{data.activeClusters === 1 ? 's' : ''} attention</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            No active clusters requiring attention
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityHealthCard;
