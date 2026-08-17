import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight, Sparkles, Activity, ShieldCheck, Layers, Play } from 'lucide-react';
import CivicNetworkScene from '../three/CivicNetworkScene';

interface HeroSectionProps {
  onExplore: () => void;
  onHowItWorks: () => void;
  onOpenReportModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplore,
  onHowItWorks,
  onOpenReportModal,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Live telemetry state for the dynamic civic intelligence card
  const [activeSignals, setActiveSignals] = useState(18);
  const [lastSignalCity, setLastSignalCity] = useState('Sector 14 — Main St');

  // Subtle real-time signal ticker simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSignals((prev) => (prev > 24 ? 18 : prev + 1));
      const sectors = ['Sector 14 — Main St', 'Sector 09 — West Park', 'Sector 03 — Harbor Ave', 'Sector 11 — North Ridge'];
      setLastSignalCity(sectors[Math.floor(Math.random() * sectors.length)]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // GSAP Choreographed entrance sequence
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.9 },
      });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.2 }
      )
        .fromTo(
          headingRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 1.0 },
          '-=0.4'
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.6'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7 },
          '-=0.5'
        )
        .fromTo(
          tagsRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          '-=0.4'
        )
        .fromTo(
          cardRef.current,
          { opacity: 0, y: 30, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power2.out' },
          '-=0.7'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden"
    >
      {/* Background 3D Scene Layer */}
      <div className="absolute inset-0 z-0 opacity-75 pointer-events-none md:pointer-events-auto flex items-center justify-end">
        <div className="w-full lg:w-3/5 h-full max-h-[700px] absolute right-0 top-10">
          <CivicNetworkScene />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Hero Copy */}
          <div className="lg:col-span-7 xl:col-span-7">
            {/* Pill Eyebrow */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E5E7EB]/70 border border-[#D1D5DB]/80 text-[#374151] text-[11px] font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#0F1E36] animate-pulse" />
              <span>AI-Powered Civic Intelligence</span>
            </div>

            {/* Editorial Serif Display Heading */}
            <h1
              ref={headingRef}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] font-normal leading-[1.08] text-[#0F1E36] tracking-[-0.02em] font-serif mb-6"
            >
              A city is made of signals.
              <br />
              <span className="italic font-light">We help it understand them.</span>
            </h1>

            {/* Refined Subtitle */}
            <p
              ref={subtitleRef}
              className="text-base sm:text-lg text-[#4B5563] leading-[1.65] max-w-xl mb-8 font-normal"
            >
              CiviNest bridges the gap between isolated citizen reports and
              actionable government intelligence. We transform fragmented data
              into verified, prioritized civic narratives.
            </p>

            {/* CTAs */}
            <div
              ref={ctaRef}
              className="flex flex-wrap items-center gap-3.5 mb-10"
            >
              <button
                onClick={onExplore}
                className="bg-[#0F1E36] hover:bg-[#1A2D4E] text-white px-6 py-3 rounded-[6px] font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md active:scale-98 flex items-center gap-2 group"
              >
                <span>Explore CiviNest</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onHowItWorks}
                className="bg-white/80 hover:bg-white text-[#1E293B] border border-[#D1D5DB] hover:border-[#9CA3AF] px-5 py-3 rounded-[6px] font-medium text-sm transition-all duration-200 shadow-xs hover:shadow-sm active:scale-98 flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-[#1E293B]" />
                <span>See How It Works</span>
              </button>
            </div>

            {/* Bottom Tagline Ticker */}
            <div
              ref={tagsRef}
              className="flex items-center gap-3 text-[11px] font-mono tracking-widest text-[#6B7280] uppercase"
            >
              <span>Evidence</span>
              <span className="text-[#9CA3AF]">•</span>
              <span>Verification</span>
              <span className="text-[#9CA3AF]">•</span>
              <span>Accountability</span>
            </div>
          </div>

          {/* Right Column: Floating Civic Intelligence Telemetry Glass Card */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-end">
            <div
              ref={cardRef}
              className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-xl border border-[#E5E7EB] shadow-[0_12px_32px_rgba(15,30,54,0.06)] p-6 transition-all duration-300 hover:shadow-[0_16px_40px_rgba(15,30,54,0.09)]"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6] mb-5">
                <span className="text-[11px] font-mono font-semibold tracking-wider text-[#6B7280] uppercase">
                  Civic Intelligence
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0F1E36]" />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#4B5563] font-normal">Communities Connected</span>
                  <span className="font-mono text-base font-semibold text-[#111827]">6</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[#4B5563] font-normal">Active Signals</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                  </div>
                  <span className="font-mono text-base font-semibold text-[#2563EB] transition-all duration-300">
                    {activeSignals}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#4B5563] font-normal">Emerging Patterns</span>
                  <span className="font-mono text-base font-semibold text-[#0284C7]">4</span>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t border-[#F3F4F6]">
                  <span className="text-[#4B5563] font-normal">Critical Issues</span>
                  <span className="font-mono text-base font-semibold text-[#DC2626]">2</span>
                </div>
              </div>

              {/* Live Signal Stream Footer inside card */}
              <div className="mt-5 pt-3.5 border-t border-[#F3F4F6] flex items-center justify-between text-[11px] text-[#9CA3AF]">
                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <Activity className="w-3 h-3 text-[#2563EB]" />
                  <span>Latest: {lastSignalCity}</span>
                </span>
                <button
                  onClick={onOpenReportModal}
                  className="text-[#0F1E36] font-medium hover:underline cursor-pointer"
                >
                  + Ingest
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
