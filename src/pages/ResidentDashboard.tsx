import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardSidebar, DashboardViewSection } from '../components/dashboard/DashboardSidebar';
import { CivicGreeting } from '../components/dashboard/CivicGreeting';
import { QuickActionBar } from '../components/dashboard/QuickActionBar';
import { CivicSpatialMap } from '../components/map/CivicSpatialMap';
import { ActiveReports } from '../components/dashboard/ActiveReports';
import { AIInsightCard } from '../components/dashboard/AIInsightCard';
import { CivicImpactCard } from '../components/dashboard/CivicImpactCard';
import { CommunityPulse } from '../components/dashboard/CommunityPulse';
import { TrendingNearby } from '../components/dashboard/TrendingNearby';
import { IssueDetailModal } from '../components/dashboard/IssueDetailModal';
import { VoiceReportModal } from '../components/dashboard/VoiceReportModal';
import { PhotoUploadModal } from '../components/dashboard/PhotoUploadModal';
import { LocationShareModal } from '../components/dashboard/LocationShareModal';
import { LiveReportSimulatorModal } from '../components/sections/LiveReportSimulatorModal';
import { DashboardDataset, defaultDashboardData } from '../data/dashboardData';
import { DashboardReportItem, SpatialMapNode, DashboardNearbyIssue } from '../types';
import { fetchResidentDashboard } from '../services/residentDashboardData';
import { convertCluster } from '../services/residentMapData';
import { getMapClusters } from '../services/api';
import type { IssueCluster } from '../services/geo/geoTypes';
import { AppPageId } from '../App';
import {
  Menu,
  X,
  CheckCircle2,
  ClipboardList,
  Search,
  Plus,
  Filter,
  Lightbulb,
  Droplet,
  SlidersHorizontal,
  Trash2,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ResidentDashboardProps {
  initialData?: DashboardDataset;
  initialSection?: DashboardViewSection;
  initialTab?: 'home' | 'explore' | 'reports' | 'community' | 'impact';
  onNavigateToPlatform?: () => void;
  onNavigateToHowItWorks?: () => void;
  onNavigateToAuth?: () => void;
  onNavigateToCreateSignal?: () => void;
  onNavigateToMunicipal?: () => void;
  onNavigateToPage?: (page: AppPageId) => void;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
  initialData = defaultDashboardData,
  initialSection = 'overview',
  initialTab = 'home',
  onNavigateToPlatform,
  onNavigateToHowItWorks,
  onNavigateToAuth,
  onNavigateToCreateSignal,
  onNavigateToMunicipal,
  onNavigateToPage,
}) => {
  const [data, setData] = useState<DashboardDataset>(initialData);
  const [realClusters, setRealClusters] = useState<IssueCluster[]>([]);

  // Load real backend data when available (falls back to demo data)
  useEffect(() => {
    let mounted = true;
    fetchResidentDashboard(data).then((next) => {
      if (mounted) setData(next);
    });
    getMapClusters()
      .then((res) => {
        if (mounted && res.clusters?.length) setRealClusters(res.clusters.map(convertCluster));
      })
      .catch(() => {
        // Backend unavailable — demo map data stays
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useNavigate();

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Inspection state
  const [selectedReport, setSelectedReport] = useState<DashboardReportItem | null>(null);
  const [selectedMapNode, setSelectedMapNode] = useState<SpatialMapNode | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Navigate to a resident route (works from both the resident router and the
  // legacy app shell, both of which render inside a BrowserRouter).
  const goTo = useCallback((path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  // Handle Support Action on Trending Issue
  const handleSupportIssue = (issueId: string) => {
    setData((prev) => ({
      ...prev,
      nearbyIssues: prev.nearbyIssues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              isSupported: !issue.isSupported,
              supportCount: issue.isSupported ? issue.supportCount - 1 : issue.supportCount + 1,
            }
          : issue
      ),
      impact: {
        ...prev.impact,
        points: prev.impact.points + 5,
        communityUpvotes: prev.impact.communityUpvotes + 1,
      },
    }));
    showToast('Signal upvoted! +5 Civic Impact points added to your score.');
  };

  // Handle New Report Added from Simulator
  const handleAddLiveReport = (reportData: any) => {
    const newReport: DashboardReportItem = {
      id: `rep-${Date.now()}`,
      reportNumber: `#CV-${Math.floor(1000 + Math.random() * 9000)}`,
      title: reportData.category || 'New Civic Report',
      category: (reportData.category?.toLowerCase() || 'roads') as any,
      reportedAgo: 'Just now',
      dateString: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Under Review',
      location: reportData.location || data.user.community,
      description: reportData.description || 'Citizen report filed and prioritized for verification.',
      upvotes: 1,
      timeline: [
        {
          status: 'Report Lodged',
          timestamp: 'Just now',
          note: 'Civic signal ingested and broadcast to ward mesh.',
        },
      ],
    };

    setData((prev) => ({
      ...prev,
      activeReports: [newReport, ...prev.activeReports],
      impact: {
        ...prev.impact,
        points: prev.impact.points + 25,
        reportsSubmitted: prev.impact.reportsSubmitted + 1,
      },
    }));

    showToast(`Report ${newReport.reportNumber} submitted successfully! +25 Impact points.`);
  };

  // Handle Voice Transcript submission
  const handleSubmitVoice = (transcript: string) => {
    handleAddLiveReport({
      category: 'Voice Lodged Signal',
      description: transcript,
      location: data.user.community,
    });
  };

  // Handle Photo Evidence
  const handleConfirmPhoto = (photoInfo: { name: string; url: string; aiTag: string }) => {
    handleAddLiveReport({
      category: 'Photographic Evidence Report',
      description: `Verified photo submission: ${photoInfo.aiTag}`,
      location: data.user.community,
    });
  };

  // Handle Resolution Confirmation
  const handleConfirmResolution = (reportId: string) => {
    setData((prev) => ({
      ...prev,
      activeReports: prev.activeReports.map((r) =>
        r.id === reportId ? { ...r, status: 'Resolved' as const } : r
      ),
      impact: {
        ...prev.impact,
        points: prev.impact.points + 50,
        verifiedSignals: prev.impact.verifiedSignals + 1,
      },
    }));
    showToast('Citizen verification confirmed! Resolution closed (+50 pts).');
  };

  // GSAP card entrance animations
  useEffect(() => {
    const cards = document.querySelectorAll('[data-animate="card"]');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* A. Civic Greeting & Local Civic Health Card */}
      <div data-animate="card">
      <CivicGreeting
        userName={data.user.name}
        city={data.user.city}
        ward={data.user.ward}
        community={data.user.community}
        civicHealth={data.civicHealth}
        onExploreHealth={() => goTo('/resident/ward-metrics')}
      />
      </div>

      {/* B. Quick Action Bar */}
      <div data-animate="card">
      <QuickActionBar
        onReportIssue={onNavigateToCreateSignal || (() => goTo('/resident/report'))}
        onAddPhoto={() => setIsPhotoModalOpen(true)}
        onUseVoice={() => setIsVoiceModalOpen(true)}
        onShareLocation={() => setIsLocationModalOpen(true)}
      />
      </div>

      {/* C. Spatial Intelligence 3D Map */}
      <section data-animate="card" className="relative">
        <div className="flex items-center justify-between mb-3 text-left">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#0F1E36]">
              Spatial Civic Intelligence
            </h2>
            <p className="text-xs text-[#6B7280]">
              3D telemetry mesh of {data.user.community} and surrounding sectors.
            </p>
          </div>
        </div>

        <CivicSpatialMap
          nodes={data.spatialNodes}
          clusters={realClusters}
          dataSource={realClusters.length > 0 ? 'live' : 'demo'}
          selectedNodeId={selectedMapNode?.id}
          onSelectNode={(node) => {
            setSelectedMapNode(node);
            setSelectedReport(null);
          }}
          wardName={data.user.ward}
          localityName={data.user.community}
        />
      </section>

      {/* D. Two-Column Mid Row (Active Filings + AI Insight | Civic Impact + Community Pulse) */}
      <div data-animate="card" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column */}
        <div className="space-y-6 flex flex-col">
          <ActiveReports
            reports={data.activeReports}
            onSelectReport={(report) => {
              setSelectedReport(report);
              setSelectedMapNode(null);
            }}
            onViewAll={() => goTo('/resident/reports')}
          />

          <AIInsightCard
            insight={data.aiInsight}
            onExplorePattern={() => {
              const insight = data.aiInsight;
              const params = new URLSearchParams();
              if (insight?.clusterId) params.set('cluster', insight.clusterId);
              if (insight?.location) {
                params.set('lat', String(insight.location.latitude));
                params.set('lng', String(insight.location.longitude));
                params.set('title', insight.headline);
              }
              const qs = params.toString();
              goTo(`/resident/explore${qs ? `?${qs}` : ''}`);
            }}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6 flex flex-col">
          <CivicImpactCard
            impact={data.impact}
            onOpenDetails={() => goTo('/resident/impact')}
          />

          <CommunityPulse data={data.communityPulse} />
        </div>
      </div>

      {/* E. Trending Nearby Carousel */}
      <div data-animate="card">
      <TrendingNearby
        issues={data.nearbyIssues}
        onSupportIssue={handleSupportIssue}
        onViewData={(issue) => {
          goTo(`/resident/trends/${issue.id}`);
        }}
      />
      </div>

      {/* 4. Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F1E36] text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 fade-in text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 5. Modals */}
      {/* Live Issue Simulator Modal */}
      {isReportModalOpen && (
        <LiveReportSimulatorModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Issue Detail Modal */}
      <IssueDetailModal
        isOpen={Boolean(selectedReport || selectedMapNode)}
        onClose={() => {
          setSelectedReport(null);
          setSelectedMapNode(null);
        }}
        report={selectedReport}
        mapNode={selectedMapNode}
        onConfirmResolution={handleConfirmResolution}
        onViewReport={(reportId) => {
          setSelectedReport(null);
          setSelectedMapNode(null);
          goTo(`/resident/reports/${reportId}`);
        }}
      />

      {/* Voice Reporter Modal */}
      <VoiceReportModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSubmitVoice={handleSubmitVoice}
      />

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onConfirmPhoto={handleConfirmPhoto}
      />

      {/* Location Share Modal */}
      <LocationShareModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        wardName={data.user.ward}
        community={data.user.community}
        onConfirmLocation={(loc) => {
          showToast(`Location tagged: ${loc.address} (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`);
        }}
      />
    </div>
  );
};

export default ResidentDashboard;
