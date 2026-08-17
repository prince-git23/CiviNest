import React, { useState, useMemo } from 'react';
import { Map, MapPin, ArrowUpRight, Compass, Layers } from 'lucide-react';
import { SpatialMapNode } from '../../types';
import { CivicMap } from '../map/CivicMap';
import type { MapViewport, CivicIssue } from '../../services/geo/geoTypes';
import { DEFAULT_VIEWPORT } from '../../services/geo/geoTypes';
import { getIssuesForViewport } from '../../services/geo/mapDataService';

interface RecentMapViewProps {
  nodes?: SpatialMapNode[];
  /** Real report locations from the backend (falls back to demo data when omitted) */
  issues?: CivicIssue[];
  onOpenMap?: () => void;
  className?: string;
}

export const RecentMapView: React.FC<RecentMapViewProps> = ({
  nodes = [],
  issues: backendIssues,
  onOpenMap,
  className = '',
}) => {
  const [mapViewport] = useState<MapViewport>(DEFAULT_VIEWPORT);
  const demoIssues = useMemo(() => getIssuesForViewport(mapViewport), [mapViewport]);
  const issues = backendIssues && backendIssues.length > 0 ? backendIssues : demoIssues;

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
            Report Locations
          </h3>
        </div>

        {onOpenMap && (
          <button
            onClick={onOpenMap}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
          >
            <span>Explore Map</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Real Map showing report locations */}
      <div className="h-44 rounded-xl overflow-hidden border border-[#CBD5E1]">
        <CivicMap
          viewport={mapViewport}
          issues={issues}
          className="w-full h-full"
          style={{ height: 176 }}
          compact={true}
          interactive={false}
        />
      </div>

      <p className="text-[11.5px] text-[#64748B] leading-relaxed">
        {issues.length} active civic issues in your area.
      </p>
    </div>
  );
};

export default RecentMapView;
