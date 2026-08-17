import { CivicClusterData, defaultStreetLightingCluster, sampleCivicClusters } from './clusterService';

export interface InfrastructureNode {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'transit' | 'utility';
  categoryLabel: string;
  position: [number, number, number];
  coordinates: { lat: number; lng: number };
  address: string;
  criticality: 'high' | 'medium' | 'standard';
  description: string;
}

export interface MapClusterItem extends CivicClusterData {
  mapPosition: [number, number, number];
  radiusScale: number;
  statusType: 'active' | 'in_progress' | 'resolved' | 'investigating';
}

export interface MapFilterState {
  searchQuery: string;
  categories: string[];
  severity: 'all' | 'critical' | 'high' | 'medium' | 'low';
  status: 'all' | 'active' | 'in_progress' | 'resolved';
  infrastructure: {
    schools: boolean;
    hospitals: boolean;
    transit: boolean;
    utilities: boolean;
  };
}

// Deterministic 3D Civic Clusters across the sector
export const initialMapClusters: MapClusterItem[] = [
  {
    ...defaultStreetLightingCluster,
    mapPosition: [3.8, 0.4, -2.6],
    radiusScale: 1.3,
    statusType: 'active',
  },
  {
    ...sampleCivicClusters[1],
    mapPosition: [-2.9, 0.4, 3.2],
    radiusScale: 1.5,
    statusType: 'in_progress',
  },
  {
    id: 'cluster-rd-304',
    clusterCode: 'CLS-NAG-2026-104',
    issueTitle: 'Main Avenue Surface Cavitation & Asphalt Subsidence',
    categoryKey: 'roads',
    categoryLabel: 'Roads & Pavements',
    severity: 'high',
    aiConfidence: 91,
    location: {
      sector: 'Sector 14 / West Access Road',
      ward: 'Dharampeth Ward 14',
      city: 'Nagpur',
      landmarks: 'Intersection of West Access and Temple Lane',
      coordinates: { lat: 21.1475, lng: 79.0845 },
    },
    description:
      'Consecutive potholes and kerb erosion creating extreme vehicular hazard along the two-wheeler commuting corridor.',
    firstReportedTime: '4 days ago',
    lastSignalTime: '1 hour ago',
    reportCount: 16,
    confirmationCount: 42,
    contributingSignals: [
      {
        id: 'sig-rd-01',
        user: 'Sunil G.',
        text: 'Large pothole near the turn. Multiple bikes skidding in the dark.',
        time: '1h ago',
        distance: '80m away',
        verified: true,
        photosCount: 2,
      },
      {
        id: 'sig-rd-02',
        user: 'Meera Iyer',
        text: 'Road surface completely peeled off after rain.',
        time: '5h ago',
        distance: '130m away',
        verified: true,
        photosCount: 1,
      },
    ],
    spatialHotspot: {
      radiusMeters: 380,
      affectedUnits: 9,
      riskRating: 'High Urgency',
      estimatedHouseholdsAffected: 780,
    },
    responsibleAgency: {
      department: 'NMC Public Works Department (PWD Road Cell)',
      contactOfficer: 'Er. Rajesh Patil (Executive Engineer)',
      slaRemainingHours: 22,
      status: 'Road Compactor & Hot Mix Scheduled',
      workOrderNumber: 'PWD-NAG-2026-8812',
    },
    aiClusterRationale:
      'Correlated 16 photo reports showing bituminous layer wear and aggregate detachment. Vibration sensors on city transit buses detected high roughness anomaly index.',
    rootCauseHypothesis: 'Sub-base water saturation from poor shoulder drainage leading to asphalt disintegration under axle loads.',
    recommendedResolution: 'Execute milling, aggregate base compaction, and 40mm bituminous concrete overlay.',
    mapPosition: [-4.2, 0.4, -1.8],
    radiusScale: 1.2,
    statusType: 'in_progress',
  },
  {
    id: 'cluster-wt-118',
    clusterCode: 'CLS-NAG-2026-067',
    issueTitle: 'Feeder Main Pipeline Pressure Drop in Block B Grid',
    categoryKey: 'water',
    categoryLabel: 'Water Supply Grid',
    severity: 'medium',
    aiConfidence: 89,
    location: {
      sector: 'Block B / Residential Sector',
      ward: 'Dharampeth Ward 14',
      city: 'Nagpur',
      landmarks: 'Opposite Community Water Tank 3',
      coordinates: { lat: 21.1432, lng: 79.0895 },
    },
    description:
      'Water supply pressure dropped below 1.2 bar across 6 residential societies during peak 06:00 - 08:30 AM distribution schedule.',
    firstReportedTime: '2 days ago',
    lastSignalTime: '3 hours ago',
    reportCount: 11,
    confirmationCount: 28,
    contributingSignals: [
      {
        id: 'sig-wt-01',
        user: 'Alok K.',
        text: 'Second floor apartments received zero water pressure this morning.',
        time: '3h ago',
        distance: '95m away',
        verified: true,
      },
      {
        id: 'sig-wt-02',
        user: 'Suman Bakshi',
        text: 'Motor running dry for 45 minutes.',
        time: '4h ago',
        distance: '150m away',
        verified: true,
      },
    ],
    spatialHotspot: {
      radiusMeters: 320,
      affectedUnits: 6,
      riskRating: 'Moderate',
      estimatedHouseholdsAffected: 450,
    },
    responsibleAgency: {
      department: 'Nagpur Jal Seva (Hydraulic Division)',
      contactOfficer: 'M. S. Wankhede (Junior Engineer)',
      slaRemainingHours: 36,
      status: 'SCADA Telemetry Pressure Audit in Progress',
      workOrderNumber: 'NJS-HYD-2026-3021',
    },
    aiClusterRationale:
      'Multi-source telemetry from 11 households correlated with distribution valve #BV-08 manifold flow rates. Pattern isolated to single secondary loop.',
    rootCauseHypothesis: 'Air locking in 200mm DI feeder distribution pipe after scheduled maintenance.',
    recommendedResolution: 'Operate kinetic air release valves at high points on Block B loop.',
    mapPosition: [1.8, 0.4, 4.1],
    radiusScale: 1.1,
    statusType: 'investigating',
  },
  {
    id: 'cluster-sn-502',
    clusterCode: 'CLS-NAG-2026-031',
    issueTitle: 'Solid Waste Overflow at Commercial Market Collector Point',
    categoryKey: 'sanitation',
    categoryLabel: 'Sanitation & Waste',
    severity: 'low',
    aiConfidence: 97,
    location: {
      sector: 'Dharampeth Central Market',
      ward: 'Dharampeth Ward 14',
      city: 'Nagpur',
      landmarks: 'North Market Complex Entry Gate',
      coordinates: { lat: 21.1418, lng: 79.0832 },
    },
    description:
      'Secondary dump bin exceeded capacity after weekend retail activity; municipal compactors resolved and disinfected site.',
    firstReportedTime: '5 days ago',
    lastSignalTime: 'Resolved Yesterday',
    reportCount: 8,
    confirmationCount: 31,
    contributingSignals: [
      {
        id: 'sig-sn-01',
        user: 'Pooja T.',
        text: 'Compactor arrived at 7 AM. Waste cleared and bin sanitized.',
        time: 'Yesterday',
        distance: '40m away',
        verified: true,
        photosCount: 2,
      },
    ],
    spatialHotspot: {
      radiusMeters: 200,
      affectedUnits: 4,
      riskRating: 'Low Risk',
      estimatedHouseholdsAffected: 210,
    },
    responsibleAgency: {
      department: 'NMC Solid Waste Management Cell',
      contactOfficer: 'S. N. Meshram (Sanitary Inspector)',
      slaRemainingHours: 0,
      status: 'Resolved & Citizen Quorum Verified',
      workOrderNumber: 'NMC-SWM-2026-1190',
    },
    aiClusterRationale:
      'Verified complete resolution through before/after photo validation (98% cleanliness score) and 31 citizen closure votes.',
    rootCauseHypothesis: 'Weekend surge in vendor packaging disposal outstripping bi-weekly collection frequency.',
    recommendedResolution: 'Increase Sunday night compactor collection frequency from 1 to 2 cycles.',
    mapPosition: [-1.5, 0.35, -3.9],
    radiusScale: 0.9,
    statusType: 'resolved',
  },
];

// Key Civic Infrastructure Landmarks
export const civicInfrastructureNodes: InfrastructureNode[] = [
  {
    id: 'infra-sch-01',
    name: 'Dharampeth High School',
    type: 'school',
    categoryLabel: 'School & Education Zone',
    position: [4.2, 0.3, -1.9],
    coordinates: { lat: 21.1465, lng: 79.0878 },
    address: 'North Avenue, Sector 4, Dharampeth',
    criticality: 'high',
    description: '1,400 students with high pedestrian footfall during 07:00-08:30 AM & 01:30-03:00 PM transit windows.',
  },
  {
    id: 'infra-hsp-01',
    name: 'Care Community Clinic & Trauma Center',
    type: 'hospital',
    categoryLabel: 'Healthcare & Emergency',
    position: [-3.5, 0.3, 1.4],
    coordinates: { lat: 21.1448, lng: 79.0838 },
    address: 'West Access Link, Dharampeth',
    criticality: 'high',
    description: '24/7 emergency medical facility requiring uninterrupted road access and reliable electrical grid.',
  },
  {
    id: 'infra-trn-01',
    name: 'Dharampeth Metro & City Transit Hub',
    type: 'transit',
    categoryLabel: 'Public Transport Node',
    position: [0.5, 0.3, -4.5],
    coordinates: { lat: 21.1488, lng: 79.0855 },
    address: 'Central Arterial Corridor',
    criticality: 'high',
    description: 'Primary rapid transit node with 8,500 daily commuter boardings and feeder e-bus connectivity.',
  },
  {
    id: 'infra-utl-01',
    name: 'Sub-Feeder Substation FP-14',
    type: 'utility',
    categoryLabel: 'Electrical Grid Utility',
    position: [3.2, 0.25, -3.8],
    coordinates: { lat: 21.1472, lng: 79.0886 },
    address: 'Sector 4 Grid Boundary',
    criticality: 'medium',
    description: 'Feeder transformer powering 48 streetlights and 4 residential housing societies.',
  },
  {
    id: 'infra-utl-02',
    name: 'Sector 14 Stormwater Culvert Sump',
    type: 'utility',
    categoryLabel: 'Drainage & Hydraulic Infrastructure',
    position: [-2.1, 0.25, 3.8],
    coordinates: { lat: 21.1438, lng: 79.0868 },
    address: 'Market Junction Low Point',
    criticality: 'high',
    description: 'Primary 1200mm diameter stormwater gravity main draining 1.8 sq km watershed.',
  },
];

// Predefined deterministic building footprints for the city
export interface CityBuildingData {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  type: 'residential' | 'commercial' | 'civic' | 'landmark';
  color: number;
}

export function generateDeterministicCityBuildings(): CityBuildingData[] {
  const buildings: CityBuildingData[] = [];
  const gridRange = [-6, -4, -2, 2, 4, 6];

  let idCounter = 1;

  for (let xi = 0; xi < gridRange.length; xi++) {
    const xBase = gridRange[xi];
    for (let zi = 0; zi < gridRange.length; zi++) {
      const zBase = gridRange[zi];

      // Keep central civic plaza / resident hub open
      if (Math.abs(xBase) <= 2 && Math.abs(zBase) <= 2) {
        continue;
      }

      // 2 sub-buildings per grid quadrant
      for (let sub = 0; sub < 2; sub++) {
        const offset = sub === 0 ? -0.55 : 0.55;
        const x = xBase + offset;
        const z = zBase + (sub === 0 ? 0.45 : -0.45);

        // Deterministic pseudo-random height and dimensions based on coords
        const seed = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453);
        const heightFactor = seed - Math.floor(seed);
        const height = 0.8 + heightFactor * 2.8;
        const width = 1.1 + (heightFactor > 0.5 ? 0.3 : -0.2);
        const depth = 1.1 + (heightFactor > 0.3 ? 0.2 : -0.15);

        let type: CityBuildingData['type'] = 'residential';
        let color = 0xEEF2F6;

        if (height > 2.6) {
          type = 'commercial';
          color = 0xE2E8F0;
        } else if (height < 1.2) {
          type = 'civic';
          color = 0xF1F5F9;
        }

        buildings.push({
          id: `bldg-${idCounter++}`,
          x,
          z,
          width,
          depth,
          height,
          type,
          color,
        });
      }
    }
  }

  return buildings;
}
