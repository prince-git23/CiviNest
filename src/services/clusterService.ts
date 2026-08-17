export interface ClusterSignalItem {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  time: string;
  distance: string;
  verified: boolean;
  photosCount?: number;
  coordinates?: { lat: number; lng: number };
}

export interface CivicClusterData {
  id: string;
  clusterCode: string;
  issueTitle: string;
  categoryKey: 'lighting' | 'water' | 'roads' | 'sanitation' | 'safety' | 'power';
  categoryLabel: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  aiConfidence: number;
  location: {
    sector: string;
    ward: string;
    city: string;
    landmarks: string;
    coordinates: { lat: number; lng: number };
  };
  description: string;
  firstReportedTime: string;
  lastSignalTime: string;
  reportCount: number;
  confirmationCount: number;
  contributingSignals: ClusterSignalItem[];
  spatialHotspot: {
    radiusMeters: number;
    affectedUnits: number;
    riskRating: 'High Urgency' | 'Moderate' | 'Low Risk' | 'Critical Bottleneck';
    estimatedHouseholdsAffected: number;
  };
  responsibleAgency: {
    department: string;
    contactOfficer: string;
    slaRemainingHours: number;
    status: string;
    workOrderNumber?: string;
  };
  aiClusterRationale: string;
  rootCauseHypothesis: string;
  recommendedResolution: string;
}

export interface ClusterConfirmationResponse {
  confirmationId: string;
  cluster: CivicClusterData;
  updatedConfirmationCount: number;
  pointsAwarded: number;
  timestamp: string;
}

export const defaultStreetLightingCluster: CivicClusterData = {
  id: 'cluster-sl-409',
  clusterCode: 'CLS-NAG-2026-089',
  issueTitle: 'Cascade Streetlight Grid Failure on Sector 4 North Corridor',
  categoryKey: 'lighting',
  categoryLabel: 'Street Lighting Grid',
  severity: 'high',
  aiConfidence: 96,
  location: {
    sector: 'Sector 4 / North Avenue',
    ward: 'Dharampeth Ward 14',
    city: 'Nagpur',
    landmarks: 'Adjacent to Dharampeth High School & Community Garden Gate 2',
    coordinates: { lat: 21.1462, lng: 79.0874 },
  },
  description:
    '7 contiguous LED luminaires along the 450m stretch from School Junction to Garden Gate 2 have been unlit for 3 consecutive evenings, creating high pedestrian safety vulnerability.',
  firstReportedTime: '3 days ago (Fri, 8:42 PM)',
  lastSignalTime: '12 minutes ago',
  reportCount: 14,
  confirmationCount: 38,
  contributingSignals: [
    {
      id: 'sig-01',
      user: 'Priya S.',
      text: 'Streetlights completely dark from Gate 2 till Dharampeth High School corner.',
      time: '12m ago',
      distance: '45m away',
      verified: true,
      photosCount: 2,
    },
    {
      id: 'sig-02',
      user: 'Rohan Deshmukh',
      text: 'Total blackout on pole #14 to #20. Kids returning from tuition had to use phone flashlights.',
      time: '1h ago',
      distance: '110m away',
      verified: true,
      photosCount: 1,
    },
    {
      id: 'sig-03',
      user: 'Green Valley RWA Guard',
      text: 'Transformer switch box sparking near Pole #16 around 7 PM during evening switch-on.',
      time: '4h ago',
      distance: '180m away',
      verified: true,
      photosCount: 3,
    },
    {
      id: 'sig-04',
      user: 'Dr. A. Verma',
      text: 'Senior citizens unable to take evening walks due to pitch dark pavement on north avenue.',
      time: '1d ago',
      distance: '240m away',
      verified: false,
    },
    {
      id: 'sig-05',
      user: 'Ananya Roy',
      text: 'Reported 2 days back. Issue still persists. Third night without illumination.',
      time: '2d ago',
      distance: '310m away',
      verified: true,
      photosCount: 1,
    },
  ],
  spatialHotspot: {
    radiusMeters: 450,
    affectedUnits: 7,
    riskRating: 'High Urgency',
    estimatedHouseholdsAffected: 620,
  },
  responsibleAgency: {
    department: 'MSEDCL & NMC Electrical Infrastructure Division',
    contactOfficer: 'Er. S. Bhende (Sub-Divisional Engineer)',
    slaRemainingHours: 18,
    status: 'Municipal Work Order Dispatched',
    workOrderNumber: 'NMC-ELEC-2026-9938',
  },
  aiClusterRationale:
    'Spatial correlation engine fused 14 individual citizen reports, 38 upvotes, and geo-located streetlight pole IDs within a 450m bounding radius. 100% temporal alignment between 7:30 PM – 11:00 PM over 72 hours points to single phase circuit breaker trip at sub-feeder pillar FP-14.',
  rootCauseHypothesis:
    'Phase-B contactor burnout inside municipal Sub-Feeder Panel FP-14 triggered by water ingress during recent showers.',
  recommendedResolution:
    'Replace 63A 3-phase magnetic contactor and seal conduit entry at Sub-Feeder FP-14.',
};

export const sampleCivicClusters: CivicClusterData[] = [
  defaultStreetLightingCluster,
  {
    id: 'cluster-dr-201',
    clusterCode: 'CLS-NAG-2026-092',
    issueTitle: 'Monsoon Runoff Storm Drain Clog & Wastewater Pooling',
    categoryKey: 'sanitation',
    categoryLabel: 'Drainage & Sanitation',
    severity: 'critical',
    aiConfidence: 94,
    location: {
      sector: 'Sector 14 Junction',
      ward: 'Dharampeth Ward 14',
      city: 'Nagpur',
      landmarks: 'Near Central Market Circle & Axis Bank ATM',
      coordinates: { lat: 21.1441, lng: 79.0862 },
    },
    description:
      'Heavy siltation and construction debris blocking primary underground storm culvert resulting in 10-inch standing foul water.',
    firstReportedTime: '1 day ago',
    lastSignalTime: '25 minutes ago',
    reportCount: 19,
    confirmationCount: 52,
    contributingSignals: [
      {
        id: 'sig-11',
        user: 'Vikram Joshi',
        text: 'Drain overflow spilling onto Main Avenue. Traffic crawling.',
        time: '25m ago',
        distance: '60m away',
        verified: true,
        photosCount: 2,
      },
      {
        id: 'sig-12',
        user: 'Kavita Nair',
        text: 'Severe stench and stagnant water entering ground floor parking.',
        time: '2h ago',
        distance: '120m away',
        verified: true,
        photosCount: 4,
      },
    ],
    spatialHotspot: {
      radiusMeters: 280,
      affectedUnits: 12,
      riskRating: 'Critical Bottleneck',
      estimatedHouseholdsAffected: 950,
    },
    responsibleAgency: {
      department: 'NMC Public Health & Drainage Engineering',
      contactOfficer: 'R. K. Tidke (Superintendent)',
      slaRemainingHours: 8,
      status: 'Suction Super-Sucker Unit En Route',
      workOrderNumber: 'NMC-DRN-2026-4421',
    },
    aiClusterRationale:
      'Aggregated 19 photographic and text signals indicating rapid backflow gradient. Image analysis verified silt accumulation index at 88%.',
    rootCauseHypothesis: 'Debris collapse in 600mm secondary stormwater feeder conduit.',
    recommendedResolution: 'Deploy high-pressure jetting machine and manual desilting team.',
  },
];

export async function confirmClusterParticipation(
  clusterId: string,
  userLocation?: { lat: number; lng: number }
): Promise<ClusterConfirmationResponse> {
  // Simulate rapid cluster reinforcement
  const target = sampleCivicClusters.find((c) => c.id === clusterId) || defaultStreetLightingCluster;
  const updatedCount = target.confirmationCount + 1;

  return {
    confirmationId: `conf-${Date.now()}`,
    cluster: {
      ...target,
      confirmationCount: updatedCount,
    },
    updatedConfirmationCount: updatedCount,
    pointsAwarded: 35,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
