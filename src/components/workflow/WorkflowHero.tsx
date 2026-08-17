import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, Sparkles, Activity, ShieldCheck, Layers } from 'lucide-react';
import CivicWorkflowScene from './CivicWorkflowScene';

interface WorkflowHeroProps {
  onExplorePlatform: () => void;
  onScrollToWorkflow?: () => void;
}

export const WorkflowHero: React.FC<WorkflowHeroProps> = ({
  onExplorePlatform,
  onScrollToWorkflow,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const sceneWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.8 },
      });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.15 }
      )
        .fromTo(
          headingRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.9 },
          '-=0.4'
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.75 },
          '-=0.55'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7 },
          '-=0.5'
        )
        .fromTo(
          sceneWrapperRef.current,
          { opacity: 0, scale: 0.95, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power2.out' },
          '-=0.7'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="workflow-hero"
      className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-[#F0F2F5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Narrative */}
          <div className="lg:col-span-6 xl:col-span-6 z-10">
            {/* Pill Eyebrow */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5E7EB]/70 border border-[#D1D5DB]/80 text-[#374151] text-[11px] font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#0F1E36]" />
              <span>The CiviNest Workflow</span>
            </div>

            {/* Editorial Heading */}
            <h1
              ref={headingRef}
              className="text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.1] text-[#0F1E36] tracking-[-0.02em] font-serif mb-6"
            >
              From one signal
              <br />
              to a <span className="text-[#2563EB] italic font-light">civic response.</span>
            </h1>

            {/* Supporting Copy */}
            <p
              ref={subtitleRef}
              className="text-base sm:text-lg text-[#4B5563] leading-[1.65] max-w-xl mb-8 font-normal font-sans"
            >
              CiviNest connects individual concerns, community context, evidence
              and municipal action into one transparent workflow.
            </p>

            {/* CTA Button */}
            <div ref={ctaRef} className="flex flex-wrap items-center gap-4">
              <button
                onClick={onExplorePlatform}
                className="bg-[#0F1E36] hover:bg-[#1A2D4E] text-white px-6 py-3 rounded-[6px] font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md active:scale-98 flex items-center gap-2 group cursor-pointer"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: 3D Civic Workflow Canvas & Container Card */}
          <div
            ref={sceneWrapperRef}
            className="lg:col-span-6 xl:col-span-6 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-lg lg:max-w-none rounded-3xl bg-[#E8EDF2]/40 border border-[#E2E8F0] shadow-[0_12px_40px_rgba(15,30,54,0.04)] overflow-hidden relative backdrop-blur-xs">
              {/* Top ambient tag */}
              <div className="absolute top-4 left-5 z-20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                <span className="text-[11px] font-mono text-[#64748B] tracking-wider uppercase font-semibold">
                  Signal Ingestion Mesh
                </span>
              </div>

              {/* 3D Scene Viewport */}
              <div className="h-[380px] sm:h-[420px] lg:h-[460px] w-full">
                <CivicWorkflowScene />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WorkflowHero;
