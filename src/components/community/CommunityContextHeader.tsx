import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MapPin, Clock, Shield } from 'lucide-react';
import type { CommunityContext } from '../../types';

interface CommunityContextHeaderProps {
  data: CommunityContext;
}

export const CommunityContextHeader: React.FC<CommunityContextHeaderProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
      );

      gsap.fromTo(
        '.ctx-badge',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, delay: 0.2, ease: 'back.out(1.4)' }
      );

      gsap.fromTo(
        '.ctx-title',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power2.out' }
      );

      gsap.fromTo(
        '.ctx-location',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.45, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-[#0F1E36] via-[#1A2E4A] to-[#0F1E36] p-6 sm:p-8 text-white shadow-lg"
    >
      {/* Subtle abstract civic pattern overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
          <line x1="0" y1="40" x2="400" y2="40" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="80" x2="400" y2="80" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="120" x2="400" y2="120" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="160" x2="400" y2="160" stroke="white" strokeWidth="0.5" />
          <line x1="80" y1="0" x2="80" y2="200" stroke="white" strokeWidth="0.5" />
          <line x1="160" y1="0" x2="160" y2="200" stroke="white" strokeWidth="0.5" />
          <line x1="240" y1="0" x2="240" y2="200" stroke="white" strokeWidth="0.5" />
          <line x1="320" y1="0" x2="320" y2="200" stroke="white" strokeWidth="0.5" />
          <circle cx="160" cy="100" r="60" stroke="white" strokeWidth="0.5" strokeDasharray="4 6" />
          <circle cx="160" cy="100" r="30" stroke="white" strokeWidth="0.5" strokeDasharray="2 4" />
        </svg>
      </div>

      {/* Gradient accent glow */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-400/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Role badge + updated time */}
        <div className="flex items-center gap-3 mb-4">
          <span className="ctx-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-white/15 backdrop-blur-sm border border-white/10 text-white/90">
            <Shield className="w-3 h-3 text-blue-300" />
            {data.role}
          </span>
          <span className="ctx-badge flex items-center gap-1 text-[11px] text-white/50 font-mono">
            <Clock className="w-3 h-3" />
            {data.lastUpdated}
          </span>
        </div>

        {/* Community name */}
        <h1 className="ctx-title text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight leading-tight mb-2"
            style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}>
          {data.name}
        </h1>

        {/* Location */}
        <div className="ctx-location flex items-center gap-1.5 text-sm text-white/60">
          <MapPin className="w-3.5 h-3.5" />
          <span>{data.location}</span>
        </div>
      </div>
    </div>
  );
};

export default CommunityContextHeader;
