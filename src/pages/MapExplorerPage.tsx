import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MapFilterState,
  civicInfrastructureNodes,
  MapClusterItem,
} from '../services/mapExplorerService';
import { useGeolocation } from '../hooks/useGeolocation';
import { fetchResidentMapData, mapCategory } from '../services/residentMapData';
import { getMapClusterById, getIssueById, CivicIssueDetail } from '../services/api';
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
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

function timeAgo(iso?: string): string {
  if (!iso) return 'Recently';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

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

  // Selected issue detail (backend-driven)
  const [selectedIssue, setSelectedIssue] = useState<CivicIssueDetail | null>(null);
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

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

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Real map state
  const [mapViewport, setMapViewport] = useState<MapViewport>(DEFAULT_VIEWPORT);
  const { position: geoPosition, locating: locatingGeo, requestLocation } = useGeolocation();

  // Backend-driven map data (falls back to demo data when unavailable)
  const [liveIssues, setLiveIssues] = useState<CivicIssue[]>([]);
  const [liveClusters, setLiveClusters] = useState<IssueCluster[]>([]);
  const [mapDataSource, setMapDataSource] = useState<'live' | 'demo'>('demo');

  // URL focus: ?cluster=<id>&lat=&lng= (used by AI Insight / Trend pages)
  const [searchParams, setSearchParams] = useSearchParams();
  const focusClusterId = searchParams.get('cluster');
  const focusLat = parseFloat(searchParams.get('lat') || '');
  const focusLng = parseFloat(searchParams.get('lng') || '');

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

  // Adapter: backend cluster (geoTypes IssueCluster or API MapClusterDetail) →
  // the richer shape the analysis drawer expects, with sensible fallbacks.
  const toMapClusterItem = useCallback((c: any): MapClusterItem | null => {
    const lat = c.center?.latitude ?? c.latitude;
    const lng = c.center?.longitude ?? c.longitude;
    if (lat == null || lng == null) return null;

    const categoryKey = (c.category || 'infrastructure') as any;
    const categoryLabel =
      (c.categoryLabel) ||
      (String(categoryKey).replace(/_/g, ' ').replace(/\b\w/g, (x: string) => x.toUpperCase())) ||
      'Civic Issue';
    // Converted geo clusters carry a numeric priority score (no severity), while
    // raw API clusters carry a severity string — support both.
    const score = typeof c.priority === 'number' ? c.priority : c.priority?.score;
    const rawSeverity = String(c.severity || '').toUpperCase();
    const severity =
      rawSeverity === 'CRITICAL' || c.priority?.level === 'CRITICAL' || c.priority === 'critical' || (score != null && score >= 80)
        ? 'critical'
        : rawSeverity === 'HIGH' || c.priority?.level === 'HIGH' || c.priority === 'high' || (score != null && score >= 60)
        ? 'high'
        : rawSeverity === 'LOW' || c.priority?.level === 'LOW' || c.priority === 'low' || (score != null && score < 35)
        ? 'low'
        : 'medium';
    const statusType = ['RESOLVED', 'resolved'].includes(c.status)
      ? 'resolved'
      : ['INVESTIGATING', 'in-progress', 'Under Review'].includes(c.status)
      ? 'investigating'
      : 'active';
    const reportCount = c.reportCount ?? c.issueCount ?? 1;

    return {
      id: c.id,
      clusterCode: c.clusterCode || `CLS-${String(c.id).slice(-6).toUpperCase()}`,
      issueTitle: c.title || c.clusterCode || 'Civic issue cluster',
      categoryKey: categoryKey as any,
      categoryLabel,
      severity: severity as any,
      aiConfidence: Math.round((c.confidence ?? 0.7) * 100),
      location: {
        sector: c.locality || c.ward || 'Local area',
        ward: c.ward || 'Ward 14',
        city: c.city || 'Nagpur',
        landmarks: c.landmarks || '',
        coordinates: { lat, lng },
      },
      description:
        c.description ||
        `${reportCount} resident report${reportCount === 1 ? '' : 's'} clustered near ${c.locality || 'your area'}.`,
      firstReportedTime: c.firstReported ? timeAgo(c.firstReported) : 'Recently',
      lastSignalTime: c.latestReport ? timeAgo(c.latestReport) : 'Recently',
      reportCount,
      confirmationCount: c.confirmationCount || 0,
      contributingSignals: (c.recentSignals || []).slice(0, 3).map((s: any, i: number) => ({
        id: s.id || `sig-${i}`,
        user: 'Resident',
        text: s.text || '',
        time: timeAgo(s.createdAt),
        distance: 'Nearby',
        verified: true,
      })),
      spatialHotspot: {
        radiusMeters: c.radiusMeters || 500,
        affectedUnits: Math.max(Math.ceil(reportCount / 2), 1),
        riskRating: severity === 'critical' ? 'Critical Bottleneck' : severity === 'high' ? 'High Urgency' : severity === 'medium' ? 'Moderate' : 'Low Risk',
        estimatedHouseholdsAffected: Math.max(reportCount * 40, 40),
      },
      responsibleAgency: {
        department: c.department || 'Municipal Ward Office',
        contactOfficer: '',
        slaRemainingHours: 0,
        status: String(c.status || 'ACTIVE').replace(/_/g, ' '),
      },
      aiClusterRationale: `Spatial correlation engine merged ${reportCount} report${reportCount === 1 ? '' : 's'} within a ${c.radiusMeters || 500}m radius of ${c.locality || c.ward || 'the area'}.`,
      rootCauseHypothesis: 'Pending field inspection.',
      recommendedResolution: 'Awaiting municipal assignment.',
      mapPosition: [0, 0, 0],
      radiusScale: 1,
      statusType: statusType as any,
    };
  }, []);

  // Focus the map on the URL-provided cluster / coordinates
  useEffect(() => {
    if (!isNaN(focusLat) && !isNaN(focusLng)) {
      setMapViewport((prev) => ({ ...prev, latitude: focusLat, longitude: focusLng, zoom: 14 }));
    }
    if (focusClusterId) {
      const existing = liveClusters.find((c) => c.id === focusClusterId);
      if (existing) {
        const item = toMapClusterItem(existing);
        if (item) {
          setSelectedCluster(item);
          setIsDrawerOpen(true);
        }
      } else {
        // Cluster not in the current page dataset — fetch it directly
        getMapClusterById(focusClusterId)
          .then((res) => {
            const item = toMapClusterItem(res.cluster);
            if (item) {
              setSelectedCluster(item);
              setIsDrawerOpen(true);
              setMapViewport((prev) => ({
                ...prev,
                latitude: res.cluster.center?.latitude ?? prev.latitude,
                longitude: res.cluster.center?.longitude ?? prev.longitude,
                zoom: 14,
              }));
            }
          })
          .catch(() => {
            showToast('Could not load the selected cluster.');
          });
      }
    }
    // Only run when the URL focus params change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusClusterId, focusLat, focusLng]);
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

  // Clear the URL focus params after consuming them so re-opening the drawer
  // doesn't re-trigger the focus effect.
  useEffect(() => {
    if (focusClusterId || !isNaN(focusLat) || !isNaN(focusLng)) {
      const next = new URLSearchParams(searchParams);
      next.delete('cluster');
      next.delete('lat');
      next.delete('lng');
      next.delete('title');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Normalize any category spelling (snake_case, kebab-case, or short key) to
  // the sidebar's short category keys: water / roads / lighting / sanitation /
  // safety. Unknown categories map to 'infrastructure' and are always shown.
  const categoryToSidebarKey = useCallback((raw?: string): string => {
    if (!raw) return 'infrastructure';
    const catKey = raw.includes('-') ? raw : mapCategory(raw);
    if (catKey === 'water-supply' || raw === 'water') return 'water';
    if (catKey === 'road-maintenance' || raw === 'roads') return 'roads';
    if (catKey === 'street-lighting' || raw === 'lighting') return 'lighting';
    if (catKey === 'drainage' || catKey === 'sanitation' || raw === 'waste') return 'sanitation';
    if (catKey === 'safety') return 'safety';
    return 'infrastructure';
  }, []);

  // Filtered clusters logic — applied to the LIVE backend clusters when
  // available (falls back to demo data only when the backend is unreachable).
  const filteredClusters = useMemo(() => {
    const source = liveClusters.length > 0 ? liveClusters : demoClusters;
    return source
      .map(toMapClusterItem)
      .filter((c): c is MapClusterItem => c !== null)
      .filter((cluster) => {
        // Category match (sidebar uses short keys: water/roads/lighting/sanitation/safety)
        if (filters.categories.length > 0) {
          const sidebarKey = categoryToSidebarKey(cluster.categoryKey as string);
          if (!filters.categories.includes(sidebarKey) && sidebarKey !== 'infrastructure') {
            return false;
          }
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
  }, [filters, liveClusters, demoClusters, toMapClusterItem, categoryToSidebarKey]);

  // Total cluster count for the sidebar — live count when available.
  const totalClusterCount = useMemo(() => {
    const source = liveClusters.length > 0 ? liveClusters : demoClusters;
    return source.length;
  }, [liveClusters, demoClusters]);

  // Filtered map data — the filters must change what's actually rendered on the
  // map, not just the sidebar count.
  const visibleClusterIds = useMemo(() => new Set(filteredClusters.map((c) => c.id)), [filteredClusters]);
  const visibleMapClusters = useMemo(
    () => (visibleClusterIds.size > 0 ? mapClusters.filter((c) => visibleClusterIds.has(c.id)) : mapClusters),
    [mapClusters, visibleClusterIds]
  );
  const visibleMapIssues = useMemo(() => {
    return mapIssues.filter((issue) => {
      if (filters.categories.length > 0) {
        const sidebarKey = categoryToSidebarKey(issue.category);
        if (!filters.categories.includes(sidebarKey) && sidebarKey !== 'infrastructure') {
          return false;
        }
      }
      if (filters.severity !== 'all') {
        const sev =
          issue.priority >= 80 ? 'critical' : issue.priority >= 60 ? 'high' : issue.priority >= 35 ? 'medium' : 'low';
        if (sev !== filters.severity) return false;
      }
      if (filters.status !== 'all') {
        const st =
          issue.status === 'resolved'
            ? 'resolved'
            : issue.status === 'in-progress' || issue.status === 'assigned'
            ? 'in_progress'
            : 'active';
        if (st !== filters.status) return false;
      }
      return true;
    });
  }, [mapIssues, filters, categoryToSidebarKey]);

  const handleSelectCluster = (cluster: MapClusterItem) => {
    setSelectedCluster(cluster);
    setIsDrawerOpen(true);
    setSelectedIssue(null);
  };

  // Fetch real issue detail from the backend when a marker is clicked
  const handleSelectIssue = useCallback((issue: CivicIssue) => {
    setSelectedIssue(null);
    setIssueLoading(true);
    setIssueError(null);
    getIssueById(issue.id)
      .then((res) => {
        setSelectedIssue(res.issue);
        setIssueLoading(false);
      })
      .catch((err: any) => {
        setIssueLoading(false);
        setIssueError(err?.message || 'Could not load issue details.');
        showToast(err?.message || 'Could not load issue details.');
      });
  }, [showToast]);

  // 'Report an Issue Here' — open the report flow with the map center prefilled
  const navigate = useNavigate();
  const handleReportHere = useCallback(() => {
    const center = mapViewport;
    const params = new URLSearchParams();
    params.set('lat', center.latitude.toFixed(6));
    params.set('lng', center.longitude.toFixed(6));
    if (selectedIssue?.title) params.set('title', selectedIssue.title);
    navigate(`/resident/report?${params.toString()}`);
  }, [mapViewport, selectedIssue, navigate]);

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
          totalClustersCount={totalClusterCount}
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
            clusters={visibleMapClusters}
            issues={visibleMapIssues}
            selectedIssueId={selectedCluster?.id}
            onSelectCluster={(cluster) => {
              const item = toMapClusterItem(cluster);
              if (item) {
                setSelectedCluster(item);
                setIsDrawerOpen(true);
                setMapViewport((prev) => ({
                  ...prev,
                  latitude: cluster.latitude,
                  longitude: cluster.longitude,
                  zoom: Math.max(prev.zoom, 13.5),
                }));
              }
            }}
            onSelectIssue={handleSelectIssue}
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

          {/* Report an Issue Here (contextual to the current map center) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={handleReportHere}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold shadow-xl border border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>Report an Issue Here</span>
            </button>
          </div>

          {/* Selected issue detail (backend-driven) */}
          {(selectedIssue || issueLoading || issueError) && (
            <div className="absolute top-4 right-4 z-20 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-4 shadow-xl text-left animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
                  Civic Issue
                </span>
                <button
                  onClick={() => {
                    setSelectedIssue(null);
                    setIssueError(null);
                  }}
                  className="p-1 rounded-md text-[#9CA3AF] hover:text-[#334155] hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {issueLoading ? (
                <div className="py-6 flex flex-col items-center gap-2 text-xs text-[#6B7280]">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  Loading issue details...
                </div>
              ) : issueError ? (
                <div className="py-4 flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{issueError}</span>
                </div>
              ) : selectedIssue ? (
                <>
                  <h4 className="text-sm font-bold text-[#0F172A] leading-snug">{selectedIssue.title}</h4>
                  <div className="mt-2 space-y-1.5 text-xs text-[#475569]">
                    <div className="flex justify-between gap-2">
                      <span className="text-[#64748B]">Report</span>
                      <span className="font-mono font-semibold text-[#0F172A]">{selectedIssue.reportNumber}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-[#64748B]">Category</span>
                      <span className="font-semibold capitalize">{(selectedIssue.category || '').replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-[#64748B]">Status</span>
                      <span className="font-semibold text-blue-700">{selectedIssue.status}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-[#64748B]">Priority</span>
                      <span className="font-semibold capitalize">{selectedIssue.priority}</span>
                    </div>
                    {selectedIssue.confidence != null && (
                      <div className="flex justify-between gap-2">
                        <span className="text-[#64748B]">AI Confidence</span>
                        <span className="font-semibold">{Math.round(selectedIssue.confidence * 100)}%</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-2">
                      <span className="text-[#64748B]">Location</span>
                      <span className="font-semibold truncate">{selectedIssue.ward || 'Not specified'}</span>
                    </div>
                    {selectedIssue.createdAt && (
                      <div className="flex justify-between gap-2">
                        <span className="text-[#64748B]">Reported</span>
                        <span className="font-semibold">{timeAgo(selectedIssue.createdAt)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#E2E8F0]">
                    <a
                      href={`/resident/reports/${selectedIssue.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
                    >
                      View Full Issue <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </>
              ) : null}
            </div>
          )}

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
