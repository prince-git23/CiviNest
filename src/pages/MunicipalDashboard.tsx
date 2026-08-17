import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { AdminSidebar, AdminNavTab } from '../components/municipal/AdminSidebar';
import { AdminTopbar } from '../components/municipal/AdminTopbar';
import { OperationalMetrics } from '../components/municipal/OperationalMetrics';
import { CriticalIssueTriage } from '../components/municipal/CriticalIssueTriage';
import { ActiveClusters } from '../components/municipal/ActiveClusters';
import { DepartmentWorkload } from '../components/municipal/DepartmentWorkload';
import { SpatialIntelligenceMini } from '../components/municipal/SpatialIntelligenceMini';
import { AssignTeamModal } from '../components/municipal/AssignTeamModal';
import { IssueTelemetryModal } from '../components/municipal/IssueTelemetryModal';
import { AdminFooter } from '../components/municipal/AdminFooter';
import { municipalService, CityAssetSearchResult } from '../services/municipalService';
import {
  MunicipalDashboardDataset,
  MunicipalIssueItem,
  MunicipalClusterSummary,
  MunicipalDepartmentWorkload,
} from '../types';

interface MunicipalDashboardProps {
  onNavigateToPlatform?: () => void;
  onNavigateToHowItWorks?: () => void;
  onNavigateToCityMap?: () => void;
  onNavigateToResidentDashboard?: () => void;
  onShowToast?: (message: string) => void;
  userName?: string;
  userRole?: string;
}

export const MunicipalDashboard: React.FC<MunicipalDashboardProps> = ({
  onNavigateToPlatform,
  onNavigateToHowItWorks,
  onNavigateToCityMap,
  onNavigateToResidentDashboard,
  onShowToast,
  userName = 'Admin User',
  userRole = 'Municipal Director',
}) => {
  const [data, setData] = useState<MunicipalDashboardDataset>(() => municipalService.getDashboardData());
  const [activeNavTab, setActiveNavTab] = useState<AdminNavTab>('dashboard');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeFlagFilter, setActiveFlagFilter] = useState<'all' | 'critical' | 'lowConfidence' | 'overSla' | 'reopened'>('all');

  // Modals state
  const [selectedIssueForAssign, setSelectedIssueForAssign] = useState<MunicipalIssueItem | null>(null);
  const [selectedIssueForTelemetry, setSelectedIssueForTelemetry] = useState<MunicipalIssueItem | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);

  const mainContainerRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animation Sequence
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !mainContainerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.from('.dashboard-topbar-anim', {
        y: -20,
        opacity: 0,
        duration: 0.4,
      })
        .from(
          '.dashboard-metrics-anim',
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.2'
        )
        .from(
          '.dashboard-triage-anim',
          {
            y: 24,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.3'
        )
        .from(
          '.dashboard-rail-anim',
          {
            x: 24,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.4'
        );
    }, mainContainerRef);

    return () => ctx.revert();
  }, []);

  const handleSelectNavTab = (tab: AdminNavTab) => {
    setActiveNavTab(tab);
    if (tab === 'city-map' && onNavigateToCityMap) {
      onNavigateToCityMap();
    } else if (tab === 'analytics') {
      const el = document.getElementById('analytics-rail');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'departments') {
      const el = document.getElementById('department-workload-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAssignTeam = (issue: MunicipalIssueItem) => {
    setSelectedIssueForAssign(issue);
    setIsAssignModalOpen(true);
  };

  const handleViewTelemetry = (issue: MunicipalIssueItem) => {
    setSelectedIssueForTelemetry(issue);
    setIsTelemetryModalOpen(true);
  };

  const handleConfirmDispatch = (
    issueId: string,
    teamData: {
      teamName: string;
      leadEngineer: string;
      personnelCount: number;
      contactRadio: string;
      notes?: string;
    }
  ) => {
    const res = municipalService.assignTeamToIssue(issueId, teamData);
    if (res.success) {
      setData(municipalService.getDashboardData());
      if (onShowToast) {
        onShowToast(
          `Dispatched ${teamData.teamName} for ${res.updatedIssue?.issueCode}! (${teamData.leadEngineer}, radio: ${teamData.contactRadio})`
        );
      }
    }
  };

  const handleSelectSearchResult = (result: CityAssetSearchResult) => {
    if (result.type === 'issue') {
      const found = data.issues.find((i) => i.id === result.id || i.issueCode === result.code);
      if (found) {
        handleViewTelemetry(found);
      }
    } else if (result.type === 'cluster' && onNavigateToCityMap) {
      onNavigateToCityMap();
    } else if (onShowToast) {
      onShowToast(`Selected ${result.title} (${result.code})`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col selection:bg-[#0F1E36] selection:text-white font-sans antialiased text-[#111827]">
      {/* Mobile Drawer (Collapsible) */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-72 h-full animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar
              activeTab={activeNavTab}
              onSelectTab={handleSelectNavTab}
              onSwitchToCitizenView={onNavigateToResidentDashboard}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full">
        {/* Desktop Fixed Left Navigation */}
        <AdminSidebar
          activeTab={activeNavTab}
          onSelectTab={handleSelectNavTab}
          onSwitchToCitizenView={onNavigateToResidentDashboard}
        />

        {/* Center/Right Main Scrollable Content */}
        <div className="flex-1 flex flex-col min-w-0" ref={mainContainerRef}>
          {/* Top Command Bar */}
          <div className="dashboard-topbar-anim">
            <AdminTopbar
              systemStatus={data.systemStatus}
              userName={userName}
              userRole={userRole}
              userOrganization="Central HQ"
              onOpenMobileMenu={() => setMobileDrawerOpen(true)}
              onSelectSearchResult={handleSelectSearchResult}
              onSignOut={onNavigateToPlatform}
              onSwitchRole={onNavigateToResidentDashboard}
            />
          </div>

          {/* Main Dashboard Body Container */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-7 max-w-7xl w-full mx-auto">
            {/* 1. Operational Metrics Row (4 Cards) */}
            <div className="dashboard-metrics-anim">
              <OperationalMetrics
                metrics={data.metrics}
                activeFilter={activeFlagFilter}
                onSelectFlagFilter={(flag) => setActiveFlagFilter(flag)}
              />
            </div>

            {/* 2. Main Operations Grid (8/4 Split on Desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
              {/* Left 8 Cols: Critical Issue Triage Feed */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-4 dashboard-triage-anim">
                <CriticalIssueTriage
                  issues={data.issues}
                  activeFlagFilter={activeFlagFilter}
                  onClearFlagFilter={() => setActiveFlagFilter('all')}
                  onAssignTeam={handleAssignTeam}
                  onViewTelemetry={handleViewTelemetry}
                />
              </div>

              {/* Right 4 Cols: Analytics Rail */}
              <div
                id="analytics-rail"
                className="lg:col-span-5 xl:col-span-4 space-y-6 dashboard-rail-anim"
              >
                {/* Active Clusters Visualizer */}
                <ActiveClusters
                  clusters={data.clusters}
                  onNavigateToMap={onNavigateToCityMap}
                  onSelectCluster={(cluster) => {
                    if (onNavigateToCityMap) onNavigateToCityMap();
                  }}
                />

                {/* Department Workload Chart */}
                <div id="department-workload-section">
                  <DepartmentWorkload
                    workloads={data.departmentWorkloads}
                    onSelectDepartment={(dept) => {
                      if (onShowToast) {
                        onShowToast(
                          `${dept.department}: ${dept.activeCases} active work orders (${dept.utilizationPercentage}% capacity).`
                        );
                      }
                    }}
                  />
                </div>

                {/* 3D Spatial Intelligence Mini-Radar */}
                <SpatialIntelligenceMini
                  clusters={data.clusters}
                  onExpandMap={onNavigateToCityMap}
                />
              </div>
            </div>
          </main>

          {/* Municipal Command Authority Footer */}
          <AdminFooter
            onNavigateToPlatform={onNavigateToPlatform}
            onNavigateToHowItWorks={onNavigateToHowItWorks}
          />
        </div>
      </div>

      {/* Modals */}
      <AssignTeamModal
        isOpen={isAssignModalOpen}
        issue={selectedIssueForAssign}
        onClose={() => setIsAssignModalOpen(false)}
        onConfirmDispatch={handleConfirmDispatch}
      />

      <IssueTelemetryModal
        isOpen={isTelemetryModalOpen}
        issue={selectedIssueForTelemetry}
        onClose={() => setIsTelemetryModalOpen(false)}
        onAssignTeam={(issue) => {
          setIsTelemetryModalOpen(false);
          handleAssignTeam(issue);
        }}
      />
    </div>
  );
};

export default MunicipalDashboard;
