import React, { useState } from 'react';
import {
  Network,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ThumbsUp,
  Radio,
  Share2,
  Layers,
  Clock,
  Activity,
  Plus,
  Compass,
  FileText,
  ChevronRight,
  Wrench,
  Check,
  CornerDownRight,
  Info,
} from 'lucide-react';
import {
  CivicClusterData,
  ClusterConfirmationResponse,
  defaultStreetLightingCluster,
  sampleCivicClusters,
  confirmClusterParticipation,
} from '../services/clusterService';
import CivicClusterScene from '../components/reports/CivicClusterScene';
import { WorkflowHeader } from '../components/navigation/WorkflowHeader';
import { DashboardViewSection } from '../components/dashboard/DashboardSidebar';

export interface ClusterDetectionPageProps {
  initialCluster?: CivicClusterData;
  userData?: {
    name: string;
    city: string;
    ward: string;
    community: string;
    avatarUrl?: string;
    role: string;
  };
  onSelectTab?: (tab: 'home' | 'reports' | 'explore' | 'profile') => void;
  onNavigateSection?: (section: DashboardViewSection) => void;
  onNavigateToPlatform?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToCreateSignal?: () => void;
  onNavigateToAnalysis?: () => void;
  onBackToDashboard?: () => void;
  onClusterConfirmed?: (response: ClusterConfirmationResponse) => void;
  onOpenReportModal?: () => void;
}

export const ClusterDetectionPage: React.FC<ClusterDetectionPageProps> = ({
  initialCluster = defaultStreetLightingCluster,
  userData,
  onNavigateToPlatform,
  onNavigateToReports,
  onNavigateToCreateSignal,
  onBackToDashboard,
  onClusterConfirmed,
  onOpenReportModal,
}) => {
  const [activeCluster, setActiveCluster] = useState<CivicClusterData>(initialCluster);
  const [selectedClusterId, setSelectedClusterId] = useState<string>(initialCluster.id);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'root-cause' | 'agency'>('overview');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const handleSelectCluster = (clusterId: string) => {
    const found = sampleCivicClusters.find((c) => c.id === clusterId);
    if (found) {
      setActiveCluster(found);
      setSelectedClusterId(clusterId);
      setHasConfirmed(false);
      setShowNoteInput(false);
    }
  };

  const handleConfirmSignal = async () => {
    if (hasConfirmed || isConfirming) return;
    setIsConfirming(true);

    try {
      const response = await confirmClusterParticipation(activeCluster.id);
      setActiveCluster(response.cluster);
      setHasConfirmed(true);
      if (onClusterConfirmed) {
        onClusterConfirmed(response);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-24">
      {/* Contextual Workflow Navigation Header */}
      <WorkflowHeader
        backLabel="Dashboard"
        onBack={onBackToDashboard || onNavigateToPlatform || (() => {})}
        onNavigateHome={onNavigateToPlatform || onBackToDashboard}
        breadcrumbs={[
          { label: 'Spatial Intelligence', onClick: onBackToDashboard },
          { label: `Cluster ${activeCluster.clusterCode}`, badge: `${activeCluster.aiConfidence}% AI Confidence`, badgeColor: 'blue' },
        ]}
        stepIndicator="Civic Cluster Correlation"
        rightActions={
          onNavigateToCreateSignal && (
            <button
              type="button"
              onClick={onNavigateToCreateSignal}
              className="inline-flex items-center gap-1 text-xs font-semibold bg-[#0F1E36] hover:bg-[#1E293B] text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>File Signal</span>
            </button>
          )
        }
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6 sm:space-y-8 text-left">
        {/* Breadcrumb & Live Cluster Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              <button
                onClick={onBackToDashboard || onNavigateToPlatform}
                className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer mr-1 px-2 py-1 rounded hover:bg-slate-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <span className="text-xs font-mono text-slate-300">/</span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                Cluster ID: {activeCluster.clusterCode}
              </span>
              <span className="text-xs font-mono font-semibold text-[#64748B] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {activeCluster.location.ward}
              </span>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {activeCluster.aiConfidence}% AI Correlation Confidence
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {activeCluster.issueTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 font-medium max-w-3xl leading-relaxed">
              {activeCluster.description}
            </p>
          </div>

          {/* Quick cluster switcher & Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <span className="text-xs font-mono text-[#64748B]">Clusters:</span>
            {sampleCivicClusters.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCluster(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedClusterId === c.id
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-[#475569] hover:bg-slate-50'
                }`}
              >
                {c.categoryLabel.split(' ')[0]}
              </button>
            ))}

            <button
              onClick={onNavigateToCreateSignal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-xl shadow-xs transition-all cursor-pointer ml-1"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* 12-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left 8-Column: Spatial Network Visualization & Detailed Tabs */}
          <div className="lg:col-span-8 space-y-6">
            {/* 3D Visualizer Card */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                    Spatial Correlation Map & Signal Topography
                  </h3>
                </div>
                <div className="text-[11px] font-mono text-[#64748B] bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                  Radius: {activeCluster.spatialHotspot.radiusMeters}m · {activeCluster.reportCount} Nodes
                </div>
              </div>

              {/* 3D Visual Scene */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-900/5 min-h-[300px]">
                <CivicClusterScene
                  reportCount={activeCluster.reportCount}
                  confirmationCount={activeCluster.confirmationCount}
                  category={activeCluster.categoryKey}
                  onHoverNode={setHoveredNode}
                />

                {/* Floating Node Info Box */}
                {hoveredNode && (
                  <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg">
                    {hoveredNode}
                  </div>
                )}

                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-[11px] font-mono text-[#334155] px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                  Interactive Orbital View
                </div>
              </div>

              {/* Cluster stats banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-100">
                  <span className="text-[10.5px] font-mono uppercase text-[#64748B] block">Direct Reports</span>
                  <span className="text-lg font-extrabold text-[#0F172A] font-mono">{activeCluster.reportCount}</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-100">
                  <span className="text-[10.5px] font-mono uppercase text-[#64748B] block">Confirmations</span>
                  <span className="text-lg font-extrabold text-[#2563EB] font-mono">{activeCluster.confirmationCount}</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-100">
                  <span className="text-[10.5px] font-mono uppercase text-[#64748B] block">Households</span>
                  <span className="text-lg font-extrabold text-[#0F172A] font-mono">
                    ~{activeCluster.spatialHotspot.estimatedHouseholdsAffected}
                  </span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-100">
                  <span className="text-[10.5px] font-mono uppercase text-[#64748B] block">Risk Level</span>
                  <span className="text-sm font-extrabold text-amber-700 block mt-0.5">
                    {activeCluster.spatialHotspot.riskRating}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs for Deep Dive */}
            <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
              {[
                { id: 'overview', label: 'Synthesis Overview', icon: Sparkles },
                { id: 'signals', label: `Citizen Signals (${activeCluster.contributingSignals.length})`, icon: Users },
                { id: 'root-cause', label: 'Root Cause Hypothesis', icon: Activity },
                { id: 'agency', label: 'Municipal Dispatch', icon: Wrench },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`inline-flex items-center gap-2 pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'border-[#0F172A] text-[#0F172A]'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
                  <h4 className="text-xs font-mono font-bold uppercase text-[#2563EB] tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Clustering Rationale
                  </h4>
                  <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                    {activeCluster.aiClusterRationale}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs sm:text-sm text-[#1E3A8A] space-y-2">
                  <div className="font-bold flex items-center gap-2 text-[#0F172A]">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Why Individual Reports Were Fused
                  </div>
                  <p className="text-xs text-[#334155] leading-relaxed">
                    Instead of flooding municipal engineers with 14 separate duplicate tickets, CiviNest converted the isolated signals into a verified spatial pattern with high-confidence root-cause attribution.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'signals' && (
              <div className="space-y-3">
                {activeCluster.contributingSignals.map((sig, idx) => (
                  <div
                    key={sig.id || idx}
                    className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#0F172A]">{sig.user}</span>
                        <span className="text-[11px] font-mono text-[#64748B]">{sig.time}</span>
                        <span className="text-[10.5px] font-mono text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {sig.distance}
                        </span>
                        {sig.verified && (
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Loc
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                        "{sig.text}"
                      </p>
                    </div>

                    {sig.photosCount && (
                      <div className="shrink-0 flex items-center gap-1.5 text-xs font-mono text-[#475569] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        <span>{sig.photosCount} Evidence Photos</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'root-cause' && (
              <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-4 shadow-xs">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                    Engineered Diagnosis
                  </span>
                  <h4 className="text-base font-bold text-[#0F172A] mt-2">
                    {activeCluster.rootCauseHypothesis}
                  </h4>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-mono font-semibold text-[#64748B] block mb-1">
                    Recommended Technical Action
                  </span>
                  <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                    {activeCluster.recommendedResolution}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'agency' && (
              <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-[#64748B]">Assigned Department</span>
                    <h4 className="text-sm font-bold text-[#0F172A]">
                      {activeCluster.responsibleAgency.department}
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {activeCluster.responsibleAgency.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[#64748B] block">Supervising Officer:</span>
                    <span className="font-semibold text-[#0F172A]">{activeCluster.responsibleAgency.contactOfficer}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">SLA Commitment:</span>
                    <span className="font-semibold text-[#0F172A]">{activeCluster.responsibleAgency.slaRemainingHours} Hours Remaining</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right 4-Column: Citizen Support & Confirmation Action Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Direct Confirmation Card */}
            <div className="rounded-3xl border-2 border-[#2563EB]/20 bg-linear-to-b from-white via-white to-blue-50/30 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-4 h-4 text-[#2563EB] animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2563EB]">
                  Civic Consensus Engine
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0F172A]">
                Are you also affected by this issue?
              </h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Adding your confirmation boosts the SLA priority with municipal contractors and earns +35 Civic Points.
              </p>

              {/* Status or Button */}
              {hasConfirmed ? (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      Confirmation Registered!
                    </span>
                    <span className="text-[11px] text-emerald-800 leading-snug block mt-0.5">
                      Your signal has been appended to {activeCluster.clusterCode}. SLA clock is prioritized.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  <button
                    onClick={handleConfirmSignal}
                    disabled={isConfirming}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{isConfirming ? 'Strengthening Signal...' : 'I Am Also Affected (+35 PTS)'}</span>
                  </button>

                  <button
                    onClick={() => setShowNoteInput(!showNoteInput)}
                    className="w-full text-center text-xs font-medium text-[#475569] hover:text-[#0F172A] py-1 cursor-pointer"
                  >
                    {showNoteInput ? 'Cancel note' : '+ Add specific note / detail'}
                  </button>

                  {showNoteInput && (
                    <div className="space-y-2 pt-2 animate-in fade-in">
                      <textarea
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        placeholder="e.g., Near pole #16, light has been flickering since yesterday..."
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Location & Sector Card */}
            <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#475569]">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Sector Details</span>
              </div>
              <p className="text-xs text-[#334155] leading-relaxed">
                <span className="font-semibold">{activeCluster.location.landmarks}</span>
              </p>
              <div className="text-[11px] font-mono text-[#64748B] pt-2 border-t border-slate-100">
                Lat: {activeCluster.location.coordinates.lat} · Lng: {activeCluster.location.coordinates.lng}
              </div>
            </div>

            {/* Quick Municipal Link Card */}
            <div className="rounded-2xl bg-slate-900 text-white p-5 space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Municipal SLA Status</span>
              </div>
              <h4 className="text-sm font-bold">
                Assigned to {activeCluster.responsibleAgency.department}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Field team dispatched with high-reach bucket truck. Target resolution within 18 hours.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClusterDetectionPage;
