import React, { useState } from 'react';
import { Check, Shield, Lock, Eye, CheckCircle2, History, AlertCircle } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);

  const auditEvents = [
    {
      time: '10:42 AM',
      title: 'System proposed merge of 4 reports',
      detail: 'NLP semantic similarity score: 0.94. Cross-referenced GPS radius: 85 meters. Extracted common hazard: "Flickering street illumination".',
      type: 'ai',
      actor: 'CiviNest Inference Engine v4.2',
    },
    {
      time: '11:15 AM',
      title: 'A. Rivera confirmed and verified cluster',
      detail: 'Human municipal dispatcher reviewed photos & signal density. Approved cluster with high priority rating 92/100.',
      type: 'human',
      actor: 'A. Rivera (Lead Municipal Triage Officer)',
      isHighlight: true,
    },
    {
      time: '11:18 AM',
      timeDetail: '3 mins after verification',
      title: 'Escalated to Public Works API',
      detail: 'Generated work ticket #PW-2024-0981 with automatic route optimization for field maintenance crew.',
      type: 'system',
      actor: 'Public Works REST Integration',
    },
  ];

  return (
    <section id="trust" className="py-24 md:py-32 bg-[#F6F7F8]/70 border-t border-[#EEF0F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Trust Narrative & Safeguards */}
          <div className="lg:col-span-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#0F1E36] tracking-tight mb-5">
              AI assists. Evidence decides.
            </h2>
            
            <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed mb-10 font-normal">
              While AI accelerates processing and pattern recognition,
              accountability remains human. CiviNest maintains a transparent chain
              of evidence for every verified issue cluster.
            </p>

            <div className="space-y-6">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#374151] shrink-0 mt-1">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F1E36]">
                    Transparent Logic
                  </h3>
                  <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">
                    View the exact reports and NLP confidences that formed a cluster.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#374151] shrink-0 mt-1">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F1E36]">
                    Human Oversight
                  </h3>
                  <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">
                    Administrators can un-merge, re-categorize, and override AI
                    suggestions at any time.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#374151] shrink-0 mt-1">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F1E36]">
                    Data Privacy
                  </h3>
                  <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">
                    PII is automatically redacted before aggregation, protecting
                    citizen privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Audit Trail Card */}
          <div className="lg:col-span-6 flex flex-col items-end">
            
            {/* Top Badge: Trusted by Cities */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F1E36] text-white text-[11px] font-medium tracking-wide mb-3 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-blue-300" />
              <span>Trusted by Cities</span>
            </div>

            {/* Audit Trail Card */}
            <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_12px_32px_rgba(15,30,54,0.04)] p-6 sm:p-8">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#F3F4F6] mb-6">
                <span className="text-sm font-semibold text-[#0F1E36]">
                  Audit Trail
                </span>
                <span className="font-mono text-xs text-[#6B7280]">
                  Issue #8842
                </span>
              </div>

              {/* Vertical Timeline */}
              <div className="relative pl-6 space-y-7 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-[#E5E7EB]">
                {auditEvents.map((ev, idx) => {
                  const isSelected = selectedLogIndex === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedLogIndex(isSelected ? null : idx)}
                      className="relative group cursor-pointer"
                    >
                      {/* Timeline Circle Marker */}
                      <div
                        className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white transition-all ${
                          ev.isHighlight
                            ? 'bg-[#0F1E36] ring-2 ring-blue-200 scale-110'
                            : 'bg-[#9CA3AF] group-hover:bg-[#4B5563]'
                        }`}
                      />

                      {/* Event Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-[#6B7280]">
                          {ev.time}
                        </span>
                      </div>

                      {/* Event Title */}
                      <p className="text-sm text-[#1F2937] leading-snug">
                        {ev.isHighlight ? (
                          <>
                            <strong className="font-semibold text-[#0F1E36]">
                              A. Rivera
                            </strong>{' '}
                            confirmed and verified cluster
                          </>
                        ) : (
                          ev.title
                        )}
                      </p>

                      {/* Expandable Audit Log Details */}
                      {isSelected && (
                        <div className="mt-2.5 p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 animate-in fade-in duration-150">
                          <p className="mb-1.5">{ev.detail}</p>
                          <span className="font-mono text-[10px] text-gray-500 block">
                            Actor: {ev.actor}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Immutable Evidence Hash Footer */}
              <div className="mt-8 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-[10px] font-mono text-[#9CA3AF]">
                <span>SHA-256: 7f8a9...b4c2</span>
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Chain of Custody
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustSection;
