import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Radio, Users, Award, ShieldCheck, HelpCircle } from 'lucide-react';
import { DashboardImpactScore } from '../../types';

interface CivicImpactCardProps {
  impact: DashboardImpactScore;
  onOpenDetails?: () => void;
}

export const CivicImpactCard: React.FC<CivicImpactCardProps> = ({
  impact,
  onOpenDetails,
}) => {
  const pointsRef = useRef<HTMLSpanElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (pointsRef.current) {
        pointsRef.current.textContent = impact.points.toString();
      }
      return;
    }

    const ctx = gsap.context(() => {
      // Counter animation
      const obj = { val: 0 };
      gsap.to(obj, {
        val: impact.points,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          if (pointsRef.current) {
            pointsRef.current.textContent = Math.round(obj.val).toString();
          }
        },
      });

      // SVG Circle stroke dash offset animation
      // Circumference = 2 * PI * 58 = 364.42
      const circumference = 2 * Math.PI * 58;
      // Let's say max is 600 points -> offset calculation
      const progressPercent = Math.min(impact.points / 550, 1);
      const targetOffset = circumference * (1 - progressPercent);

      if (circleRef.current) {
        gsap.fromTo(
          circleRef.current,
          { strokeDashoffset: circumference },
          {
            strokeDashoffset: targetOffset,
            duration: 1.6,
            ease: 'power2.out',
          }
        );
      }
    }, cardRef);

    return () => ctx.revert();
  }, [impact]);

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs transition-all duration-200 hover:shadow-md text-left flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono font-semibold tracking-wider text-[#6B7280] uppercase">
            Your Civic Impact
          </span>
          <button
            onClick={onOpenDetails}
            className="text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
            title="Impact breakdown & rewards"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Circular Progress Meter */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
              {/* Background Track Circle */}
              <circle
                cx="65"
                cy="65"
                r="58"
                className="text-[#F3F4F6]"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress Circle */}
              <circle
                ref={circleRef}
                cx="65"
                cy="65"
                r="58"
                className="text-[#0F1E36]"
                strokeWidth="7"
                strokeDasharray={2 * Math.PI * 58}
                strokeDashoffset={2 * Math.PI * 58}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Score Text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span
                ref={pointsRef}
                className="text-3xl font-bold font-serif text-[#0F1E36] tracking-tight leading-none"
              >
                {impact.points}
              </span>
              <span className="text-[11px] font-mono font-medium text-[#6B7280] mt-1">
                Points
              </span>
            </div>
          </div>

          <p className="text-xs text-[#4B5563] text-center font-medium mt-2">
            Top {impact.rankPercentile}% of contributors in {impact.locality}.
          </p>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F3F4F6]">
        {/* Signal Contributor */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/80">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#111827] block truncate leading-tight">
              Signal
            </span>
            <span className="text-[10px] text-[#6B7280] block truncate">
              Contributor
            </span>
          </div>
        </div>

        {/* Community Voice */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/80">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#9333EA] flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#111827] block truncate leading-tight">
              Community
            </span>
            <span className="text-[10px] text-[#6B7280] block truncate">
              Voice
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicImpactCard;
