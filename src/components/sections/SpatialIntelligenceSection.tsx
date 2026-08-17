import React, { useState } from 'react';
import { Layers, BarChart3, TrendingUp, MapPin, AlertTriangle, CheckCircle, Navigation, Radio } from 'lucide-react';
import { SectorData } from '../../types';

const sectorsData: Record<string, SectorData> = {
  'SECTOR-14': {
    id: 'SECTOR-14',
    name: 'Sector 14 — Downtown & Main',
    civicHealthIndex: 64,
    activeSignals: 37,
    criticalIssues: 2,
    coordinates: [
      { x: 30, y: 25 },
      { x: 75, y: 20 },
      { x: 85, y: 75 },
      { x: 50, y: 88 },
      { x: 20, y: 65 },
    ],
    hotspots: [
      { id: 'h1', x: 42, y: 48, type: 'critical', title: 'Street Lighting Failure' },
      { id: 'h2', x: 68, y: 62, type: 'medium', title: 'Road Pothole Cluster' },
    ],
    topIssues: [
      {
        title: 'Street Lighting',
        priority: 'High Priority',
        linkedReports: 25,
        status: 'Active',
      },
      {
        title: 'Pothole',
        priority: 'Medium',
        linkedReports: 12,
        status: 'Scheduled',
      },
    ],
  },
  'SECTOR-09': {
    id: 'SECTOR-09',
    name: 'Sector 09 — West Ridge',
    civicHealthIndex: 82,
    activeSignals: 19,
    criticalIssues: 1,
    coordinates: [
      { x: 25, y: 15 },
      { x: 80, y: 30 },
      { x: 70, y: 85 },
      { x: 15, y: 70 },
    ],
    hotspots: [
      { id: 'h3', x: 50, y: 40, type: 'critical', title: 'Water Main Valve Anomaly' },
      { id: 'h4', x: 35, y: 65, type: 'info', title: 'Park Bench Vandalism' },
    ],
    topIssues: [
      {
        title: 'Water Pressure',
        priority: 'High Priority',
        linkedReports: 19,
        status: 'Active',
      },
      {
        title: 'Park Maintenance',
        priority: 'Low',
        linkedReports: 4,
        status: 'Investigating',
      },
    ],
  },
};

export const SpatialIntelligenceSection: React.FC = () => {
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [activeSectorKey, setActiveSectorKey] = useState<string>('SECTOR-14');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  const sector = sectorsData[activeSectorKey] || sectorsData['SECTOR-14'];

  return (
    <section id="intelligence" className="py-24 md:py-32 bg-[#0A1426] text-white overflow-hidden relative">
      {/* Background ambient civic glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Spatial Narrative & Capabilities */}
          <div className="lg:col-span-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight mb-6 leading-tight">
              See what the city is telling you
            </h2>
            
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-10 font-light">
              Visualize civic health in real-time. Our spatial intelligence tools
              map verified issue clusters, predict emerging hotspots, and track
              resolution metrics across administrative boundaries.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-100">
                    Custom ward & boundary overlays
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Ingest existing municipal GIS shapefiles or dynamically define custom zones.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-100">
                    Real-time heatmaps & cluster density
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    DBSCAN spatial clustering filters individual noise into consolidated points of interest.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-100">
                    Historical trend analysis per sector
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Compare resolution velocity against historical averages to prevent chronic systemic blindspots.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Sector Selector */}
            <div className="mt-10 pt-6 border-t border-slate-800 flex items-center gap-3 text-xs">
              <span className="text-slate-400 font-mono">Select Ward:</span>
              <button
                onClick={() => setActiveSectorKey('SECTOR-14')}
                className={`px-3 py-1.5 rounded font-mono transition-colors ${
                  activeSectorKey === 'SECTOR-14'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Sector 14 (Downtown)
              </button>
              <button
                onClick={() => setActiveSectorKey('SECTOR-09')}
                className={`px-3 py-1.5 rounded font-mono transition-colors ${
                  activeSectorKey === 'SECTOR-09'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Sector 09 (West Ridge)
              </button>
            </div>
          </div>

          {/* Right Column: Interactive GIS Map & Ward Telemetry Overlay */}
          <div className="lg:col-span-7">
            <div className="relative bg-[#060E1A] rounded-2xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden min-h-[460px] flex flex-col">
              
              {/* Map Top Controls Bar */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-[#0A1426]/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 text-xs font-mono">
                <button
                  onClick={() => setMapMode('map')}
                  className={`px-3 py-1 rounded transition-colors ${
                    mapMode === 'map'
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Map
                </button>
                <button
                  onClick={() => setMapMode('satellite')}
                  className={`px-3 py-1 rounded transition-colors ${
                    mapMode === 'satellite'
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Satellite
                </button>
              </div>

              {/* GIS Spatial Viewport */}
              <div className="relative w-full h-[460px] overflow-hidden">
                {/* SVG Coordinate Grid Background */}
                <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.75" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>

                {/* Ward Boundary Polygon */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Outer boundary fill */}
                  <polygon
                    points={sector.coordinates.map((c) => `${c.x},${c.y}`).join(' ')}
                    fill="rgba(37, 99, 235, 0.08)"
                    stroke="#3B82F6"
                    strokeWidth="0.8"
                    strokeDasharray="2,2"
                  />
                  {/* Subtle inner triangulation rays */}
                  {sector.coordinates.map((c, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={c.x}
                      y2={c.y}
                      stroke="#2563EB"
                      strokeWidth="0.3"
                      strokeOpacity="0.4"
                    />
                  ))}
                </svg>

                {/* Hotspot Signal Pins */}
                {sector.hotspots.map((spot) => {
                  const isCritical = spot.type === 'critical';
                  const isSelected = selectedHotspot === spot.id;

                  return (
                    <div
                      key={spot.id}
                      onClick={() => setSelectedHotspot(isSelected ? null : spot.id)}
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                    >
                      {/* Pulse Ring */}
                      <span
                        className={`absolute -inset-2.5 rounded-full animate-ping opacity-60 ${
                          isCritical ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                      />
                      
                      {/* Solid Center Dot */}
                      <div
                        className={`relative w-4 h-4 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-125 ${
                          isCritical ? 'bg-red-500' : 'bg-blue-600'
                        }`}
                      />

                      {/* Tooltip on hover/click */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-slate-900 text-white text-[11px] font-mono px-2.5 py-1 rounded shadow-xl border border-slate-700 z-30">
                        {spot.title} ({isCritical ? 'High Risk' : 'Active'})
                      </div>
                    </div>
                  );
                })}

                {/* Floating Sector Telemetry Dashboard Card */}
                <div className="absolute top-4 right-4 bottom-4 w-72 sm:w-80 bg-[#0B172B]/95 backdrop-blur-md rounded-xl border border-slate-700/80 p-5 z-20 flex flex-col justify-between shadow-2xl">
                  {/* Sector Title */}
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="font-mono text-xs font-bold tracking-wider text-slate-300 uppercase">
                        {sector.id.replace('-', ' ')}
                      </span>
                      <button
                        onClick={() => setActiveSectorKey(activeSectorKey === 'SECTOR-14' ? 'SECTOR-09' : 'SECTOR-14')}
                        className="text-slate-400 hover:text-white text-xs font-mono transition-colors"
                        title="Switch Sector"
                      >
                        [toggle]
                      </button>
                    </div>

                    {/* Civic Health Index Meter */}
                    <div className="mt-4 mb-6">
                      <span className="text-[11px] text-slate-400 font-mono block mb-1">
                        Civic Health Index
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-3xl font-bold text-white tracking-tight">
                          {sector.civicHealthIndex}
                        </span>
                        <span className="font-mono text-xs text-slate-400">/100</span>
                      </div>
                      
                      {/* Health Meter Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          style={{ width: `${sector.civicHealthIndex}%` }}
                          className={`h-full rounded-full ${
                            sector.civicHealthIndex > 75
                              ? 'bg-emerald-500'
                              : sector.civicHealthIndex > 50
                              ? 'bg-amber-400'
                              : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Top Verified Issues List */}
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block mb-2.5">
                        Top Verified Issues
                      </span>

                      <div className="space-y-2.5">
                        {sector.topIssues.map((issue, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-850 bg-[#101D33] p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-100">
                                {issue.title}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                                  issue.priority === 'High Priority'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}
                              >
                                {issue.priority}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>{issue.linkedReports} linked reports</span>
                              <span className="text-slate-300">• {issue.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Status Footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      <span>Live GIS Sync</span>
                    </span>
                    <span>24.89° N, 78.43° E</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SpatialIntelligenceSection;
