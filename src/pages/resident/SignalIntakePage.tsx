import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  LocateFixed,
  Loader2,
  Sparkles,
  Shield,
  AlertCircle,
  CheckCircle2,
  Radio,
  Search,
  Navigation,
  BrainCircuit,
  AlertTriangle,
  ExternalLink,
  X,
} from 'lucide-react';
import { submitSignal, analyzeSignal, NearbyIssueItem, SignalAnalysisPreview } from '../../services/api';
import { CivicMap } from '../../components/map/CivicMap';
import { MapSearch } from '../../components/map/MapSearch';
import { reverseGeocode } from '../../services/geo/geocodingService';
import type { MapViewport, GeoPoint } from '../../services/geo/geoTypes';

interface SignalLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  ward?: string;
  city?: string;
}

type IntakeStep = 1 | 2 | 3;

const STEPS: { id: IntakeStep; label: string }[] = [
  { id: 1, label: 'Describe' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Review' },
];

const PROCESSING_STAGES = [
  'Receiving signal',
  'Redacting PII',
  'Classifying issue',
  'Assessing severity',
  'Calculating priority',
  'Checking nearby clusters',
  'Generating result',
];

type ProcessingState = 'idle' | 'locating' | 'analyzing' | 'submitting' | 'error' | 'done';

const SEVERITY_STYLES: Record<string, { label: string; classes: string }> = {
  CRITICAL: { label: 'Critical', classes: 'bg-red-100 text-red-700 border-red-200' },
  HIGH: { label: 'High', classes: 'bg-orange-100 text-orange-700 border-orange-200' },
  MEDIUM: { label: 'Medium', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  LOW: { label: 'Low', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  UNKNOWN: { label: 'Unknown', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const LEVEL_STYLES: Record<string, string> = {
  CRITICAL: 'text-red-700 bg-red-50 border-red-200',
  HIGH: 'text-orange-700 bg-orange-50 border-orange-200',
  MEDIUM: 'text-amber-700 bg-amber-50 border-amber-200',
  LOW: 'text-emerald-700 bg-emerald-50 border-emerald-200',
};

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

function formatCategory(category: string): string {
  if (!category || category === 'UNCLASSIFIED') return 'Unclassified';
  return category
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const SignalIntakePage: React.FC = () => {
  const navigate = useNavigate();

  // ── Step state ──
  const [currentStep, setCurrentStep] = useState<IntakeStep>(1);

  // ── Form state ──
  const [text, setText] = useState('');
  const [location, setLocation] = useState<SignalLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  // ── AI review state ──
  const [state, setState] = useState<ProcessingState>('idle');
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SignalAnalysisPreview | null>(null);
  const [nearby, setNearby] = useState<NearbyIssueItem[]>([]);
  const [confirmedLocation, setConfirmedLocation] = useState<SignalLocation | null>(null);

  // ── Map state ──
  const [mapViewport, setMapViewport] = useState<MapViewport>({
    latitude: 21.1458,
    longitude: 79.0882,
    zoom: 13,
  });
  const [pinLocation, setPinLocation] = useState<GeoPoint | null>(null);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (stepRef.current) {
      gsap.fromTo(
        stepRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [currentStep]);

  // ── Reverse geocode the pin whenever it moves ──
  const applyReverseGeocode = useCallback(async (point: GeoPoint) => {
    setReverseGeocoding(true);
    try {
      const result = await reverseGeocode(point);
      if (result) {
        setLocationAddress(result.address);
        setLocation((prev) => ({
          latitude: point.latitude,
          longitude: point.longitude,
          accuracy: prev?.accuracy,
          address: result.address,
          ward: result.ward || prev?.ward,
          city: result.city || prev?.city,
        }));
      } else {
        setLocationAddress(null);
        setLocation((prev) => ({
          latitude: point.latitude,
          longitude: point.longitude,
          accuracy: prev?.accuracy,
          address: prev?.address,
          ward: prev?.ward,
          city: prev?.city,
        }));
      }
    } finally {
      setReverseGeocoding(false);
    }
  }, []);

  // ── Real geolocation (explicit user action only) ──
  const useMyLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by this browser. You can search for the issue location instead.');
      return;
    }
    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setLocating(false);
        setPinLocation(point);
        setMapViewport((prev) => ({ ...prev, latitude: point.latitude, longitude: point.longitude, zoom: 15 }));
        setLocation((prev) => ({
          latitude: point.latitude,
          longitude: point.longitude,
          accuracy: pos.coords.accuracy,
          address: prev?.address,
          ward: prev?.ward,
          city: prev?.city,
        }));
        void applyReverseGeocode(point);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location access was denied. You can search for the issue location manually.');
        } else if (err.code === err.TIMEOUT) {
          setLocationError('Location request timed out. Try again or search for the location manually.');
        } else {
          setLocationError('Unable to determine your location. You can search for the issue location manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [applyReverseGeocode]);

  // ── Map click → set pin ──
  const handleMapClick = useCallback(
    (point: GeoPoint) => {
      setPinLocation(point);
      setMapViewport((prev) => ({ ...prev, latitude: point.latitude, longitude: point.longitude }));
      void applyReverseGeocode(point);
    },
    [applyReverseGeocode]
  );

  // ── Search location → move map + pin ──
  const handleSearchSelect = useCallback(
    (point: GeoPoint, name: string) => {
      setPinLocation(point);
      setMapViewport((prev) => ({ ...prev, latitude: point.latitude, longitude: point.longitude, zoom: 15 }));
      setLocationAddress(name);
      void applyReverseGeocode(point);
    },
    [applyReverseGeocode]
  );

  // ── Confirm location (Step 2 → Step 3) ──
  const handleConfirmLocation = useCallback(async () => {
    if (!location) return;
    setConfirmedLocation(location);
    setState('analyzing');
    setError(null);
    setAnalysis(null);
    setNearby([]);
    setCurrentStep(3);
    try {
      const res = await analyzeSignal({
        rawText: text.trim(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          ward: location.ward,
          city: location.city,
        },
      });
      setAnalysis(res.analysis);
      setNearby(res.nearby || []);
      setState('idle');
    } catch (err: any) {
      setState('error');
      setError(err?.message || 'AI analysis is unavailable right now. You can still continue to submit.');
    }
  }, [location, text]);

  // ── Submit the confirmed signal ──
  const handleSubmit = async () => {
    if (!confirmedLocation || state === 'submitting') return;
    setState('submitting');
    setStageIndex(0);
    setError(null);

    for (let i = 0; i < PROCESSING_STAGES.length; i++) {
      setStageIndex(i);
      await new Promise((r) => setTimeout(r, 350));
    }

    try {
      const result = await submitSignal({
        rawText: text.trim(),
        location: {
          latitude: confirmedLocation.latitude,
          longitude: confirmedLocation.longitude,
          address: confirmedLocation.address,
          ward: confirmedLocation.ward,
          city: confirmedLocation.city,
        },
      });
      setState('done');
      navigate(`/resident/signal-intake/result/${result.signal._id}`, { replace: true });
    } catch (err: any) {
      setState('error');
      setError(err?.message || 'Failed to process your signal. Please try again.');
    }
  };

  const canContinue = text.trim().length >= 5;
  const canConfirmLocation = Boolean(location);
  const aiUnavailable = analysis?.aiAnalysisStatus === 'UNAVAILABLE';
  const confidencePct = analysis?.confidence != null ? Math.round(analysis.confidence * 100) : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between mb-6">
        <Link
          to="/resident/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4B5563] hover:text-[#0F1E36] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all ${
                  currentStep === s.id
                    ? 'bg-[#0F1E36] text-white border-[#0F1E36]'
                    : currentStep > s.id
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-[#9CA3AF] border-[#D1D5DB]'
                }`}
              >
                {currentStep > s.id ? '✓' : s.id}
              </span>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  currentStep === s.id ? 'text-[#0F1E36]' : currentStep > s.id ? 'text-emerald-600' : 'text-[#9CA3AF]'
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-0.5 rounded-full ${currentStep > s.id ? 'bg-emerald-400' : 'bg-[#E5E7EB]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div ref={stepRef}>
        {/* ══════ STEP 1: Describe ══════ */}
        {currentStep === 1 && (
          <div>
            <div className="space-y-1 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Citizen Signal Intake</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F1E36] tracking-tight font-sans">
                What's happening?
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Tell us what you noticed. CiviNest will organize the details, detect duplicates, and route it to the right team.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <label htmlFor="signal-text" className="block text-sm font-semibold text-[#111827] mb-2">
                  Describe the issue
                </label>
                <textarea
                  id="signal-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe the issue clearly... e.g. Streetlights near the school have not been working for the last three nights."
                  rows={5}
                  maxLength={1000}
                  className="w-full rounded-2xl border border-[#E5E7EB] bg-[#FBFBFA] p-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all resize-none"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-[#9CA3AF]">{text.length}/1000 characters</span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!canContinue}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer ${
                    canContinue
                      ? 'bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white hover:shadow-md'
                      : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  }`}
                >
                  <span>Continue to Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════ STEP 2: Capture Location ══════ */}
        {currentStep === 2 && (
          <div>
            <div className="space-y-1 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Step 2 of 3</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F1E36] tracking-tight font-sans">
                Where is the issue?
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Use your current location or search for the exact spot. The ward is derived from the geographic location where possible.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
              {/* Location actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating || reverseGeocoding}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#0F1E36] hover:bg-[#1E293B] text-white text-sm font-bold shadow-xs transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                  {locating ? 'Getting your current location...' : 'Use My Current Location'}
                </button>
                <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3">
                  <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                  <div className="flex-1">
                    <MapSearch
                      onSelectLocation={handleSearchSelect}
                      placeholder="Search street, landmark, area..."
                    />
                  </div>
                </div>
              </div>

              {/* Real map with pin */}
              <div className="rounded-2xl overflow-hidden border border-[#E5E7EB]">
                <CivicMap
                  viewport={mapViewport}
                  onViewportChange={setMapViewport}
                  onMapClick={handleMapClick}
                  userLocation={pinLocation || undefined}
                  showUserLocation={Boolean(pinLocation)}
                  className="w-full"
                  style={{ height: 260 }}
                  compact={true}
                />
              </div>
              <p className="text-[11px] text-[#6B7280] -mt-2 flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-blue-600" />
                Click the map to drop the pin, or use your current location / search.
              </p>

              {/* Location summary */}
              {location && (
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111827]">
                        {location.address || 'Location detected'}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {reverseGeocoding ? (
                          <span className="inline-flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Resolving address...
                          </span>
                        ) : (
                          <>
                            {location.city ? `${location.city} · ` : ''}
                            {location.ward ? `Ward: ${location.ward} · ` : ''}
                            {location.accuracy != null ? `Accuracy: ±${Math.round(location.accuracy)}m · ` : ''}
                            {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                          </>
                        )}
                      </p>
                      {!location.ward && (
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                          Ward not available — no municipal boundary data for this point yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {locationError && (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{locationError}</span>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#4B5563] hover:text-[#0F1E36] hover:bg-black/5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  disabled={!canConfirmLocation || state === 'analyzing'}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer ${
                    canConfirmLocation && state !== 'analyzing'
                      ? 'bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white hover:shadow-md'
                      : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  }`}
                >
                  {state === 'analyzing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <span>Confirm Location & Analyze</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════ STEP 3: AI Review & Confirm ══════ */}
        {currentStep === 3 && (
          <div>
            <div className="space-y-1 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Step 3 of 3</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F1E36] tracking-tight font-sans">
                Review before you submit
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                This is how CiviNest interprets your signal. Confirm the details below.
              </p>
            </div>

            {/* AI analysis state */}
            {state === 'analyzing' && (
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0F1E36] flex items-center justify-center">
                    <Radio className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F1E36]">Analyzing civic signal</h3>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    AI PIPELINE
                  </span>
                </div>
                <div className="space-y-2.5">
                  {PROCESSING_STAGES.map((stage, i) => {
                    const isCurrent = i === stageIndex;
                    const isDone = i < stageIndex;
                    return (
                      <div
                        key={stage}
                        className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                          isDone ? 'text-emerald-600' : isCurrent ? 'text-[#0F1E36] font-semibold' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 shrink-0 animate-spin text-blue-600" />
                        ) : (
                          <span className="w-4 h-4 shrink-0 rounded-full border border-[#E5E7EB]" />
                        )}
                        <span>{stage}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {state === 'error' && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* AI interpretation */}
            {analysis && (
              <div className="space-y-4">
                {/* AI unavailable warning */}
                {aiUnavailable && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-800">AI analysis unavailable — awaiting verification</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        The classification service could not be reached. Your signal will be stored safely and reviewed manually. No confidence value has been assigned.
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0F1E36] flex items-center justify-center">
                      <BrainCircuit className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-base font-bold text-[#0F1E36]">CiviNest's interpretation</h3>
                    {confidencePct != null && (
                      <span className="ml-auto text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        {confidencePct}% AI Confidence
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-[#E5E7EB] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Category</p>
                      <p className="text-sm font-bold text-[#111827]">
                        {formatCategory(analysis.category)}
                        {analysis.subcategory && analysis.subcategory !== analysis.category ? (
                          <span className="block text-xs font-medium text-[#6B7280] mt-0.5">{analysis.subcategory}</span>
                        ) : null}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#E5E7EB] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Severity</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          (SEVERITY_STYLES[analysis.severity] || SEVERITY_STYLES.UNKNOWN).classes
                        }`}
                      >
                        {(SEVERITY_STYLES[analysis.severity] || SEVERITY_STYLES.UNKNOWN).label}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-[#E5E7EB] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Priority</p>
                      {analysis.priority ? (
                        <>
                          <p className="text-lg font-extrabold text-[#0F1E36]">{analysis.priority.score}/100</p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border mt-1 ${
                              LEVEL_STYLES[analysis.priority.level] || LEVEL_STYLES.LOW
                            }`}
                          >
                            {analysis.priority.level}
                          </span>
                        </>
                      ) : (
                        <p className="text-sm text-[#9CA3AF]">Not available</p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-[#E5E7EB] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Affected Service</p>
                      <p className="text-sm font-bold text-[#111827] capitalize">{analysis.affectedService}</p>
                      {analysis.keywords?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {analysis.keywords.slice(0, 4).map((k) => (
                            <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {analysis.reasoning && !aiUnavailable && (
                    <div className="rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Why</p>
                      <p className="text-sm text-[#374151]">{analysis.reasoning}</p>
                    </div>
                  )}

                  {/* Location */}
                  <div className="rounded-2xl border border-[#E5E7EB] p-4 flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#111827]">
                        {confirmedLocation?.address || locationAddress || 'Location detected'}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {confirmedLocation?.ward ? `Ward: ${confirmedLocation.ward} · ` : 'Ward: Not available · '}
                        {confirmedLocation ? `${confirmedLocation.latitude.toFixed(4)}, ${confirmedLocation.longitude.toFixed(4)}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* PII note */}
                  <div className="flex items-center gap-2 text-xs">
                    {analysis.piiRedacted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-emerald-700">
                          PII redacted before storage
                          {analysis.piiDetected.length > 0 ? ` (${analysis.piiDetected.join(', ')})` : ''}
                        </span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-[#6B7280]" />
                        <span className="text-[#6B7280]">No personal information detected in your signal.</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Nearby existing issues */}
                {nearby.length > 0 && (
                  <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-sm font-bold text-[#0F1E36]">Possible existing issues nearby</h3>
                    </div>
                    <div className="space-y-2.5">
                      {nearby.slice(0, 3).map((issue) => (
                        <div key={issue.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#111827] truncate">{issue.title}</p>
                              <p className="text-xs text-[#6B7280] mt-0.5">
                                {issue.distanceMeters != null ? `${Math.round(issue.distanceMeters)}m away · ` : ''}
                                {timeAgo(issue.createdAt)} · {issue.status}
                              </p>
                            </div>
                            <Link
                              to={`/resident/reports/${issue.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 shrink-0 transition-colors"
                            >
                              View Issue <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-3">
                      Your signal will NOT be merged automatically — you decide whether to report a new issue.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={state === 'submitting'}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#4B5563] hover:text-[#0F1E36] hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Adjust Location
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={state === 'submitting'}
                    className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer ${
                      state === 'submitting'
                        ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                        : 'bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white hover:shadow-md'
                    }`}
                  >
                    {state === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{PROCESSING_STAGES[stageIndex]}...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Submit Signal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {!analysis && state !== 'analyzing' && state !== 'error' && (
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 text-center">
                <Sparkles className="w-8 h-8 mx-auto text-[#9CA3AF]" />
                <p className="mt-3 text-sm font-semibold text-[#111827]">No analysis yet</p>
                <p className="text-xs text-[#6B7280] mt-1">Go back and confirm your location to run the analysis.</p>
              </div>
            )}

            <p className="text-[11px] text-[#6B7280] text-center mt-6 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Your identity is protected. Personal information is redacted before processing.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalIntakePage;
