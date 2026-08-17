// ============================================================
// CiviNest Map Data Service — Demo Data Provider
// ============================================================
// This service provides demo geographic data for development.
// Replace with real API calls when backend is connected.

import type {
  CivicIssue,
  IssueCluster,
  WardBoundary,
  InfrastructurePoint,
  DeploymentPoint,
  MapViewport,
  MapFilter,
  IssueCategory,
  IssueStatus,
  GeoPoint,
} from './geoTypes';

// ── Demo Civic Issues ──

export const demoIssues: CivicIssue[] = [
  {
    id: 'iss-001',
    title: 'Street Lighting Failure',
    category: 'street-lighting',
    latitude: 21.1462,
    longitude: 79.0874,
    locality: 'Sector 14',
    ward: 'Ward 14',
    priority: 92,
    confidence: 91,
    reportCount: 25,
    confirmationCount: 8,
    affectedProperties: 14,
    status: 'active',
    department: 'Electrical Operations',
    description: 'Total blackout spanning 3 blocks near primary school zone.',
    createdAt: '2026-08-17T08:39:00Z',
    updatedAt: '2026-08-17T08:39:00Z',
  },
  {
    id: 'iss-002',
    title: 'Water Main Break',
    category: 'water-supply',
    latitude: 21.1441,
    longitude: 79.0862,
    locality: 'Downtown',
    ward: 'Ward 08',
    priority: 88,
    confidence: 98,
    reportCount: 112,
    confirmationCount: 24,
    affectedProperties: 1250,
    status: 'in-progress',
    department: 'Water Supply',
    description: '400mm trunk pipe fracture at Station Roundabout.',
    createdAt: '2026-08-17T07:09:00Z',
    updatedAt: '2026-08-17T08:38:00Z',
  },
  {
    id: 'iss-003',
    title: 'Pothole Cluster',
    category: 'road-maintenance',
    latitude: 21.1475,
    longitude: 79.0845,
    locality: 'West Sector',
    ward: 'Ward 05',
    priority: 85,
    confidence: 94,
    reportCount: 38,
    confirmationCount: 12,
    affectedProperties: 320,
    status: 'sla-risk',
    department: 'Roads & Transport',
    description: 'Deep road surface collapse blocking westbound emergency lane.',
    createdAt: '2026-08-17T06:06:00Z',
    updatedAt: '2026-08-17T08:06:00Z',
  },
  {
    id: 'iss-004',
    title: 'Stormwater Drain Overflow',
    category: 'drainage',
    latitude: 21.1432,
    longitude: 79.0855,
    locality: 'Central Market',
    ward: 'Ward 08',
    priority: 79,
    confidence: 96,
    reportCount: 64,
    confirmationCount: 18,
    affectedProperties: 540,
    status: 'assigned',
    department: 'Drainage',
    description: 'Siphon 4B clogged with industrial runoff backing into basements.',
    createdAt: '2026-08-17T04:41:00Z',
    updatedAt: '2026-08-17T06:10:00Z',
  },
  {
    id: 'iss-005',
    title: 'Traffic Signal Failure',
    category: 'traffic-signal',
    latitude: 21.1455,
    longitude: 79.0888,
    locality: 'Dharampeth',
    ward: 'Ward 14',
    priority: 74,
    confidence: 84,
    reportCount: 29,
    confirmationCount: 14,
    affectedProperties: 85,
    status: 'reopened',
    department: 'Public Transport',
    description: 'Controller circuit board shorted. Zebra crossing signals dark.',
    createdAt: '2026-08-17T04:11:00Z',
    updatedAt: '2026-08-17T04:11:00Z',
  },
  {
    id: 'iss-006',
    title: 'Garbage Collection Delay',
    category: 'sanitation',
    latitude: 21.1480,
    longitude: 79.0890,
    locality: 'Ward 12',
    ward: 'Ward 12',
    priority: 62,
    confidence: 88,
    reportCount: 15,
    confirmationCount: 6,
    affectedProperties: 120,
    status: 'active',
    department: 'Sanitation & Waste',
    description: 'Missed collection for 3 consecutive days in residential zone.',
    createdAt: '2026-08-16T09:00:00Z',
    updatedAt: '2026-08-17T06:00:00Z',
  },
  {
    id: 'iss-007',
    title: 'Park Lighting Vandalism',
    category: 'street-lighting',
    latitude: 21.1420,
    longitude: 79.0900,
    locality: 'Civil Lines',
    ward: 'Ward 02',
    priority: 45,
    confidence: 72,
    reportCount: 8,
    confirmationCount: 3,
    affectedProperties: 20,
    status: 'resolved',
    department: 'Electrical Operations',
    description: 'Multiple light fixtures damaged in park area.',
    createdAt: '2026-08-14T14:00:00Z',
    updatedAt: '2026-08-16T10:00:00Z',
  },
  {
    id: 'iss-008',
    title: 'Low Water Pressure',
    category: 'water-supply',
    latitude: 21.1495,
    longitude: 79.0870,
    locality: 'Nandanvan',
    ward: 'Ward 16',
    priority: 58,
    confidence: 65,
    reportCount: 12,
    confirmationCount: 4,
    affectedProperties: 200,
    status: 'active',
    department: 'Water Supply',
    description: 'Low pressure reported across multiple buildings.',
    createdAt: '2026-08-16T06:00:00Z',
    updatedAt: '2026-08-17T05:00:00Z',
  },
];

// ── Demo Issue Clusters ──

export const demoClusters: IssueCluster[] = [
  {
    id: 'cls-001',
    title: 'Ward 14 Electrical Hazard Cluster',
    category: 'electricity',
    latitude: 21.1460,
    longitude: 79.0880,
    issueCount: 14,
    priority: 92,
    confidence: 91,
    ward: 'Ward 14',
    locality: 'Dharampeth',
    radius: 500,
    affectedProperties: 620,
    status: 'active',
    department: 'Electrical Operations',
  },
  {
    id: 'cls-002',
    title: 'Downtown Water Infrastructure',
    category: 'water-supply',
    latitude: 21.1440,
    longitude: 79.0860,
    issueCount: 18,
    priority: 88,
    confidence: 96,
    ward: 'Ward 08',
    locality: 'Downtown',
    radius: 800,
    affectedProperties: 1800,
    status: 'in-progress',
    department: 'Water Supply',
  },
  {
    id: 'cls-003',
    title: 'Road Surface Degradation',
    category: 'road-maintenance',
    latitude: 21.1470,
    longitude: 79.0850,
    issueCount: 12,
    priority: 85,
    confidence: 94,
    ward: 'Ward 05',
    locality: 'West Sector',
    radius: 600,
    affectedProperties: 780,
    status: 'sla-risk',
    department: 'Roads & Transport',
  },
  {
    id: 'cls-004',
    title: 'Drainage Siphon Overflow',
    category: 'drainage',
    latitude: 21.1435,
    longitude: 79.0855,
    issueCount: 8,
    priority: 79,
    confidence: 96,
    ward: 'Ward 08',
    locality: 'Central Market',
    radius: 400,
    affectedProperties: 540,
    status: 'assigned',
    department: 'Drainage',
  },
];

// ── Demo Ward Boundaries (approximate for Nagpur) ──

export const demoWards: WardBoundary[] = [
  {
    id: 'ward-02',
    name: 'Ward 02',
    city: 'Nagpur',
    coordinates: [
      { latitude: 21.1500, longitude: 79.0880 },
      { latitude: 21.1520, longitude: 79.0920 },
      { latitude: 21.1490, longitude: 79.0940 },
      { latitude: 21.1470, longitude: 79.0900 },
    ],
    center: { latitude: 21.1495, longitude: 79.0910 },
    activeIssues: 8,
    criticalIssues: 1,
  },
  {
    id: 'ward-05',
    name: 'Ward 05',
    city: 'Nagpur',
    coordinates: [
      { latitude: 21.1490, longitude: 79.0820 },
      { latitude: 21.1510, longitude: 79.0860 },
      { latitude: 21.1460, longitude: 79.0880 },
      { latitude: 21.1440, longitude: 79.0840 },
    ],
    center: { latitude: 21.1475, longitude: 79.0850 },
    activeIssues: 38,
    criticalIssues: 5,
  },
  {
    id: 'ward-08',
    name: 'Ward 08',
    city: 'Nagpur',
    coordinates: [
      { latitude: 21.1460, longitude: 79.0840 },
      { latitude: 21.1480, longitude: 79.0880 },
      { latitude: 21.1430, longitude: 79.0900 },
      { latitude: 21.1410, longitude: 79.0860 },
    ],
    center: { latitude: 21.1445, longitude: 79.0870 },
    activeIssues: 56,
    criticalIssues: 4,
  },
  {
    id: 'ward-12',
    name: 'Ward 12',
    city: 'Nagpur',
    coordinates: [
      { latitude: 21.1500, longitude: 79.0860 },
      { latitude: 21.1520, longitude: 79.0900 },
      { latitude: 21.1480, longitude: 79.0920 },
      { latitude: 21.1460, longitude: 79.0880 },
    ],
    center: { latitude: 21.1490, longitude: 79.0890 },
    activeIssues: 12,
    criticalIssues: 1,
  },
  {
    id: 'ward-14',
    name: 'Ward 14',
    city: 'Nagpur',
    coordinates: [
      { latitude: 21.1480, longitude: 79.0860 },
      { latitude: 21.1500, longitude: 79.0900 },
      { latitude: 21.1450, longitude: 79.0920 },
      { latitude: 21.1430, longitude: 79.0880 },
    ],
    center: { latitude: 21.1465, longitude: 79.0890 },
    activeIssues: 42,
    criticalIssues: 7,
  },
  {
    id: 'ward-16',
    name: 'Ward 16',
    city: 'Nagpur',
    coordinates: [
      { latitude: 21.1510, longitude: 79.0840 },
      { latitude: 21.1530, longitude: 79.0880 },
      { latitude: 21.1490, longitude: 79.0900 },
      { latitude: 21.1470, longitude: 79.0860 },
    ],
    center: { latitude: 21.1500, longitude: 79.0870 },
    activeIssues: 38,
    criticalIssues: 5,
  },
];

// ── Demo Infrastructure ──

export const demoInfrastructure: InfrastructurePoint[] = [
  { id: 'inf-001', type: 'school', name: 'Dharampeth High School', latitude: 21.1455, longitude: 79.0888, ward: 'Ward 14' },
  { id: 'inf-002', type: 'hospital', name: 'Metro Hospital', latitude: 21.1441, longitude: 79.0862, ward: 'Ward 08' },
  { id: 'inf-003', type: 'transit', name: 'Metro Station', latitude: 21.1441, longitude: 79.0862, ward: 'Ward 08' },
  { id: 'inf-004', type: 'market', name: 'Central Market', latitude: 21.1432, longitude: 79.0855, ward: 'Ward 08' },
  { id: 'inf-005', type: 'park', name: 'Children\'s Park', latitude: 21.1480, longitude: 79.0890, ward: 'Ward 12' },
  { id: 'inf-006', type: 'government', name: 'Ward 14 Office', latitude: 21.1462, longitude: 79.0874, ward: 'Ward 14' },
];

// ── Demo Deployments ──

export const demoDeployments: DeploymentPoint[] = [
  { id: 'dep-001', teamName: 'Team Alpha (Roads)', department: 'Roads', latitude: 21.1470, longitude: 79.0850, ward: 'Ward 14', status: 'active', taskCount: 6 },
  { id: 'dep-002', teamName: 'Team Delta (Water)', department: 'Water', latitude: 21.1441, longitude: 79.0862, ward: 'Ward 08', status: 'active', taskCount: 8 },
  { id: 'dep-003', teamName: 'Team Echo (Sanitation)', department: 'Sanitation', latitude: 21.1490, longitude: 79.0890, ward: 'Ward 12', status: 'standby', taskCount: 0 },
  { id: 'dep-004', teamName: 'Team Beta (Electrical)', department: 'Electrical', latitude: 21.1462, longitude: 79.0874, ward: 'Ward 14', status: 'active', taskCount: 4 },
];

// ── Service Functions ──

export function getIssuesForViewport(
  viewport: MapViewport,
  filter?: MapFilter,
  bufferDegrees = 0.02
): CivicIssue[] {
  return demoIssues.filter((issue) => {
    const inBounds =
      issue.latitude > viewport.latitude - bufferDegrees &&
      issue.latitude < viewport.latitude + bufferDegrees &&
      issue.longitude > viewport.longitude - bufferDegrees &&
      issue.longitude < viewport.longitude + bufferDegrees;

    if (!inBounds) return false;
    if (filter?.categories?.length && !filter.categories.includes(issue.category)) return false;
    if (filter?.statuses?.length && !filter.statuses.includes(issue.status)) return false;
    if (filter?.wards?.length && !filter.wards.includes(issue.ward || '')) return false;
    return true;
  });
}

export function getClustersForViewport(
  viewport: MapViewport,
  bufferDegrees = 0.03
): IssueCluster[] {
  return demoClusters.filter(
    (c) =>
      c.latitude > viewport.latitude - bufferDegrees &&
      c.latitude < viewport.latitude + bufferDegrees &&
      c.longitude > viewport.longitude - bufferDegrees &&
      c.longitude < viewport.longitude + bufferDegrees
  );
}

export function getWards(): WardBoundary[] {
  return demoWards;
}

export function getInfrastructure(): InfrastructurePoint[] {
  return demoInfrastructure;
}

export function getDeployments(): DeploymentPoint[] {
  return demoDeployments;
}

export function getIssueById(id: string): CivicIssue | undefined {
  return demoIssues.find((i) => i.id === id);
}

export function getClusterById(id: string): IssueCluster | undefined {
  return demoClusters.find((c) => c.id === id);
}

export function findNearbyIssues(point: GeoPoint, radiusMeters = 200): CivicIssue[] {
  return demoIssues.filter((issue) => {
    const dist = haversineDistance(point, { latitude: issue.latitude, longitude: issue.longitude });
    return dist <= radiusMeters;
  });
}

export function findSimilarIssue(description: string): CivicIssue | undefined {
  const desc = description.toLowerCase();
  return demoIssues.find((issue) => {
    const title = issue.title.toLowerCase();
    return desc.includes(title.split(' ')[0]) || title.includes(desc.split(' ')[0]);
  });
}

// ── Utility: Haversine Distance ──

function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const sinHalf = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(sinHalf), Math.sqrt(1 - sinHalf));
}
