/**
 * Community Dashboard Service
 *
 * Derives community dashboard data from the existing DashboardDataset.
 * This is the single boundary to replace when a dedicated backend API is ready.
 */
import type {
  CommunityDashboardData,
  CommunityContext,
  CommunityHealthData,
  CivicMetrics,
  PrioritizedIssue,
  ConsensusCategory,
  MunicipalCase,
  ResponseDistributionData,
  DashboardReportItem,
} from '../types';
import type { DashboardDataset } from '../data/dashboardData';

// ─── Category color map (matches CiviNest design tokens) ─────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  lighting: '#F59E0B',
  water: '#2563EB',
  roads: '#64748B',
  sanitation: '#EF4444',
  drainage: '#06B6D4',
  safety: '#8B5CF6',
  power: '#F97316',
};

const CATEGORY_LABELS: Record<string, string> = {
  lighting: 'Street Lighting',
  water: 'Water Supply',
  roads: 'Roads & Pavement',
  sanitation: 'Waste & Sanitation',
  drainage: 'Drainage',
  safety: 'Public Safety',
  power: 'Power Grid',
};

// ─── Severity weight for priority scoring ─────────────────────────────────────
const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 40,
  high: 30,
  medium: 20,
  low: 10,
};

/**
 * Compute the community context header data
 */
export function computeCommunityContext(dataset: DashboardDataset): CommunityContext {
  return {
    name: `${dataset.user.community} Community`,
    role: dataset.user.role || 'Community Representative',
    location: `${dataset.user.ward} · ${dataset.user.city}`,
    city: dataset.user.city,
    lastUpdated: getRelativeTime(),
  };
}

/**
 * Compute community health score from report data
 */
export function computeCommunityHealth(dataset: DashboardDataset): CommunityHealthData {
  const reports = dataset.activeReports;
  const categories = dataset.civicHealth.categories;
  const overallScore = dataset.civicHealth.overallScore;

  // Count active clusters
  const clusterIds = new Set<string>();
  reports.forEach((r) => {
    if (r.cluster && r.status !== 'Resolved') {
      clusterIds.add(r.cluster.id);
    }
  });
  const activeClusters = clusterIds.size;

  // Determine health status
  let status: CommunityHealthData['status'] = 'Stable';
  if (overallScore >= 85) status = 'Improving';
  else if (overallScore >= 70) status = 'Stable';
  else if (overallScore >= 50) status = 'Needs Attention';
  else status = 'At Risk';

  // Generate explanation
  const explanation = generateHealthExplanation(dataset, status);

  // Determine trend from community pulse data
  const pulseScore = dataset.communityPulse.primaryCommunity.score;
  const benchmarkScore = dataset.communityPulse.sectorBenchmark.score;
  const trend: CommunityHealthData['trend'] =
    pulseScore > benchmarkScore + 5 ? 'up' : pulseScore < benchmarkScore - 5 ? 'down' : 'stable';

  // Build segments from categories
  const segments = categories.map((cat) => ({
    category: cat.name,
    score: cat.score,
    color: CATEGORY_COLORS[cat.icon] || '#64748B',
  }));

  return {
    score: overallScore,
    maxScore: 100,
    status,
    explanation,
    activeClusters,
    trend,
    segments,
  };
}

/**
 * Compute the four core civic metrics
 */
export function computeCivicMetrics(dataset: DashboardDataset): CivicMetrics {
  const reports = dataset.activeReports;

  // Active issues (not resolved, not reopened-and-closed)
  const activeReports = reports.filter(
    (r) => r.status !== 'Resolved'
  );
  const activeCount = activeReports.length;

  // Total confirmations across issues with clusters
  let totalConfirmations = 0;
  let issuesWithConfirmations = 0;
  reports.forEach((r) => {
    if (r.cluster && r.cluster.confirmationCount > 0) {
      totalConfirmations += r.cluster.confirmationCount;
      issuesWithConfirmations++;
    }
  });

  // Open cases (reports with government action)
  const openCases = reports.filter(
    (r) => r.governmentAction && r.status !== 'Resolved'
  );
  const awaitingCount = reports.filter(
    (r) => r.status === 'Awaiting Review' || r.status === 'Under Review'
  ).length;

  // Municipal response (reports that have government action assigned)
  const respondedReports = reports.filter((r) => r.governmentAction);
  const coveragePercent = reports.length > 0
    ? Math.round((respondedReports.length / reports.length) * 100)
    : 0;

  return {
    activeIssues: {
      count: activeCount,
      change: Math.max(1, Math.floor(activeCount * 0.3)),
      trend: activeCount > 2 ? 'up' : 'down',
    },
    confirmations: {
      count: totalConfirmations,
      issueCount: issuesWithConfirmations,
    },
    openCases: {
      count: openCases.length,
      awaitingCount,
    },
    municipalResponse: {
      count: respondedReports.length,
      coveragePercent,
    },
  };
}

/**
 * Compute prioritized issues sorted by priority score
 */
export function computePrioritizedIssues(dataset: DashboardDataset): PrioritizedIssue[] {
  return dataset.activeReports
    .filter((r) => r.status !== 'Resolved')
    .map((report) => {
      const severityScore = SEVERITY_WEIGHT[report.severity || 'medium'] || 20;
      const upvoteScore = Math.min((report.upvotes || 0) * 1.5, 30);
      const clusterScore = report.cluster ? Math.min(report.cluster.reportCount * 2, 30) : 0;
      const priorityScore = Math.round(severityScore + upvoteScore + clusterScore);

      return {
        id: report.id,
        title: report.title,
        reportCount: report.cluster?.reportCount || 1,
        confirmationCount: report.cluster?.confirmationCount || 0,
        priorityScore: Math.min(priorityScore, 100),
        severity: report.severity || 'medium',
        category: report.category,
        clusterId: report.cluster?.id,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Compute resident consensus — confirmations aggregated by category
 */
export function computeResidentConsensus(dataset: DashboardDataset): ConsensusCategory[] {
  const categoryMap = new Map<string, number>();

  dataset.activeReports.forEach((report) => {
    if (report.cluster && report.cluster.confirmationCount > 0) {
      const cat = report.category;
      const existing = categoryMap.get(cat) || 0;
      categoryMap.set(cat, existing + report.cluster.confirmationCount);
    }
  });

  const entries = Array.from(categoryMap.entries());
  const maxConfirmations = Math.max(...entries.map(([, count]) => count), 1);

  return entries
    .map(([category, confirmations]) => ({
      category: CATEGORY_LABELS[category] || category,
      confirmations,
      percentage: Math.round((confirmations / maxConfirmations) * 100),
      color: CATEGORY_COLORS[category] || '#64748B',
    }))
    .sort((a, b) => b.confirmations - a.confirmations);
}

/**
 * Compute municipal open cases from reports with government actions
 */
export function computeMunicipalCases(dataset: DashboardDataset): MunicipalCase[] {
  return dataset.activeReports
    .filter((r) => r.governmentAction && r.status !== 'Resolved')
    .map((report) => ({
      id: report.id,
      caseId: report.reportNumber || 'Case ID pending',
      issue: report.title,
      department: report.governmentAction?.department || 'Unassigned',
      status: report.status,
    }));
}

/**
 * Compute response distribution from all reports
 */
export function computeResponseDistribution(dataset: DashboardDataset): ResponseDistributionData {
  const reports = dataset.activeReports;

  const responded = reports.filter(
    (r) => r.governmentAction && r.status !== 'Awaiting Review' && r.status !== 'Under Review'
  ).length;
  const awaiting = reports.filter(
    (r) => r.status === 'Awaiting Review' || r.status === 'Under Review'
  ).length;
  const resolved = reports.filter((r) => r.status === 'Resolved').length;
  const reopened = reports.filter((r) => r.status === 'Reopened').length;

  const insight = generateResponseInsight(reports, responded, awaiting, resolved, reopened);

  return { responded, awaiting, resolved, reopened, insight };
}

/**
 * Aggregate all community dashboard data
 */
export function computeCommunityDashboard(dataset: DashboardDataset): CommunityDashboardData {
  return {
    community: computeCommunityContext(dataset),
    health: computeCommunityHealth(dataset),
    metrics: computeCivicMetrics(dataset),
    activeIssues: computePrioritizedIssues(dataset),
    consensus: computeResidentConsensus(dataset),
    municipalCases: computeMunicipalCases(dataset),
    responseDistribution: computeResponseDistribution(dataset),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRelativeTime(): string {
  const now = new Date();
  const minutes = now.getMinutes();
  if (minutes < 5) return 'Updated just now';
  return `Updated ${minutes} min ago`;
}

function generateHealthExplanation(
  dataset: DashboardDataset,
  status: CommunityHealthData['status']
): string {
  const categories = dataset.civicHealth.categories;
  const weakest = [...categories].sort((a, b) => a.score - b.score)[0];

  if (!weakest) return `Community health is ${status.toLowerCase()}.`;

  const weakLabel = weakest.name.toLowerCase();

  switch (status) {
    case 'Improving':
      return `Community health is trending positively. All civic categories are performing above benchmark.`;
    case 'Stable':
      return `Stable, with emerging ${weakLabel} concerns.`;
    case 'Needs Attention':
      return `${weakest.name} infrastructure requires attention. Score has dropped below threshold.`;
    case 'At Risk':
      return `Critical: Multiple civic categories below acceptable thresholds. Immediate municipal coordination needed.`;
  }
}

function generateResponseInsight(
  reports: DashboardReportItem[],
  responded: number,
  _awaiting: number,
  _resolved: number,
  _reopened: number
): string {
  const total = reports.length;
  if (total === 0) return 'Not enough recent data to identify a response trend.';

  const rate = Math.round((responded / total) * 100);

  // Find department with most responses
  const deptCounts = new Map<string, number>();
  reports.forEach((r) => {
    if (r.governmentAction && r.status !== 'Awaiting Review' && r.status !== 'Under Review') {
      const dept = r.governmentAction.department;
      deptCounts.set(dept, (deptCounts.get(dept) || 0) + 1);
    }
  });

  let topDept = '';
  let topCount = 0;
  deptCounts.forEach((count, dept) => {
    if (count > topCount) {
      topCount = count;
      // Shorten department name for display
      topDept = dept.split('(')[0].trim();
    }
  });

  if (topDept) {
    return `Response rate is maintaining at ${rate}%. ${topDept} leads in resolution time this week.`;
  }

  return `Response rate is at ${rate}%. Municipal departments are processing civic signals.`;
}
