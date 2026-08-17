import React from 'react';
import { X, Network, MapPin, CheckCircle2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface SpatialCorrelationModalProps {
  onClose: () => void;
  wardName: string;
  sector: string;
  nearbyCount: number;
  confirmationsCount: number;
}

export const SpatialCorrelationModal: React.FC<SpatialCorrelationModalProps> = ({
  onClose,
  wardName,
  sector,
  nearbyCount,
  confirmationsCount,
}) => {
  const clusterPoints = [
    {
      id: 'cp-1',
      title: 'Streetlight Circuit Failure (Pole #12-16)',
      distance: '35m north',
      timeAgo: '2h ago',
      correlation: '94% Cluster Match',
      type: 'Direct Circuit Link',
    },
    {
      id: 'cp-2',
      title: 'Pedestrian Crossing Dark Zone Report',
      distance: '85m west',
      timeAgo: 'Yesterday',
      correlation: '88% Semantic Match',
      type: 'Corridor Correlation',
    },
    {
      id: 'cp-3',
      title: 'Low Luminance School Perimeter Log',
      distance: '110m east',
      timeAgo: '2 days ago',
      correlation: '82% Proximity Match',
      type: 'Ward Grid Context',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col text-left">
        {/* Header */}
        <div className="p-5 border-b border-[#F1F5F9] flex items-center justify-between bg-[#0F1E36] text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/40 text-blue-300 flex items-center justify-center">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Spatial Correlation Mesh</h3>
              <p className="text-xs text-blue-200">{wardName} · {sector}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Top summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                Correlated Nodes
              </span>
              <p className="text-xl font-extrabold text-[#0F1E36] font-mono mt-0.5">
                {nearbyCount} Signals
              </p>
              <span className="text-[10px] text-[#64748B]">Within 1.0 km radius</span>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Community Multiplier
              </span>
              <p className="text-xl font-extrabold text-emerald-800 font-mono mt-0.5">
                {confirmationsCount} Confirmations
              </p>
              <span className="text-[10px] text-[#64748B]">Sector 14 high consensus</span>
            </div>
          </div>

          {/* Cluster Points List */}
          <div className="space-y-2.5 pt-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4B5563]">
              Active Correlated Signals in this Sector
            </span>

            {clusterPoints.map((cp) => (
              <div
                key={cp.id}
                className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#0F1E36]">{cp.title}</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                    {cp.correlation}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>{cp.distance}</span>
                    <span>•</span>
                    <span>{cp.timeAgo}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#475569]">{cp.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Civic Intelligence Note */}
          <div className="p-3 bg-slate-900 text-slate-300 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
              <Zap className="w-3.5 h-3.5" />
              <span>Automated Dispatch Clustering</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When 3+ correlated signals are confirmed in a 150m radius, CiviNest bundles them into a Unified Municipal Work Order for the electrical dispatch crew.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F1F5F9] bg-[#F8FAFC] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
