import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  ArrowLeft,
  MapPin,
  LocateFixed,
  Loader2,
  Sparkles,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { submitSignal } from '../../services/api';

interface SignalLocation {
  latitude: number;
  longitude: number;
  address?: string;
  ward?: string;
  city?: string;
}

const PROCESSING_STAGES = [
  'Receiving signal',
  'Redacting PII',
  'Classifying issue',
  'Assessing severity',
  'Calculating priority',
  'Checking nearby clusters',
  'Generating result',
];

type ProcessingState = 'idle' | 'locating' | 'processing' | 'error' | 'done';

export const SignalIntakePage: React.FC = () => {
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [location, setLocation] = useState<SignalLocation | null>(null);
  const [locationLabel, setLocationLabel] = useState('Green Valley Residency, Dharampeth, Nagpur');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [state, setState] = useState<ProcessingState>('idle');
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
      gsap.fromTo(
        composerRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: 'power3.out' }
      );
      if (locationRef.current) {
        gsap.fromTo(
          locationRef.current,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const useMyLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by this browser. You can still select a location manually.');
      return;
    }
    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          city: 'Nagpur',
        });
        setLocationLabel(
          `Current location · ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
        );
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission was denied. You can still proceed without a precise location.');
        } else if (err.code === err.TIMEOUT) {
          setLocationError('Location request timed out. Try again or proceed without a precise location.');
        } else {
          setLocationError('Unable to determine your location. You can still proceed without a precise location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || state === 'processing') return;

    setState('processing');
    setStageIndex(0);
    setError(null);

    // Animate through processing stages
    for (let i = 0; i < PROCESSING_STAGES.length; i++) {
      setStageIndex(i);
      await new Promise((r) => setTimeout(r, 550));
    }

    try {
      const result = await submitSignal({
        rawText: text.trim(),
        location: location || undefined,
      });
      setState('done');
      navigate(`/resident/signal-intake/result/${result.signal._id}`, { replace: true });
    } catch (err: any) {
      setState('error');
      setError(err?.message || 'Failed to process your signal. Please try again.');
    }
  };

  const canSubmit = text.trim().length >= 5 && state !== 'processing';

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
        <span className="text-xs font-semibold text-[#6B7280]">Step 1 of 2</span>
      </div>

      <div className="space-y-1 mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Citizen Signal Intake</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F1E36] tracking-tight font-sans">
          What's happening?
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Tell us what you noticed. CiviNest will organize the details, detect duplicates, and route it to the right team.
        </p>
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit}>
        <div
          ref={composerRef}
          className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5"
        >
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
              disabled={state === 'processing'}
              className="w-full rounded-2xl border border-[#E5E7EB] bg-[#FBFBFA] p-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all resize-none"
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-[#9CA3AF]">{text.length}/1000 characters</span>
              <span className="text-[11px] text-[#9CA3AF]">Optional voice input coming soon</span>
            </div>
          </div>

          <div className="border-t border-[#F1F5F9]" />

          {/* Location */}
          <div ref={locationRef}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[#111827]">Location</label>
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating || state === 'processing'}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                {locating ? 'Locating...' : 'Use My Location'}
              </button>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FBFBFA] p-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111827] truncate">{locationLabel}</p>
                <p className="text-xs text-[#6B7280]">Approximate location{location ? ' · ' + location.latitude.toFixed(5) + ', ' + location.longitude.toFixed(5) : ''}</p>
              </div>
            </div>

            {locationError && (
              <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{locationError}</span>
              </div>
            )}
          </div>

          {/* Error state */}
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl text-base font-bold shadow-md transition-all duration-200 cursor-pointer ${
              !canSubmit
                ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed shadow-none'
                : 'bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white hover:shadow-lg'
            }`}
          >
            {state === 'processing' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span>{PROCESSING_STAGES[stageIndex]}...</span>
              </>
            ) : (
              <>
                <span>Analyze & Submit Signal</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-[11px] text-[#6B7280] text-center flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Your identity is protected. Personal information is redacted before processing.</span>
          </p>
        </div>
      </form>

      {/* Processing overlay */}
      {state === 'processing' && (
        <div className="mt-6 bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-xs">
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
    </div>
  );
};

export default SignalIntakePage;
