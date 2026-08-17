# CiviNest — Frontend Architecture & Developer Boundaries

**Architecture Owner:** Person 1 (Architecture, Flow & Integration)

---

## 1. Core Civic Intelligence Product Journey

```
Citizen Signal Ingestion (CreateCivicSignalPage)
       ↓
AI Signal Analysis & Confidence Score (SignalAnalysisPage)
       ↓
Evidence Verification & Municipal Dispatch (MyReportsPage)
       ↓
Spatial GIS & Correlation (MapExplorerPage / SpatialIntelligence)
       ↓
Cluster Detection & Collective Impact (ClusterDetectionPage)
       ↓
Government Execution & Municipal Action
       ↓
Ground Truth Resolution Verification (ResolutionVerificationPage)
       ↓
Citizen Confirmation / Reopen Loop (+Impact Points)
```

---

## 2. Navigation Context Matrix

The application enforces **three discrete navigation contexts**:

| Context | Component | Pages Rendered In | Navigation Items & Purpose |
| :--- | :--- | :--- | :--- |
| **Context A: Public CiviNest** | `PublicNavbar` | `platform` (Landing), `how-it-works` | • `Platform`<br>• `How It Works`<br>• `Sign In`<br>• `Get Started` (Onboarding) |
| **Context B: Resident Workspace** | `WorkspaceHeader` | `dashboard`, `my-reports`, `map-explorer` | • `Home`<br>• `Explore`<br>• `My Reports`<br>• `Community`<br>• `Impact`<br>• Quick Report Action, Search, Notifications, Profile |
| **Context C: Contextual Workflows** | `WorkflowHeader` / `AuthHeader` | `auth`, `onboarding`, `create-signal`, `signal-analysis`, `cluster-detection`, `verification` | Contextual back button, breadcrumb trail with status badges, step indicators, and dedicated exit controls. |

---

## 3. Developer Ownership Boundaries

To ensure all team members can work in parallel without merge conflicts or breaking flows:

### **Person 1 — App Shell, Shared Primitives & Integration**
- **Owned Files**:
  - `src/App.tsx`
  - `src/types.ts`
  - `src/components/navigation/*` (`PublicNavbar`, `WorkspaceHeader`, `AuthHeader`, `WorkflowHeader`, `NavigationLink`, `NavigationAction`)
  - `src/components/Navbar.tsx` (Proxy)
  - `src/components/auth/AuthNavbar.tsx` (Proxy)
  - `src/components/dashboard/DashboardHeader.tsx` (Proxy)
  - `src/components/Footer.tsx`

### **Person 2 — Public & Authentication Experiences**
- **Owned Files**:
  - `src/pages/AuthPage.tsx`
  - `src/pages/HowItWorksPage.tsx`
  - `src/pages/OnboardingPage.tsx`
  - `src/components/hero/*`
  - `src/components/sections/*`
  - `src/components/auth/*` (except `AuthNavbar.tsx` proxy)
  - `src/components/onboarding/*`

### **Person 3 — Citizen Reporting & AI Analysis**
- **Owned Files**:
  - `src/pages/ResidentDashboard.tsx`
  - `src/pages/CreateCivicSignalPage.tsx`
  - `src/pages/SignalAnalysisPage.tsx`
  - `src/components/dashboard/*` (except `DashboardHeader.tsx` proxy)
  - `src/components/signal/*`
  - `src/components/analysis/*`
  - `src/services/signalAnalysisService.ts`

### **Person 4 — Citizen Intelligence, Spatial GIS & Clusters**
- **Owned Files**:
  - `src/pages/MyReportsPage.tsx`
  - `src/pages/MapExplorerPage.tsx`
  - `src/pages/ClusterDetectionPage.tsx`
  - `src/components/map-explorer/*`
  - `src/components/reports/CivicClusterScene.tsx`
  - `src/components/three/*`
  - `src/services/clusterService.ts`

### **Person 5 — Resolution Verification & Government Workflow**
- **Owned Files**:
  - `src/pages/ResolutionVerificationPage.tsx`
  - `src/components/reports/StillNotFixedModal.tsx`
  - `src/components/workflow/*`

---

## 4. Shared State Contracts & Props Flow

- **App Entry**: Initial state in `App.tsx` defaults to `'platform'` (Landing).
- **Signal Draft**: Passed from `CreateCivicSignalPage` to `SignalAnalysisPage` via `setCurrentSignalDraft`.
- **Submission Output**: Ingested into `dashboardData.activeReports` and immediately visible in `MyReportsPage`.
- **Verification Output**: Updates resolution status to `'Resolved'` or `'Reopened'`, updating citizen impact points.
- **Cluster Confirmation**: Appends user confirmation, boosts AI correlation strength, and awards verified signal impact points.
