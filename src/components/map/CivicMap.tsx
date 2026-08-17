import React, { useRef, useEffect, useState, useCallback } from 'react';
import type {
  MapViewport,
  MapFilter,
  MapLayer,
  CivicIssue,
  IssueCluster,
  WardBoundary,
  InfrastructurePoint,
  DeploymentPoint,
  GeoPoint,
  IssueCategory,
  IssueStatus,
} from '../../services/geo/geoTypes';
import { CATEGORY_COLORS, PRIORITY_COLORS, DEFAULT_VIEWPORT } from '../../services/geo/geoTypes';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export interface CivicMapProps {
  viewport?: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  issues?: CivicIssue[];
  clusters?: IssueCluster[];
  wards?: WardBoundary[];
  infrastructure?: InfrastructurePoint[];
  deployments?: DeploymentPoint[];
  layers?: MapLayer[];
  filter?: MapFilter;
  selectedIssueId?: string;
  onSelectIssue?: (issue: CivicIssue) => void;
  onSelectCluster?: (cluster: IssueCluster) => void;
  showUserLocation?: boolean;
  userLocation?: GeoPoint;
  impactRadiusPoint?: GeoPoint;
  impactRadiusMeters?: number;
  className?: string;
  style?: React.CSSProperties;
  interactive?: boolean;
  onMapClick?: (point: GeoPoint) => void;
  compact?: boolean;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  viewport = DEFAULT_VIEWPORT,
  onViewportChange,
  issues = [],
  clusters = [],
  wards = [],
  infrastructure = [],
  deployments = [],
  layers = [],
  filter,
  selectedIssueId,
  onSelectIssue,
  onSelectCluster,
  showUserLocation = false,
  userLocation,
  impactRadiusPoint,
  impactRadiusMeters = 200,
  className = '',
  style,
  interactive = true,
  onMapClick,
  compact = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let mounted = true;
    let mapInstance: any = null;
    let loadTimeout: ReturnType<typeof setTimeout> | null = null;

    const initMap = async () => {
      try {
        // Ensure maplibre-gl CSS is loaded
        if (!document.querySelector('link[href*="maplibre-gl"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
          document.head.appendChild(link);
          // Wait for CSS to load
          await new Promise((resolve) => {
            link.onload = resolve;
            link.onerror = resolve;
            setTimeout(resolve, 1000);
          });
        }

        const maplibregl = await import('maplibre-gl');

        if (!mounted || !mapContainer.current) return;

        mapInstance = new maplibregl.Map({
          container: mapContainer.current,
          style: MAP_STYLE,
          center: [viewport.longitude, viewport.latitude],
          zoom: viewport.zoom,
          pitch: viewport.pitch || 0,
          bearing: viewport.bearing || 0,
          attributionControl: compact ? false : { compact: true },
          interactive,
          maxZoom: 18,
          minZoom: 10,
        });

        if (!compact) {
          mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
        }

        // Fallback: set loaded after timeout if load event doesn't fire
        loadTimeout = setTimeout(() => {
          if (mounted) {
            setMapLoaded(true);
          }
        }, 3000);

        mapInstance.on('load', () => {
          if (loadTimeout) clearTimeout(loadTimeout);
          if (!mounted) return;
          setMapLoaded(true);

          // Add ward boundaries
          mapInstance.addSource('wards', {
            type: 'geojson',
            data: createWardsGeoJSON(wards),
          });

          mapInstance.addLayer({
            id: 'ward-boundaries',
            type: 'line',
            source: 'wards',
            paint: {
              'line-color': '#94A3B8',
              'line-width': 1.5,
              'line-dasharray': [4, 2],
            },
          });

          mapInstance.addLayer({
            id: 'ward-fill',
            type: 'fill',
            source: 'wards',
            paint: {
              'fill-color': '#F1F5F9',
              'fill-opacity': 0.3,
            },
          });

          // Impact radius
          mapInstance.addSource('impact-radius', {
            type: 'geojson',
            data: createEmptyGeoJSON(),
          });

          mapInstance.addLayer({
            id: 'impact-circle',
            type: 'circle',
            source: 'impact-radius',
            paint: {
              'circle-radius': { stops: [[10, 30], [15, 60], [18, 200]] },
              'circle-color': '#3B82F6',
              'circle-opacity': 0.15,
              'circle-stroke-color': '#3B82F6',
              'circle-stroke-width': 2,
              'circle-stroke-opacity': 0.4,
            },
          });
        });

        // Viewport changes
        if (onViewportChange) {
          mapInstance.on('moveend', () => {
            const center = mapInstance.getCenter();
            onViewportChange({
              latitude: center.lat,
              longitude: center.lng,
              zoom: mapInstance.getZoom(),
              pitch: mapInstance.getPitch(),
              bearing: mapInstance.getBearing(),
            });
          });
        }

        // Click handler
        if (onMapClick) {
          mapInstance.on('click', (e: any) => {
            onMapClick({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
          });
        }

        mapRef.current = mapInstance;
      } catch (err) {
        console.error('Failed to load map:', err);
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (loadTimeout) clearTimeout(loadTimeout);
      if (mapInstance) {
        mapInstance.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update viewport
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom,
      pitch: viewport.pitch || 0,
      bearing: viewport.bearing || 0,
      duration: 800,
    });
  }, [viewport.latitude, viewport.longitude, viewport.zoom]);

  // Update wards
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('wards');
    if (source) source.setData(createWardsGeoJSON(wards));
  }, [wards, mapLoaded]);

  // Update impact radius
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('impact-radius');
    if (source && impactRadiusPoint) {
      source.setData(createImpactRadiusGeoJSON(impactRadiusPoint, impactRadiusMeters));
    }
  }, [impactRadiusPoint, impactRadiusMeters, mapLoaded]);

  // Render markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    markersRef.current.forEach((m: any) => m.remove());
    markersRef.current = [];

    // Import maplibregl for markers
    import('maplibre-gl').then((maplibregl) => {
      if (!mapRef.current) return;

      // Issue markers
      issues.forEach((issue) => {
        const el = createIssueMarkerElement(issue, issue.id === selectedIssueId);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([issue.longitude, issue.latitude])
          .addTo(mapRef.current);
        if (onSelectIssue) {
          el.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            onSelectIssue(issue);
          });
        }
        markersRef.current.push(marker);
      });

      // Cluster markers
      clusters.forEach((cluster) => {
        const el = createClusterMarkerElement(cluster);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([cluster.longitude, cluster.latitude])
          .addTo(mapRef.current);
        if (onSelectCluster) {
          el.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            onSelectCluster(cluster);
          });
        }
        markersRef.current.push(marker);
      });

      // Infrastructure
      infrastructure.forEach((inf) => {
        const el = createInfrastructureMarkerElement(inf);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([inf.longitude, inf.latitude])
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      });

      // Deployments
      deployments.forEach((dep) => {
        const el = createDeploymentMarkerElement(dep);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([dep.longitude, dep.latitude])
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      });

      // User location
      if (showUserLocation && userLocation) {
        const el = document.createElement('div');
        el.innerHTML = `<div style="position:relative;width:16px;height:16px;"><div style="position:absolute;inset:0;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div></div>`;
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([userLocation.longitude, userLocation.latitude])
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      }
    });
  }, [issues, clusters, infrastructure, deployments, showUserLocation, userLocation, selectedIssueId, mapLoaded]);

  // Fly to selected
  useEffect(() => {
    if (!mapRef.current || !selectedIssueId) return;
    const issue = issues.find((i) => i.id === selectedIssueId);
    if (issue) {
      mapRef.current.flyTo({ center: [issue.longitude, issue.latitude], zoom: 15, duration: 600 });
    }
  }, [selectedIssueId, issues]);

  return (
    <div className={`relative ${className}`} style={style}>
      <div
        ref={mapContainer}
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ minHeight: compact ? 200 : 400 }}
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F8FAFC] rounded-xl">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#0F1E36] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-[#6B7280]">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Marker Helpers ──

function createIssueMarkerElement(issue: CivicIssue, isSelected: boolean): HTMLElement {
  const el = document.createElement('div');
  el.className = 'civinest-issue-marker';
  el.style.cssText = 'cursor:pointer;transition:transform 0.15s;';
  const color = CATEGORY_COLORS[issue.category] || '#6B7280';
  const size = isSelected ? 18 : 14;

  el.innerHTML = `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid ${isSelected ? '#0F1E36' : 'white'};border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>`;

  const tooltip = document.createElement('div');
  tooltip.style.cssText = 'position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:white;padding:6px 10px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.15);white-space:nowrap;font-size:11px;opacity:0;pointer-events:none;transition:opacity 0.15s;z-index:10;border:1px solid #E5E7EB;';
  tooltip.innerHTML = `<div style="font-weight:700;margin-bottom:2px;">${issue.title}</div><div style="color:#6B7280;font-size:10px;">Priority ${issue.priority} · ${issue.reportCount} reports</div>`;
  el.style.position = 'relative';
  el.appendChild(tooltip);
  el.addEventListener('mouseenter', () => { tooltip.style.opacity = '1'; });
  el.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });
  return el;
}

function createClusterMarkerElement(cluster: IssueCluster): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = 'cursor:pointer;';
  const color = CATEGORY_COLORS[cluster.category] || '#6B7280';
  el.innerHTML = `<div style="position:relative;display:flex;align-items:center;justify-content:center;"><div style="width:40px;height:40px;background:${color}22;border:2px solid ${color};border-radius:50%;display:flex;align-items:center;justify-content:center;"><span style="font-size:11px;font-weight:800;color:${color};">${cluster.issueCount}</span></div></div>`;
  return el;
}

function createInfrastructureMarkerElement(inf: InfrastructurePoint): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = 'cursor:default;';
  const icons: Record<string, string> = { school: '🏫', hospital: '🏥', market: '🏪', park: '🌳', transit: '🚉', government: '🏛️', utility: '⚡' };
  el.innerHTML = `<div style="width:24px;height:24px;background:white;border:1px solid #E5E7EB;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 1px 4px rgba(0,0,0,0.1);">${icons[inf.type] || '📍'}</div>`;
  return el;
}

function createDeploymentMarkerElement(dep: DeploymentPoint): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = 'cursor:default;';
  const statusColor = dep.status === 'active' ? '#10B981' : dep.status === 'en-route' ? '#3B82F6' : '#9CA3AF';
  el.innerHTML = `<div style="width:28px;height:28px;background:white;border:2px solid ${statusColor};border-radius:8px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.15);"><span style="font-size:12px;">👷</span></div>`;
  return el;
}

// ── GeoJSON Helpers ──

function createWardsGeoJSON(wards: WardBoundary[]): any {
  return {
    type: 'FeatureCollection',
    features: wards.map((ward) => ({
      type: 'Feature',
      properties: { id: ward.id, name: ward.name },
      geometry: {
        type: 'Polygon',
        coordinates: [ward.coordinates.map((c) => [c.longitude, c.latitude])],
      },
    })),
  };
}

function createImpactRadiusGeoJSON(point: GeoPoint, radiusMeters: number): any {
  const earthRadius = 6371000;
  const dLat = (radiusMeters / earthRadius) * (180 / Math.PI);
  const dLng = dLat / Math.cos((point.latitude * Math.PI) / 180);
  const steps = 64;
  const coords: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    coords.push([point.longitude + dLng * Math.cos(angle), point.latitude + dLat * Math.sin(angle)]);
  }
  coords.push(coords[0]);
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: { radius: radiusMeters }, geometry: { type: 'Polygon', coordinates: [coords] } }],
  };
}

function createEmptyGeoJSON(): any {
  return { type: 'FeatureCollection', features: [] };
}

export default CivicMap;
