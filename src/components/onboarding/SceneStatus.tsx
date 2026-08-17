import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { StepConfig } from './onboardingData';

interface SceneStatusProps {
  stepConfig: StepConfig;
  customLocality?: string;
}

export const SceneStatus: React.FC<SceneStatusProps> = ({
  stepConfig,
  customLocality,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.status-anim-item',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [stepConfig.id]);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-20 max-w-sm pointer-events-none select-none"
    >
      {/* Node Status Eyebrow */}
      <div className="status-anim-item flex items-center gap-2 mb-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-mono tracking-wider text-[#94A3B8] uppercase font-semibold">
          {stepConfig.sceneCode}
        </span>
      </div>

      {/* Title */}
      <h3 className="status-anim-item text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight leading-tight">
        {stepConfig.sceneTitle}
      </h3>

      {/* Description */}
      <p className="status-anim-item text-xs sm:text-[13px] text-[#94A3B8] font-sans mt-1.5 leading-relaxed">
        {stepConfig.id === 'location' && customLocality
          ? `Targeting ${customLocality} infrastructure and ward telemetry coordinates.`
          : stepConfig.sceneDescription}
      </p>
    </div>
  );
};

export default SceneStatus;
