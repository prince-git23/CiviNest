import {
  DashboardCivicHealth,
  DashboardReportItem,
  DashboardAIInsight,
  DashboardImpactScore,
  CommunityPulseData,
  DashboardNearbyIssue,
  SpatialMapNode,
  OnboardingFormData,
} from '../types';

export interface DashboardDataset {
  user: {
    name: string;
    city: string;
    ward: string;
    community: string;
    avatarUrl?: string;
    role: string;
  };
  civicHealth: DashboardCivicHealth;
  quickActions: {
    canReport: boolean;
    canUploadPhoto: boolean;
    canVoiceRecord: boolean;
    canShareLocation: boolean;
  };
  spatialNodes: SpatialMapNode[];
  activeReports: DashboardReportItem[];
  aiInsight: DashboardAIInsight;
  impact: DashboardImpactScore;
  communityPulse: CommunityPulseData;
  nearbyIssues: DashboardNearbyIssue[];
}

export const defaultDashboardData: DashboardDataset = {
  user: {
    name: 'Prince',
    city: 'Nagpur',
    ward: 'Dharampeth',
    community: 'Green Valley Residency',
    role: 'Resident Citizen',
  },
  civicHealth: {
    overallScore: 78,
    wardName: 'Dharampeth',
    locality: 'Green Valley Residency',
    categories: [
      { id: 'water', name: 'Water Grid', score: 82, maxScore: 100, status: 'Optimal', icon: 'water' },
      { id: 'lighting', name: 'Street Lighting', score: 71, maxScore: 100, status: 'Fair', icon: 'lighting' },
      { id: 'roads', name: 'Roads & Pavement', score: 79, maxScore: 100, status: 'Good', icon: 'roads' },
      { id: 'sanitation', name: 'Sanitation / Drainage', score: 58, maxScore: 100, status: 'Critical', icon: 'sanitation' },
    ],
  },
  quickActions: {
    canReport: true,
    canUploadPhoto: true,
    canVoiceRecord: true,
    canShareLocation: true,
  },
  spatialNodes: [
    {
      id: 'node-sewerage',
      title: 'Sewerage Blockage',
      category: 'drainage',
      severity: 'critical',
      position: [2.5, 0.4, 1.8],
      sector: 'Sector 14',
      distance: '200m away',
      assignedTo: 'Assigned to BMC (Public Works)',
      status: 'In Progress',
      description: 'Backflow and minor pooling detected near Junction 4 manhole chamber after monsoon run-off.',
    },
    {
      id: 'node-pothole',
      title: 'Pothole Repair Scheduled',
      category: 'roads',
      severity: 'attention',
      position: [-3.2, 0.35, -2.1],
      sector: 'Main Ave',
      distance: '450m away',
      assignedTo: 'Starts Tomorrow · Road Infra Dept',
      status: 'Scheduled Work',
      description: 'Deep surface cavitation flagged by 18 citizen reports; hot-mix asphalt patching team scheduled.',
    },
    {
      id: 'node-streetlight',
      title: 'Streetlight Outage',
      category: 'lighting',
      severity: 'info',
      position: [4.1, 0.5, -3.4],
      sector: 'Lane 3',
      distance: '1.2km away',
      assignedTo: 'Investigating · MSEDCL Division',
      status: 'Investigating',
      description: 'Phase circuit breaker trip affecting 5 consecutive poles along north residential avenue.',
    },
    {
      id: 'node-water',
      title: 'Low Pressure Alert',
      category: 'water',
      severity: 'attention',
      position: [-1.8, 0.3, 3.5],
      sector: 'Block B Sector',
      distance: '600m away',
      assignedTo: 'Hydraulic Engineering Team',
      status: 'Verification',
      description: 'Secondary feeder booster pump calibration required due to pressure drops in morning cycle.',
    },
  ],
  activeReports: [
    {
      id: 'rep-8821',
      reportNumber: '#CV-8821',
      title: 'Streetlight outside Gate 2',
      category: 'lighting',
      reportedAgo: 'Reported 2 days ago',
      dateString: 'Aug 14, 2026',
      status: 'In Progress',
      severity: 'high',
      location: 'Gate 2, Sector 14, Dharampeth',
      description: 'Sodium vapor lamp luminaire failure and flickering phase trip outside Gate 2 near the pedestrian ingress corridor.',
      upvotes: 25,
      timeline: [
        { status: 'Submitted', timestamp: 'Aug 14, 09:30 AM', note: 'Signal ingested with photos & geolocation telemetry.', completed: true, actor: 'Citizen Prince' },
        { status: 'Under Review', timestamp: 'Aug 14, 11:15 AM', note: 'AI classified severity as High Priority (School Zone).', completed: true, actor: 'CiviNest AI Engine' },
        { status: 'Assigned', timestamp: 'Aug 15, 02:45 PM', note: 'Routed to Municipal Electrical Services dispatch.', completed: true, actor: 'Ward 12 Officer' },
        { status: 'In Progress', timestamp: 'Aug 16, 08:30 AM', note: 'Field inspection and luminaire replacement underway.', completed: false, current: true, actor: 'Field Inspection Team 03' },
        { status: 'Resolved', timestamp: 'Estimated in 8h', note: 'Pending field completion and citizen quorum verification.', completed: false },
      ],
      cluster: {
        id: 'cluster-light-s14',
        category: 'Street Lighting Grid',
        title: 'Street Lighting — Sector 14',
        reportCount: 25,
        confirmationCount: 8,
        location: 'Sector 14 Corridor',
        severity: 'high',
        trendDescription: '25 reports, 8 independent citizen confirmations across a 400m grid.',
      },
      governmentAction: {
        department: 'Municipal Electrical Services',
        assignedTeam: 'Field Inspection Team 03',
        actionDescription: 'Replacement luminaire & circuit trip breaker reset scheduled.',
        sla: '24 hours',
        lastUpdated: 'Today, 08:30 AM',
        expectedNextStep: 'Field crew onsite at Sector 14 luminaire pole #14.',
      },
      evidenceUrls: [
        'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'rep-8904',
      reportNumber: '#CV-8904',
      title: 'Low water pressure - Block B',
      category: 'water',
      reportedAgo: 'Reported yesterday',
      dateString: 'Aug 15, 2026',
      status: 'Awaiting Review',
      severity: 'medium',
      location: 'Block B, Apartments 101-404',
      description: 'Main supply manifold pressure dropped below 1.2 bar during morning distribution hours.',
      upvotes: 14,
      timeline: [
        { status: 'Submitted', timestamp: 'Aug 15, 07:10 AM', note: 'Pressure telemetry anomaly submitted by resident.', completed: true, actor: 'Citizen Prince' },
        { status: 'Under Review', timestamp: 'Aug 15, 02:40 PM', note: 'Awaiting engineer validation against SCADA logs.', completed: false, current: true, actor: 'Nagpur Jal Seva' },
        { status: 'Assigned', timestamp: 'Queued', note: 'Hydraulic zone valve calibration team.', completed: false },
        { status: 'In Progress', timestamp: 'Pending', note: 'Booster pump pressure adjustment.', completed: false },
        { status: 'Resolved', timestamp: 'Pending', note: 'Citizen pressure confirmation.', completed: false },
      ],
      cluster: {
        id: 'cluster-water-blk',
        category: 'Water Distribution',
        title: 'Hydraulic Feeder Zone B',
        reportCount: 6,
        confirmationCount: 4,
        location: 'Block B Distribution Line',
        severity: 'medium',
        trendDescription: '6 reports across Block B apartments.',
      },
      governmentAction: {
        department: 'Nagpur Jal Seva (Water Works)',
        assignedTeam: 'Hydraulic Operations Unit',
        actionDescription: 'Reviewing feeder line valve pressure differential telemetry.',
        sla: '48 hours',
        lastUpdated: 'Yesterday, 02:40 PM',
        expectedNextStep: 'SCADA sensor calibration check at Block B substation.',
      },
    },
    {
      id: 'rep-8110',
      reportNumber: '#CV-8110',
      title: 'Pothole on Main St. / West Access',
      category: 'roads',
      reportedAgo: 'Reported 5 days ago',
      dateString: 'Aug 11, 2026',
      status: 'Resolved',
      severity: 'high',
      location: 'West Access Road, Sector 14',
      description: 'Deep road cavity in northbound carriage lane causing two-wheeler hazard.',
      upvotes: 38,
      timeline: [
        { status: 'Submitted', timestamp: 'Aug 11, 08:15 AM', note: 'High severity pothole flagged by 12 photo submissions.', completed: true },
        { status: 'Under Review', timestamp: 'Aug 11, 10:30 AM', note: 'GIS priority queue elevated.', completed: true },
        { status: 'Assigned', timestamp: 'Aug 12, 09:00 AM', note: 'Work Order #ENG-2026-990 issued to PWD contractor.', completed: true },
        { status: 'In Progress', timestamp: 'Aug 13, 01:00 PM', note: 'Hot-mix asphalt compaction completed.', completed: true },
        { status: 'Resolved', timestamp: 'Aug 14, 05:30 PM', note: 'Contractor uploaded completion photo. Awaiting citizen confirmation.', completed: true, current: true },
      ],
      cluster: {
        id: 'cluster-roads-west',
        category: 'Asphalt Restoration',
        title: 'Main Avenue Resurfacing',
        reportCount: 18,
        confirmationCount: 12,
        location: 'Main St & West Access',
        severity: 'high',
        trendDescription: '18 reports across 300m stretch.',
      },
      governmentAction: {
        department: 'Public Works Department (PWD)',
        assignedTeam: 'Road Maintenance Crew #04',
        actionDescription: 'Hot-mix asphalt patch compacted and cured.',
        sla: 'Completed in 72h',
        lastUpdated: 'Aug 14, 05:30 PM',
        expectedNextStep: 'Resident confirmation needed to close warranty file.',
      },
      resolution: {
        isVerifiedByResident: false,
        residentConfirmed: false,
      },
      evidenceUrls: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'rep-7922',
      reportNumber: '#CV-7922',
      title: 'Stormwater Chamber Sump Overflow',
      category: 'sanitation',
      reportedAgo: 'Reported 6 days ago',
      dateString: 'Aug 10, 2026',
      status: 'Reopened',
      severity: 'critical',
      location: 'Central Market Square & Lane 4',
      description: 'Effluent and stormwater pooling again after brief rain shower; previous desilting was incomplete.',
      upvotes: 21,
      timeline: [
        { status: 'Submitted', timestamp: 'Aug 10, 08:00 AM', note: 'Initial backflow report logged.', completed: true },
        { status: 'Assigned', timestamp: 'Aug 10, 01:00 PM', note: 'Drainage crew visited location.', completed: true },
        { status: 'Resolved', timestamp: 'Aug 11, 04:00 PM', note: 'Marked resolved by municipal operator.', completed: true },
        { status: 'Reopened', timestamp: 'Aug 12, 09:15 AM', note: 'Reopened by resident: "Grate still blocked beneath surface."', completed: true, current: true },
        { status: 'In Progress', timestamp: 'Aug 16, 10:00 AM', note: 'High-pressure jetting machine deployed for deep pipe clearance.', completed: false },
      ],
      cluster: {
        id: 'cluster-drain-mkt',
        category: 'Stormwater Infrastructure',
        title: 'Market Square Drainage Sump',
        reportCount: 14,
        confirmationCount: 9,
        location: 'Market Square Arterial',
        severity: 'critical',
        trendDescription: '14 reports, 9 independent citizen confirmations.',
      },
      governmentAction: {
        department: 'Municipal Sanitation & Drainage Cell',
        assignedTeam: 'Emergency Jetting Unit #02',
        actionDescription: 'Re-dispatched for deep subterranean desilting.',
        sla: 'High Priority Escalation',
        lastUpdated: 'Today, 10:00 AM',
        expectedNextStep: 'Camera inspection through main storm conduit.',
      },
      resolution: {
        isVerifiedByResident: true,
        residentConfirmed: false,
        reopenedReason: 'Grate cleared on top but subterranean culvert remains obstructed.',
        verifiedAt: 'Aug 12, 2026',
      },
    },
  ],
  aiInsight: {
    id: 'ai-lighting-cluster',
    eyebrow: 'CIVINEST AI INSIGHT',
    headline: 'Street lighting concerns have increased by 40% in your sector this week.',
    description: 'This pattern correlates with recent heavy rainfall. Local authorities have been notified of the cluster to prioritize wide-area repair.',
    category: 'Electrical Infrastructure',
    confidenceScore: 94,
    affectedSector: 'Sector 14 & Dharampeth North',
    actionCta: 'Explore affected area',
    relatedReportCount: 19,
  },
  impact: {
    points: 420,
    rankPercentile: 15,
    locality: 'Dharampeth',
    badges: [
      {
        id: 'badge-signal',
        label: 'Signal Contributor',
        icon: 'Radio',
        description: 'Submitted 12+ high-accuracy geolocated civic reports with valid photographic evidence.',
      },
      {
        id: 'badge-voice',
        label: 'Community Voice',
        icon: 'Users',
        description: 'Participated in 25+ verification quorums and community issue upvotes.',
      },
    ],
    reportsSubmitted: 8,
    verifiedSignals: 7,
    communityUpvotes: 56,
  },
  communityPulse: {
    primaryCommunity: {
      name: 'Green Valley Residency',
      score: 82,
    },
    sectorBenchmark: {
      name: 'Sector 14 Average',
      score: 68,
    },
    trendSummary: 'Neighborhood health is stable, trending positive over the last 30 days due to recent road resurfacing.',
    daysSpan: 30,
  },
  nearbyIssues: [
    {
      id: 'near-1',
      badge: 'HIGH PRIORITY',
      badgeType: 'high',
      sector: 'Sector 14',
      locality: 'Main Arterial Road',
      title: 'Street Lighting Failure',
      description: 'Multiple reports of complete blackout on Main Arterial Road causing safety concerns after dark.',
      supportCount: 124,
      isSupported: false,
    },
    {
      id: 'near-2',
      badge: 'INVESTIGATING',
      badgeType: 'investigating',
      sector: 'Dharampeth',
      locality: 'Central Market Square',
      title: 'Drainage Overflow',
      description: 'Minor overflow reported near the central market square after yesterday’s seasonal rainfall.',
      supportCount: 42,
      isSupported: false,
    },
    {
      id: 'near-3',
      badge: 'EMERGING TREND',
      badgeType: 'trend',
      sector: 'Dharampeth North',
      locality: 'Laxmi Nagar Cross',
      title: 'Erratic Water Pressure',
      description: 'AI detected a cluster of low pressure complaints forming in the northern residential feeder zone.',
      supportCount: 18,
      isSupported: false,
      hasViewData: true,
    },
    {
      id: 'near-4',
      badge: 'SCHEDULED WORK',
      badgeType: 'scheduled',
      sector: 'West Park Zone',
      locality: 'Children Park Perimeter',
      title: 'Pavement Restoration & Kerb Repair',
      description: 'Municipal contractor deployed for 3-day resurfacing and pedestrian walkway restoration.',
      supportCount: 89,
      isSupported: false,
    },
  ],
};

export function buildDashboardFromOnboarding(onboarding: OnboardingFormData): DashboardDataset {
  const name = onboarding.profile.fullName.trim() || 'Prince';
  const city = onboarding.location.city || 'Nagpur';
  const ward = onboarding.location.ward || 'Dharampeth';
  const community = onboarding.community.societyName || 'Green Valley Residency';

  return {
    ...defaultDashboardData,
    user: {
      name,
      city,
      ward,
      community,
      role: 'Verified Resident',
    },
    civicHealth: {
      ...defaultDashboardData.civicHealth,
      wardName: ward,
      locality: community,
    },
    impact: {
      ...defaultDashboardData.impact,
      locality: ward,
    },
    communityPulse: {
      ...defaultDashboardData.communityPulse,
      primaryCommunity: {
        name: community,
        score: 84,
      },
      sectorBenchmark: {
        name: `${ward} Sector Benchmark`,
        score: 71,
      },
    },
  };
}
