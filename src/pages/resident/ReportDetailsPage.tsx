import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  FileText,
  Building,
  ChevronRight,
  Loader2,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { getReportById, getIssueById, ReportData, CivicIssueDetail } from '../../services/api';
import { CivicMap } from '../../components/map/CivicMap';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  'Under Review': { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Under Review' },
  'Assigned': { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', label: 'Assigned' },
  'In Progress': { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'In Progress' },
  'Verification': { color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', label: 'Awaiting Verification' },
  'Resolved': { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Resolved' },
  'Reopened': { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Reopened' },
};

const CATEGORY_ICONS: Record<string, string> = {
  lighting: '💡',
  roads: '🛣️',
  water: '💧',
  sanitation: '🗑️',
  general: '📋',
  safety: '🛡️',
  parks: '🌳',
  power: '⚡',
};

const WORKFLOW_STEPS = [
  'Reported',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Citizen Verified',
];

export const ReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportData | null>(null);
  // A civic issue belonging to another resident is shown through the public
  // issue view (GET /api/resident/issues/:id) — never the owner's private data.
  const [publicIssue, setPublicIssue] = useState<CivicIssueDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setReport(null);
    setPublicIssue(null);
    getReportById(id)
      .then((result) => setReport(result.report))
      .catch((err) => {
        // Not the resident's own filing — fall back to the sanitized public
        // issue view so linked discussions / community cards still resolve.
        if (err && (err.status === 404 || err.status === 403)) {
          getIssueById(id)
            .then(({ issue }) => setPublicIssue(issue))
            .catch(() => setError(err.message || 'Failed to load report'));
        } else {
          setError(err.message || 'Failed to load report');
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
        <span className="ml-3 text-sm text-[#6B7280]">Loading report...</span>
      </div>
    );
  }

  if (error || (!report && !publicIssue)) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <p className="text-sm text-[#6B7280] mb-4">{error || 'Report not found'}</p>
        <button
          onClick={() => navigate('/resident/reports')}
          className="px-4 py-2 bg-[#0F1E36] text-white text-sm font-semibold rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer"
        >
          Back to Reports
        </button>
      </div>
    );
  }

  // ── Public civic issue view (issue belongs to another resident) ──
  if (publicIssue && !report) {
    const hasCoords =
      typeof publicIssue.latitude === 'number' && typeof publicIssue.longitude === 'number';
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-semibold text-[#6B7280]">
                  {publicIssue.reportNumber}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Community Civic Issue
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F1E36] tracking-tight">
                {publicIssue.title}
              </h1>
            </div>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200 shrink-0">
              {publicIssue.status}
            </span>
          </div>

          <p className="text-xs text-[#6B7280] mb-4">
            This civic issue was reported in your community. It is not one of your
            private filings — this is the sanitized public view.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="bg-[#F9FAFB] rounded-xl p-3">
              <p className="text-[10px] text-[#6B7280] mb-0.5">Category</p>
              <p className="text-sm font-semibold text-[#111827] capitalize">{(publicIssue.category || 'civic').replace(/_/g, ' ')}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-3">
              <p className="text-[10px] text-[#6B7280] mb-0.5">Priority</p>
              <p className="text-sm font-semibold text-[#111827] capitalize">{String(publicIssue.priority || '—')}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-3">
              <p className="text-[10px] text-[#6B7280] mb-0.5">AI Confidence</p>
              <p className="text-sm font-semibold text-[#111827]">
                {typeof publicIssue.confidence === 'number' ? Math.round(publicIssue.confidence * 100) + '%' : '—'}
              </p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-3">
              <p className="text-[10px] text-[#6B7280] mb-0.5">Reported</p>
              <p className="text-sm font-semibold text-[#111827]">
                {publicIssue.createdAt ? new Date(publicIssue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                {publicIssue.ward || 'Ward unavailable'}
                {publicIssue.locality ? ` · ${publicIssue.locality}` : ''}
              </p>
              {hasCoords && (
                <p className="text-xs text-[#6B7280] font-mono">
                  {publicIssue.latitude!.toFixed(4)}°N, {publicIssue.longitude!.toFixed(4)}°E
                </p>
              )}
            </div>
          </div>
        </div>

        {hasCoords && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
              Issue Location
            </h3>
            <div className="rounded-xl overflow-hidden border border-[#E5E7EB]">
              <CivicMap
                viewport={{ latitude: publicIssue.latitude!, longitude: publicIssue.longitude!, zoom: 14 }}
                issues={[{
                  id: publicIssue.id,
                  title: publicIssue.title,
                  category: (publicIssue.category || 'other') as any,
                  priority: typeof publicIssue.priority === 'number' ? publicIssue.priority : 50,
                  confidence: publicIssue.confidence ?? 0.8,
                  reportCount: 1,
                  confirmationCount: 0,
                  status: publicIssue.status as any,
                  latitude: publicIssue.latitude!,
                  longitude: publicIssue.longitude!,
                }]}
                className="w-full"
                style={{ height: 240 }}
                compact={true}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => navigate(`/resident/explore?lat=${publicIssue.latitude || 21.1458}&lng=${publicIssue.longitude || 79.0882}`)}
          className="w-full px-4 py-3 bg-[#0F1E36] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] transition-colors cursor-pointer"
        >
          View on Civic Map
        </button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG['Under Review'];
  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => {
    if (report.status === 'Under Review') return s === 'Under Review';
    if (report.status === 'Assigned') return s === 'Assigned';
    if (report.status === 'In Progress') return s === 'In Progress';
    if (report.status === 'Resolved') return s === 'Resolved';
    if (report.status === 'Verification') return s === 'Resolved';
    return s === 'Reported';
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/resident/reports')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Reports</span>
      </button>

      {/* Report Header */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{CATEGORY_ICONS[report.category] || '📋'}</span>
              <span className="text-xs font-mono font-semibold text-[#6B7280]">
                {report.reportNumber}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F1E36] tracking-tight">
              {report.title}
            </h1>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.color} shrink-0`}>
            {statusConfig.label}
          </span>
        </div>

        <p className="text-sm text-[#4B5563] leading-relaxed mb-4">
          {report.description}
        </p>

        <div className="flex flex-wrap gap-4 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

      {/* Workflow Progress */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
          Report Progress
        </h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {WORKFLOW_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentStepIndex
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-[#E5E7EB] text-[#9CA3AF]'
                  }`}
                >
                  {i < currentStepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] mt-1 text-center max-w-[60px] ${
                  i <= currentStepIndex ? 'text-[#3B82F6] font-semibold' : 'text-[#9CA3AF]'
                }`}>
                  {step}
                </span>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div className={`h-0.5 w-6 sm:w-10 rounded-full shrink-0 ${
                  i < currentStepIndex ? 'bg-[#3B82F6]' : 'bg-[#E5E7EB]'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
          Location
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">{report.location.address}</p>
            <p className="text-xs text-[#6B7280] font-mono">
              {report.location.latitude.toFixed(4)}°N, {report.location.longitude.toFixed(4)}°E
              {report.location.accuracy && ` · ${report.location.accuracy}`}
            </p>
          </div>
        </div>
      </div>

      {/* Evidence */}
      {report.evidence && report.evidence.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
            Evidence ({report.evidence.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {report.evidence.map((ev) => (
              <div key={ev.id} className="aspect-square rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center overflow-hidden">
                {ev.type === 'image' && ev.url ? (
                  <img src={ev.url} alt={ev.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <Camera className="w-6 h-6 text-[#9CA3AF] mx-auto mb-1" />
                    <p className="text-[10px] text-[#6B7280] truncate">{ev.name}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {report.analysis && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
            AI Analysis
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F9FAFB] rounded-xl p-3">
              <p className="text-[10px] text-[#6B7280] mb-0.5">Category</p>
              <p className="text-sm font-semibold text-[#111827]">{report.analysis.categoryLabel || report.analysis.category}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-3">
              <p className="text-[10px] text-[#6B7280] mb-0.5">Confidence</p>
              <p className="text-sm font-semibold text-[#111827]">{report.analysis.confidence}%</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-3">
              <p className="text-[10px] text-[#6B7280] mb-0.5">Severity</p>
              <p className="text-sm font-semibold text-[#111827] capitalize">{report.analysis.severity}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-3">
              <p className="text-[10px] text-[#6B7280] mb-0.5">Department</p>
              <p className="text-sm font-semibold text-[#111827]">{report.analysis.suggestedDepartment}</p>
            </div>
          </div>
          {report.analysis.keywords && report.analysis.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {report.analysis.keywords.map((kw) => (
                <span key={kw} className="px-2 py-0.5 bg-[#F3F4F6] text-[10px] font-medium text-[#4B5563] rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {report.timeline && report.timeline.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
            Activity Timeline
          </h3>
          <div className="space-y-4">
            {report.timeline.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-[#3B82F6]' : 'bg-[#D1D5DB]'}`} />
                  {i < report.timeline.length - 1 && <div className="w-0.5 flex-1 bg-[#E5E7EB] mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-[#111827]">{event.status}</p>
                  <p className="text-xs text-[#6B7280]">{event.note}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">{event.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification action for eligible reports */}
      {report.status === 'Verification' && (
        <div className="bg-white rounded-2xl border-2 border-[#3B82F6] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="text-sm font-bold text-[#0F1E36]">Verify Resolution</h3>
          </div>
          <p className="text-xs text-[#6B7280] mb-4">
            The municipality has marked this issue as resolved. Please verify whether the fix is adequate.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/resident/verify/${report._id}`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify Resolution</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetailsPage;
