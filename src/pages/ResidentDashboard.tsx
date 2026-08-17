import React, { useState, useCallback, useEffect } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardSidebar, DashboardViewSection } from '../components/dashboard/DashboardSidebar';
import { CivicGreeting } from '../components/dashboard/CivicGreeting';
import { QuickActionBar } from '../components/dashboard/QuickActionBar';
import { CivicSpatialMap } from '../components/dashboard/CivicSpatialMap';
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
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
  initialData = defaultDashboardData,
  initialSection = 'overview',
  initialTab = 'home',
  onNavigateToPlatform,
  onNavigateToHowItWorks,
  onNavigateToAuth,
  onNavigateToCreateSignal,
}) => {
  const [data, setData] = useState<DashboardDataset>(initialData);
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'reports' | 'community' | 'impact'>(initialTab);
  const [activeSection, setActiveSection] = useState<DashboardViewSection>(initialSection);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Filings view search and filter state
  const [reportsSearchQuery, setReportsSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Under Review' | 'Verification' | 'Assigned' | 'Resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'lighting' | 'water' | 'roads' | 'sanitation'>('all');

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
      if (initialSection === 'filings') setActiveTab('reports');
      else if (initialSection === 'map') setActiveTab('explore');
      else if (initialSection === 'discussions') setActiveTab('community');
      else if (initialSection === 'impact') setActiveTab('impact');
      else setActiveTab('home');
    }
  }, [initialSection]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      if (initialTab === 'reports') setActiveSection('filings');
      else if (initialTab === 'explore') setActiveSection('map');
      else if (initialTab === 'community') setActiveSection('discussions');
      else if (initialTab === 'impact') setActiveSection('impact');
      else setActiveSection('overview');
    }
  }, [initialTab]);

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

  // Filtered reports for My Filings view
  const filteredReports = data.activeReports.filter((report) => {
    const matchesSearch =
      !reportsSearchQuery.trim() ||
      report.title.toLowerCase().includes(reportsSearchQuery.toLowerCase()) ||
      report.reportNumber.toLowerCase().includes(reportsSearchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(reportsSearchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(reportsSearchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lighting':
        return <Lightbulb className="w-4 h-4 text-[#F59E0B]" />;
      case 'water':
        return <Droplet className="w-4 h-4 text-[#2563EB]" />;
      case 'roads':
        return <SlidersHorizontal className="w-4 h-4 text-[#4B5563]" />;
      case 'sanitation':
      default:
        return <Trash2 className="w-4 h-4 text-[#EF4444]" />;
    }
  };

  const getStatusBadge = (status: DashboardReportItem['status']) => {
    switch (status) {
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-medium tracking-wide uppercase bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
            Under Review
          </span>
        );
      case 'Verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-semibold tracking-wide uppercase bg-blue-50 text-[#2563EB] border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            Verification
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-medium tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Resolved
          </span>
        );
      case 'Assigned':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-medium tracking-wide uppercase bg-purple-50 text-purple-700 border border-purple-100">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            Assigned
          </span>
        );
    }
  };

  // Handle Tab Switch
  const handleSelectTab = (tab: 'home' | 'explore' | 'reports' | 'community' | 'impact') => {
    setActiveTab(tab);
    if (tab === 'explore') setActiveSection('map');
    else if (tab === 'reports') setActiveSection('filings');
    else if (tab === 'community') setActiveSection('discussions');
    else if (tab === 'impact') setActiveSection('impact');
    else setActiveSection('overview');
  };

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

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111827] font-sans antialiased flex flex-col selection:bg-[#0F1E36] selection:text-white">
      {/* 1. Dashboard Top Header */}
      <DashboardHeader
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        userName={data.user.name}
        onOpenReportModal={onNavigateToCreateSignal || (() => setIsReportModalOpen(true))}
        onNavigateLanding={onNavigateToPlatform}
      />

      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden px-4 py-2 bg-[#F3F4F6] border-b border-[#E5E7EB] flex items-center justify-between">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold text-[#374151] px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB]"
        >
          <Menu className="w-4 h-4" />
          <span className="capitalize">{activeSection} Menu</span>
        </button>
        <span className="text-[11px] font-mono text-[#6B7280]">
          {data.user.ward} · {data.user.community}
        </span>
      </div>

      {/* Main Dashboard Layout Shell */}
      <div className="max-w-[1600px] mx-auto w-full flex flex-1">
        {/* 2. Left Sticky Sidebar (Desktop) */}
        <DashboardSidebar
          activeSection={activeSection}
          onSelectSection={(sec) => {
            setActiveSection(sec);
            if (sec === 'overview') setActiveTab('home');
            else if (sec === 'map') setActiveTab('explore');
            else if (sec === 'filings') setActiveTab('reports');
            else if (sec === 'discussions') setActiveTab('community');
            else if (sec === 'impact') setActiveTab('impact');
          }}
          localityName={data.user.community}
          wardName={data.user.ward}
        />

        {/* Mobile Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-black/40 backdrop-blur-sm flex">
            <div className="w-72 bg-[#FBFBFA] h-full shadow-2xl relative">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
              <DashboardSidebar
                activeSection={activeSection}
                onSelectSection={(sec) => {
                  setActiveSection(sec);
                  if (sec === 'overview') setActiveTab('home');
                  else if (sec === 'map') setActiveTab('explore');
                  else if (sec === 'filings') setActiveTab('reports');
                  else if (sec === 'discussions') setActiveTab('community');
                  else if (sec === 'impact') setActiveTab('impact');
                }}
                localityName={data.user.community}
                wardName={data.user.ward}
                isMobileDrawer={true}
                onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
              />
            </div>
            <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
          </div>
        )}

        {/* 3. Main Central Content Scrollable Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeSection === 'filings' ? (
            /* DEDICATED MY REPORTS / FILINGS VIEW */
            <div className="space-y-6">
              {/* Header & Quick stats */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                    <ClipboardList className="w-4 h-4" />
                    <span>My Filings & Reports</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight font-serif">
                    Civic Signals Tracked
                  </h1>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Direct telemetry, department dispatch status, and verification quorums for your ward.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSection('overview')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#4B5563] bg-white border border-[#E5E7EB] hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Back to Overview
                  </button>
                  <button
                    type="button"
                    onClick={onNavigateToCreateSignal || (() => setIsReportModalOpen(true))}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Signal</span>
                  </button>
                </div>
              </div>

              {/* Stats overview banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs">
                  <p className="text-[11px] font-semibold text-[#6B7280]">Total Filed</p>
                  <p className="text-2xl font-extrabold text-[#0F1E36] mt-1 font-mono">
                    {data.activeReports.length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 shadow-2xs">
                  <p className="text-[11px] font-semibold text-blue-700">Verification Quorum</p>
                  <p className="text-2xl font-extrabold text-blue-600 mt-1 font-mono">
                    {data.activeReports.filter((r) => r.status === 'Verification').length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 shadow-2xs">
                  <p className="text-[11px] font-semibold text-emerald-700">Resolved</p>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
                    {data.activeReports.filter((r) => r.status === 'Resolved').length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs">
                  <p className="text-[11px] font-semibold text-[#6B7280]">Impact Earned</p>
                  <p className="text-2xl font-extrabold text-[#0F1E36] mt-1 font-mono">
                    +{data.impact.points} pts
                  </p>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search reports by title, #CV id, or landmark..."
                      value={reportsSearchQuery}
                      onChange={(e) => setReportsSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs bg-[#FBFBFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[#111827]"
                    />
                    {reportsSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setReportsSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F3F4F6]">
                  {/* Status Filters */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-[#6B7280] mr-1">Status:</span>
                    {(['all', 'Verification', 'Assigned', 'Under Review', 'Resolved'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          statusFilter === st
                            ? 'bg-[#0F1E36] text-white'
                            : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-gray-200'
                        }`}
                      >
                        {st === 'all' ? 'All Statuses' : st}
                      </button>
                    ))}
                  </div>

                  {/* Category Filters */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-[#6B7280] mr-1">Category:</span>
                    {(['all', 'lighting', 'water', 'roads', 'sanitation'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                          categoryFilter === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-gray-200'
                        }`}
                      >
                        {cat === 'all' ? 'All Categories' : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reports List */}
              <div className="space-y-3">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="p-5 rounded-2xl bg-white border border-[#E5E7EB] hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                    >
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 shrink-0">
                          {getCategoryIcon(report.category)}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#6B7280]">
                              {report.reportNumber}
                            </span>
                            {getStatusBadge(report.status)}
                            <span className="text-xs text-[#9CA3AF]">•</span>
                            <span className="text-xs text-[#6B7280] flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {report.timeAgo}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-[#0F1E36] group-hover:text-blue-600 transition-colors">
                            {report.title}
                          </h3>
                          <p className="text-xs text-[#6B7280] line-clamp-2">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-[#6B7280] pt-1">
                            <MapPin className="w-3 h-3 text-[#9CA3AF]" />
                            <span>{report.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#F3F4F6]">
                        <div className="flex items-center gap-2 text-xs font-mono text-[#6B7280] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{report.upvotes} Confirmations</span>
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center rounded-2xl bg-white border border-[#E5E7EB]">
                    <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-[#0F1E36]">No reports match your filters</h3>
                    <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
                      Try clearing your search query or selecting a different status filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setReportsSearchQuery('');
                        setStatusFilter('all');
                        setCategoryFilter('all');
                      }}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* DEFAULT / OVERVIEW DASHBOARD VIEW */
            <>
              {/* A. Civic Greeting & Local Civic Health Card */}
              <CivicGreeting
                userName={data.user.name}
                city={data.user.city}
                ward={data.user.ward}
                community={data.user.community}
                civicHealth={data.civicHealth}
                onExploreHealth={() => setActiveSection('map')}
              />

              {/* B. Quick Action Bar */}
              <QuickActionBar
                onReportIssue={onNavigateToCreateSignal || (() => setIsReportModalOpen(true))}
                onAddPhoto={() => setIsPhotoModalOpen(true)}
                onUseVoice={() => setIsVoiceModalOpen(true)}
                onShareLocation={() => setIsLocationModalOpen(true)}
              />

              {/* C. Spatial Intelligence 3D Map */}
              <section className="relative">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Left Column */}
                <div className="space-y-6 flex flex-col">
                  <ActiveReports
                    reports={data.activeReports}
                    onSelectReport={(report) => {
                      setSelectedReport(report);
                      setSelectedMapNode(null);
                    }}
                    onViewAll={() => setActiveSection('filings')}
                  />

                  <AIInsightCard
                    insight={data.aiInsight}
                    onExplorePattern={() => {
                      const node = data.spatialNodes.find((n) => n.category === 'lighting');
                      if (node) setSelectedMapNode(node);
                      showToast('Focusing spatial map on street lighting signal cluster.');
                    }}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-6 flex flex-col">
                  <CivicImpactCard
                    impact={data.impact}
                    onOpenDetails={() => {
                      showToast('Impact score is based on validated signals, verification quorums, and prompt feedback.');
                    }}
                  />

                  <CommunityPulse data={data.communityPulse} />
                </div>
              </div>

              {/* E. Trending Nearby Carousel */}
              <TrendingNearby
                issues={data.nearbyIssues}
                onSupportIssue={handleSupportIssue}
                onViewData={(issue) => {
                  showToast(`Analyzing telemetry trends for: ${issue.title}`);
                }}
              />
            </>
          )}
        </main>
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
