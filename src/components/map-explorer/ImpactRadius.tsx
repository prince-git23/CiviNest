import React from 'react';
import { Target, MapPin, AlertTriangle, Shield, Layers, School, Hospital, Bus } from 'lucide-react';
import { MapClusterItem } from '../../services/mapExplorerService';

interface ImpactRadiusProps {
  cluster: MapClusterItem;
}

export const ImpactRadius: React.FC<ImpactRadiusProps> = ({ cluster }) => {
  const getRiskBadge = (rating: string) => {
    switch (rating) {
      case 'Critical Bottleneck':
      case 'High Urgency':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
    }
  };

  const riskStyle = getRiskBadge(cluster.spatialHotspot.riskRating);

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
          Spatial Impact Radius & Exposure
        </span>
        <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${riskStyle.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${riskStyle.dot}`} />
          {cluster.spatialHotspot.riskRating}
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
        {/* Visual Map Radar representation */}
        <div className="relative h-32 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center p-3">
          {/* Concentric radar rings */}
          <div className="absolute w-28 h-28 rounded-full border border-blue-500/30 animate-ping opacity-25" />
          <div className="absolute w-24 h-24 rounded-full border border-blue-500/40" />
          <div className="absolute w-16 h-16 rounded-full border border-blue-400/50 bg-blue-500/10" />
          <div className="absolute w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60A5FA]" />
          </div>

          {/* Floating Telemetry Overlays */}
          <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded backdrop-blur-xs">
            Radius: {cluster.spatialHotspot.radiusMeters}m
          </div>
          <div className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-400 bg-slate-800/80 px-2 py-0.5 rounded backdrop-blur-xs">
            ~{cluster.spatialHotspot.estimatedHouseholdsAffected} Residents
          </div>
        </div>

        {/* Proximity Vulnerability Points */}
        <div className="text-xs space-y-2 pt-1">
          <div className="flex items-center justify-between text-[#475569]">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              {cluster.location.landmarks}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            The civic impact extends across {cluster.spatialHotspot.affectedUnits} contiguous urban assets along {cluster.location.sector}.
          </p>
        </div>
      </div>
    </div>
  );
};
