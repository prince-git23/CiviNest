import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { CreateAccountPage } from './pages/CreateAccountPage';
import OnboardingPage from './pages/OnboardingPage';
import ResidentDashboard from './pages/ResidentDashboard';
import { CreateReportPage } from './pages/CreateReportPage';
import { SignalAnalysisPage } from './pages/SignalAnalysisPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { ResolutionVerificationPage } from './pages/ResolutionVerificationPage';
import { ClusterDetectionPage } from './pages/ClusterDetectionPage';
import { MapExplorerPage } from './pages/MapExplorerPage';
import { MunicipalPortal } from './pages/municipal/MunicipalPortal';
import { DiscussionsPage } from './pages/DiscussionsPage';
import { ImpactScorePage } from './pages/ImpactScorePage';
import { ProfileOptimizationPage } from './pages/ProfileOptimizationPage';
import { RepresentativeShell } from './components/community-representative/RepresentativeShell';
import type { RepresentativeSection } from './components/community-representative/RepresentativeSidebar';
import { CommunityDashboard } from './pages/community-representative/CommunityDashboard';
import { CommunityIssues } from './pages/community-representative/CommunityIssues';
import { IssueAggregation } from './pages/community-representative/IssueAggregation';
import { CommunityMembers } from './pages/community-representative/CommunityMembers';
import { CommunityAnalytics } from './pages/community-representative/CommunityAnalytics';
import { RepresentativeProfile } from './pages/community-representative/RepresentativeProfile';
import { RepresentativeSettings } from './pages/community-representative/RepresentativeSettings';
import { SupportCenter } from './pages/community-representative/SupportCenter';
import { NotificationsPage } from './pages/community-representative/NotificationsPage';
import {
  loadNotifications,
  saveNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationItem,
} from './services/notificationService';
import { OnboardingFormData, UserRoleConfig, DashboardReportItem, ResolutionVerificationInfo, AuthenticatedUser, ROLE_DEFAULT_PERMISSIONS, ROLE_PORTAL_MAP, type PortalId, type UserRoleId } from './types';
import { defaultDashboardData, buildDashboardFromOnboarding, DashboardDataset } from './data/dashboardData';
import { CivicSignalSubmission } from './services/signalAnalysisService';
import { ClusterConfirmationResponse, defaultStreetLightingCluster, CivicClusterData } from './services/clusterService';
import { DashboardSidebar, DashboardViewSection } from './components/dashboard/DashboardSidebar';
import { NotificationProvider } from './context/NotificationContext';
import { ResidentRouter } from './pages/resident/ResidentRouter';
import {
  getCommunityNotifications,
  markCommunityNotificationRead,
  markAllCommunityNotificationsRead,
  getCommunityProfile,
} from './services/communityApi';
import type { CommunityNotificationItem } from './services/communityApi';

export type AppPageId =
  | 'platform'
  | 'how-it-works'
  | 'auth'
  | 'create-account'
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
  | 'profile-optimization'
  | 'community-representative';

export function App() {
  // CRITICAL REQUIREMENT: Application entry MUST be the public landing platform
  const [currentPage, setCurrentPage] = useState<AppPageId>(() => {
    // Restore the portal from a persisted session so a reload (e.g. after
    // signing in as a representative or municipal officer) returns to the
    // correct portal instead of the public landing page.
    try {
      const raw = localStorage.getItem('civinest_user');
      if (raw) {
        const u = JSON.parse(raw) as AuthenticatedUser;
        const portalFor: Record<string, AppPageId> = {
          community_rep: 'community-representative',
          municipal_officer: 'municipal',
          admin: 'municipal',
        };
        return portalFor[u.role] || 'platform';
      }
    } catch {
      // ignore malformed persistence
    }
    return 'platform';
  });
  const [dashboardActiveSection, setDashboardActiveSection] = useState<DashboardViewSection>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardDataset>(defaultDashboardData);
  const [currentSignalDraft, setCurrentSignalDraft] = useState<Partial<CivicSignalSubmission> | null>(null);
  const [activeCluster, setActiveCluster] = useState<CivicClusterData>(defaultStreetLightingCluster);
  const [selectedVerificationReport, setSelectedVerificationReport] = useState<DashboardReportItem | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [representativeSection, setRepresentativeSection] = useState<RepresentativeSection>('dashboard');
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(() => {
    // Restore the authenticated session so the /resident portal survives
    // full page reloads (the JWT lives in localStorage already).
    try {
      const raw = localStorage.getItem('civinest_user');
      return raw ? (JSON.parse(raw) as AuthenticatedUser) : null;
    } catch {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('civinest_token'));
  const [accountData, setAccountData] = useState<{ fullName: string; email: string } | null>(null);
  const [representativeNotifications, setRepresentativeNotifications] = useState<NotificationItem[]>(
    () => loadNotifications()
  );
  // Backend-driven representative data: community context + notifications.
  const [repContext, setRepContext] = useState<{ community: string; ward: string; locality: string; city: string; name: string } | null>(null);
  const repContextUserIdRef = useRef<string | null>(null);

  // Persist the authenticated session alongside the JWT.
  const persistAuthUser = (user: AuthenticatedUser | null) => {
    if (user) {
      localStorage.setItem('civinest_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('civinest_user');
    }
  };

  // Persist representative notification read-state locally (demo persistence).
  useEffect(() => {
    saveNotifications(representativeNotifications);
  }, [representativeNotifications]);

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

  const handleNavigateToRepresentative = () => {
    setCurrentPage('community-representative');
    setRepresentativeSection('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mapRepNotification = (n: CommunityNotificationItem): NotificationItem => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    timestamp: new Date(n.timestamp).toLocaleString(),
    read: n.read,
    relatedIssueId: n.relatedIssueId,
    relatedSection: n.relatedSection as NotificationItem['relatedSection'],
  });

  // Load the representative's real profile + backend notifications once per
  // authenticated user when entering the Community portal.
  useEffect(() => {
    const isRep = currentPage === 'community-representative';
    const userId = authenticatedUser?.id || authToken;
    if (!isRep || !userId || repContextUserIdRef.current === userId) return;
    repContextUserIdRef.current = userId;
    (async () => {
      try {
        const [{ profile }, notifRes] = await Promise.all([
          getCommunityProfile(),
          getCommunityNotifications(),
        ]);
        setRepContext({
          community: profile.user.community,
          ward: profile.user.ward,
          locality: profile.user.locality,
          city: profile.user.city,
          name: profile.user.name,
        });
        setRepresentativeNotifications(notifRes.notifications.map(mapRepNotification));
      } catch {
        // Backend unavailable — the portal falls back to its neutral defaults.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, authenticatedUser?.id, authToken]);

  const handleSelectRepresentativeNotification = (notification: NotificationItem) => {
    setRepresentativeNotifications((prev) => markNotificationRead(prev, notification.id));
    void markCommunityNotificationRead(notification.id).catch(() => {});
    if (notification.relatedSection) {
      setRepresentativeSection(notification.relatedSection);
    } else if (notification.relatedIssueId) {
      setRepresentativeSection('issues');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkAllRepresentativeNotificationsRead = () => {
    setRepresentativeNotifications((prev) => markAllNotificationsRead(prev));
    void markAllCommunityNotificationsRead().catch(() => {});
  };

  const handleViewAllRepresentativeNotifications = () => {
    setRepresentativeSection('notifications');
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

  const handleLoginSuccess = (role: UserRoleConfig, authData?: { token: string; userId: string; email: string; name: string; backendRole?: string }) => {
    // Map backend role to frontend role ID — prefer backend role over selected role
    const backendToFrontendRole: Record<string, string> = {
      CITIZEN: 'resident',
      COMMUNITY_REPRESENTATIVE: 'community_rep',
      MUNICIPAL_OFFICER: 'municipal_officer',
      ADMIN: 'admin',
    };
    const actualRoleId = authData?.backendRole
      ? (backendToFrontendRole[authData.backendRole] || role.id)
      : role.id;

    // Build the authenticated user using the actual role from the backend
    const newUser: AuthenticatedUser = {
      id: authData?.userId || `user-${Date.now()}`,
      name: authData?.name || dashboardData.user.name || 'User',
      email: authData?.email || role.defaultEmail,
      role: actualRoleId as any,
      permissions: ROLE_DEFAULT_PERMISSIONS[actualRoleId] || [],
      locality: dashboardData.user.community || 'Dharampeth',
      ward: dashboardData.user.ward || 'Ward 14',
      city: dashboardData.user.city || 'Nagpur',
      department: actualRoleId === 'municipal_officer' ? 'Municipal Operations' : undefined,
      impactScore: dashboardData.impact.points,
      currentPortal: ROLE_PORTAL_MAP[actualRoleId] || 'residential',
      hasCommunityRepRole: actualRoleId === 'community_rep',
    };
    setAuthenticatedUser(newUser);
    persistAuthUser(newUser);

    // Persist auth token
    if (authData?.token) {
      setAuthToken(authData.token);
      localStorage.setItem('civinest_token', authData.token);
    }

    showToast(`Authenticated as ${role.title} — Civic Intelligence Active`);
    setDashboardData((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        name: newUser.name,
        role: role.title,
      },
    }));
    setTimeout(() => {
      const targetPortal = ROLE_PORTAL_MAP[actualRoleId];
      // The app portal renders for any pathname except /resident and /auth;
      // move off the auth URL so the selected portal actually displays.
      if (window.location.pathname.startsWith('/auth')) {
        window.history.pushState({}, '', '/');
      }
      if (targetPortal === 'municipal') {
        setCurrentPage('municipal');
      } else if (targetPortal === 'community') {
        setCurrentPage('community-representative');
        setRepresentativeSection('dashboard');
      } else if (targetPortal === 'admin') {
        setCurrentPage('municipal');
      } else {
        // Residents land directly in the Resident Portal
        window.location.href = '/resident/dashboard';
      }
    }, 800);
  };

  const handleOnboardingComplete = (data: OnboardingFormData) => {
    const citizenName = data.profile.fullName.trim() || 'Prince';
    const personalized = buildDashboardFromOnboarding(data);
    setDashboardData(personalized);

    // Route based on the authenticated user's actual role, not always to resident dashboard
    const userRole = authenticatedUser?.role || 'resident';
    const targetPortal = ROLE_PORTAL_MAP[userRole] || 'residential';

    showToast(`Civic node initialized for ${citizenName} in ${data.location.ward || 'Dharampeth'}!`);
    setTimeout(() => {
      if (targetPortal === 'municipal') {
        setCurrentPage('municipal');
      } else if (targetPortal === 'community') {
        setCurrentPage('community-representative');
        setRepresentativeSection('dashboard');
      } else if (targetPortal === 'admin') {
        setCurrentPage('municipal');
      } else {
        window.location.href = '/resident/dashboard';
      }
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
  const isRepresentativeContext = currentPage === 'community-representative';

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <BrowserRouter>
    <div className="min-h-screen bg-[#FBFBFA] text-[#111827] flex flex-col selection:bg-[#0F1E36] selection:text-white font-sans">
      {/* Resident Portal Routes */}
      <Routes>
        <Route path="/resident/*" element={
          <ResidentRouter
            authenticatedUser={authenticatedUser || undefined}
            onSignOut={() => {
              setAuthenticatedUser(null);
              persistAuthUser(null);
              setAuthToken(null);
              localStorage.removeItem('civinest_token');
              setCurrentPage('platform');
            }}
          />
        } />
        {/* Login reachable as a real URL (the resident router redirects here) */}
        <Route path="/auth" element={
          <AuthPage
            onBackToCiviNest={() => handleSelectPage('platform')}
            onNavigateToOnboarding={() => handleSelectPage('onboarding')}
            onNavigateToCreateAccount={() => handleSelectPage('create-account')}
            onLoginSuccess={handleLoginSuccess}
          />
        } />
      </Routes>

      {/* Existing app content — only show when not on /resident or /auth routes */}
      {!window.location.pathname.startsWith('/resident') && !window.location.pathname.startsWith('/auth') && (
      <>
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
            setCurrentPage('create-account');
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
          onNavigateToRepresentative={handleNavigateToRepresentative}
          onNavigateToProfile={() => {
            setCurrentPage('profile-optimization');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSignOut={() => {
            setAuthenticatedUser(null);
            persistAuthUser(null);
            setAuthToken(null);
            localStorage.removeItem('civinest_token');
            setCurrentPage('platform');
            showToast('Signed out of resident workspace.');
          }}
          authenticatedUser={authenticatedUser || undefined}
        />
      )}

      {/* 3.5. COMMUNITY REPRESENTATIVE PORTAL */}
      {isRepresentativeContext && (
        <RepresentativeShell
          activeSection={representativeSection}
          onSelectSection={setRepresentativeSection}
          communityName={repContext?.community || 'Green Valley Residency'}
          wardName={repContext ? [repContext.ward, repContext.city].filter(Boolean).join(', ') : 'Ward 12, Nagpur'}
          authenticatedUser={authenticatedUser || undefined}
          notifications={representativeNotifications}
          onSelectNotification={handleSelectRepresentativeNotification}
          onMarkAllNotificationsRead={handleMarkAllRepresentativeNotificationsRead}
          onViewAllNotifications={handleViewAllRepresentativeNotifications}
          onSignOut={() => {
            setAuthenticatedUser(null);
            persistAuthUser(null);
            setAuthToken(null);
            localStorage.removeItem('civinest_token');
            setRepContext(null);
            repContextUserIdRef.current = null;
            setRepresentativeNotifications(loadNotifications());
            setCurrentPage('platform');
            showToast('Signed out of Community Representative portal.');
          }}
        >
          {representativeSection === 'dashboard' && (
            <CommunityDashboard
              onNavigateToIssues={() => setRepresentativeSection('issues')}
              onNavigateToAggregation={() => setRepresentativeSection('aggregation')}
            />
          )}
          {representativeSection === 'issues' && (
            <CommunityIssues onNavigateToAggregation={() => setRepresentativeSection('aggregation')} />
          )}
          {representativeSection === 'aggregation' && <IssueAggregation />}
          {representativeSection === 'members' && <CommunityMembers />}
          {representativeSection === 'analytics' && <CommunityAnalytics />}
          {representativeSection === 'settings' && <RepresentativeSettings />}
          {representativeSection === 'support' && (
            <SupportCenter onNavigateSection={setRepresentativeSection} />
          )}
          {representativeSection === 'profile' && (
            <RepresentativeProfile
              onNavigateToSettings={() => setRepresentativeSection('settings')}
            />
          )}
          {representativeSection === 'notifications' && (
            <NotificationsPage
              notifications={representativeNotifications}
              onSelect={handleSelectRepresentativeNotification}
              onMarkAllRead={handleMarkAllRepresentativeNotificationsRead}
            />
          )}
        </RepresentativeShell>
      )}

      {/* 4. MAIN PAGE CONTENT ROUTER */}
      {!isRepresentativeContext && isWorkspaceContext && (
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
      )}

      {!isRepresentativeContext && !isWorkspaceContext && (
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
          <CreateReportPage
            onBackToDashboard={() => handleSelectPage('dashboard')}
            onNavigateToMyReports={() => handleSelectPage('my-reports')}
            onSignalSubmitted={handleSignalSubmissionCompleted}
            authenticatedUser={authenticatedUser || undefined}
            initialLocation={{
              address: `${dashboardData.user.community}, ${dashboardData.user.city}`,
              ward: dashboardData.user.ward,
              city: dashboardData.user.city,
              accuracy: 'Approx. 15m accuracy',
              coordinates: { lat: 21.1458, lng: 79.0882 },
            }}
          />
        ) : currentPage === 'municipal' ? (
        <NotificationProvider key={authenticatedUser?.id || 'municipal-guest'}>
          <MunicipalPortal
            onSwitchToCitizenView={() => {
              setAuthenticatedUser(null);
              persistAuthUser(null);
              setAuthToken(null);
              localStorage.removeItem('civinest_token');
              handleSelectPage('dashboard');
            }}
            authenticatedUser={authenticatedUser || undefined}
          />
        </NotificationProvider>
        ) : currentPage === 'create-account' ? (
          <CreateAccountPage
            onBackToLanding={() => handleSelectPage('platform')}
            onAccountCreated={(data) => {
              setAccountData(data);
              // Persist token from registration
              if (data.token) {
                setAuthToken(data.token);
                localStorage.setItem('civinest_token', data.token);
              }

              // Map backend role to frontend role ID
              const backendToFrontendRole: Record<string, string> = {
                CITIZEN: 'resident',
                COMMUNITY_REPRESENTATIVE: 'community_rep',
                MUNICIPAL_OFFICER: 'municipal_officer',
                ADMIN: 'admin',
              };
              const frontendRoleId = backendToFrontendRole[data.role] || 'resident';

              // Build authenticated user from real registration data
              const newUser: AuthenticatedUser = {
                id: data.userId,
                name: data.fullName,
                email: data.email,
                role: frontendRoleId as any,
                permissions: ROLE_DEFAULT_PERMISSIONS[frontendRoleId] || [],
                locality: 'Dharampeth',
                ward: 'Ward 14',
                city: 'Nagpur',
                department: frontendRoleId === 'municipal_officer' ? 'Municipal Operations' : undefined,
                impactScore: 0,
                currentPortal: ROLE_PORTAL_MAP[frontendRoleId] || 'residential',
                hasCommunityRepRole: frontendRoleId === 'community_rep',
              };
              setAuthenticatedUser(newUser);
              persistAuthUser(newUser);

              showToast(`Account created for ${data.fullName}. Let's set up your civic profile.`);

              // Route based on role: municipal/community go directly to their portal
              const targetPortal = ROLE_PORTAL_MAP[frontendRoleId];
              if (targetPortal === 'municipal') {
                setTimeout(() => setCurrentPage('municipal'), 1200);
              } else if (targetPortal === 'community') {
                setTimeout(() => {
                  setCurrentPage('community-representative');
                  setRepresentativeSection('dashboard');
                }, 1200);
              } else {
                // Residents go through onboarding
                setTimeout(() => setCurrentPage('onboarding'), 1200);
              }
            }}
            onNavigateToSignIn={() => handleSelectPage('auth')}
          />
        ) : currentPage === 'onboarding' ? (
          <OnboardingPage
            onBackToPlatform={() => handleSelectPage('platform')}
            onComplete={handleOnboardingComplete}
            accountData={accountData}
          />
        ) : currentPage === 'auth' ? (
          <AuthPage
            onBackToCiviNest={() => handleSelectPage('platform')}
            onNavigateToOnboarding={() => handleSelectPage('onboarding')}
            onNavigateToCreateAccount={() => handleSelectPage('create-account')}
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
      </>
      )}
    </div>
    </BrowserRouter>
  );
}

export default App;
