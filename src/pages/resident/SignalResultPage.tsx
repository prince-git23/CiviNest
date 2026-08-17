import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  MapPin,
  Layers,
  Gauge,
  BrainCircuit,
  RefreshCw,
} from 'lucide-react';
import { getSignalById, CivicSignalData } from '../../services/api';

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

function formatCategory(category: string): string {
  if (!category || category === 'UNCLASSIFIED') return 'Unclassified';
  return category
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const SignalResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [signal, setSignal] = useState<CivicSignalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { signal } = await getSignalById(id);
      setSignal(signal);
    } catch (err: any) {
      setError(err?.message || 'Unable to load the signal result.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (signal && cardRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(cardRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
      }, cardRef);
      return () => ctx.revert();
    }
  }, [signal]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-4 text-sm text-[#6B7280]">Loading signal analysis...</p>
      </div>
    );
  }

  if (error || !signal) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
          <p className="mt-3 text-sm font-semibold text-red-700">{error || 'Signal not found.'}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1E36] text-white text-sm font-semibold hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
            <Link
              to="/resident/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const aiUnavailable = signal.aiAnalysisStatus === 'UNAVAILABLE';
  const confidencePct = signal.aiConfidence !== null ? Math.round(signal.aiConfidence * 100) : null;
  const severity = SEVERITY_STYLES[signal.severity] || SEVERITY_STYLES.UNKNOWN;
  const levelStyle = LEVEL_STYLES[signal.priority?.level || 'LOW'] || LEVEL_STYLES.LOW;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/resident/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4B5563] hover:text-[#0F1E36] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <span className="text-xs font-semibold text-[#6B7280]">Step 2 of 2</span>
      </div>

      {/* Result header */}
      <div ref={cardRef}>
        <div className="space-y-1 mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">AI Signal Analysis</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight font-sans">
            {signal.clusterId ? 'Merged into Active Cluster' : 'Civic Issue Created'}
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {signal.signalNumber} · {new Date(signal.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Cluster banner */}
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 mb-5 ${
            signal.clusterId
              ? 'bg-blue-50 border-blue-200'
              : 'bg-emerald-50 border-emerald-200'
          }`}
        >
          {signal.clusterId ? (
            <Layers className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          ) : (
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-bold text-[#0F1E36]">
              {signal.clusterId ? 'Matched an existing issue cluster' : 'New civic issue registered'}
            </p>
            <p className="text-xs text-[#4B5563] mt-0.5">
              {signal.clusterId
                ? 'Your report was attached to a nearby active cluster so the municipality can respond to the whole area at once.'
                : 'Your signal was processed and registered as a new civic issue.'}
            </p>
          </div>
        </div>

        {/* AI unavailable warning */}
        {aiUnavailable && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">AI analysis unavailable — awaiting verification</p>
              <p className="text-xs text-amber-700 mt-0.5">
                The classification service could not be reached. Your signal is stored safely and will be reviewed manually. No confidence value has been assigned.
              </p>
            </div>
          </div>
        )}

        {/* AI interpretation card */}
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0F1E36] flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-[#0F1E36]">CiviNest's interpretation</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="rounded-2xl border border-[#E5E7EB] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Category</p>
              <p className="text-sm font-bold text-[#111827]">
                {formatCategory(signal.category)}
                {signal.subcategory && signal.subcategory !== signal.category ? (
                  <span className="block text-xs font-medium text-[#6B7280] mt-0.5">{signal.subcategory}</span>
                ) : null}
              </p>
            </div>

            {/* Severity */}
            <div className="rounded-2xl border border-[#E5E7EB] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Severity</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${severity.classes}`}>
                {severity.label}
              </span>
            </div>

            {/* Confidence */}
            <div className="rounded-2xl border border-[#E5E7EB] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">AI Confidence</p>
              {confidencePct !== null ? (
                <>
                  <p className="text-2xl font-extrabold text-[#0F1E36]">{confidencePct}%</p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    {signal.confidenceSource === 'MODEL' ? 'Model confidence' : 'Estimated from classification signals'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#9CA3AF]">Not available</p>
              )}
            </div>

            {/* Location */}
            <div className="rounded-2xl border border-[#E5E7EB] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Location</p>
              <p className="text-sm font-bold text-[#111827]">
                {signal.location?.ward || 'Ward not specified'}
              </p>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {signal.location?.city || 'City not specified'}
                {signal.location ? ` · ${signal.location.latitude.toFixed(4)}, ${signal.location.longitude.toFixed(4)}` : ''}
              </p>
            </div>
          </div>

          {/* Reasoning */}
          {signal.reasoning && !aiUnavailable && (
            <div className="rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Why</p>
              <p className="text-sm text-[#374151]">{signal.reasoning}</p>
            </div>
          )}

          {/* PII status */}
          <div className="flex items-center gap-2 text-xs">
            {signal.piiRedacted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-emerald-700">
                  PII redacted before storage
                  {signal.piiDetected.length > 0 ? ` (${signal.piiDetected.join(', ')})` : ''}
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

        {/* Priority card */}
        {signal.priority && (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs mt-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0F1E36] flex items-center justify-center">
                <Gauge className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-[#0F1E36]">Priority</h3>
              <span className="ml-auto text-[11px] text-[#6B7280]">Engine v{signal.priority.engineVersion}</span>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-4xl font-extrabold text-[#0F1E36]">{signal.priority.score}</p>
              <span className="text-sm text-[#6B7280]">/ 100</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${levelStyle}`}>
                {signal.priority.level}
              </span>
              {signal.priority.safetyOverride && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                  <AlertTriangle className="w-3.5 h-3.5" /> Safety floor applied
                </span>
              )}
            </div>

            {/* Priority factors */}
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Why this priority?</p>
              <div className="space-y-2">
                {signal.priority.factors.map((f) => (
                  <div key={f.name} className="flex items-center gap-3">
                    <span className="w-36 text-xs font-medium text-[#374151] truncate">{f.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${Math.min(f.contribution, 100)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-[#111827]">{f.contribution}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
          {signal.issueId ? (
            <Link
              to={`/resident/reports/${signal.issueId}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0F1E36] text-white text-sm font-bold hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              View Civic Issue <ArrowRight className="w-4 h-4" />
            </Link>
          ) : null}
          <Link
            to="/resident/explore"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors"
          >
            <MapPin className="w-4 h-4" /> View on Map
          </Link>
          <Link
            to="/resident/reports"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors"
          >
            My Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignalResultPage;
