import React, { useState } from 'react';
import PublicNavbar from './components/navigation/PublicNavbar';
import WorkspaceHeader, { WorkspaceTabId } from './components/navigation/WorkspaceHeader';
import HeroSection from './components/hero/HeroSection';
import NoiseToContextSection from './components/sections/NoiseToContextSection';
import ProcessSection from './components/sections/ProcessSection';
import SpatialIntelligenceSection from './components/sections/SpatialIntelligenceSection';
import StakeholdersSection from './components/sections/StakeholdersSection';
import TrustSection from './components/sections/TrustSection';
import Footer from './components/Footer';
import LiveReportSimulatorModal from './components/sections/LiveReportSimulatorModal';
import HowItWorksPage from './pages/HowItWorksPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import ResidentDashboard from './pages/ResidentDashboard';
import CreateCivicSignalPage from './pages/CreateCivicSignalPage';
import { SignalAnalysisPage } from './pages/SignalAnalysisPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { ResolutionVerificationPage } from './pages/ResolutionVerificationPage';
import { ClusterDetectionPage } from './pages/ClusterDetectionPage';
import { MapExplorerPage } from './pages/MapExplorerPage';
import { MunicipalDashboard } from './pages/MunicipalDashboard';
import { DiscussionsPage } from './pages/DiscussionsPage';
import { ImpactScorePage } from './pages/ImpactScorePage';
import { ProfileOptimizationPage } from './pages/ProfileOptimizationPage';
import { OnboardingFormData, UserRoleConfig, DashboardReportItem, ResolutionVerificationInfo } from './types';
import { defaultDashboardData, buildDashboardFromOnboarding, DashboardDataset } from './data/dashboardData';
import { CivicSignalSubmission } from './services/signalAnalysisService';
import { ClusterConfirmationResponse, defaultStreetLightingCluster, CivicClusterData } from './services/clusterService';
import { DashboardSidebar, DashboardViewSection } from './components/dashboard/DashboardSidebar';

export type AppPageId =
  | 'platform'
  | 'how-it-works'
  | 'auth'
  | 'onboarding'
  | 'dashboard'
  | 'municipal'
  | 'create-signal'
  | 'signal-analysis'
  | 'my-reports'
  | 'verification'
  | 'cluster-detection'
  | 'map-explorer'
  | 'discussions'
  | 'impact-score'
  | 'profile-optimization';

export function App() {
  // CRITICAL REQUIREMENT: Application entry MUST be the public landing platform
  const [currentPage, setCurrentPage] = useState<AppPageId>('platform');
  const [dashboardActiveSection, setDashboardActiveSection] = useState<DashboardViewSection>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardDataset>(defaultDashboardData);
  const [currentSignalDraft, setCurrentSignalDraft] = useState<Partial<CivicSignalSubmission> | null>(null);
  const [activeCluster, setActiveCluster] = useState<CivicClusterData>(defaultStreetLightingCluster);
  const [selectedVerificationReport, setSelectedVerificationReport] = useState<DashboardReportItem | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleSelectPage = (page: AppPageId) => {
    if (page === 'dashboard') {
      setDashboardActiveSection('overview');
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToReports = () => {
    setCurrentPage('my-reports');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToMapExplorer = () => {
    setCurrentPage('map-explorer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectWorkspaceTab = (tab: WorkspaceTabId) => {
    if (tab === 'home') {
      setDashboardActiveSection('overview');
      setCurrentPage('dashboard');
    } else if (tab === 'explore') {
      setCurrentPage('map-explorer');
    } else if (tab === 'reports') {
      setCurrentPage('my-reports');
    } else if (tab === 'community') {
      setCurrentPage('discussions');
    } else if (tab === 'impact') {
      setCurrentPage('impact-score');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClusterConfirmed = (response: ClusterConfirmationResponse) => {
    const newReport: DashboardReportItem = {
      id: response.confirmationId,
      reportNumber: response.cluster.clusterCode,
      title: `${response.cluster.issueTitle} (Confirmed in Cluster)`,
      category: response.cluster.categoryKey,
      location: `${response.cluster.location.sector}, ${response.cluster.location.ward}`,
      reportedAgo: 'Just now',
      dateString: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'In Progress',
      severity: 'high',
      upvotes: response.updatedConfirmationCount,
      description: response.cluster.description,
      cluster: {
        id: response.cluster.id,
        category: response.cluster.categoryKey,
        title: response.cluster.issueTitle,
        reportCount: response.cluster.reportCount,
        confirmationCount: response.updatedConfirmationCount,
        location: `${response.cluster.location.sector}, ${response.cluster.location.ward}`,
        severity: response.cluster.severity,
      },
    };

    setDashboardData((prev) => ({
      ...prev,
      activeReports: [newReport, ...prev.activeReports],
      impact: {
        ...prev.impact,
        points: prev.impact.points + response.pointsAwarded,
        verifiedSignals: prev.impact.verifiedSignals + 1,
      },
    }));

    showToast(`Signal strengthened for ${response.cluster.clusterCode}! (+${response.pointsAwarded} PTS)`);
  };

  const handleOpenVerificationPage = (report?: DashboardReportItem) => {
    if (report) {
      setSelectedVerificationReport(report);
    } else {
      const found = dashboardData.activeReports.find(
        (r) => r.status === 'Verification' || r.status === 'Resolved' || r.status === 'In Progress'
      );
      setSelectedVerificationReport(found || dashboardData.activeReports[0] || null);
    }
    setCurrentPage('verification');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerificationCompleted = (reportId: string, resolution: ResolutionVerificationInfo) => {
    setDashboardData((prev) => ({
      ...prev,
      activeReports: prev.activeReports.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: resolution.residentConfirmed ? ('Resolved' as const) : ('Reopened' as const),
            resolution,
          };
        }
        return r;
      }),
      impact: {
        ...prev.impact,
        points: resolution.residentConfirmed ? prev.impact.points + 50 : prev.impact.points + 15,
        verifiedSignals: prev.impact.verifiedSignals + 1,
      },
    }));
  };

  const handleUpdateReports = (updatedReports: DashboardReportItem[]) => {
    setDashboardData((prev) => ({
      ...prev,
      activeReports: updatedReports,
    }));
  };

  const handleLoginSuccess = (role: UserRoleConfig) => {
    showToast(`Authenticated as ${role.title} (${role.label}) — Civic Intelligence Active`);
    setDashboardData((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        role: role.title,
      },
    }));
    setTimeout(() => {
      if (role.id === 'municipal_officer' || role.id === 'admin') {
        setCurrentPage('municipal');
      } else {
        setCurrentPage('dashboard');
      }
    }, 800);
  };

  const handleOnboardingComplete = (data: OnboardingFormData) => {
    const citizenName = data.profile.fullName.trim() || 'Prince';
    const personalized = buildDashboardFromOnboarding(data);
    setDashboardData(personalized);
    showToast(`Civic node initialized for ${citizenName} in ${data.location.ward || 'Dharampeth'}!`);
    setTimeout(() => {
      setCurrentPage('dashboard');
    }, 800);
  };

  const handleDraftToAnalysis = (draft: CivicSignalSubmission) => {
    setCurrentSignalDraft(draft);
    setCurrentPage('signal-analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignalSubmissionCompleted = (submission: CivicSignalSubmission) => {
    const newReport: DashboardReportItem = {
      id: submission.id,
      reportNumber: submission.reportNumber,
      title: submission.analysis?.subcategory || submission.description.slice(0, 36) + '...',
      category: (submission.analysis?.category || 'roads') as any,
      reportedAgo: 'Just now',
      dateString: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Under Review',
      location: submission.location.address,
      description: submission.description,
      upvotes: 1,
      timeline: [
        {
          status: 'Report Lodged',
          timestamp: 'Just now',
          note: `Ingested via Civic Signal composer with ${submission.analysis?.confidence || 95}% confidence.`,
        },
      ],
    };

    setDashboardData((prev) => ({
      ...prev,
      activeReports: [newReport, ...prev.activeReports],
      impact: {
        ...prev.impact,
        points: prev.impact.points + 25,
        reportsSubmitted: prev.impact.reportsSubmitted + 1,
        verifiedSignals: prev.impact.verifiedSignals + 1,
      },
    }));

    showToast(`Signal ${submission.reportNumber} ingested & queued for municipal dispatch! (+25 PTS)`);
    setCurrentSignalDraft(null);
    setCurrentPage('my-reports');
  };

  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'process' || sectionId === 'how-it-works') {
      handleSelectPage('how-it-works');
      return;
    }

    if (currentPage !== 'platform') {
      setCurrentPage('platform');
      setTimeout(() => {
        const elem = document.getElementById(sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignalAdded = (text: string) => {
    showToast(`Signal ingested & clustered: "${text.slice(0, 32)}..."`);
  };

  // Determine current active workspace tab
  const getActiveWorkspaceTab = (): WorkspaceTabId => {
    if (currentPage === 'map-explorer') return 'explore';
    if (currentPage === 'my-reports') return 'reports';
    if (currentPage === 'discussions') return 'community';
    if (currentPage === 'impact-score') return 'impact';
    if (currentPage === 'profile-optimization') return 'profile';
    if (currentPage === 'dashboard') {
      if (dashboardActiveSection === 'map') return 'explore';
      if (dashboardActiveSection === 'filings') return 'reports';
      if (dashboardActiveSection === 'discussions') return 'community';
      if (dashboardActiveSection === 'impact') return 'impact';
      return 'home';
    }
    return 'home';
  };

  // Convert current page to sidebar section
  const getActiveSidebarSection = (): DashboardViewSection => {
    if (currentPage === 'dashboard') return 'overview';
    if (currentPage === 'map-explorer') return 'map';
    if (currentPage === 'my-reports') return 'filings';
    if (currentPage === 'discussions') return 'discussions';
    if (currentPage === 'impact-score') return 'impact';
    if (currentPage === 'profile-optimization') return 'profile';
    return 'overview';
  };

  const handleSelectSidebarSection = (section: DashboardViewSection) => {
    if (section === 'overview') {
      setDashboardActiveSection('overview');
      setCurrentPage('dashboard');
    } else if (section === 'map') {
      setCurrentPage('map-explorer');
    } else if (section === 'filings') {
      setCurrentPage('my-reports');
    } else if (section === 'discussions') {
      setCurrentPage('discussions');
    } else if (section === 'impact') {
      setCurrentPage('impact-score');
    } else if (section === 'profile') {
      setCurrentPage('profile-optimization');
    }
  };

  const isPublicContext = currentPage === 'platform' || currentPage === 'how-it-works';
  const isWorkspaceContext = currentPage === 'dashboard' || currentPage === 'my-reports' || currentPage === 'map-explorer' || currentPage === 'discussions' || currentPage === 'impact-score' || currentPage === 'profile-optimization';

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111827] flex flex-col selection:bg-[#0F1E36] selection:text-white font-sans">
      {/* 1. PUBLIC NAVIGATION CONTEXT (Only on Platform & How It Works) */}
      {isPublicContext && (
        <PublicNavbar
          currentPage={currentPage === 'how-it-works' ? 'how-it-works' : 'platform'}
          onNavigateLanding={() => {
            setCurrentPage('platform');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateSection={handleNavigateSection}
          onNavigateHowItWorks={() => {
            setCurrentPage('how-it-works');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateSignIn={() => {
            setCurrentPage('auth');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateGetStarted={() => {
            setCurrentPage('onboarding');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* 2. RESIDENT WORKSPACE NAVIGATION CONTEXT (Rendered on all Workspace Pages) */}
      {isWorkspaceContext && (
        <WorkspaceHeader
          activeTab={getActiveWorkspaceTab() as any}
          onSelectTab={handleSelectWorkspaceTab}
          userName={dashboardData.user.name}
          userWard={dashboardData.user.ward}
          impactPoints={dashboardData.impact.points}
          onOpenReportModal={() => setReportModalOpen(true)}
          onNavigateToCreateSignal={() => setCurrentPage('create-signal')}
          onNavigateLanding={() => {
            setCurrentPage('platform');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateToMunicipal={() => {
            handleSelectPage('municipal');
          }}
          onNavigateToProfile={() => {
            setCurrentPage('profile-optimization');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSignOut={() => {
            setCurrentPage('platform');
            showToast('Signed out of resident workspace.');
          }}
        />
      )}

      {/* 3. MAIN PAGE CONTENT ROUTER */}
      {isWorkspaceContext ? (
        <div className="flex flex-col flex-1">
          {/* Mobile Sidebar Toggle Button */}
          <div className="lg:hidden px-4 py-2 bg-[#F3F4F6] border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-[#374151] px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB]"
            >
              <span className="capitalize">{getActiveSidebarSection()} Menu</span>
            </button>
            <span className="text-[11px] font-mono text-[#6B7280]">
              {dashboardData.user.ward} · {dashboardData.user.community}
            </span>
          </div>

          <div className="max-w-[1600px] mx-auto w-full flex flex-1">
            {/* Desktop Persistent Sidebar */}
            <DashboardSidebar
              activeSection={getActiveSidebarSection()}
              onSelectSection={handleSelectSidebarSection}
              localityName={dashboardData.user.community}
              wardName={dashboardData.user.ward}
            />

            {/* Mobile Drawer */}
            {mobileDrawerOpen && (
              <div className="fixed inset-0 z-50 lg:hidden bg-black/40 backdrop-blur-sm flex">
                <div className="w-72 bg-[#FBFBFA] h-full shadow-2xl relative">
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200"
                  >
                    X
                  </button>
                  <DashboardSidebar
                    activeSection={getActiveSidebarSection()}
                    onSelectSection={(sec) => {
                      handleSelectSidebarSection(sec);
                      setMobileDrawerOpen(false);
                    }}
                    localityName={dashboardData.user.community}
                    wardName={dashboardData.user.ward}
                    isMobileDrawer={true}
                    onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
                  />
                </div>
                <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
              </div>
            )}

            <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
              {currentPage === 'dashboard' ? (
                <ResidentDashboard
                  initialData={dashboardData}
                  onNavigateToPlatform={() => handleSelectPage('platform')}
                  onNavigateToHowItWorks={() => handleSelectPage('how-it-works')}
                  onNavigateToAuth={() => handleSelectPage('auth')}
                  onNavigateToCreateSignal={() => handleSelectPage('create-signal')}
                  onNavigateToMunicipal={() => handleSelectPage('municipal')}
                />
              ) : currentPage === 'map-explorer' ? (
                <MapExplorerPage
                  userContext={dashboardData.user}
                  onOpenReportModal={() => setReportModalOpen(true)}
                  onNavigate={(page) => handleSelectPage(page)}
                />
              ) : currentPage === 'my-reports' ? (
                <MyReportsPage
                  dashboardData={dashboardData}
                  onNavigateToCreateSignal={() => setCurrentPage('create-signal')}
                  onNavigateToDashboard={() => {
                    handleSelectPage('dashboard');
                  }}
                  onNavigateToMapExplorer={handleNavigateToMapExplorer}
                  onOpenVerificationPage={handleOpenVerificationPage}
                  onUpdateReports={handleUpdateReports}
                  onShowToast={showToast}
                />
              ) : currentPage === 'discussions' ? (
                <DiscussionsPage
                  userContext={dashboardData.user}
                  onNavigateToIssue={(issueId) => {
                    showToast(`Opening issue ${issueId}...`);
                  }}
                  onOpenReportModal={() => setReportModalOpen(true)}
                />
              ) : currentPage === 'impact-score' ? (
                <ImpactScorePage
                  userContext={dashboardData.user}
                  onNavigateToReports={() => setCurrentPage('my-reports')}
                  onNavigateToMap={() => setCurrentPage('map-explorer')}
                />
              ) : currentPage === 'profile-optimization' ? (
                <ProfileOptimizationPage
                  userContext={dashboardData.user}
                />
              ) : null}
            </main>
          </div>
        </div>
      ) : (
        currentPage === 'cluster-detection' ? (
          <ClusterDetectionPage
            initialCluster={activeCluster}
            userData={dashboardData.user}
            onSelectTab={(tab) => {
              if (tab === 'reports') setCurrentPage('my-reports');
              else if (tab === 'home') setCurrentPage('dashboard');
              else if (tab === 'explore') setCurrentPage('map-explorer');
            }}
            onNavigateSection={(section) => {
              setDashboardActiveSection(section);
              setCurrentPage('dashboard');
            }}
            onNavigateToPlatform={() => handleSelectPage('platform')}
            onNavigateToReports={handleNavigateToReports}
            onNavigateToCreateSignal={() => setCurrentPage('create-signal')}
            onNavigateToAnalysis={() => setCurrentPage('signal-analysis')}
            onBackToDashboard={() => {
              setDashboardActiveSection('overview');
              setCurrentPage('dashboard');
            }}
            onClusterConfirmed={handleClusterConfirmed}
            onOpenReportModal={() => setReportModalOpen(true)}
          />
        ) : currentPage === 'verification' ? (
          <ResolutionVerificationPage
            dashboardData={dashboardData}
            selectedReport={selectedVerificationReport}
            onNavigateBack={handleNavigateToReports}
            onNavigateToDashboard={() => {
              setDashboardActiveSection('overview');
              setCurrentPage('dashboard');
            }}
            onNavigateToMapExplorer={handleNavigateToMapExplorer}
            onVerificationCompleted={handleVerificationCompleted}
            onShowToast={showToast}
          />
        ) : currentPage === 'signal-analysis' ? (
          <SignalAnalysisPage
            initialSubmission={currentSignalDraft || undefined}
            onEditReport={() => setCurrentPage('create-signal')}
            onConfirmAndSubmit={handleSignalSubmissionCompleted}
            onNavigateToDashboard={() => {
              setDashboardActiveSection('overview');
              setCurrentPage('dashboard');
            }}
            onNavigateToExplore={() => setCurrentPage('map-explorer')}
            onNavigateToReports={handleNavigateToReports}
            onNavigateToCommunity={() => {
              setDashboardActiveSection('discussions');
              setCurrentPage('dashboard');
            }}
            onNavigateToImpact={() => {
              setDashboardActiveSection('impact');
              setCurrentPage('dashboard');
            }}
          />
        ) : currentPage === 'create-signal' ? (
          <CreateCivicSignalPage
            onBackToDashboard={() => handleSelectPage('dashboard')}
            onNavigateToPlatform={() => handleSelectPage('platform')}
            onNavigateToAuth={() => handleSelectPage('auth')}
            onNavigateToAnalysis={handleDraftToAnalysis}
            onSignalSubmitted={handleSignalSubmissionCompleted}
            initialDraft={currentSignalDraft || undefined}
            initialLocation={{
              address: `${dashboardData.user.community}, ${dashboardData.user.city}`,
              ward: dashboardData.user.ward,
              city: dashboardData.user.city,
              accuracy: 'Approx. 15m accuracy',
              coordinates: { lat: 21.1458, lng: 79.0882 },
            }}
          />
        ) : currentPage === 'municipal' ? (
          <MunicipalDashboard
            onNavigateToPlatform={() => handleSelectPage('platform')}
            onNavigateToHowItWorks={() => handleSelectPage('how-it-works')}
            onNavigateToCityMap={handleNavigateToMapExplorer}
            onNavigateToResidentDashboard={() => handleSelectPage('dashboard')}
            onShowToast={showToast}
            userName={dashboardData.user.name || 'Admin User'}
            userRole={dashboardData.user.role || 'Municipal Director'}
          />
        ) : currentPage === 'onboarding' ? (
          <OnboardingPage
            onBackToPlatform={() => handleSelectPage('platform')}
            onComplete={handleOnboardingComplete}
          />
        ) : currentPage === 'auth' ? (
          <AuthPage
            onBackToCiviNest={() => handleSelectPage('platform')}
            onNavigateToOnboarding={() => handleSelectPage('onboarding')}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : currentPage === 'how-it-works' ? (
          <HowItWorksPage
            onOpenReportModal={() => setReportModalOpen(true)}
            onNavigateToPlatform={() => handleSelectPage('platform')}
          />
        ) : (
          <main className="flex-1">
            {/* Public Landing Hero Section */}
            <HeroSection
              onExplore={() => handleNavigateSection('intelligence')}
              onHowItWorks={() => handleSelectPage('how-it-works')}
              onOpenReportModal={() => setReportModalOpen(true)}
            />

            {/* Raw Signals to Verified Context Transformation */}
            <NoiseToContextSection />

            {/* Systematic 5-Step Process */}
            <ProcessSection />

            {/* Spatial Intelligence & Ward Heatmap GIS */}
            <SpatialIntelligenceSection />

            {/* Stakeholder Ecosystem */}
            <StakeholdersSection />

            {/* Human Oversight & Transparent Audit Trail */}
            <TrustSection />
          </main>
        )
      )}

      {/* Footer (Only on Public pages: Platform and How It Works) */}
      {isPublicContext && (
        <Footer
          onNavigateSection={handleNavigateSection}
          onOpenReportModal={() => setReportModalOpen(true)}
          onSelectPage={handleSelectPage}
        />
      )}

      {/* Live Citizen Signal Ingestion Modal */}
      <LiveReportSimulatorModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSignalAdded={handleSignalAdded}
      />

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F1E36] text-white text-xs font-medium px-4 py-3 rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
