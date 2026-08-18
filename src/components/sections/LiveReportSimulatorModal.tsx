import React, { useState } from 'react';
import { X, Send, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, LocateFixed, Loader2, MapPin } from 'lucide-react';
import { CiviNestLogo } from '../common/CiviNestLogo';
import { MapSearch } from '../map/MapSearch';
import { CivicMap } from '../map/CivicMap';
import { reverseGeocode } from '../../services/geo/geocodingService';
import type { MapViewport, GeoPoint } from '../../services/geo/geoTypes';

interface LiveReportSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignalAdded?: (text: string) => void;
}

interface CapturedLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  city?: string;
  ward?: string;
}

export const LiveReportSimulatorModal: React.FC<LiveReportSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSignalAdded,
}) => {
  const [reportText, setReportText] = useState('');
  const [location, setLocation] = useState<CapturedLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    status: string;
    cluster: string;
    confidence: number;
    priority: number;
    piiCleaned: boolean;
  } | null>(null);

  // Map state (Nagpur default until a real location is captured)
  const [mapViewport, setMapViewport] = useState<MapViewport>({
    latitude: 21.1458,
    longitude: 79.0882,
    zoom: 13,
  });
  const [pinLocation, setPinLocation] = useState<GeoPoint | null>(null);

  if (!isOpen) return null;

  const captureLocation = (point: GeoPoint, accuracy?: number, keepAddress = false) => {
    setPinLocation(point);
    setMapViewport((prev) => ({ ...prev, latitude: point.latitude, longitude: point.longitude, zoom: 15 }));
    setLocation((prev) => ({
      latitude: point.latitude,
      longitude: point.longitude,
      accuracy,
      address: keepAddress ? prev?.address : undefined,
      city: keepAddress ? prev?.city : undefined,
      ward: keepAddress ? prev?.ward : undefined,
    }));
    // Reverse geocode for a real address (best effort)
    setResolving(true);
    setLocationError(null);
    reverseGeocode(point)
      .then((result) => {
        if (result) {
          setLocation((prev) => ({
            latitude: point.latitude,
            longitude: point.longitude,
            accuracy: prev?.accuracy,
            address: result.address,
            city: result.city,
            ward: result.ward,
          }));
        }
      })
      .catch(() => {
        /* keep coordinates-only location */
      })
      .finally(() => setResolving(false));
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by this browser. You can search for the location instead.');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        captureLocation(
          { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          pos.coords.accuracy
        );
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location access was denied. You can search for the issue location manually.');
        } else if (err.code === err.TIMEOUT) {
          setLocationError('Location request timed out. Try again or search for the location.');
        } else {
          setLocationError('Unable to determine your location. You can search for the location manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleMapClick = (point: GeoPoint) => {
    captureLocation(point);
  };

  const handleSearchSelect = (point: GeoPoint, name: string) => {
    captureLocation(point, undefined, true);
    setLocation((prev) => ({
      latitude: point.latitude,
      longitude: point.longitude,
      accuracy: prev?.accuracy,
      address: name || prev?.address,
      city: prev?.city,
      ward: prev?.ward,
    }));
  };

  const handleSimulateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim() || !location) return;

    setIsProcessing(true);
    setSimulationResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      setSimulationResult({
        status: 'Merged into Active Cluster',
        cluster: 'Infrastructure Hazard #8842',
        confidence: 93,
        priority: 89,
        piiCleaned: true,
      });
      if (onSignalAdded) {
        onSignalAdded(reportText);
      }
    }, 1200);
  };

  const sampleReports = [
    'Streetlight on corner of 4th and Elm is broken, pitch black at night.',
    'Deep pothole right after the bus stop on Oak Avenue, almost hit my wheel.',
    'Fire hydrant valve dripping dirty water onto the sidewalk for 2 days.',
  ];

  const locationLabel = location
    ? location.address || `Captured location`
    : 'No location captured yet';

  const locationDetail = location
    ? [
        location.city ? `${location.city}` : '',
        location.ward ? `Ward: ${location.ward}` : '',
        location.accuracy != null ? `±${Math.round(location.accuracy)}m` : '',
        `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 border border-gray-200 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <CiviNestLogo size={32} />
        </div>

        {/* Resident signal intake only — municipal access stays in the
            authenticated municipal portal, never inside a resident-facing flow. */}
        <div>
            <p className="text-xs text-gray-500 mb-4 font-normal">
              Test how CiviNest takes unstructured citizen input, automatically redacts PII, and clusters it into verified municipal intelligence.
            </p>

            <form onSubmit={handleSimulateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-600 mb-1.5 uppercase">
                  Describe Civic Issue / Hazard
                </label>
                <textarea
                  rows={3}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="e.g. Streetlight out for 3 days on Elm Street, very dark for evening walkers..."
                  className="w-full text-sm p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0F1E36] font-sans"
                />
              </div>

              {/* Sample Prompts */}
              <div>
                <span className="text-[11px] text-gray-500 block mb-1.5">Or try a sample signal:</span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleReports.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReportText(s)}
                      className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-md text-left truncate max-w-full"
                    >
                      {s.slice(0, 38)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Real location capture (no fake ward dropdown) */}
              <div>
                <label className="block text-xs font-mono text-gray-600 mb-1.5 uppercase">
                  Where is the issue?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating || resolving}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#0F1E36] hover:bg-slate-800 text-white text-xs font-medium transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                    {locating ? 'Getting location...' : 'Use My Current Location'}
                  </button>
                  <div className="flex items-center gap-2 bg-[#F9FAFB] border border-gray-300 rounded-lg px-2.5">
                    <MapSearch onSelectLocation={handleSearchSelect} placeholder="Search street, landmark..." />
                  </div>
                </div>

                {/* Real map preview */}
                <div className="mt-2.5 rounded-xl overflow-hidden border border-gray-200">
                  <CivicMap
                    viewport={mapViewport}
                    onViewportChange={setMapViewport}
                    onMapClick={handleMapClick}
                    userLocation={pinLocation || undefined}
                    showUserLocation={Boolean(pinLocation)}
                    className="w-full"
                    style={{ height: 180 }}
                    compact={true}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Click the map to drop the pin, use your current location, or search for a place.
                </p>

                {location && (
                  <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 animate-in fade-in duration-200">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-blue-900 truncate">{locationLabel}</p>
                      <p className="text-[10px] text-blue-800 font-mono truncate">
                        {resolving ? 'Resolving address...' : locationDetail}
                      </p>
                    </div>
                  </div>
                )}

                {locationError && (
                  <div className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{locationError}</span>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isProcessing || !reportText.trim() || !location}
                  className="w-full bg-[#0F1E36] hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Ingest Signal</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Simulation Result Box */}
            {simulationResult && (
              <div className="mt-5 p-4 rounded-xl bg-blue-50/70 border border-blue-200 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{simulationResult.status}</span>
                  </span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                    Confidence: {simulationResult.confidence}%
                  </span>
                </div>
                <p className="text-xs text-blue-950 font-medium">
                  {simulationResult.cluster} ({location?.address || location ? `${location?.latitude.toFixed(4)}, ${location?.longitude.toFixed(4)}` : ''})
                </p>
                <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-800 font-mono">
                  <span>✓ PII Cryptographically Redacted</span>
                  <span className="text-red-700 font-semibold">Priority {simulationResult.priority}/100</span>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default LiveReportSimulatorModal;
