import React from 'react';
import { Scan, Eye, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { EvidenceFinding } from '../../services/signalAnalysisService';

interface EvidenceAnalysisCardProps {
  findings?: EvidenceFinding[];
  evidenceCount?: number;
}

export const EvidenceAnalysisCard: React.FC<EvidenceAnalysisCardProps> = ({
  findings = [],
  evidenceCount = 2,
}) => {
  const defaultFindings: EvidenceFinding[] = [
    {
      id: 'ef-default-1',
      title: 'Ambient Light Level: Critical',
      status: 'Critical',
      statusType: 'critical',
      description: 'Computer vision detects < 5 lux in the primary zone. Confirms "very dark" description.',
      source: 'Luminance Mesh & Photo 1 Analysis',
      confidence: 94,
    },
    {
      id: 'ef-default-2',
      title: 'Structural Match',
      status: 'Verified',
      statusType: 'verified',
      description: 'Geometry in Photo 1 correlates 84% with typical school gate structures in this ward.',
      source: 'GIS Cadastral Alignment',
      confidence: 84,
    },
  ];

  const displayFindings = findings.length > 0 ? findings : defaultFindings;

  return (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs text-left space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Scan className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-[#0F1E36]">Evidence Analysis</h3>
        </div>

        <span className="text-[10px] font-mono font-medium text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
          CV Engine v2.4
        </span>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {displayFindings.map((finding) => {
          const isCritical = finding.statusType === 'critical';
          const isVerified = finding.statusType === 'verified';
          const isElevated = finding.statusType === 'elevated';

          return (
            <div
              key={finding.id}
              className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-1.5 transition-all hover:border-[#CBD5E1]"
            >
              {/* Finding Title & Status Badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      isCritical
                        ? 'bg-rose-100 text-rose-700'
                        : isElevated
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isCritical || isElevated ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#0F1E36]">{finding.title}</span>
                </div>

                {finding.confidence && (
                  <span className="text-[10px] font-mono font-semibold text-[#475569] bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                    {finding.confidence}%
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-[#475569] leading-relaxed pl-7">
                {finding.description}
              </p>

              {/* Source Tag */}
              {finding.source && (
                <div className="pl-7 pt-0.5">
                  <span className="text-[9px] font-mono text-[#94A3B8] tracking-wider uppercase">
                    Source: {finding.source}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
