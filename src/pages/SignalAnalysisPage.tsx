import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  LayoutGrid,
  Compass,
  ClipboardList,
  MessageSquare,
  TrendingUp,
  Search,
  Bell,
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CiviNestLogo } from '../components/common/CiviNestLogo';
import { SignalAnalysisHeader } from '../components/analysis/SignalAnalysisHeader';
import { OriginalSignalCard } from '../components/analysis/OriginalSignalCard';
import { EvidenceAnalysisCard } from '../components/analysis/EvidenceAnalysisCard';
import { StructuredSignalCard } from '../components/analysis/StructuredSignalCard';
import { SignalFlowVisualization } from '../components/analysis/SignalFlowVisualization';
import { RelatedSignalsCard } from '../components/analysis/RelatedSignalsCard';
import { LocationData } from '../components/signal/LocationSelector';
import { EvidenceItem } from '../components/signal/EvidenceUploader';
import {
  ExtractedSignalMetadata,
  CivicSignalSubmission,
} from '../services/signalAnalysisService';

export interface SignalAnalysisPageProps {
  initialSubmission?: Partial<CivicSignalSubmission>;
  onEditReport: () => void;
  onConfirmAndSubmit: (finalSubmission: CivicSignalSubmission) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToExplore?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToCommunity?: () => void;
  onNavigateToImpact?: () => void;
}

export const SignalAnalysisPage: React.FC<SignalAnalysisPageProps> = ({
  initialSubmission,
  onEditReport,
  onConfirmAndSubmit,
  onNavigateToDashboard,
  onNavigateToExplore,
  onNavigateToReports,
  onNavigateToCommunity,
  onNavigateToImpact,
}) => {
  // Description and Location state
  const rawDescription =
    initialSubmission?.description ||
    'The streetlight outside Gate 2 has been off for three nights. It gets very dark near the school.';

  const [description, setDescription] = useState(rawDescription);

  const initialLocationData: LocationData = initialSubmission?.location || {
    address: 'Near Gate 2, Dharampeth High School',
    ward: 'Dharampeth',
    city: 'Nagpur',
    accuracy: 'Approx. 15m accuracy',
    coordinates: { lat: 21.1458, lng: 79.0882 },
  };

  const [location, setLocation] = useState<LocationData>(initialLocationData);

  const initialTimestamp =
    initialSubmission?.timestamp ||
    new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
      ' • ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ' IST';

  const [timestamp] = useState(initialTimestamp);

  // Evidence state
  const initialEvidence: EvidenceItem[] =
    initialSubmission?.evidence?.map((ev) => ({
      id: ev.id,
      url: ev.url,
      name: ev.name,
      size: ev.size,
      type: ev.type,
      uploading: false,
      progress: 100,
    })) || [
      {
        id: 'ev-1',
        url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&auto=format&fit=crop&q=80',
        name: 'streetlight_dark_zone_01.jpg',
        size: '1.8 MB',
        type: 'image',
        uploading: false,
        progress: 100,
      },
      {
        id: 'ev-2',
        url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
        name: 'school_gate_perimeter_02.jpg',
        size: '2.1 MB',
        type: 'image',
        uploading: false,
        progress: 100,
      },
    ];

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(initialEvidence);

  // Structured Metadata
  const defaultMetadata: ExtractedSignalMetadata = initialSubmission?.analysis || {
    category: 'lighting',
    categoryLabel: 'Public Utilities · Lighting Grid',
    subcategory: 'Street Lighting',
    issueType: 'Streetlight Luminaire & Cable Trip',
    specificIssue: 'Streetlight failure (No power)',
    preciseLocation: 'Near Gate 2, Dharampeth High School',
    duration: '3 Days (approx. 72 hours)',
    severity: 'high',
    severityLabel: 'High Priority',
    severityReason:
      'Elevated severity due to proximity to a school zone. Unlit areas near educational institutions increase vulnerability risk factors during early morning/evening hours.',
    urgency: 'Requires Evening Verification',
    confidence: 91,
    suggestedDepartment: 'MSEDCL & Municipal Electrical Works',
    keywords: ['Streetlight Grid', 'Zone Luminaire', 'Phase Tripping', 'Night Visibility', 'School Corridor'],
    suggestedAction: 'Route to Sector 14 Electrical Dispatch',
    evidenceFindings: [
      {
        id: 'ef-1',
        title: 'Ambient Light Level: Critical',
        status: 'Critical',
        statusType: 'critical',
        description: 'Computer vision detects < 5 lux in the primary zone. Confirms "very dark" description.',
        source: 'Luminance Mesh & Photo 1 Exif Analysis',
        confidence: 94,
      },
      {
        id: 'ef-2',
        title: 'Structural Match',
        status: 'Verified',
        statusType: 'verified',
        description: 'Geometry in Photo 1 correlates 84% with typical municipal streetlight poles and school gate structures in this ward.',
        source: 'GIS Cadastral Alignment Engine',
        confidence: 84,
      },
    ],
    contextualFactors: [
      {
        factor: 'Educational Zone Proximity',
        impact: 'High',
        description: 'Located within 50m of school pedestrian ingress route.',
      },
      {
        factor: 'Vulnerability Window',
        impact: 'High',
        description: 'High footfall during 06:30-08:00 and 18:00-20:00 student transit hours.',
      },
      {
        factor: 'Grid Cascade Risk',
        impact: 'Medium',
        description: 'Phase circuit covers 3 contiguous luminaire poles.',
      },
    ],
    relatedSignals: {
      nearbyReportsCount: 7,
      radiusKm: 1.0,
      confirmationsCount: 5,
      sectorName: 'Sector 14',
      clusterCorrelationScore: 89,
      relatedItems: [
        { id: 'rel-1', title: 'Secondary Pole #14 Flashing', distance: '35m away', status: 'Active', timeAgo: '2h ago' },
        { id: 'rel-2', title: 'Dim Corridor near Gate 1', distance: '85m away', status: 'Queued', timeAgo: 'Yesterday' },
      ],
    },
  };

  const [metadata, setMetadata] = useState<ExtractedSignalMetadata>(defaultMetadata);
  const [isConfirming, setIsConfirming] = useState(false);

  // Animation ref
  const pageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-fade-in',
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
      );
    }, pageContainerRef);

    return () => ctx.revert();
  }, []);

  const handleUpdateMetadata = (updated: Partial<ExtractedSignalMetadata>) => {
    setMetadata((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleConfirmContinue = async () => {
    setIsConfirming(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const finalSubmission: CivicSignalSubmission = {
      id: initialSubmission?.id || `sig-${Date.now()}`,
      reportNumber: initialSubmission?.reportNumber || `#CV-${Math.floor(1000 + Math.random() * 9000)}`,
      description,
      evidence: evidenceList.map((ev) => ({
        id: ev.id,
        url: ev.url,
        name: ev.name,
        type: ev.type,
        size: ev.size,
      })),
      location,
      analysis: metadata,
      duplicateDecision: initialSubmission?.duplicateDecision || 'none',
      timestamp,
    };

    setIsConfirming(false);
    onConfirmAndSubmit(finalSubmission);
  };

  return (
    <div
      ref={pageContainerRef}
      className="min-h-screen bg-[#FBFBFA] flex text-[#111827] font-sans antialiased selection:bg-blue-600 selection:text-white"
    >
      {/* 1. Left Sidebar Navigation (Desktop) */}
      <aside className="w-60 bg-[#FBFBFA] border-r border-[#E5E7EB] shrink-0 p-5 hidden lg:flex flex-col justify-between sticky top-0 h-screen">
        <div className="space-y-6 text-left">
          {/* Logo */}
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="px-2 pt-1 block text-left cursor-pointer"
            aria-label="CiviNest Home"
          >
            <CiviNestLogo size={28} />
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-[#6B7280]" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToExplore}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#6B7280]" />
              <span>Explore</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToReports}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4 text-[#6B7280] group-hover:text-[#111827]" />
                <span>My Reports</span>
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-gray-200 text-[#4B5563]">
                3
              </span>
            </button>

            <div className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
              <span>AI Review</span>
            </div>

            <button
              type="button"
              onClick={onNavigateToCommunity}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#6B7280]" />
              <span>Community</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToImpact}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-[#6B7280]" />
              <span>Impact</span>
            </button>
          </nav>
        </div>

        {/* User Profile Card */}
        <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB] flex items-center gap-3 text-left shadow-2xs">
          <div className="relative w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            AC
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#0F1E36] truncate">Alex Chen</p>
            <p className="text-[10px] text-[#64748B] truncate">Dharampeth Resident</p>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar with Search and Notifications */}
        <header className="h-16 px-4 sm:px-8 border-b border-[#E5E7EB] bg-[#FBFBFA]/80 backdrop-blur-xs flex items-center justify-between sticky top-0 z-30">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="cursor-pointer"
              aria-label="CiviNest Home"
            >
              <CiviNestLogo size={20} />
            </button>
          </div>

          {/* Search bar */}
          <div className="hidden sm:flex items-center gap-2 max-w-md w-full px-3.5 py-1.5 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs">
            <Search className="w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search civic data, signals, or wards..."
              className="w-full text-xs text-[#1E293B] bg-transparent focus:outline-none placeholder-[#94A3B8]"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              className="relative p-2 rounded-xl bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#0F1E36] hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            <div className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              AC
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header with Title and CTAs */}
          <div className="gsap-fade-in">
            <SignalAnalysisHeader
              onEditReport={onEditReport}
              onConfirmContinue={handleConfirmContinue}
              isConfirming={isConfirming}
            />
          </div>

          {/* Main 4/12 vs 8/12 Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (4/12 width) */}
            <div className="lg:col-span-4 space-y-6 gsap-fade-in">
              {/* Original Signal Card */}
              <OriginalSignalCard
                description={description}
                location={location}
                timestamp={timestamp}
                evidenceList={evidenceList}
                onEditSignal={onEditReport}
              />

              {/* Evidence Analysis Card */}
              <EvidenceAnalysisCard
                findings={metadata.evidenceFindings}
                evidenceCount={evidenceList.length}
              />
            </div>

            {/* Right Column (8/12 width) */}
            <div className="lg:col-span-8 space-y-6 gsap-fade-in">
              {/* Structured Semantic Extraction Card */}
              <StructuredSignalCard
                metadata={metadata}
                onUpdateMetadata={handleUpdateMetadata}
              />

              {/* Bottom Sub-Grid: 3D Signal Flow & Related Signals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gsap-fade-in">
                {/* 3D WebGL Neural Signal Flow */}
                <SignalFlowVisualization />

                {/* Related Signals Correlation */}
                <RelatedSignalsCard
                  data={metadata.relatedSignals}
                  wardName={location.ward}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
