import type { CivicIssue, IssueCategory, IssueCluster, IssueStatus } from './geo/geoTypes';
import { getMapClusters, getMapIssues, ResidentDashboardData } from './api';

// Map backend category keys to the shared geo type category union
const CATEGORY_MAP: Record<string, IssueCategory> = {
  water_supply: 'water-supply',
  roads: 'road-maintenance',
  street_lighting: 'street-lighting',
  drainage: 'drainage',
  waste: 'sanitation',
  electricity: 'electricity',
  public_safety: 'safety',
  parks: 'parks',
  water: 'water-supply',
  road: 'road-maintenance',
  lighting: 'street-lighting',
  safety: 'safety',
};

export function mapCategory(category?: string): IssueCategory {
  if (!category) return 'infrastructure';
  return CATEGORY_MAP[category] || 'infrastructure';
}

const STATUS_MAP: Record<string, IssueStatus> = {
  ACTIVE: 'active',
  INVESTIGATING: 'in-progress',
  ASSIGNED: 'assigned',
  RESOLVED: 'resolved',
  REOPENED: 'reopened',
  'Under Review': 'active',
  'In Progress': 'in-progress',
  Verification: 'sla-risk',
};

export function mapClusterStatus(status?: string): IssueStatus {
  return STATUS_MAP[status || ''] || 'active';
}

const PRIORITY_SCORES: Record<string, number> = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 95,
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 95,
};

export function priorityToNumber(priority?: string | number): number {
  if (typeof priority === 'number') return priority;
  return PRIORITY_SCORES[priority || 'medium'] ?? 50;
}

type BackendCluster = ResidentDashboardData['nearbyClusters'][number];

export function convertCluster(c: BackendCluster): IssueCluster {
  return {
    id: c._id,
    title: c.title,
    category: mapCategory(c.category),
    latitude: c.center?.latitude ?? 21.1458,
    longitude: c.center?.longitude ?? 79.0882,
    issueCount: c.reportCount || 1,
    priority: c.priority?.score ?? 50,
    confidence: c.reportCount ? Math.min(0.5 + c.reportCount * 0.05, 0.95) : 0.5,
    ward: c.ward,
    locality: c.locality,
    status: mapClusterStatus(c.status),
  };
}

export interface MapIssueInput {
  _id?: string;
  id?: string;
  title: string;
  category?: string;
  status?: string;
  priority?: string;
  reportCount?: number;
  confirmationCount?: number;
  location?: { latitude?: number; longitude?: number; ward?: string; address?: string; city?: string };
  analysis?: { confidence?: number; category?: string };
  createdAt?: string;
}

export function convertIssue(r: MapIssueInput): CivicIssue {
  return {
    id: r.id || r._id || '',
    title: r.title || 'Civic issue',
    category: mapCategory(r.category || r.analysis?.category),
    latitude: r.location?.latitude ?? 21.1458,
    longitude: r.location?.longitude ?? 79.0882,
    priority: priorityToNumber(r.priority),
    confidence: r.analysis?.confidence ?? 0,
    reportCount: r.reportCount || 1,
    confirmationCount: r.confirmationCount || 0,
    status: (STATUS_MAP[r.status || ''] || 'active') as IssueStatus,
    ward: r.location?.ward,
    locality: r.location?.address || r.location?.city,
    createdAt: r.createdAt,
  };
}

export interface ResidentMapData {
  issues: CivicIssue[];
  clusters: IssueCluster[];
  source: 'live' | 'demo';
}

/**
 * Fetch real map data from the resident backend. Falls back to an empty
 * result (caller keeps its demo data) when the backend is unavailable.
 */
export async function fetchResidentMapData(): Promise<ResidentMapData> {
  try {
    const [clusterRes, issueRes] = await Promise.all([getMapClusters(), getMapIssues()]);
    const clusters = (clusterRes.clusters || []).map(convertCluster);
    const issues = (issueRes.issues || []).map(convertIssue);
    return { issues, clusters, source: clusters.length || issues.length ? 'live' : 'demo' };
  } catch {
    return { issues: [], clusters: [], source: 'demo' };
  }
}

export default fetchResidentMapData;
