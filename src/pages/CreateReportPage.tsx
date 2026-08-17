import React, { useState, useEffect, useCallback, useRef } from 'react';
import { gsap } from 'gsap';
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  Loader2,
  Sparkles,
  MapPin,
  CheckCircle2,
  X,
  User,
  Radio,
  Info,
  Edit3,
  Camera,
  Mic,
  Navigation,
  ChevronRight,
} from 'lucide-react';
import { CiviNestLogo } from '../components/common/CiviNestLogo';
import { IssueComposer } from '../components/signal/IssueComposer';
import { EvidenceUploader, EvidenceItem } from '../components/signal/EvidenceUploader';
import { LocationSelector, LocationData } from '../components/signal/LocationSelector';
import { AIUnderstandingPanel, AIAnalysisState } from '../components/signal/AIUnderstandingPanel';
import { DuplicateIssuePanel } from '../components/signal/DuplicateIssuePanel';
import { LocationAdjustModal } from '../components/signal/LocationAdjustModal';
import { SignalSuccessView } from '../components/signal/SignalSuccessView';
import {
  analyzeCivicSignalText,
  detectDuplicateCivicSignal,
  ExtractedSignalMetadata,
  DuplicateIssueMatch,
  CivicSignalSubmission,
} from '../services/signalAnalysisService';
import type { AuthenticatedUser } from '../types';

type ReportStep = 1 | 2 | 3;

interface CreateReportPageProps {
  onBackToDashboard?: () => void;
  onNavigateToMyReports?: () => void;
  onSignalSubmitted?: (submission: CivicSignalSubmission) => void;
  authenticatedUser?: AuthenticatedUser;
  initialLocation?: LocationData;
  startMode?: 'describe' | 'photo' | 'voice' | 'location';
}

const STEPS: { id: ReportStep; label: string }[] = [
  { id: 1, label: 'Describe' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Review' },
];

export const CreateReportPage: React.FC<CreateReportPageProps> = ({
  onBackToDashboard,
  onNavigateToMyReports,
  onSignalSubmitted,
  authenticatedUser,
  initialLocation = {
    address: 'Dharampeth, Nagpur',
    ward: 'Dharampeth',
    city: 'Nagpur',
    accuracy: 'Approx. 15m accuracy',
    coordinates: { lat: 21.1458, lng: 79.0882 },
  },
  startMode = 'describe',
}) => {
  // ── Current step ──
  const [currentStep, setCurrentStep] = useState<ReportStep>(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // ── Form state ──
  const [description, setDescription] = useState('');
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [location, setLocation] = useState<LocationData>(initialLocation);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // ── AI state ──
  const [aiState, setAiState] = useState<AIAnalysisState>('idle');
  const [extractedMetadata, setExtractedMetadata] = useState<ExtractedSignalMetadata | null>(null);

  // ── Duplicate detection ──
  const [duplicateMatch, setDuplicateMatch] = useState<DuplicateIssueMatch | null>(null);
  const [duplicateDecision, setDuplicateDecision] = useState<'none' | 'merged' | 'new_confirmed'>('none');

  // ── Submission ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSubmission, setCompletedSubmission] = useState<CivicSignalSubmission | null>(null);
  const [isDraftDirty, setIsDraftDirty] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // ── Animation refs ──
  const stepContentRef = useRef<HTMLDivElement>(null);

  // ── Handle start mode ──
  useEffect(() => {
    if (startMode === 'photo' || startMode === 'voice' || startMode === 'location') {
      setCurrentStep(2);
    }
  }, [startMode]);

  // ── Track draft dirty state ──
  useEffect(() => {
    if (description || evidenceList.length > 0) {
      setIsDraftDirty(true);
    }
  }, [description, evidenceList]);

  // ── Step transition animation ──
  useEffect(() => {
    if (stepContentRef.current) {
      gsap.fromTo(
        stepContentRef.current,
        { opacity: 0, x: direction === 'forward' ? 24 : -24 },
        { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [currentStep, direction]);

  // ── AI analysis (runs in background) ──
  useEffect(() => {
    if (!description || description.trim().length < 8) {
      setAiState('idle');
      setExtractedMetadata(null);
      setDuplicateMatch(null);
      return;
    }
    setAiState('analyzing');
    const timer = setTimeout(async () => {
      try {
        const result = await analyzeCivicSignalText(description, location.address);
        if (result) {
          setExtractedMetadata(result);
          setAiState('analyzed');
          const dup = detectDuplicateCivicSignal(description, result.category);
          setDuplicateMatch(dup);
        } else {
          setAiState('idle');
        }
      } catch {
        setAiState('error');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [description, location.address]);

  // ── Navigation ──
  const goToStep = (step: ReportStep) => {
    setDirection(step > currentStep ? 'forward' : 'back');
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canGoNext = () => {
    if (currentStep === 1) return description.trim().length >= 8;
    if (currentStep === 2) return true;
    return false;
  };

  const handleNext = () => {
    if (currentStep < 3 && canGoNext()) {
      goToStep((currentStep + 1) as ReportStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep((currentStep - 1) as ReportStep);
    }
  };

  // ── Evidence handlers ──
  const handleAddEvidence = (item: EvidenceItem) => setEvidenceList((prev) => [...prev, item]);
  const handleRemoveEvidence = (id: string) => setEvidenceList((prev) => prev.filter((e) => e.id !== id));

  // ── Submit ──
  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const submission: CivicSignalSubmission = {
      id: `sig-${Date.now()}`,
      reportNumber: `#CV-${Math.floor(1000 + Math.random() * 9000)}`,
      description: description.trim(),
      evidence: evidenceList.map((ev) => ({
        id: ev.id,
        url: ev.url,
        name: ev.name,
        type: ev.type,
        size: ev.size,
      })),
      location,
      analysis: extractedMetadata,
      duplicateDecision,
      mergedWithReportNumber:
        duplicateDecision === 'merged' && duplicateMatch ? duplicateMatch.reportNumber : undefined,
      timestamp:
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
    };

    setCompletedSubmission(submission);
    setIsSubmitting(false);
    setIsDraftDirty(false);
    if (onSignalSubmitted) onSignalSubmitted(submission);
  };

  // ── Success state ──
  if (completedSubmission) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] text-[#111827] flex flex-col font-sans selection:bg-[#0F1E36] selection:text-white">
        {/* Simple header for success */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <CiviNestLogo size={24} showText={true} />
          </div>
        </header>

        <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
          {/* Success view — reused from existing */}
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xl">
            {/* Success Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 mb-1 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Submitted
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F1E36] tracking-tight">
                  Civic issue submitted
                </h2>
              </div>
            </div>

            {/* Submission Details */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 mb-6 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Issue ID
                  </span>
                  <div className="text-base font-mono font-bold text-[#0F1E36]">
                    {completedSubmission.reportNumber}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Status
                  </span>
                  <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Under Review
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-[#4B5563]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">{completedSubmission.location.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{completedSubmission.evidence.length} evidence items</span>
                </div>
              </div>

              {completedSubmission.analysis && (
                <div className="pt-2 border-t border-[#E2E8F0]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Category
                  </span>
                  <div className="text-sm font-semibold text-[#111827]">
                    {completedSubmission.analysis.categoryLabel}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {onNavigateToMyReports && (
                <button
                  type="button"
                  onClick={onNavigateToMyReports}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white px-5 py-3.5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <span>View My Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setCompletedSubmission(null);
                  setDescription('');
                  setEvidenceList([]);
                  setAiState('idle');
                  setExtractedMetadata(null);
                  setDuplicateMatch(null);
                  setDuplicateDecision('none');
                  goToStep(1);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:scale-[0.99] text-[#374151] border border-[#D1D5DB] px-4 py-3.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
              >
                Report Another Issue
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Main Reporting Workflow ──
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111827] flex flex-col font-sans selection:bg-[#0F1E36] selection:text-white">
      {/* ── Simple Header ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (isDraftDirty) {
                  setShowLeaveConfirm(true);
                } else {
                  onBackToDashboard?.();
                }
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <CiviNestLogo size={22} showText={true} />
            <span className="text-[#D1D5DB] hidden sm:block">|</span>
            <span className="text-sm font-semibold text-[#374151] hidden sm:block">
              Report a Civic Issue
            </span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    currentStep === step.id
                      ? 'text-[#0F1E36]'
                      : currentStep > step.id
                      ? 'text-emerald-600'
                      : 'text-[#9CA3AF]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all ${
                      currentStep === step.id
                        ? 'bg-[#0F1E36] text-white border-[#0F1E36]'
                        : currentStep > step.id
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-[#9CA3AF] border-[#D1D5DB]'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-6 h-0.5 rounded-full ${
                      currentStep > step.id ? 'bg-emerald-400' : 'bg-[#E5E7EB]'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* ── Step Content ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div ref={stepContentRef}>
          {/* ══════ STEP 1: Describe ══════ */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
                  Step 1 of 3
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F1E36] tracking-tight">
                  What's happening?
                </h1>
                <p className="text-sm text-[#6B7280]">
                  Tell us what you noticed. CiviNest will help organize the details.
                </p>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs">
                <IssueComposer
                  value={description}
                  onChange={setDescription}
                  disabled={false}
                />
              </div>

              {/* Continue button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer ${
                    canGoNext()
                      ? 'bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white hover:shadow-md'
                      : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  }`}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ══════ STEP 2: Evidence & Location ══════ */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left: Evidence + Location */}
              <section className="lg:col-span-7 space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
                    Step 2 of 3
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F1E36] tracking-tight">
                    Add details
                  </h1>
                  <p className="text-sm text-[#6B7280]">
                    Photos, videos, or other evidence help verify your report.
                  </p>
                </div>

                {/* Evidence */}
                <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs">
                  <EvidenceUploader
                    evidenceList={evidenceList}
                    onAddEvidence={handleAddEvidence}
                    onRemoveEvidence={handleRemoveEvidence}
                  />
                </div>

                {/* Location */}
                <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs">
                  <LocationSelector
                    location={location}
                    onOpenAdjustModal={() => setIsLocationModalOpen(true)}
                  />
                </div>

                {/* Nearby Issues */}
                {duplicateMatch && (
                  <DuplicateIssuePanel
                    duplicate={duplicateMatch}
                    decision={duplicateDecision}
                    onConfirmSameIssue={() => setDuplicateDecision('merged')}
                    onConfirmCreateNew={() => setDuplicateDecision('new_confirmed')}
                  />
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#4B5563] hover:text-[#0F1E36] hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white text-sm font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <span>Review Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>

              {/* Right: Civic Context Map */}
              <aside className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Radio className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-bold text-[#0F1E36]">Civic Context</h3>
                    <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  {/* Compact map placeholder */}
                  <div className="w-full h-48 rounded-xl bg-[#1A2332] flex items-center justify-center">
                    <p className="text-xs text-slate-400">Civic context map</p>
                  </div>
                  {/* Nearby context */}
                  <div className="mt-3 flex items-center justify-between p-2.5 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-[11px] font-medium text-[#374151]">
                        Streetlight Issue · 45m
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* ══════ STEP 3: Review & Submit ══════ */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
                  Step 3 of 3
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F1E36] tracking-tight">
                  Review your report
                </h1>
                <p className="text-sm text-[#6B7280]">
                  Does this look correct? You can go back to make changes.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                {/* Description */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Issue
                  </span>
                  <p className="text-sm text-[#111827] mt-1 leading-relaxed">
                    {description}
                  </p>
                </div>

                <div className="border-t border-[#F1F5F9]" />

                {/* Location */}
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#6B7280] shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Location
                    </span>
                    <p className="text-sm text-[#111827]">{location.address}</p>
                  </div>
                </div>

                {/* Evidence */}
                <div className="flex items-center gap-3">
                  <Camera className="w-4 h-4 text-[#6B7280] shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Evidence
                    </span>
                    <p className="text-sm text-[#111827]">
                      {evidenceList.length === 0
                        ? 'No evidence added'
                        : `${evidenceList.length} photo${evidenceList.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>

                {/* Evidence thumbnails */}
                {evidenceList.length > 0 && (
                  <div className="flex gap-2 pl-7">
                    {evidenceList.map((ev) => (
                      <div key={ev.id} className="w-16 h-16 rounded-lg overflow-hidden border border-[#E5E7EB]">
                        <img src={ev.url} alt={ev.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-[#F1F5F9]" />

                {/* AI Analysis */}
                <AIUnderstandingPanel state={aiState} metadata={extractedMetadata} />

                {/* Does this look correct? */}
                {aiState === 'analyzed' && extractedMetadata && (
                  <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <span className="text-sm font-medium text-[#0F1E36]">
                      Does this look correct?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#4B5563] hover:bg-white rounded-lg border border-[#E5E7EB] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit Details
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Looks Correct
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#4B5563] hover:text-[#0F1E36] hover:bg-black/5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Go Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !description.trim()}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer ${
                    isSubmitting || !description.trim()
                      ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                      : 'bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white hover:shadow-md'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Civic Issue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Privacy note */}
              <p className="text-[11px] text-[#6B7280] text-center flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Identity protected. Location is used to route this civic report.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ── Location Adjust Modal ── */}
      <LocationAdjustModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSaveLocation={(newLoc) => setLocation(newLoc)}
      />

      {/* ── Unsaved Draft Confirmation ── */}
      {showLeaveConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowLeaveConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#0F1E36] mb-2">Leave report?</h3>
            <p className="text-sm text-[#6B7280] mb-5">
              Your current report has not been submitted.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#0F1E36] hover:bg-[#1E293B] rounded-xl transition-colors cursor-pointer"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLeaveConfirm(false);
                  onBackToDashboard?.();
                }}
                className="px-4 py-2.5 text-sm font-medium text-[#DC2626] hover:bg-red-50 rounded-xl border border-[#E5E7EB] transition-colors cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateReportPage;
