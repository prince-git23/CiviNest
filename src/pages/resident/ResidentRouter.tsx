import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ResidentShell } from '../../components/resident/ResidentShell';
import ResidentDashboard from '../ResidentDashboard';
import { CreateReportPage } from '../CreateReportPage';
import { MyReportsPage } from '../MyReportsPage';
import { MapExplorerPage } from '../MapExplorerPage';
import { DiscussionsPage } from '../DiscussionsPage';
import { ImpactScorePage } from '../ImpactScorePage';
import { ProfileOptimizationPage } from '../ProfileOptimizationPage';
import { ResolutionVerificationPage } from '../ResolutionVerificationPage';
import { OnboardingPage } from '../OnboardingPage';
import ReportDetailsPage from './ReportDetailsPage';
import SignalIntakePage from './SignalIntakePage';
import SignalResultPage from './SignalResultPage';
import InsightsPage from './InsightsPage';
import { defaultDashboardData, buildDashboardFromOnboarding } from '../../data/dashboardData';
import type { AuthenticatedUser, OnboardingFormData, DashboardReportItem, ResolutionVerificationInfo } from '../../types';
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

  return (
    <Routes>
      <Route element={<ResidentShell authenticatedUser={authenticatedUser} onSignOut={onSignOut} />}>
        {/* Dashboard — canonical /resident/dashboard, also /resident redirects */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={
          <ResidentDashboard
            initialData={dashboardData}
            onNavigateToPlatform={() => {}}
            onNavigateToCreateSignal={() => {}}
            onNavigateToPage={() => {}}
          />
        } />

        {/* Create Report */}
        <Route path="report" element={
          <CreateReportPage
            onBackToDashboard={() => {}}
            onNavigateToMyReports={() => {}}
            authenticatedUser={authenticatedUser}
          />
        } />

        {/* Citizen Signal Intake */}
        <Route path="signal-intake" element={<SignalIntakePage />} />
        <Route path="signal-intake/result/:id" element={<SignalResultPage />} />

        {/* Insights */}
        <Route path="insights" element={<InsightsPage />} />

        {/* My Reports */}
        <Route path="reports" element={
          <MyReportsPage
            dashboardData={dashboardData}
            onNavigateToCreateSignal={() => {}}
            onNavigateToDashboard={() => {}}
            onShowToast={() => {}}
          />
        } />

        {/* Report Details */}
        <Route path="reports/:id" element={<ReportDetailsPage />} />

        {/* Explore / Map */}
        <Route path="explore" element={
          <MapExplorerPage
            userContext={dashboardData.user}
            onOpenReportModal={() => {}}
            onNavigate={() => {}}
          />
        } />

        {/* Community / Discussions */}
        <Route path="community" element={
          <DiscussionsPage
            userContext={dashboardData.user}
            onNavigateToIssue={(issueId) => navigate(`/resident/reports/${issueId}`)}
            onOpenReportModal={() => {}}
          />
        } />

        {/* Impact Score */}
        <Route path="impact" element={
          <ImpactScorePage
            userContext={dashboardData.user}
            onNavigateToReports={() => {}}
            onNavigateToMap={() => {}}
          />
        } />

        {/* Profile */}
        <Route path="profile" element={
          <ProfileOptimizationPage
            userContext={dashboardData.user}
          />
        } />

        {/* Resolution Verification */}
        <Route path="verify/:id" element={
          <ResolutionVerificationPage
            dashboardData={dashboardData}
            selectedReport={null}
            onNavigateBack={() => {}}
            onNavigateToDashboard={() => {}}
            onVerificationCompleted={() => {}}
            onShowToast={() => {}}
          />
        } />

        {/* Onboarding */}
        <Route path="onboarding" element={
          <OnboardingPage
            onBackToPlatform={() => {}}
            onComplete={(data: OnboardingFormData) => {
              setDashboardData(buildDashboardFromOnboarding(data));
            }}
          />
        } />

        {/* Catch-all → dashboard */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default ResidentRouter;
