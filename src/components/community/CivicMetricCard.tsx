import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react';

interface CivicMetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  secondaryLabel?: string;
  secondaryValue?: string;
  trend?: 'up' | 'down';
  trendValue?: number;
  suffix?: string;
  animationDelay?: number;
}

export const CivicMetricCard: React.FC<CivicMetricCardProps> = ({
  title,
  value,
  icon: Icon,
  secondaryLabel,
  secondaryValue,
  trend,
  trendValue,
  suffix,
  animationDelay = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (valueRef.current) {
        valueRef.current.textContent = `${value}${suffix || ''}`;
      }
      return;
    }

    const ctx = gsap.context(() => {
      // Card entrance
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.3 + animationDelay }
      );

      // Value count-up
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration: 0.9,
        ease: 'power2.out',
        delay: 0.5 + animationDelay,
        onUpdate: () => {
          if (valueRef.current) {
            valueRef.current.textContent = `${Math.round(obj.val)}${suffix || ''}`;
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [value, animationDelay, suffix]);

  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-[#9CA3AF]';
  const TrendArrow = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : null;

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow duration-200 text-left"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xs font-semibold text-[#6B7280]">{title}</h3>
        <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <span
          ref={valueRef}
          className="text-3xl sm:text-4xl font-bold text-[#0F1E36] tracking-tight font-mono"
          aria-label={`${title}: ${value}${suffix || ''}`}
        >
          0
        </span>

        {TrendArrow && trendValue !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold mb-1 ${trendColor}`}>
            <TrendArrow className="w-3 h-3" />
            {trendValue}
          </span>
        )}
      </div>

      {secondaryLabel && (
        <p className="text-[11px] text-[#6B7280] mt-1.5 font-medium">
          {secondaryValue && <span className="text-[#2563EB] font-semibold">{secondaryValue}</span>}
          {secondaryValue && ' '}
          {secondaryLabel}
        </p>
      )}
    </div>
  );
};

export default CivicMetricCard;
