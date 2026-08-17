import React from 'react';
import { Network, ArrowUpRight, MapPin, ChevronRight, Layers } from 'lucide-react';
import { MunicipalClusterSummary } from '../../types';

interface ActiveClustersProps {
  clusters: MunicipalClusterSummary[];
  onSelectCluster?: (cluster: MunicipalClusterSummary) => void;
  onNavigateToMap?: () => void;
}

export const ActiveClusters: React.FC<ActiveClustersProps> = ({
  clusters,
  onSelectCluster,
  onNavigateToMap,
}) => {
  const maxIssues = Math.max(...clusters.map((c) => c.issueCount), 1);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#111827] tracking-tight font-sans flex items-center gap-2">
          <span>Top Active Clusters</span>
        </h3>
        {onNavigateToMap && (
          <button
            onClick={onNavigateToMap}
            className="text-[11px] font-mono font-semibold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>CITY MAP</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Cluster List */}
      <div className="space-y-4">
        {clusters.map((cluster) => {
          const intensityPercent = Math.round((cluster.issueCount / maxIssues) * 100);

          return (
            <div
              key={cluster.id}
              onClick={() => onSelectCluster && onSelectCluster(cluster)}
              className="space-y-1.5 group cursor-pointer"
            >
              {/* Item Title & Issue Count Badge */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors truncate pr-2">
                  {cluster.title}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] shrink-0">
                  {cluster.issueCount} ISSUES
                </span>
              </div>

              {/* Data-Driven Relative Intensity Progress Bar */}
              <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#0F1E36] rounded-full transition-all duration-700 ease-out group-hover:bg-[#2563EB]"
                  style={{ width: `${intensityPercent}%` }}
                />
              </div>

              {/* Sub-location info */}
              <div className="flex items-center justify-between text-[11px] text-[#6B7280] font-sans">
                <span className="truncate">{cluster.location}</span>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                  {cluster.affectedHouseholds} households
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveClusters;
