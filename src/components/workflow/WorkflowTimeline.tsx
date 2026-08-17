import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Stage01Signal from './stages/Stage01Signal';
import Stage02Understand from './stages/Stage02Understand';
import Stage03Evidence from './stages/Stage03Evidence';
import Stage0405VerifyConnect from './stages/Stage0405VerifyConnect';
import Stage06Prioritize from './stages/Stage06Prioritize';
import Stage0708ActResolve from './stages/Stage0708ActResolve';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

export const WorkflowTimeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step45Ref = useRef<HTMLDivElement>(null);
  const step6Ref = useRef<HTMLDivElement>(null);
  const step78Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const steps = [
        step1Ref.current,
        step2Ref.current,
        step3Ref.current,
        step45Ref.current,
        step6Ref.current,
        step78Ref.current,
      ];

      steps.forEach((step, idx) => {
        if (!step) return;
        gsap.fromTo(
          step,
          {
            opacity: 0,
            y: 35,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 82%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="workflow-timeline"
      className="relative py-20 sm:py-28 overflow-hidden bg-[#FBFBFA]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Timeline Center Ambient Line (Desktop) */}
        <div className="hidden lg:block absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-[1.5px] bg-gradient-to-b from-transparent via-[#CBD5E1] to-transparent pointer-events-none" />

        {/* Stages Stack */}
        <div className="space-y-24 sm:space-y-32 relative z-10">
          
          {/* Stage 01: Signal */}
          <div ref={step1Ref} className="relative">
            {/* Center Timeline Node Marker (Desktop) */}
            <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border-2 border-[#2563EB] items-center justify-center text-[#2563EB] font-mono text-xs font-bold shadow-sm z-20">
              01
            </div>
            <Stage01Signal />
          </div>

          {/* Stage 02: Understand */}
          <div ref={step2Ref} className="relative">
            {/* Center Timeline Node Marker (Desktop) */}
            <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border-2 border-[#0F1E36] items-center justify-center text-[#0F1E36] font-mono text-xs font-bold shadow-sm z-20">
              02
            </div>
            <Stage02Understand />
          </div>

          {/* Stage 03: Evidence */}
          <div ref={step3Ref} className="relative">
            {/* Center Timeline Node Marker (Desktop) */}
            <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border-2 border-[#2563EB] items-center justify-center text-[#2563EB] font-mono text-xs font-bold shadow-sm z-20">
              03
            </div>
            <Stage03Evidence />
          </div>

          {/* Stage 04 & 05: Verify & Connect (Full width break) */}
          <div ref={step45Ref} className="relative pt-6">
            <Stage0405VerifyConnect />
          </div>

          {/* Stage 06: Prioritize */}
          <div ref={step6Ref} className="relative">
            {/* Center Timeline Node Marker (Desktop) */}
            <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border-2 border-red-500 items-center justify-center text-red-600 font-mono text-xs font-bold shadow-sm z-20">
              06
            </div>
            <Stage06Prioritize />
          </div>

          {/* Stage 07 & 08: Act & Verify Resolution */}
          <div ref={step78Ref} className="relative pt-6">
            <Stage0708ActResolve />
          </div>

        </div>

      </div>
    </section>
  );
};

export default WorkflowTimeline;
