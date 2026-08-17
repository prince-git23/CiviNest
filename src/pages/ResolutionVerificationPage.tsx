import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  Camera,
  FileCheck,
  Send,
  RotateCcw,
  Building,
  Check,
  Upload,
  ThumbsUp,
} from 'lucide-react';
import {
  DashboardDataset,
  DashboardReportItem,
  ResolutionVerificationInfo,
} from '../types';
import { CiviNestLogo } from '../components/common/CiviNestLogo';
import StillNotFixedModal from '../components/reports/StillNotFixedModal';

export interface ResolutionVerificationPageProps {
  dashboardData: DashboardDataset;
  selectedReport: DashboardReportItem | null;
  onNavigateBack: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToMapExplorer?: () => void;
  onVerificationCompleted: (
    reportId: string,
    resolution: ResolutionVerificationInfo
  ) => void;
  onShowToast?: (msg: string) => void;
}

export const ResolutionVerificationPage: React.FC<ResolutionVerificationPageProps> = ({
  dashboardData,
  selectedReport,
  onNavigateBack,
  onNavigateToDashboard,
  onVerificationCompleted,
  onShowToast,
}) => {
  // Use selected report or fall back to first verification-eligible report
  const defaultReport =
    selectedReport ||
    dashboardData.activeReports.find(
      (r) => r.status === 'Verification' || r.status === 'Resolved' || r.status === 'In Progress'
    ) ||
    dashboardData.activeReports[0];

  const [activeReport, setActiveReport] = useState<DashboardReportItem>(defaultReport);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedState, setVerifiedState] = useState<'unverified' | 'confirmed' | 'reopened'>(
    activeReport?.resolution?.residentConfirmed
      ? 'confirmed'
      : activeReport?.resolution?.reopenedReason
      ? 'reopened'
      : 'unverified'
  );

  // Still not fixed modal state
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  const handleConfirmGroundTruth = () => {
    setIsSubmitting(true);

    const resolution: ResolutionVerificationInfo = {
      isVerifiedByResident: true,
      residentConfirmed: true,
      verifiedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      residentFeedback: feedbackText.trim() || 'Verified resolved on-site by resident.',
    };

    setTimeout(() => {
      setVerifiedState('confirmed');
      setIsSubmitting(false);
      onVerificationCompleted(activeReport.id, resolution);
      if (onShowToast) {
        onShowToast('✓ Ground truth verified! +50 Civic Score added to your profile.');
      }
    }, 400);
  };

  const handleReopenSubmit = (reportId: string, reason: string, photoUrl?: string) => {
    const resolution: ResolutionVerificationInfo = {
      isVerifiedByResident: true,
      residentConfirmed: false,
      verifiedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      reopenedReason: reason,
      residentFeedback: feedbackText,
    };

    setVerifiedState('reopened');
    setIsReopenModalOpen(false);
    onVerificationCompleted(reportId, resolution);
    if (onShowToast) {
      onShowToast('Report flagged to municipal supervisor for immediate re-inspection.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-24 pt-24 sm:pt-28">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 text-left">
        {/* Title & Audit Banner */}
        <div className="border-b border-[#E2E8F0] pb-6">
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer mr-1 px-2 py-1 rounded hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>My Reports</span>
            </button>
            <span className="text-xs font-mono text-slate-300">/</span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Report #{activeReport.reportNumber}
            </span>
            <span className="text-xs font-mono text-[#64748B] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              {activeReport.location}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Civic Ground-Truth Audit
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Verify Resolution: {activeReport.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 font-medium leading-relaxed max-w-2xl">
            Municipal contractors have marked this civic ticket as resolved. Your on-ground confirmation ensures civic accountability and closes the feedback loop.
          </p>
        </div>

        {/* Verification Status Cards */}
        {verifiedState === 'confirmed' ? (
          <div className="p-6 rounded-3xl bg-emerald-50/80 border-2 border-emerald-300 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  Resolution Confirmed & Audited
                </h3>
                <p className="text-xs text-emerald-800">
                  Thank you for certifying this municipal repair. <span className="font-bold">+50 Civic Impact Points</span> have been credited.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900 font-mono">
              <span>Audited By: Citizen {dashboardData.user.name}</span>
              <span>Status: Closed in Official Civic Ledger</span>
            </div>
          </div>
        ) : verifiedState === 'reopened' ? (
          <div className="p-6 rounded-3xl bg-rose-50/80 border-2 border-rose-300 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-950">
                  Ticket Reopened & Escalated
                </h3>
                <p className="text-xs text-rose-800">
                  You flagged this issue as unresolved on the ground. A priority re-inspection notice was generated for the municipal department head.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* 2-Column Comparison Layout: Citizen Signal vs Contractor Proof */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left: Original Citizen Signal */}
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-[#64748B] tracking-wider">
                Original Signal
              </span>
              <span className="text-xs font-mono text-[#64748B]">
                {activeReport.dateString || 'Reported recently'}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">
                {activeReport.title}
              </h4>
              <p className="text-xs text-[#475569] mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{activeReport.description || 'Issue submitted by resident for municipal attention.'}"
              </p>
            </div>

            <div className="text-xs space-y-1.5 pt-2 text-[#475569]">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Category:</span>
                <span className="font-semibold capitalize text-[#0F172A]">{activeReport.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Location:</span>
                <span className="font-semibold text-[#0F172A]">{activeReport.location}</span>
              </div>
            </div>
          </div>

          {/* Right: Contractor Completion & Work Order Record */}
          <div className="rounded-3xl border border-emerald-200 bg-linear-to-b from-white to-emerald-50/20 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                Contractor Completion Log
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Signed Off
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 text-xs text-[#334155] space-y-2">
              <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Work Order NMC-WO-8821 Completed
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Field crew completed replacement of failed luminaire and tested circuit breaker stability on pole cluster. Output verified at nominal 85 Lux.
              </p>
            </div>

            <div className="text-xs space-y-1.5 text-[#475569]">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Department:</span>
                <span className="font-semibold text-[#0F172A]">
                  {activeReport.governmentAction?.department || 'Public Works & Infrastructure'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Technician In Charge:</span>
                <span className="font-semibold text-[#0F172A]">R. Mane (Field Crew A-3)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Action Decision Panel */}
        {verifiedState === 'unverified' && (
          <div className="rounded-3xl border-2 border-[#0F172A] bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Your Verification Verdict
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
                Please check the location in person. Does the repair match what was reported?
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#475569] block">
                Verification Notes / Resident Feedback (Optional)
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="e.g., Walked past today at 8 PM. All 7 streetlights are working normally."
                rows={2}
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-[#FBFBFA]"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={handleConfirmGroundTruth}
                disabled={isSubmitting}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording Audit...' : 'Yes, Confirmed Fixed (+50 PTS)'}</span>
              </button>

              <button
                onClick={() => setIsReopenModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Still Not Fixed</span>
              </button>
            </div>
          </div>
        )}

        {/* Other Reports Waiting for Resident Audit in Your Sector */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] font-mono uppercase tracking-wider">
              Other Reports In Your Ward
            </h3>
            <button
              onClick={onNavigateBack}
              className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
            >
              View All in My Reports →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dashboardData.activeReports
              .filter((r) => r.id !== activeReport.id)
              .slice(0, 2)
              .map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => {
                    setActiveReport(rep);
                    setVerifiedState(
                      rep.resolution?.residentConfirmed
                        ? 'confirmed'
                        : rep.resolution?.reopenedReason
                        ? 'reopened'
                        : 'unverified'
                    );
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer text-left space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#2563EB]">#{rep.reportNumber}</span>
                    <span className="text-[#64748B]">{rep.status}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] line-clamp-1">
                    {rep.title}
                  </h4>
                  <p className="text-[11px] text-[#64748B] line-clamp-1">
                    {rep.location}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </main>

      {/* Still Not Fixed Modal */}
      <StillNotFixedModal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        reportId={activeReport.id}
        reportTitle={activeReport.title}
        onSubmitReopen={handleReopenSubmit}
      />
    </div>
  );
};

export default ResolutionVerificationPage;
