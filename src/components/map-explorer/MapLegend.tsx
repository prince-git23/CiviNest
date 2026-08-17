import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Layers, MapPin, School, Hospital, Bus, Zap } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      id="map-legend-card"
      className="absolute bottom-6 left-6 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E2E8F0] shadow-lg transition-all overflow-hidden text-left"
    >
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 border-b border-slate-100"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0F172A]">
            Civic Map Legend
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-3.5 space-y-3 text-xs">
          {/* Issue Clusters */}
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#94A3B8] block mb-1.5">
              Civic Issue Clusters
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#F43F5E]" />
                <span>Critical Bottleneck</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_6px_#2563EB]" />
                <span>Active / High</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#F59E0B]" />
                <span>Attention / Work</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#334155]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
                <span>Resolved & Quorum</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Landmarks */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#94A3B8] block mb-1.5">
              Key Infrastructure
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#334155]">
                <div className="w-2.5 h-2.5 rounded-sm bg-teal-500" />
                <span>Schools & Edu</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#334155]">
                <div className="w-2.5 h-2.5 rounded-sm bg-pink-500" />
                <span>Hospitals & Clinics</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#334155]">
                <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                <span>Transit Nodes</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#334155]">
                <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
                <span>Power & Utilities</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
