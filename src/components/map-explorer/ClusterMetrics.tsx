import React from 'react';
import { Users, FileText, ThumbsUp, Home, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MapClusterItem } from '../../services/mapExplorerService';

interface ClusterMetricsProps {
  cluster: MapClusterItem;
}

export const ClusterMetrics: React.FC<ClusterMetricsProps> = ({ cluster }) => {
  const metrics = [
    {
      id: 'reports',
      label: 'Citizen Filings',
      value: `${cluster.reportCount}`,
      subtext: 'Aggregated reports',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 'confirmations',
      label: 'Quorum Upvotes',
      value: `${cluster.confirmationCount}`,
      subtext: 'Verified by neighbors',
      icon: ThumbsUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 'households',
      label: 'Impacted Units',
      value: `~${cluster.spatialHotspot.estimatedHouseholdsAffected}`,
      subtext: 'Households in radius',
      icon: Home,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      id: 'sla',
      label: 'SLA Timer',
      value: cluster.responsibleAgency.slaRemainingHours > 0 ? `${cluster.responsibleAgency.slaRemainingHours}h left` : 'Resolved',
      subtext: 'Target resolution time',
      icon: Clock,
      color: cluster.responsibleAgency.slaRemainingHours > 0 ? 'text-amber-600' : 'text-emerald-600',
      bg: cluster.responsibleAgency.slaRemainingHours > 0 ? 'bg-amber-50' : 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
          Cluster Core Metrics
        </span>
        <span className="text-[11px] font-mono font-semibold text-[#0F172A]">
          Radius: {cluster.spatialHotspot.radiusMeters}m
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-[#64748B]">{m.label}</span>
                <div className={`w-6 h-6 rounded-lg ${m.bg} ${m.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold text-[#0F172A] tracking-tight font-mono">
                  {m.value}
                </span>
                <span className="text-[10px] text-[#94A3B8] block mt-0.5">{m.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
