import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  MapFilterState,
  initialMapClusters,
  civicInfrastructureNodes,
  MapClusterItem,
} from '../services/mapExplorerService';
import { useGeolocation } from '../hooks/useGeolocation';
import { fetchResidentMapData } from '../services/residentMapData';
import { CivicMap } from '../components/map/CivicMap';
import { MapControls as CivicMapControls } from '../components/map/MapControls';
import { MapSearch } from '../components/map/MapSearch';
import { MapFilterSidebar } from '../components/map-explorer/MapFilterSidebar';
import { ClusterAnalysisDrawer } from '../components/map-explorer/ClusterAnalysisDrawer';
import type { MapViewport, MapLayer, CivicIssue, IssueCluster } from '../services/geo/geoTypes';
import { DEFAULT_VIEWPORT } from '../services/geo/geoTypes';
import { getIssuesForViewport, getClustersForViewport } from '../services/geo/mapDataService';
import {
  SlidersHorizontal,
  PlusCircle,
  Sparkles,
  MapPin,
  Flame,
  CheckCircle2,
  Share2,
  ArrowRight,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';

interface MapExplorerPageProps {
  onOpenReportModal?: () => void;
  onNavigate?: (page: any) => void;
  userContext?: {
    name: string;
    city: string;
    ward: string;
    community: string;
  };
}

export const MapExplorerPage: React.FC<MapExplorerPageProps> = ({
  onOpenReportModal,
  onNavigate,
  userContext = {
    name: 'Prince',
    city: 'Nagpur',
    ward: 'Dharampeth Ward 14',
    community: 'Green Valley Residency',
  },
}) => {
  // Filter state
  const [filters, setFilters] = useState<MapFilterState>({
    searchQuery: '',
    categories: ['water', 'roads', 'lighting', 'sanitation', 'safety'],
    severity: 'all',
    status: 'all',
    infrastructure: {
      schools: true,
      hospitals: true,
      transit: true,
      utilities: true,
    },
  });

  // Selected Cluster state
  const [selectedCluster, setSelectedCluster] = useState<MapClusterItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Tracked clusters set
  const [trackedClusterIds, setTrackedClusterIds] = useState<Set<string>>(
    new Set(['cluster-sl-409'])
  );

  // Mobile filter drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Camera triggers
  const [zoomTrigger, setZoomTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);
  const [locateTrigger, setLocateTrigger] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real map state
  const [mapViewport, setMapViewport] = useState<MapViewport>(DEFAULT_VIEWPORT);
  const { position: geoPosition, locating: locatingGeo, requestLocation } = useGeolocation();

  // Backend-driven map data (falls back to demo data when unavailable)
  const [liveIssues, setLiveIssues] = useState<CivicIssue[]>([]);
  const [liveClusters, setLiveClusters] = useState<IssueCluster[]>([]);
  const [mapDataSource, setMapDataSource] = useState<'live' | 'demo'>('demo');

  useEffect(() => {
    let mounted = true;
    fetchResidentMapData().then((data) => {
      if (!mounted) return;
      setLiveIssues(data.issues);
      setLiveClusters(data.clusters);
      setMapDataSource(data.source);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLocateMe = useCallback(() => {
    requestLocation();
  }, [requestLocation]);
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: 'issues', name: 'Civic Issues', type: 'issues', visible: true, color: '#EF4444' },
    { id: 'clusters', name: 'Issue Clusters', type: 'clusters', visible: true, color: '#F59E0B' },
    { id: 'wards', name: 'Ward Boundaries', type: 'wards', visible: true, color: '#94A3B8' },
    { id: 'infrastructure', name: 'Infrastructure', type: 'infrastructure', visible: false, color: '#3B82F6' },
  ]);

  const demoIssues = useMemo(() => getIssuesForViewport(mapViewport), [mapViewport]);
  const demoClusters = useMemo(() => getClustersForViewport(mapViewport), [mapViewport]);
  const mapIssues = liveIssues.length > 0 ? liveIssues : demoIssues;
  const mapClusters = liveClusters.length > 0 ? liveClusters : demoClusters;

  const handleToggleLayer = useCallback((layerId: string) => {
    setMapLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Center the map on the user's live location when located
  useEffect(() => {
    if (geoPosition) {
      setMapViewport((prev) => ({
        ...prev,
        latitude: geoPosition.latitude,
        longitude: geoPosition.longitude,
        zoom: 15,
      }));
      showToast(`Centered on your location (${geoPosition.latitude.toFixed(4)}, ${geoPosition.longitude.toFixed(4)})`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoPosition]);

  // Filtered clusters logic
  const filteredClusters = useMemo(() => {
    return initialMapClusters.filter((cluster) => {
      // Category match
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(cluster.categoryKey)
      ) {
        return false;
      }

      // Severity match
      if (filters.severity !== 'all' && cluster.severity !== filters.severity) {
        return false;
      }

      // Status match
      if (filters.status !== 'all' && cluster.statusType !== filters.status) {
        return false;
      }

      // Search match
      if (filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = cluster.issueTitle.toLowerCase().includes(query);
        const matchesCode = cluster.clusterCode.toLowerCase().includes(query);
        const matchesSector = cluster.location.sector.toLowerCase().includes(query);
        const matchesDesc = cluster.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCode && !matchesSector && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  const handleSelectCluster = (cluster: MapClusterItem) => {
    setSelectedCluster(cluster);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleTrackToggle = (clusterId: string, isTracking: boolean) => {
    const nextSet = new Set(trackedClusterIds);
    if (isTracking) {
      nextSet.add(clusterId);
    } else {
      nextSet.delete(clusterId);
    }
    setTrackedClusterIds(nextSet);
  };

  const handleOpenVerification = (cluster: MapClusterItem) => {
    if (onNavigate) {
      onNavigate('verification');
    }
  };

  return (
    <div
      id="map-explorer-page"
      className={`relative w-full bg-[#F4F6F9] pt-0 min-h-screen flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 pt-0 bg-white' : ''
      }`}
    >
      {/* Top Breadcrumb & Live Intelligence Control Bar */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-extrabold text-[#0F172A] tracking-tight truncate">
                {userContext.ward}
              </h1>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold hidden sm:inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Spatial Quorum
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] truncate">
              {userContext.community} · {userContext.city} Civic District
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Filters Trigger */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0F172A] shadow-xs active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters ({filteredClusters.length})</span>
          </button>

          {/* Create Signal Action */}
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>Create Signal</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map Viewport & Filter Sidebar Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Filter Sidebar */}
        <MapFilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          totalClustersCount={initialMapClusters.length}
          filteredClustersCount={filteredClusters.length}
          userLocation={userContext}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Central Real Map Viewport */}
        <main
          id="civic-3d-viewport"
          className="flex-1 relative w-full h-[calc(100vh-8.5rem)] sm:h-[calc(100vh-7.5rem)]"
        >
          <CivicMap
            viewport={mapViewport}
            onViewportChange={setMapViewport}
            clusters={mapClusters}
            issues={mapIssues}
            selectedIssueId={selectedCluster?.id}
            showUserLocation={!!geoPosition}
            userLocation={geoPosition || undefined}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />

          {/* Floating Map Controls */}
          <div className="absolute top-4 right-4 z-20">
            <CivicMapControls
              layers={mapLayers}
              onToggleLayer={handleToggleLayer}
              onLocateMe={handleLocateMe}
              onReset={() => setMapViewport(DEFAULT_VIEWPORT)}
              isFullscreen={isFullscreen}
              onFullscreen={() => setIsFullscreen(!isFullscreen)}
            />
          </div>

          {/* Search bar */}
          <div className="absolute top-4 left-4 z-20 w-72">
            <MapSearch
              onSelectLocation={(point, name) => {
                setMapViewport((prev) => ({ ...prev, latitude: point.latitude, longitude: point.longitude, zoom: 15 }));
              }}
            />
          </div>

          {/* Floating Cluster Quick Preview on Map (Top-Right Pill when not full drawer) */}
          {selectedCluster && !isDrawerOpen && (
            <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-3.5 shadow-xl max-w-sm text-left animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-blue-600">
                  {selectedCluster.clusterCode}
                </span>
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="text-xs font-bold text-[#0F172A] hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Intelligence Drawer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-xs font-bold text-[#0F172A] truncate">
                {selectedCluster.issueTitle}
              </h4>
            </div>
          )}
        </main>

        {/* Right Cluster Analysis Drawer */}
        <ClusterAnalysisDrawer
          cluster={selectedCluster}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          onTrackToggle={handleTrackToggle}
          isTracking={selectedCluster ? trackedClusterIds.has(selectedCluster.id) : false}
          onOpenVerification={handleOpenVerification}
          onOpenReportModal={onOpenReportModal}
          onShowToast={showToast}
        />
      </div>

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
