import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Clock,
  Loader2,
  Building,
  RotateCcw,
  Camera,
} from 'lucide-react';
import { getReportById, verifyReport, ReportData } from '../../services/api';
import { CivicMap } from '../../components/map/CivicMap';
import type { MapViewport } from '../../services/geo/geoTypes';
import StillNotFixedModal from '../../components/reports/StillNotFixedModal';

type Verdict = 'unverified' | 'confirming' | 'confirmed' | 'reopening' | 'reopened' | 'error';

export const VerifyResolutionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>('unverified');
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [reopenModalOpen, setReopenModalOpen] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getReportById(id);
      setReport(res.report);
    } catch (err: any) {
      setLoadError(err?.message || 'Unable to load this report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleConfirmFixed = async () => {
    if (!report) return;
    setVerdict('confirming');
    setActionError(null);
    try {
      const res = await verifyReport(report._id, true);
      setReport(res.report);
      setVerdict('confirmed');
    } catch (err: any) {
      setVerdict('error');
      setActionError(err?.message || 'Verification failed. Please try again.');
    }
  };

  const handleReopen = async (reportId: string, reason: string) => {
    setVerdict('reopening');
    setActionError(null);
    try {
      const res = await verifyReport(reportId, false);
      setReport(res.report);
      setVerdict('reopened');
    } catch (err: any) {
      setVerdict('error');
      setActionError(err?.message || 'Failed to reopen the report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-4 text-sm text-[#6B7280]">Loading report for verification...</p>
      </div>
    );
  }

  if (loadError || !report) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
          <p className="mt-3 text-sm font-semibold text-red-700">{loadError || 'Report not found.'}</p>
          <Link
            to="/resident/reports"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-[#0F1E36] text-white text-sm font-semibold hover:bg-[#1E293B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Reports
          </Link>
        </div>
      </div>
    );
  }

  const viewport: MapViewport = {
    latitude: report.location.latitude,
    longitude: report.location.longitude,
    zoom: 15,
  };

  const statusConfig: Record<string, string> = {
    'Under Review': 'text-blue-700 bg-blue-50 border-blue-200',
    'Assigned': 'text-purple-700 bg-purple-50 border-purple-200',
    'In Progress': 'text-amber-700 bg-amber-50 border-amber-200',
    'Verification': 'text-indigo-700 bg-indigo-50 border-indigo-200',
    'Resolved': 'text-emerald-700 bg-emerald-50 border-emerald-200',
    'Reopened': 'text-red-700 bg-red-50 border-red-200',
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/resident/reports/${report._id}`)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4B5563] hover:text-[#0F1E36] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Report
        </button>
        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" /> Resolution Verification
        </span>
      </div>

      {/* Report summary */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs mb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                {report.reportNumber}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig[report.status] || statusConfig['Under Review']}`}>
                {report.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F1E36] tracking-tight">{report.title}</h1>
            <p className="text-sm text-[#4B5563] mt-1.5 leading-relaxed">{report.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Reported {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {report.location.address}
          </span>
          {report.analysis?.suggestedDepartment && (
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5" />
              {report.analysis.suggestedDepartment}
            </span>
          )}
        </div>
      </div>

      {/* Real location mini-map */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs mb-5">
        <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Issue Location</span>
          </div>
          <span className="text-[11px] text-[#94A3B8] font-mono">
            {report.location.latitude.toFixed(4)}°N, {report.location.longitude.toFixed(4)}°E
          </span>
        </div>
        <div className="h-48 relative">
          <CivicMap
            viewport={viewport}
            userLocation={{ latitude: report.location.latitude, longitude: report.location.longitude }}
            showUserLocation={true}
            className="w-full h-full"
            style={{ height: 192 }}
            compact={true}
            interactive={false}
          />
        </div>
        {report.location.accuracy && (
          <div className="px-4 py-2 border-t border-[#F3F4F6] text-[11px] text-[#6B7280] font-mono">
            {report.location.accuracy}
          </div>
        )}
      </div>

      {/* Timeline */}
      {report.timeline && report.timeline.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs mb-5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B7280] mb-4">Activity Timeline</h3>
          <div className="space-y-3">
            {report.timeline.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${i === report.timeline!.length - 1 ? 'bg-[#3B82F6]' : 'bg-[#D1D5DB]'}`} />
                  {i < report.timeline!.length - 1 && <div className="w-0.5 flex-1 bg-[#E5E7EB] mt-1" />}
                </div>
                <div className="pb-2">
                  <p className="text-sm font-semibold text-[#111827]">{event.status}</p>
                  <p className="text-xs text-[#6B7280]">{event.note}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">{event.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verdict panel */}
      {verdict === 'confirmed' ? (
        <div className="p-6 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 text-left space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950">Resolution Confirmed</h3>
              <p className="text-xs text-emerald-800">The municipality has been notified. Your verification was recorded.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/resident/reports/${report._id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
            >
              View Updated Report
            </Link>
            <Link
              to="/resident/reports"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-sm font-semibold transition-colors"
            >
              Back to My Reports
            </Link>
          </div>
        </div>
      ) : verdict === 'reopened' ? (
        <div className="p-6 rounded-2xl bg-rose-50/80 border-2 border-rose-300 text-left space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950">Report Reopened & Escalated</h3>
              <p className="text-xs text-rose-800">A priority re-inspection notice was generated for the municipal department.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/resident/reports/${report._id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-colors"
            >
              View Updated Report
            </Link>
            <Link
              to="/resident/reports"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-rose-300 text-rose-800 text-sm font-semibold transition-colors"
            >
              Back to My Reports
            </Link>
          </div>
        </div>
      ) : verdict === 'error' ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-left">
          <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {actionError || 'Something went wrong.'}
          </p>
          <button
            onClick={() => setVerdict('unverified')}
            className="mt-3 text-xs font-semibold text-red-700 underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="bg-white border-2 border-[#0F1E36] rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#0F1E36] mb-1">Your Verification Verdict</h3>
          <p className="text-xs sm:text-sm text-[#6B7280] mb-4 leading-relaxed">
            Please check the location in person. Does the repair match what was reported?
          </p>

          <label className="text-xs font-semibold text-[#475569] block mb-1.5">
            Verification Notes (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g., Walked past today at 8 PM — all streetlights are working normally."
            rows={2}
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#FBFBFA] mb-4"
          />

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleConfirmFixed}
              disabled={verdict === 'confirming'}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {verdict === 'confirming' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Recording Audit...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Yes, Confirmed Fixed</>
              )}
            </button>
            <button
              onClick={() => setReopenModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
            >
              <XCircle className="w-4 h-4" /> Still Not Fixed
            </button>
          </div>
        </div>
      )}

      <StillNotFixedModal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        reportId={report._id}
        reportTitle={report.title}
        onSubmitReopen={handleReopen}
      />
    </div>
  );
};

export default VerifyResolutionPage;
