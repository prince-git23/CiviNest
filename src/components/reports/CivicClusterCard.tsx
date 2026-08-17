import React, { useState } from 'react';
import { Network, ArrowRight, ShieldCheck, Users, Radio } from 'lucide-react';
import { CivicClusterInfo } from '../../types';
import CivicClusterScene from './CivicClusterScene';

interface CivicClusterCardProps {
  cluster: CivicClusterInfo;
  onViewCluster?: (clusterId: string) => void;
  className?: string;
}

export const CivicClusterCard: React.FC<CivicClusterCardProps> = ({
  cluster,
  onViewCluster,
  className = '',
}) => {
  const [hoveredNodeText, setHoveredNodeText] = useState<string | null>(null);

  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-linear-to-b from-[#F8FAFC] to-white p-4 sm:p-5 shadow-xs text-left ${className}`}
    >
      {/* Eyebrow and Cluster Badging */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#2563EB]">
          <Network className="w-3.5 h-3.5" />
          <span>Part of a Larger Civic Issue</span>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-[#1E40AF] border border-blue-200 font-semibold">
          AI Clustered
        </span>
      </div>

      {/* Cluster Title and Location */}
      <div className="mb-3">
        <h4 className="text-sm sm:text-base font-bold text-[#0F172A] tracking-tight">
          {cluster.title}
        </h4>
        <p className="text-xs text-[#64748B] mt-0.5 flex items-center gap-2">
          <span>{cluster.location}</span>
          <span>•</span>
          <span className="font-mono text-[#0F172A] font-semibold">
            {cluster.reportCount} reports, {cluster.confirmationCount} independent confirmations
          </span>
        </p>
      </div>

      {/* 3D Civic Cluster Scene Visualization */}
      <div className="relative mb-3.5">
        <CivicClusterScene
          reportCount={cluster.reportCount}
          confirmationCount={cluster.confirmationCount}
          category={cluster.category}
          onHoverNode={setHoveredNodeText}
        />

        {/* Hovered node floating pill */}
        {hoveredNodeText && (
          <div className="absolute bottom-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-mono px-2.5 py-1 rounded-md border border-slate-700 shadow-md animate-in fade-in duration-150">
            {hoveredNodeText}
          </div>
        )}

        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-[10.5px] font-mono text-[#475569] px-2 py-0.5 rounded border border-[#CBD5E1]">
          Live Signal Network
        </div>
      </div>

      {/* Footer Navigation Action */}
      <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
        <p className="text-[11.5px] text-[#64748B]">
          Your individual report is correlated with neighbors in this sector.
        </p>

        <button
          onClick={() => onViewCluster && onViewCluster(cluster.id)}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] group transition-colors cursor-pointer shrink-0 ml-2"
        >
          <span>View Cluster</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default CivicClusterCard;
