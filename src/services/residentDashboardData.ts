import {
  DashboardDataset,
  DashboardReportItem,
  DashboardAIInsight,
  DashboardNearbyIssue,
  SpatialMapNode,
} from '../types';
import { getResidentDashboard, ReportData, AIInsightData } from './api';

const CATEGORY_TO_REPORT: Record<string, DashboardReportItem['category']> = {
  water_supply: 'water',
  water: 'water',
  roads: 'roads',
  road: 'roads',
  street_lighting: 'lighting',
  lighting: 'lighting',
  drainage: 'sanitation',
  waste: 'sanitation',
  electricity: 'power',
  power: 'power',
  public_safety: 'safety',
  safety: 'safety',
  parks: 'safety',
};

const CATEGORY_TO_NODE: Record<string, SpatialMapNode['category']> = {
  water_supply: 'water',
  water: 'water',
  street_lighting: 'lighting',
  lighting: 'lighting',
  drainage: 'drainage',
  roads: 'roads',
  road: 'roads',
  waste: 'sanitation',
  electricity: 'roads',
  public_safety: 'roads',
  parks: 'sanitation',
};

function timeAgo(iso?: string): string {
  if (!iso) return 'Recently';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function toReportItem(r: ReportData): DashboardReportItem {
  return {
    id: r._id,
    reportNumber: r.reportNumber || `#CV-${r._id.slice(-4).toUpperCase()}`,
    title: r.title,
    category: CATEGORY_TO_REPORT[r.category] || 'roads',
    reportedAgo: timeAgo(r.createdAt),
    dateString: r.createdAt
      ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '',
    status: r.status as DashboardReportItem['status'],
    location: r.location?.address || 'Location not provided',
    description: r.description,
    upvotes: r.upvotes || 1,
    timeline: r.timeline,
  };
}

function clusterToSpatialNode(c: ClusterShape): SpatialMapNode {
  return {
    id: c._id,
    title: c.title || c.clusterCode,
    category: CATEGORY_TO_NODE[c.category] || 'roads',
    severity: c.severity === 'CRITICAL' ? 'critical' : c.severity === 'HIGH' ? 'attention' : 'info',
    position: [0, 0, 0],
    sector: c.ward || 'Ward',
    distance: c.locality || 'Nearby',
    assignedTo: c.status || 'Active',
    status: c.status || 'ACTIVE',
    description: `${c.reportCount || 1} resident report${(c.reportCount || 1) > 1 ? 's' : ''} in this cluster`,
  };
}

function toAIInsight(a: AIInsightData): DashboardAIInsight {
  return {
    id: `insight-${a.category}`,
    eyebrow: 'AI Insight',
    headline: a.title || 'Trending concern in your area',
    description: a.description || '',
    category: a.category || 'general',
    confidenceScore: a.confidence != null ? Math.round(a.confidence * 100) : 80,
    affectedSector: a.locality || a.ward || 'Your locality',
    actionCta: 'Explore affected area',
  };
}

function clusterToNearbyIssue(c: ClusterShape): DashboardNearbyIssue {
  const level = c.priority?.level || 'MEDIUM';
  const isCritical = level === 'CRITICAL' || level === 'HIGH';
  return {
    id: c._id,
    badge: isCritical ? 'HIGH PRIORITY' : c.status === 'INVESTIGATING' ? 'INVESTIGATING' : 'EMERGING TREND',
    badgeType: isCritical ? 'high' : c.status === 'INVESTIGATING' ? 'investigating' : 'trend',
    sector: c.ward || 'Ward',
    locality: c.locality || '',
    title: c.title || c.clusterCode,
    description: `${c.reportCount || 1} resident report${(c.reportCount || 1) > 1 ? 's' : ''} · priority ${level.toLowerCase()}`,
    supportCount: c.confirmationCount || 0,
    hasViewData: true,
  };
}

export interface ClusterShape {
  _id: string;
  clusterCode: string;
  title: string;
  category: string;
  severity: string;
  priority: { score: number; level: string };
  center: { latitude: number; longitude: number };
  ward: string;
  locality: string;
  status: string;
  reportCount: number;
  confirmationCount: number;
}

/**
 * Fetch the real resident dashboard from the backend and merge it into the
 * existing DashboardDataset shape. Returns the original dataset untouched
 * when the backend is unavailable (demo mode).
 */
export async function fetchResidentDashboard(base: DashboardDataset): Promise<DashboardDataset> {
  try {
    const res = await getResidentDashboard();
    const d = res.dashboard;
    const clusters = (d.nearbyClusters || []) as unknown as ClusterShape[];

    return {
      ...base,
      user: {
        name: res.user?.name || base.user.name,
        city: d.city || base.user.city,
        ward: d.ward || base.user.ward,
        community: d.locality || base.user.community,
        role: res.user?.role || base.user.role,
      },
      civicHealth: {
        ...base.civicHealth,
        wardName: d.ward || base.civicHealth.wardName,
        locality: d.locality || base.civicHealth.locality,
        overallScore: Math.min(Math.max(d.impactScore || 70, 0), 100),
      },
      spatialNodes: clusters.map(clusterToSpatialNode),
      activeReports: (d.recentReports || []).map(toReportItem),
      aiInsight: d.aiInsight ? toAIInsight(d.aiInsight) : base.aiInsight,
      impact: {
        ...base.impact,
        points: d.impactScore || base.impact.points,
        locality: d.locality || base.impact.locality,
        reportsSubmitted: d.reportsSubmitted ?? base.impact.reportsSubmitted,
        verifiedSignals: d.verifiedSignals ?? base.impact.verifiedSignals,
      },
      nearbyIssues: clusters.slice(0, 6).map(clusterToNearbyIssue),
    };
  } catch {
    return base;
  }
}

export default fetchResidentDashboard;
