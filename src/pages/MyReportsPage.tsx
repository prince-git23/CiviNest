import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, PlusCircle, ArrowLeft, Radio, CheckCircle2, ShieldCheck, Sparkles, Filter, Loader2 } from 'lucide-react';
import { DashboardDataset, DashboardReportItem } from '../types';
import { getMyReports, ReportData } from '../services/api';
import { convertIssue } from '../services/residentMapData';
import type { CivicIssue } from '../services/geo/geoTypes';
import ReportsSummary from '../components/reports/ReportsSummary';
import ReportFilters from '../components/reports/ReportFilters';
import ReportCard from '../components/reports/ReportCard';
import ImpactSummary from '../components/reports/ImpactSummary';
import RecentMapView from '../components/reports/RecentMapView';
import EmptyState from '../components/reports/EmptyState';
import StillNotFixedModal from '../components/reports/StillNotFixedModal';

interface MyReportsPageProps {
  dashboardData: DashboardDataset;
  onNavigateToCreateSignal: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToMapExplorer?: () => void;
  onUpdateReports?: (updatedReports: DashboardReportItem[]) => void;
  onShowToast?: (message: string) => void;
}

export const MyReportsPage: React.FC<MyReportsPageProps> = ({
  dashboardData,
  onNavigateToCreateSignal,
  onNavigateToDashboard,
  onNavigateToMapExplorer,
  onUpdateReports,
  onShowToast,
}) => {
  const [reports, setReports] = useState<DashboardReportItem[]>(dashboardData.activeReports || []);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reportIssues, setReportIssues] = useState<CivicIssue[]>([]);

  // Load reports from backend on mount
  useEffect(() => {
    const loadReports = async () => {
      setIsLoadingReports(true);
      try {
        const result = await getMyReports({ limit: 50 });
        if (result.reports?.length) {
          setReportIssues(result.reports.map(convertIssue));
        }
        // Convert backend report format to DashboardReportItem format
        const converted: DashboardReportItem[] = result.reports.map((r: ReportData) => ({
          id: r._id,
          reportNumber: r.reportNumber,
          title: r.title,
          category: r.category as any,
          reportedAgo: getTimeAgo(r.createdAt),
          dateString: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: r.status as any,
          location: r.location.address,
          description: r.description,
          upvotes: r.upvotes,
          timeline: r.timeline.map((t) => ({
            status: t.status,
            timestamp: t.timestamp,
            note: t.note,
            actor: t.actor,
          })),
        }));
        if (converted.length > 0) {
          setReports(converted);
        }
      } catch (error: any) {
        // Silently fall back to mock data if backend is unavailable
        console.log('Using local report data:', error.message);
      } finally {
        setIsLoadingReports(false);
      }
    };
    loadReports();
  }, []);

  // Modal State for "Still Not Fixed"
  const [reopenModalData, setReopenModalData] = useState<{
    isOpen: boolean;
    reportId: string;
    reportTitle: string;
  }>({
    isOpen: false,
    reportId: '',
    reportTitle: '',
  });

  // Helper: time ago string
  function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  // Filter and Search Logic
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // 1. Status Filter
      if (currentFilter !== 'all') {
        const normStatus = report.status.toLowerCase();
        if (currentFilter === 'active') {
          const isActive =
            normStatus.includes('in progress') ||
            normStatus.includes('assigned') ||
            normStatus.includes('active');
          if (!isActive) return false;
        } else if (currentFilter === 'awaiting') {
          const isAwaiting =
            normStatus.includes('awaiting') ||
            normStatus.includes('under review') ||
            normStatus.includes('verification');
          if (!isAwaiting) return false;
        } else if (currentFilter === 'in_progress') {
          const isInProgress =
            normStatus.includes('in progress') || normStatus.includes('assigned');
          if (!isInProgress) return false;
        } else if (currentFilter === 'resolved') {
          const isResolved =
            normStatus.includes('resolved') || normStatus.includes('closed');
          if (!isResolved) return false;
        } else if (currentFilter === 'reopened') {
          if (!normStatus.includes('reopened')) return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        if (report.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = report.title.toLowerCase().includes(query);
        const matchesId = report.reportNumber.toLowerCase().includes(query);
        const matchesLoc = report.location.toLowerCase().includes(query);
        const matchesDesc = (report.description || '').toLowerCase().includes(query);

        if (!matchesTitle && !matchesId && !matchesLoc && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [reports, currentFilter, selectedCategory, searchQuery]);

  // Handle Resident Confirm Resolution Flow
  const handleConfirmResolution = (reportId: string) => {
    const updated = reports.map((r) => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'Resolved' as const,
          resolution: {
            ...r.resolution,
            isVerifiedByResident: true,
            residentConfirmed: true,
            verifiedAt: 'Just now',
          },
        };
      }
      return r;
    });

    setReports(updated);
    if (onUpdateReports) onUpdateReports(updated);
    if (onShowToast) {
      onShowToast('✓ Resolution confirmed! +40 Civic Impact points added to your score.');
    }
  };

  // Open Reopen / Still Not Fixed Modal
  const handleOpenReopenModal = (reportId: string) => {
    const target = reports.find((r) => r.id === reportId);
    if (!target) return;

    setReopenModalData({
      isOpen: true,
      reportId,
      reportTitle: target.title,
    });
  };

  // Submit Reopen / Still Not Fixed
  const handleSubmitReopen = (reportId: string, reason: string, photoUrl?: string) => {
    const updated = reports.map((r) => {
      if (r.id === reportId) {
        const newTimeline = [
          ...(r.timeline || []),
          {
            status: 'Reopened by Resident',
            timestamp: 'Just now',
            note: `Resident flagged unresolved issue: "${reason}"`,
            completed: true,
            current: true,
            actor: 'Citizen Prince',
          },
        ];

        return {
          ...r,
          status: 'Reopened' as const,
          timeline: newTimeline,
          resolution: {
            isVerifiedByResident: true,
            residentConfirmed: false,
            reopenedReason: reason,
            verifiedAt: 'Just now',
          },
          evidenceUrls: photoUrl ? [...(r.evidenceUrls || []), photoUrl] : r.evidenceUrls,
        };
      }
      return r;
    });

    setReports(updated);
    if (onUpdateReports) onUpdateReports(updated);
    if (onShowToast) {
      onShowToast('Signal re-escalated to municipal department with High Priority.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#0F172A] pb-20 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Top Header & New Filing CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6 text-left">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                onClick={onNavigateToDashboard}
                className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <span className="text-xs font-mono font-semibold text-[#94A3B8]">/</span>
              <span className="text-xs font-mono font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">
                Personal Civic Center
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              My Reports
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
              Follow the journey of every civic signal you've contributed.
            </p>
          </div>

          {/* New Filing / Report Issue CTA Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToCreateSignal}
              className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <Plus className="w-4 h-4 text-blue-400 group-hover:rotate-90 transition-transform duration-200" />
              <span>New Filing</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <ReportsSummary
          reports={reports}
          activeFilter={currentFilter}
          onSelectFilter={(status) => {
            setCurrentFilter(status);
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
        />

        {/* Filter and Search Bar */}
        <ReportFilters
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          reports={reports}
        />

        {/* Main 8-col / 4-col Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* 8-Column Left: Reports Feed */}
          <div className="lg:col-span-8 space-y-5">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onConfirmResolution={handleConfirmResolution}
                  onRequestReopen={handleOpenReopenModal}
                  onViewCluster={(clusterId) => {
                    if (onNavigateToMapExplorer) onNavigateToMapExplorer();
                  }}
                  onInspectDetails={(r) => navigate(`/resident/reports/${r.id}`)}
                />
              ))
            ) : (
              <EmptyState
                filterType={currentFilter}
                searchQuery={searchQuery}
                onCreateSignal={onNavigateToCreateSignal}
                onClearFilters={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setCurrentFilter('all');
                }}
              />
            )}
          </div>

          {/* 4-Column Right: Sidebar with Impact & Map View */}
          <div className="lg:col-span-4 space-y-6">
            <ImpactSummary
              reports={reports}
              impact={dashboardData.impact}
            />

            <RecentMapView
              nodes={dashboardData.spatialNodes}
              issues={reportIssues}
              onOpenMap={onNavigateToMapExplorer || onNavigateToDashboard}
            />
          </div>
        </div>
      </div>

      {/* Still Not Fixed Modal */}
      <StillNotFixedModal
        isOpen={reopenModalData.isOpen}
        onClose={() => setReopenModalData({ isOpen: false, reportId: '', reportTitle: '' })}
        reportId={reopenModalData.reportId}
        reportTitle={reopenModalData.reportTitle}
        onSubmitReopen={handleSubmitReopen}
      />
    </div>
  );
};

export default MyReportsPage;
