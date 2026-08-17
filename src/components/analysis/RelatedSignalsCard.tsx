import React, { useState } from 'react';
import { Network, MapPin, CheckCircle2, ArrowRight, ExternalLink, Activity } from 'lucide-react';
import { RelatedSignalData } from '../../services/signalAnalysisService';
import { SpatialCorrelationModal } from './SpatialCorrelationModal';

interface RelatedSignalsCardProps {
  data?: RelatedSignalData;
  wardName?: string;
}

export const RelatedSignalsCard: React.FC<RelatedSignalsCardProps> = ({
  data,
  wardName = 'Dharampeth',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nearbyCount = data?.nearbyReportsCount ?? 7;
  const radiusKm = data?.radiusKm ?? 1.0;
  const confirmationsCount = data?.confirmationsCount ?? 5;
  const sector = data?.sectorName ?? 'Sector 14';

  return (
    <>
      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs text-left space-y-4 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Network className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F1E36]">Related Signals</h3>
          </div>

          <span className="text-[10px] font-mono font-medium text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
            {wardName}
          </span>
        </div>

        {/* Counts Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Nearby Reports */}
          <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-[#0F1E36] font-mono">
                {nearbyCount}
              </span>
              <span className="text-[11px] font-medium text-[#64748B]">Reports</span>
            </div>
            <p className="text-[10px] text-[#94A3B8] pt-0.5">Within {radiusKm}km radius</p>
          </div>

          {/* Confirmations */}
          <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                {confirmationsCount}
              </span>
              <span className="text-[11px] font-medium text-[#64748B]">Votes</span>
            </div>
            <p className="text-[10px] text-[#94A3B8] pt-0.5">In {sector}</p>
          </div>
        </div>

        {/* View Spatial Correlation Map Action */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-xs font-bold text-blue-900 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>View spatial correlation map</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Spatial Correlation Overlay Modal */}
      {isModalOpen && (
        <SpatialCorrelationModal
          onClose={() => setIsModalOpen(false)}
          wardName={wardName}
          sector={sector}
          nearbyCount={nearbyCount}
          confirmationsCount={confirmationsCount}
        />
      )}
    </>
  );
};
