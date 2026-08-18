import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ResidentShell } from '../../components/resident/ResidentShell';
import ResidentDashboard from '../ResidentDashboard';
import { CreateReportPage } from '../CreateReportPage';
import { MyReportsPage } from '../MyReportsPage';
import { MapExplorerPage } from '../MapExplorerPage';
import { DiscussionsPage } from '../DiscussionsPage';
import { ImpactScorePage } from '../ImpactScorePage';
import { ProfileOptimizationPage } from '../ProfileOptimizationPage';
import { OnboardingPage } from '../OnboardingPage';
import ReportDetailsPage from './ReportDetailsPage';
import SignalIntakePage from './SignalIntakePage';
import SignalResultPage from './SignalResultPage';
import InsightsPage from './InsightsPage';
import WardMetricsPage from './WardMetricsPage';
import TrendDetailPage from './TrendDetailPage';
import VerifyResolutionPage from './VerifyResolutionPage';
import StartDiscussionPage from './StartDiscussionPage';
import DiscussionDetailPage from './DiscussionDetailPage';
import { defaultDashboardData, buildDashboardFromOnboarding } from '../../data/dashboardData';
import type { AuthenticatedUser, OnboardingFormData } from '../../types';
import { DashboardDataset } from '../../data/dashboardData';

interface ResidentRouterProps {
  authenticatedUser?: AuthenticatedUser;
  onSignOut?: () => void;
}

export const ResidentRouter: React.FC<ResidentRouterProps> = ({
  authenticatedUser,
  onSignOut,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardDataset>(defaultDashboardData);

  // Redirect unauthenticated users to auth
  if (!authenticatedUser) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect non-residents
  if (authenticatedUser.role !== 'resident') {
    return <Navigate to="/" replace />;
  }

  const showToast = (msg: string) => {
    // Lightweight toast — renders inline via a small stateful toast in the shell
    window.dispatchEvent(new CustomEvent('civinest:toast', { detail: msg }));
  };

  return (
    <Routes>
      <Route element={<ResidentShell authenticatedUser={authenticatedUser} onSignOut={onSignOut} />}>
        {/* Dashboard — canonical /resident/dashboard, also /resident redirects */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={
          <ResidentDashboard
            initialData={dashboardData}
            onNavigateToPlatform={() => navigate('/')}
            onNavigateToCreateSignal={() => navigate('/resident/report')}
            onNavigateToPage={(page) => {
              if (page === 'my-reports') navigate('/resident/reports');
              else if (page === 'map-explorer') navigate('/resident/explore');
              else if (page === 'impact-score') navigate('/resident/impact');
              else if (page === 'discussions') navigate('/resident/community');
              else if (page === 'profile-optimization') navigate('/resident/profile');
              else if (page === 'dashboard') navigate('/resident/dashboard');
              else if (page === 'create-signal') navigate('/resident/report');
            }}
          />
        } />

        {/* Create Report — accepts ?lat=&lng=&title= to prefill the location
            (used by Map Explorer's 'Report an Issue Here') */}
        <Route path="report" element={
          <CreateReportFromMap
            onBackToDashboard={() => navigate('/resident/dashboard')}
            onNavigateToMyReports={() => navigate('/resident/reports')}
            onSignalSubmitted={() => navigate('/resident/reports')}
            authenticatedUser={authenticatedUser}
          />
        } />

        {/* Citizen Signal Intake */}
        <Route path="signal-intake" element={<SignalIntakePage />} />
        <Route path="signal-intake/result/:id" element={<SignalResultPage />} />

        {/* Insights */}
        <Route path="insights" element={<InsightsPage />} />

        {/* Ward Sensor Metrics */}
        <Route path="ward-metrics" element={<WardMetricsPage />} />

        {/* Emerging Trends */}
        <Route path="trends/:id" element={<TrendDetailPage />} />

        {/* My Reports */}
        <Route path="reports" element={
          <MyReportsPage
            dashboardData={dashboardData}
            onNavigateToCreateSignal={() => navigate('/resident/report')}
            onNavigateToDashboard={() => navigate('/resident/dashboard')}
            onNavigateToMapExplorer={() => navigate('/resident/explore')}
            onShowToast={showToast}
          />
        } />

        {/* Report Details */}
        <Route path="reports/:id" element={<ReportDetailsPage />} />

        {/* Explore / Map */}
        <Route path="explore" element={
          <MapExplorerPage
            userContext={dashboardData.user}
            onOpenReportModal={() => navigate('/resident/report')}
            onNavigate={() => {}}
          />
        } />

        {/* Community / Discussions */}
        <Route path="community" element={
          <DiscussionsPage
            userContext={dashboardData.user}
            onNavigateToIssue={(issueId) => navigate(`/resident/reports/${issueId}`)}
          />
        } />
        <Route path="community/new" element={
          <StartDiscussionPage authenticatedUser={authenticatedUser} />
        } />
        <Route path="community/:id" element={
          <DiscussionDetailPage />
        } />

        {/* Impact Score */}
        <Route path="impact" element={
          <ImpactScorePage
            userContext={dashboardData.user}
            onNavigateToReports={() => navigate('/resident/reports')}
            onNavigateToMap={() => navigate('/resident/explore')}
          />
        } />

        {/* Profile */}
        <Route path="profile" element={
          <ProfileOptimizationPage
            userContext={dashboardData.user}
          />
        } />

        {/* Resolution Verification (data-driven) */}
        <Route path="verify/:id" element={<VerifyResolutionPage />} />

        {/* Onboarding */}
        <Route path="onboarding" element={
          <OnboardingPage
            onBackToPlatform={() => navigate('/')}
            onComplete={(data: OnboardingFormData) => {
              setDashboardData(buildDashboardFromOnboarding(data));
              navigate('/resident/dashboard');
            }}
          />
        } />

        {/* Catch-all → dashboard */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

/**
 * Wrapper that reads ?lat=&lng=&title= from the URL (set by Map Explorer's
 * "Report an Issue Here") and passes the real coordinates to CreateReportPage.
 */
const CreateReportFromMap: React.FC<{
  onBackToDashboard?: () => void;
  onNavigateToMyReports?: () => void;
  onSignalSubmitted?: (submission: any) => void;
  authenticatedUser?: AuthenticatedUser;
}> = ({ onBackToDashboard, onNavigateToMyReports, onSignalSubmitted, authenticatedUser }) => {
  const [searchParams] = useSearchParams();
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const hasCoords = !isNaN(lat) && !isNaN(lng);
  const title = searchParams.get('title') || undefined;

  return (
    <CreateReportPage
      onBackToDashboard={onBackToDashboard}
      onNavigateToMyReports={onNavigateToMyReports}
      onSignalSubmitted={onSignalSubmitted}
      authenticatedUser={authenticatedUser}
      initialLocation={
        hasCoords
          ? {
              address: title ? `Near: ${title}` : `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              ward: 'Not available',
              city: '',
              accuracy: 'Precise map-selected point',
              coordinates: { lat, lng },
            }
          : undefined
      }
      startMode="location"
    />
  );
};

export default ResidentRouter;
