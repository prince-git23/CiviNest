import React, { useState, useEffect, useCallback, useRef } from 'react';
import { gsap } from 'gsap';
import { CiviNestLogo } from '../components/common/CiviNestLogo';
import { IssueComposer } from '../components/signal/IssueComposer';
import { EvidenceUploader, EvidenceItem } from '../components/signal/EvidenceUploader';
import { LocationSelector, LocationData } from '../components/signal/LocationSelector';
import { AIUnderstandingPanel, AIAnalysisState } from '../components/signal/AIUnderstandingPanel';
import { DuplicateIssuePanel } from '../components/signal/DuplicateIssuePanel';
import { CivicContextScene } from '../components/signal/CivicContextScene';
import { ContextMarker, ContextMarkerData } from '../components/signal/ContextMarker';
import { LocationAdjustModal } from '../components/signal/LocationAdjustModal';
import { SignalSuccessView } from '../components/signal/SignalSuccessView';
import { MobileBottomNav, MobileTabType } from '../components/signal/MobileBottomNav';
import {
  analyzeCivicSignalText,
  detectDuplicateCivicSignal,
  ExtractedSignalMetadata,
  DuplicateIssueMatch,
  CivicSignalSubmission,
} from '../services/signalAnalysisService';
import {
  ArrowRight,
  Shield,
  Loader2,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Menu,
  X,
  User,
  Radio,
} from 'lucide-react';

interface CreateCivicSignalPageProps {
  onBackToDashboard?: () => void;
  onNavigateToPlatform?: () => void;
  onNavigateToAuth?: () => void;
  onNavigateToAnalysis?: (submission: CivicSignalSubmission) => void;
  onSignalSubmitted?: (submission: CivicSignalSubmission) => void;
  initialLocation?: LocationData;
  initialDraft?: Partial<CivicSignalSubmission>;
}

export const CreateCivicSignalPage: React.FC<CreateCivicSignalPageProps> = ({
  onBackToDashboard,
  onNavigateToPlatform,
  onNavigateToAuth,
  onNavigateToAnalysis,
  onSignalSubmitted,
  initialLocation = {
    address: 'Dharampeth, Nagpur',
    ward: 'Dharampeth',
    city: 'Nagpur',
    accuracy: 'Approx. 15m accuracy',
    coordinates: { lat: 21.1458, lng: 79.0882 },
  },
  initialDraft,
}) => {
  // Signal draft state
  const [description, setDescription] = useState(initialDraft?.description || '');
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(
    initialDraft?.evidence?.map((ev) => ({
      id: ev.id,
      url: ev.url,
      name: ev.name,
      size: ev.size,
      type: ev.type,
      uploading: false,
      progress: 100,
    })) || [
      {
        id: 'ev-default-1',
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
        name: 'pothole_inspection_01.jpg',
        size: '1.4 MB',
        type: 'image',
        uploading: false,
        progress: 100,
      },
    ]
  );
  const [location, setLocation] = useState<LocationData>(
    initialDraft?.location || initialLocation
  );
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // AI Understanding state
  const [aiState, setAiState] = useState<AIAnalysisState>('idle');
  const [extractedMetadata, setExtractedMetadata] = useState<ExtractedSignalMetadata | null>(
    initialDraft?.analysis || null
  );

  // Duplicate detection state
  const [duplicateMatch, setDuplicateMatch] = useState<DuplicateIssueMatch | null>(null);
  const [duplicateDecision, setDuplicateDecision] = useState<'none' | 'merged' | 'new_confirmed'>('none');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSubmission, setCompletedSubmission] = useState<CivicSignalSubmission | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTabType>('civic');

  // Context markers for 3D Map
  const [contextMarkers, setContextMarkers] = useState<ContextMarkerData[]>([
    {
      id: 'cm-1',
      type: 'nearby',
      badgeLabel: 'Nearby Context',
      title: 'Streetlight Grid',
      distance: '45m',
      status: 'Active',
      statusType: 'active',
      icon: 'light',
      position: [3.8, 0.5, -2.5],
      description: 'Sector 14 residential lighting phase circuit.',
    },
    {
      id: 'cm-2',
      type: 'zone',
      badgeLabel: 'Zone Marker',
      title: 'Primary School',
      distance: '120m',
      status: 'High Priority',
      statusType: 'priority',
      icon: 'school',
      position: [-4.2, 0.8, 2.8],
      description: 'Designated high-footfall school transit zone.',
    },
    {
      id: 'cm-3',
      type: 'infra',
      badgeLabel: 'Infrastructure',
      title: 'Stormwater Drain Sump',
      distance: '80m',
      status: 'Monitored',
      statusType: 'normal',
      icon: 'drain',
      position: [2.2, 0.4, 3.5],
      description: 'Main arterial stormwater catchment grate.',
    },
  ]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  // Animation refs
  const headerRef = useRef<HTMLDivElement>(null);
  const composerCardRef = useRef<HTMLDivElement>(null);
  const contextPanelRef = useRef<HTMLDivElement>(null);

  // Initial GSAP Page Entrance Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
      gsap.fromTo(
        composerCardRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: 'power3.out' }
      );
      if (contextPanelRef.current) {
        gsap.fromTo(
          contextPanelRef.current,
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Debounced AI Understanding analysis & Duplicate checking
  useEffect(() => {
    if (!description || description.trim().length < 8) {
      setAiState('idle');
      setExtractedMetadata(null);
      setDuplicateMatch(null);
      setDuplicateDecision('none');
      return;
    }

    setAiState('analyzing');

    const timer = setTimeout(async () => {
      try {
        const result = await analyzeCivicSignalText(description, location.address);
        if (result) {
          setExtractedMetadata(result);
          setAiState('analyzed');

          // Check duplicates if not yet decided
          const dup = detectDuplicateCivicSignal(description, result.category);
          setDuplicateMatch(dup);
        } else {
          setAiState('idle');
          setDuplicateMatch(null);
        }
      } catch (err) {
        setAiState('error');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [description, location.address]);

  // Evidence handlers
  const handleAddEvidence = (item: EvidenceItem) => {
    setEvidenceList((prev) => [...prev, item]);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((item) => item.id !== id));
  };

  // Duplicate decision handlers
  const handleConfirmSameIssue = () => {
    setDuplicateDecision('merged');
  };

  const handleConfirmCreateNew = () => {
    setDuplicateDecision('new_confirmed');
  };

  // Submit Civic Signal Handler
  const handleSubmitSignal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate backend ingestion & routing pipeline
    await new Promise((resolve) => setTimeout(resolve, 800));

    const generatedId = `sig-${Date.now()}`;
    const generatedReportNumber = `#CV-${Math.floor(1000 + Math.random() * 9000)}`;

    const submission: CivicSignalSubmission = {
      id: generatedId,
      reportNumber: generatedReportNumber,
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
      mergedWithReportNumber: duplicateDecision === 'merged' && duplicateMatch ? duplicateMatch.reportNumber : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
    };

    setCompletedSubmission(submission);
    setIsSubmitting(false);

    if (onNavigateToAnalysis) {
      onNavigateToAnalysis(submission);
    } else if (onSignalSubmitted) {
      onSignalSubmitted(submission);
    }
  };

  // Reset form for another report
  const handleCreateAnother = () => {
    setDescription('');
    setEvidenceList([]);
    setAiState('idle');
    setExtractedMetadata(null);
    setDuplicateMatch(null);
    setDuplicateDecision('none');
    setCompletedSubmission(null);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111827] flex flex-col font-sans selection:bg-[#0F1E36] selection:text-white pb-20 md:pb-8">
      {/* 1. CiviNest Header matching reference */}
      <header className="sticky top-0 z-40 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#E5E7EB] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer mr-1"
                title="Return to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <CiviNestLogo />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onNavigateToAuth || onBackToDashboard}
              className="text-xs sm:text-sm font-semibold tracking-wider text-[#0F1E36] hover:text-blue-600 uppercase transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onBackToDashboard || onNavigateToPlatform}
              className="p-2 rounded-lg text-[#111827] hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Signal Ingestion View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {completedSubmission ? (
          /* Post-submission Success State */
          <SignalSuccessView
            submission={completedSubmission}
            onReturnToDashboard={onBackToDashboard || (() => {})}
            onCreateAnother={handleCreateAnother}
          />
        ) : (
          /* Two-Panel Layout (Left Composer + Right Civic Context) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN (approx 3/5 width): Civic Signal Composer */}
            <section className="lg:col-span-7 space-y-5">
              {/* Page Eyebrow & Title */}
              <div ref={headerRef} className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
                  Civic Signal
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F1E36] tracking-tight font-sans">
                  What's happening?
                </h1>
              </div>

              {/* Main Composer Box */}
              <div
                ref={composerCardRef}
                className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6"
              >
                {/* 1. Large Issue Textarea & Voice Record Trigger */}
                <IssueComposer
                  value={description}
                  onChange={setDescription}
                  onSubmitShortcut={() => {
                    if (description.trim()) {
                      const form = document.getElementById('signal-form');
                      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }}
                  disabled={isSubmitting}
                />

                <div className="border-t border-[#F1F5F9]" />

                {/* 2. Evidence Section (Photo/Video dropzone + previews) */}
                <EvidenceUploader
                  evidenceList={evidenceList}
                  onAddEvidence={handleAddEvidence}
                  onRemoveEvidence={handleRemoveEvidence}
                  disabled={isSubmitting}
                />

                <div className="border-t border-[#F1F5F9]" />

                {/* 3. Location Section with Mini Map graphic & Adjust trigger */}
                <LocationSelector
                  location={location}
                  onOpenAdjustModal={() => setIsLocationModalOpen(true)}
                  disabled={isSubmitting}
                />
              </div>

              {/* 4. AI Understanding Panel (idle / analyzing / analyzed) */}
              <AIUnderstandingPanel
                state={aiState}
                metadata={extractedMetadata}
              />

              {/* 5. Duplicate Issue Detection Card (if duplicate match identified) */}
              {duplicateMatch && (
                <DuplicateIssuePanel
                  duplicate={duplicateMatch}
                  decision={duplicateDecision}
                  onConfirmSameIssue={handleConfirmSameIssue}
                  onConfirmCreateNew={handleConfirmCreateNew}
                />
              )}

              {/* 6. Submit Button Bar */}
              <form id="signal-form" onSubmit={handleSubmitSignal} className="pt-2">
                <button
                  type="submit"
                  id="btn-submit-civic-signal"
                  disabled={isSubmitting || !description.trim()}
                  className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl text-base font-bold shadow-md transition-all duration-200 cursor-pointer ${
                    isSubmitting || !description.trim()
                      ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed shadow-none'
                      : 'bg-[#0F1E36] hover:bg-[#1E293B] active:scale-[0.99] text-white hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      <span>Ingesting into Municipal Spatial Mesh...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Civic Signal</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Privacy footnote matching CiviNest specification */}
                <p className="text-[11px] text-[#6B7280] text-center mt-3 flex items-center justify-center gap-1.5 font-sans">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Identity protected. Location is used to route and contextualize this civic signal.
                  </span>
                </p>
              </form>
            </section>

            {/* RIGHT COLUMN (approx 2/5 width): Civic Context Panel & 3D Scene */}
            <aside ref={contextPanelRef} className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 shadow-xs">
                {/* Header with Network Icon & Live Map Pill */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0F1E36] flex items-center justify-center">
                      <Radio className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h3 className="text-base font-bold text-[#0F1E36]">Civic Context</h3>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    LIVE MAP
                  </span>
                </div>

                {/* 3D WebGL Three.js Spatial Map Scene */}
                <div className="w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden mb-4 border border-slate-700/60 shadow-inner">
                  <CivicContextScene
                    markers={contextMarkers}
                    selectedMarkerId={selectedMarkerId}
                    onSelectMarker={(m) => setSelectedMarkerId(m.id)}
                    locality={location.ward}
                    ward={`Ward #${location.ward === 'Dharampeth' ? '14' : '08'}`}
                  />
                </div>

                {/* Interactive Context Markers */}
                <div className="space-y-2.5">
                  {contextMarkers.map((marker) => (
                    <ContextMarker
                      key={marker.id}
                      marker={marker}
                      isSelected={selectedMarkerId === marker.id}
                      onClick={() => setSelectedMarkerId(marker.id)}
                    />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Location Adjust Modal */}
      <LocationAdjustModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSaveLocation={(newLoc) => setLocation(newLoc)}
      />

      {/* Mobile Bottom Navigation Bar matching reference */}
      <MobileBottomNav
        activeTab={mobileTab}
        onSelectTab={setMobileTab}
        onNavigateToDashboard={onBackToDashboard}
        onNavigateToPlatform={onNavigateToPlatform}
        onNavigateToAuth={onNavigateToAuth}
      />
    </div>
  );
};

export default CreateCivicSignalPage;
