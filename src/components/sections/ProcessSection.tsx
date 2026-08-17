import React, { useState } from 'react';
import { Radio, BrainCircuit, ShieldCheck, BarChart3, Building2, Check, ArrowRight } from 'lucide-react';

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  details: string;
  metric: string;
}

const steps: ProcessStep[] = [
  {
    number: '01',
    title: 'Signal',
    description: 'Citizens report issues via SMS, web, or app.',
    icon: Radio,
    details: 'Omni-channel ingestion accepts multi-modal reports including unstructured text, voice notes, geotagged photos, and SMS messages without requiring app downloads.',
    metric: '< 30s Ingestion Speed',
  },
  {
    number: '02',
    title: 'Understand',
    description: 'NLP parses context, sentiment, and urgency.',
    icon: BrainCircuit,
    details: 'Advanced language models extract semantic intent, urgency parameters, localized dialect terms, and specific civic hazards while scrubbing citizen personal identifiers (PII).',
    metric: '99.4% PII Redaction',
  },
  {
    number: '03',
    title: 'Verify',
    description: 'Cross-referencing groups reports into verified issues.',
    icon: ShieldCheck,
    details: 'Spatial proximity algorithms and temporal clustering cross-validate isolated accounts into consolidated, verified community incidents.',
    metric: '91%+ Cluster Confidence',
  },
  {
    number: '04',
    title: 'Prioritize',
    description: 'Scoring based on impact, risk, and volume.',
    icon: BarChart3,
    details: 'Dynamic risk matrix evaluates population density, historical infrastructure vulnerabilities, vulnerable demographic presence, and report acceleration.',
    metric: '1-100 Impact Scoring',
  },
  {
    number: '05',
    title: 'Resolve',
    description: 'Actionable data delivered to local government.',
    icon: Building2,
    details: 'Direct API dispatch into municipal work order systems (CityWorks, Salesforce Public Sector, custom ERPs) with automatic two-way status loop back to citizens.',
    metric: '60% Triage Time Reduction',
  },
];

export const ProcessSection: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  return (
    <section id="process" className="py-24 md:py-32 bg-[#FBFBFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#0F1E36] tracking-tight mb-5">
            From signal to resolution
          </h2>
          <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed">
            A systematic approach to civic resilience, powered by community input
            and AI analysis.
          </p>
        </div>

        {/* 5-Step Process Pipeline with Horizontal Line */}
        <div className="relative">
          {/* Connecting Line across steps on desktop */}
          <div className="hidden lg:block absolute top-[23px] left-8 right-8 h-[1.5px] bg-[#E5E7EB] z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 relative z-10">
            {steps.map((step, idx) => {
              const isSelected = activeStepIndex === idx;
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  onClick={() => setActiveStepIndex(isSelected ? null : idx)}
                  className={`group flex flex-col items-start text-left cursor-pointer p-4 rounded-xl transition-all duration-200 ${
                    isSelected
                      ? 'bg-white shadow-md border border-blue-200 ring-1 ring-blue-100'
                      : 'hover:bg-white/60'
                  }`}
                >
                  {/* Step Number Pill Circle */}
                  <div className="mb-6 relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#0F1E36] text-white ring-4 ring-blue-100'
                          : 'bg-[#F3F4F6] text-[#4B5563] group-hover:bg-[#E5E7EB] border border-[#E5E7EB]'
                      }`}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-lg font-semibold text-[#0F1E36] mb-2 group-hover:text-blue-900 transition-colors flex items-center gap-1.5">
                    <span>{step.title}</span>
                  </h3>

                  {/* Step Brief Description */}
                  <p className="text-sm text-[#4B5563] leading-relaxed mb-3">
                    {step.description}
                  </p>

                  {/* Interactive Details Expansion */}
                  {isSelected && (
                    <div className="mt-2 pt-3 border-t border-gray-100 text-xs text-[#374151] animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="leading-normal mb-2 text-[#4B5563]">{step.details}</p>
                      <span className="inline-block font-mono font-semibold text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {step.metric}
                      </span>
                    </div>
                  )}

                  {!isSelected && (
                    <span className="text-[11px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mt-auto flex items-center gap-0.5">
                      Inspect step <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
