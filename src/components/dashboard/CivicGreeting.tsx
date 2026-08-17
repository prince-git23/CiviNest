import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Droplet, Lightbulb, SlidersHorizontal, Trash2, Shield, ArrowUpRight } from 'lucide-react';
import { DashboardCivicHealth } from '../../types';

interface CivicGreetingProps {
  userName: string;
  city: string;
  ward: string;
  community: string;
  civicHealth: DashboardCivicHealth;
  onExploreHealth?: () => void;
}

export const CivicGreeting: React.FC<CivicGreetingProps> = ({
  userName = 'Prince',
  city = 'Nagpur',
  ward = 'Dharampeth',
  community = 'Green Valley Residency',
  civicHealth,
  onExploreHealth,
}) => {
  const scoreRef = useRef<HTMLSpanElement>(null);
  const healthCardRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);

  // Dynamic time of day calculation
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (scoreRef.current) {
        scoreRef.current.textContent = civicHealth.overallScore.toString();
      }
      return;
    }

    const ctx = gsap.context(() => {
      // Score count-up
      const scoreObj = { val: 0 };
      gsap.to(scoreObj, {
        val: civicHealth.overallScore,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: () => {
          if (scoreRef.current) {
            scoreRef.current.textContent = Math.round(scoreObj.val).toString();
          }
        },
      });

      // Progress bar animations
      const bars = barsRef.current?.querySelectorAll('.civic-bar-fill');
      if (bars) {
        gsap.fromTo(
          bars,
          { width: '0%' },
          {
            width: (i, target) => target.getAttribute('data-target-width') || '70%',
            duration: 1.2,
            stagger: 0.12,
            ease: 'power2.out',
            delay: 0.2,
          }
        );
      }
    }, healthCardRef);

    return () => ctx.revert();
  }, [civicHealth]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'water':
        return <Droplet className="w-3.5 h-3.5 text-[#2563EB]" />;
      case 'lighting':
        return <Lightbulb className="w-3.5 h-3.5 text-[#F59E0B]" />;
      case 'roads':
        return <SlidersHorizontal className="w-3.5 h-3.5 text-[#4B5563]" />;
      case 'sanitation':
      default:
        return <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />;
    }
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-[#3B82F6]'; // Solid Blue
    if (score >= 70) return 'bg-[#94A3B8]'; // Muted Slate
    return 'bg-[#FCA5A5]'; // Soft Coral/Red
  };

  return (
    <section className="flex flex-col lg:flex-row items-start justify-between gap-6 pt-2 pb-6">
      {/* Left Greeting & Civic Context */}
      <div className="flex-1 text-left max-w-2xl">
        {/* Locality Breadcrumb / Tag */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-widest text-[#6B7280] uppercase font-semibold mb-2">
          <span>{city}</span>
          <span className="text-[#CBD5E1]">·</span>
          <span>{ward}</span>
          <span className="text-[#CBD5E1]">·</span>
          <span>{community}</span>
        </div>

        {/* Display Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#0F1E36] tracking-tight leading-[1.15] mb-3">
          {getTimeGreeting()}, <br className="hidden sm:inline" />
          <span className="text-[#0F1E36]">{userName}.</span>
        </h1>

        {/* Supporting Context */}
        <p className="text-sm sm:text-[15px] text-[#4B5563] leading-relaxed max-w-xl font-normal">
          Here is the civic intelligence overview for your neighborhood today. High priority issues have been escalated to local authorities.
        </p>
      </div>

      {/* Right Civic Health Card */}
      <div
        ref={healthCardRef}
        className="w-full lg:w-96 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs transition-all duration-200 hover:shadow-md text-left relative"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono font-semibold tracking-wider text-[#6B7280] uppercase">
            Local Civic Health
          </span>
          <div className="flex items-baseline gap-0.5">
            <span
              ref={scoreRef}
              className="text-2xl font-bold font-serif text-[#0F1E36]"
            >
              {civicHealth.overallScore}
            </span>
            <span className="text-xs font-semibold text-[#9CA3AF]">/100</span>
          </div>
        </div>

        {/* Categories Bar List */}
        <div ref={barsRef} className="space-y-3">
          {civicHealth.categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between gap-3 text-xs">
              <div className="w-5 flex items-center justify-center shrink-0">
                {getCategoryIcon(cat.icon)}
              </div>

              {/* Bar track */}
              <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className={`civic-bar-fill h-full rounded-full ${getBarColor(cat.score)}`}
                  data-target-width={`${cat.score}%`}
                  style={{ width: '0%' }}
                />
              </div>

              {/* Value */}
              <span className="w-6 text-right font-mono text-[11px] font-medium text-[#4B5563]">
                {cat.score}
              </span>
            </div>
          ))}
        </div>

        {onExploreHealth && (
          <button
            onClick={onExploreHealth}
            className="mt-4 pt-3 border-t border-[#F3F4F6] w-full flex items-center justify-between text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
          >
            <span>View Full Ward Sensor Metrics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </section>
  );
};

export default CivicGreeting;
