// ============================================================
// CiviNest Geographic Data Types
// ============================================================

export interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeoLocation extends GeoPoint {
  address?: string;
  locality?: string;
  ward?: string;
  city?: string;
  pincode?: string;
}

export type IssueCategory =
  | 'street-lighting'
  | 'water-supply'
  | 'road-maintenance'
  | 'sanitation'
  | 'drainage'
  | 'electricity'
  | 'traffic-signal'
  | 'parks'
  | 'public-transport'
  | 'infrastructure'
  | 'noise'
  | 'safety';

export type IssuePriority = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'active' | 'assigned' | 'in-progress' | 'resolved' | 'reopened' | 'sla-risk';

export interface CivicIssue {
  id: string;
  title: string;
  category: IssueCategory;
  latitude: number;
  longitude: number;
  locality?: string;
  ward?: string;
  priority: number;
  confidence: number;
  reportCount: number;
  confirmationCount: number;
  affectedProperties?: number;
  status: IssueStatus;
  department?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IssueCluster {
  id: string;
  title: string;
  category: IssueCategory;
  latitude: number;
  longitude: number;
  issueCount: number;
  priority: number;
  confidence: number;
  ward?: string;
  locality?: string;
  radius?: number; // meters
  affectedProperties?: number;
  status: IssueStatus;
  department?: string;
}

export interface WardBoundary {
  id: string;
  name: string;
  city: string;
  coordinates: GeoPoint[];
  center: GeoPoint;
  activeIssues?: number;
  criticalIssues?: number;
}

export interface InfrastructurePoint {
  id: string;
  type: 'school' | 'hospital' | 'market' | 'park' | 'transit' | 'government' | 'utility';
  name: string;
  latitude: number;
  longitude: number;
  locality?: string;
  ward?: string;
  status?: string;
}

export interface DeploymentPoint {
  id: string;
  teamName: string;
  department: string;
  latitude: number;
  longitude: number;
  ward?: string;
  status: 'active' | 'en-route' | 'standby';
  taskCount?: number;
}

export interface MapLayer {
  id: string;
  name: string;
  type: 'issues' | 'clusters' | 'wards' | 'infrastructure' | 'deployments' | 'sla-risk' | 'resolved';
  visible: boolean;
  color?: string;
}

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface MapFilter {
  categories?: IssueCategory[];
  priorities?: IssuePriority[];
  statuses?: IssueStatus[];
  wards?: string[];
  departments?: string[];
  timeRange?: { start: string; end: string };
}

// Default Nagpur viewport
export const DEFAULT_VIEWPORT: MapViewport = {
  latitude: 21.1458,
  longitude: 79.0882,
  zoom: 13,
  pitch: 0,
  bearing: 0,
};

// Category colors
export const CATEGORY_COLORS: Record<IssueCategory, string> = {
  'street-lighting': '#F59E0B',
  'water-supply': '#3B82F6',
  'road-maintenance': '#6B7280',
  'sanitation': '#10B981',
  'drainage': '#06B6D4',
  'electricity': '#EF4444',
  'traffic-signal': '#8B5CF6',
  'parks': '#22C55E',
  'public-transport': '#6366F1',
  'infrastructure': '#78716C',
  'noise': '#F97316',
  'safety': '#DC2626',
};

// Priority colors
export const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#3B82F6',
  low: '#6B7280',
};
