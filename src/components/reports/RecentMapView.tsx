import React from 'react';
import { Map, MapPin, ArrowUpRight, Compass, Layers } from 'lucide-react';
import { SpatialMapNode } from '../../types';

interface RecentMapViewProps {
  nodes?: SpatialMapNode[];
  onOpenMap?: () => void;
  className?: string;
}

export const RecentMapView: React.FC<RecentMapViewProps> = ({
  nodes = [],
  onOpenMap,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs text-left space-y-3.5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB]">
            <Compass className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A]">
            Spatial Sector View
          </h3>
        </div>

        <span className="text-[10.5px] font-mono text-[#64748B]">Sector 14 Grid</span>
      </div>

      {/* Styled Interactive Map Thumbnail */}
      <div
        onClick={onOpenMap}
        className="relative h-44 rounded-xl overflow-hidden border border-[#CBD5E1] bg-[#0F1E36] group cursor-pointer"
      >
        {/* Abstract Urban Grid Graphic */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Sector Road Network Paths */}
        <svg className="absolute inset-0 w-full h-full stroke-blue-400/40 stroke-1 fill-none">
          <path d="M 20 40 Q 120 80 280 60" />
          <path d="M 60 140 Q 150 100 240 160" />
          <path d="M 140 10 L 140 170" strokeDasharray="4 4" />
          <path d="M 220 20 L 220 180" />
        </svg>

        {/* Active Signal Pins */}
        <div className="absolute top-8 left-16 flex items-center gap-1.5 bg-blue-600/90 text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>Gate 2 (#CV-8821)</span>
        </div>

        <div className="absolute bottom-10 right-10 flex items-center gap-1.5 bg-emerald-600/90 text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span>Main St (#CV-8110)</span>
        </div>

        <div className="absolute top-16 right-20 flex items-center gap-1.5 bg-amber-600/90 text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>Block B (#CV-8904)</span>
        </div>

        {/* Center Overlay CTA */}
        <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/15 backdrop-blur-[1px] flex items-center justify-center transition-colors">
          <div className="px-3 py-1.5 rounded-lg bg-white/95 text-[#0F172A] text-xs font-bold font-mono shadow-md flex items-center gap-1.5 group-hover:scale-105 transition-transform">
            <span>Explore Spatial Map</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#2563EB]" />
          </div>
        </div>
      </div>

      <p className="text-[11.5px] text-[#64748B] leading-relaxed">
        3 active civic nodes logged in your 500m ward perimeter.
      </p>
    </div>
  );
};

export default RecentMapView;
