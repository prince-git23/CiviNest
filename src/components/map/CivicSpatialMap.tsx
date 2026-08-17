import React, { useState, useCallback, useMemo } from 'react';
import {
  Layers,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Info,
  Eye,
} from 'lucide-react';
import { CivicMap } from './CivicMap';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import type { MapViewport, MapLayer, CivicIssue, IssueCluster, SpatialMapNode } from '../../services/geo/geoTypes';
import { DEFAULT_VIEWPORT } from '../../services/geo/geoTypes';
import {
  getIssuesForViewport,
  getClustersForViewport,
  findNearbyIssues,
} from '../../services/geo/mapDataService';

interface CivicSpatialMapProps {
  nodes?: SpatialMapNode[];
  onSelectNode?: (node: SpatialMapNode) => void;
  selectedNodeId?: string | null;
  wardName?: string;
  localityName?: string;
  userLocation?: { latitude: number; longitude: number };
}

const DEFAULT_ISSUES: SpatialMapNode[] = [
  {
    id: 'node-1',
    title: 'Streetlight Issue',
    category: 'lighting',
    severity: 'critical',
    position: [3.8, 0.5, -2.5],
    sector: 'Sector 14',
    distance: '45m',
    assignedTo: 'Electrical Ops',
    status: 'Active',
    description: 'Sector 14 residential lighting phase circuit failure.',
  },
  {
    id: 'node-2',
    title: 'Water Main Pressure Drop',
    category: 'water',
    severity: 'attention',
    position: [-4.2, 0.8, 2.8],
    sector: 'Downtown',
    distance: '120m',
    assignedTo: 'Water Supply',
    status: 'Assigned',
    description: '400mm trunk pipe pressure anomaly detected.',
  },
  {
    id: 'node-3',
    title: 'Stormwater Drain Clog',
    category: 'drainage',
    severity: 'info',
    position: [2.2, 0.4, 3.5],
    sector: 'Central Market',
    distance: '80m',
    assignedTo: 'Drainage',
    status: 'Monitoring',
    description: 'Siphon 4B water level elevated after rainfall.',
  },
];

export const CivicSpatialMap: React.FC<CivicSpatialMapProps> = ({
  nodes = DEFAULT_ISSUES,
  onSelectNode,
  selectedNodeId,
  wardName = 'Dharampeth',
  localityName = 'Green Valley Residency',
  userLocation,
}) => {
  const [viewport, setViewport] = useState<MapViewport>({
    ...DEFAULT_VIEWPORT,
    zoom: 14,
  });

  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'issues', name: 'Civic Issues', type: 'issues', visible: true, color: '#EF4444' },
    { id: 'clusters', name: 'Issue Clusters', type: 'clusters', visible: true, color: '#F59E0B' },
    { id: 'wards', name: 'Ward Boundaries', type: 'wards', visible: true, color: '#94A3B8' },
    { id: 'infrastructure', name: 'Infrastructure', type: 'infrastructure', visible: false, color: '#3B82F6' },
  ]);

  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);

  // Get data for current viewport
  const issues = useMemo(() => getIssuesForViewport(viewport), [viewport]);
  const clusters = useMemo(() => getClustersForViewport(viewport), [viewport]);

  const handleToggleLayer = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
    );
  }, []);

  const handleSelectIssue = useCallback((issue: CivicIssue) => {
    setSelectedIssue(issue);
  }, []);

  const handleLocateMe = useCallback(() => {
    if (userLocation) {
      setViewport((prev) => ({
        ...prev,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        zoom: 15,
      }));
    }
  }, [userLocation]);

  const handleReset = useCallback(() => {
    setViewport(DEFAULT_VIEWPORT);
    setSelectedIssue(null);
  }, []);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#0F1E36]">Spatial Civic Intelligence</h3>
          <p className="text-[11px] text-[#6B7280]">
            {wardName} · {localityName}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Demo Data
        </span>
      </div>

      <div className="flex">
        {/* Map */}
        <div className="flex-1 relative" style={{ height: 400 }}>
          <CivicMap
            viewport={viewport}
            onViewportChange={setViewport}
            issues={layers.find((l) => l.id === 'issues')?.visible ? issues : []}
            clusters={layers.find((l) => l.id === 'clusters')?.visible ? clusters : []}
            wards={layers.find((l) => l.id === 'wards')?.visible ? [] : []}
            selectedIssueId={selectedIssue?.id}
            onSelectIssue={handleSelectIssue}
            showUserLocation={!!userLocation}
            userLocation={userLocation}
            className="w-full h-full"
            style={{ height: 400 }}
          />

          {/* Controls overlay */}
          <div className="absolute top-3 left-3 z-10">
            <MapControls
              layers={layers}
              onToggleLayer={handleToggleLayer}
              onLocateMe={handleLocateMe}
              onReset={handleReset}
            />
          </div>

          {/* Legend overlay */}
          <div className="absolute bottom-3 left-3 z-10">
            <MapLegend showCategories={false} />
          </div>
        </div>

        {/* Right sidebar: Issue details */}
        <div className="w-72 border-l border-[#E5E7EB] p-4 space-y-4 hidden lg:block">
          {selectedIssue ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Selected Issue
                </span>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="text-[11px] text-[#9CA3AF] hover:text-[#6B7280]"
                >
                  Clear
                </button>
              </div>

              <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB]">
                <h4 className="text-sm font-bold text-[#111827]">{selectedIssue.title}</h4>
                <p className="text-xs text-[#6B7280] mt-1">{selectedIssue.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#0F1E36] text-white">
                    {selectedIssue.priority}
                  </span>
                  <span className="text-[11px] text-[#6B7280]">{selectedIssue.reportCount} reports</span>
                  <span className="text-[11px] text-[#6B7280]">{selectedIssue.confidence}% confidence</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
              <p className="text-xs text-[#9CA3AF]">Click an issue marker to view details</p>
            </div>
          )}

          {/* Nearby Issues */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              Nearby Issues ({issues.length})
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {issues.slice(0, 5).map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                    selectedIssue?.id === issue.id
                      ? 'bg-[#0F1E36]/5 border-[#0F1E36]/20'
                      : 'bg-white border-[#E5E7EB] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <p className="text-xs font-semibold text-[#111827] truncate">{issue.title}</p>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">
                    Priority {issue.priority} · {issue.reportCount} reports
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicSpatialMap;
