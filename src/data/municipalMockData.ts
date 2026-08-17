// ============================================================
// CiviNest Municipal Portal — Mock Data
// ============================================================

// ─── Issue Types ──────────────────────────────────────────────
export type IssueCategory =
  | 'Street Lighting'
  | 'Water Supply'
  | 'Road Maintenance'
  | 'Sanitation'
  | 'Drainage'
  | 'Electricity'
  | 'Traffic Signal'
  | 'Parks'
  | 'Public Transport';

export type IssuePriority = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus =
  | 'Unassigned'
  | 'Assigned'
  | 'In Progress'
  | 'Department Resolved'
  | 'Awaiting Verification'
  | 'Citizen Confirmed'
  | 'Reopened'
  | 'Over SLA';

export type DepartmentType =
  | 'Roads & Transport'
  | 'Water Supply'
  | 'Sanitation & Waste'
  | 'Electrical Operations'
  | 'Drainage'
  | 'Street Lighting'
  | 'Parks & Recreation'
  | 'Public Transport'
  | 'Infrastructure';

export interface MunicipalIssue {
  id: string;
  issueCode: string;
  title: string;
  category: IssueCategory;
  ward: string;
  locality: string;
  address: string;
  reports: number;
  confirmations: number;
  affectedProperties: number;
  confidence: number;
  priority: number;
  status: IssueStatus;
  department: DepartmentType;
  slaTarget: string;
  slaRemaining: string;
  isOverSla: boolean;
  reportedAgo: string;
  reportedTime: string;
  description: string;
  aiRationale: string;
  priorityFactors: {
    safetyRisk: number;
    severity: number;
    duration: number;
    vulnerability: number;
    geographicImpact: number;
    evidenceConfidence: number;
  };
  timeline: {
    time: string;
    date: string;
    status: string;
    note: string;
    actor: string;
  }[];
  contributingSignals: {
    user: string;
    text: string;
    time: string;
    verified: boolean;
  }[];
  latestFieldUpdate?: {
    text: string;
    author: string;
    role: string;
    time: string;
  };
}

// ─── Issues ───────────────────────────────────────────────────

export const municipalIssues: MunicipalIssue[] = [
  {
    id: 'civ-2026-014',
    issueCode: 'CIV-2026-014',
    title: 'Major Water Main Break',
    category: 'Water Supply',
    ward: 'Ward 14',
    locality: 'Main St.',
    address: 'Ward 14, Main Street, Nagpur',
    reports: 25,
    confirmations: 8,
    affectedProperties: 14,
    confidence: 91,
    priority: 92,
    status: 'Unassigned',
    department: 'Water Supply',
    slaTarget: '2h',
    slaRemaining: '14m left',
    isOverSla: false,
    reportedAgo: '12 mins ago',
    reportedTime: '08:14 AM',
    description:
      'Significant pressure drop detected. Multiple localized flooding reports near transit hub. 400mm feeder trunk pipe fracture suspected.',
    aiRationale:
      'Hydrodynamic sensor acoustic signature confirms 400mm cast-iron trunk pipe fracture at Station Roundabout. 1,250 downstream domestic connections affected.',
    priorityFactors: {
      safetyRisk: 95,
      severity: 90,
      duration: 60,
      vulnerability: 90,
      geographicImpact: 72,
      evidenceConfidence: 91,
    },
    timeline: [
      { time: '08:14 AM', date: '17 Aug 2026', status: 'Reported', note: 'First citizen signal ingested via mobile app.', actor: 'Citizen Signal' },
      { time: '08:22 AM', date: '17 Aug 2026', status: 'AI Clustered', note: '25 reports correlated within 200m radius. 91% confidence.', actor: 'AI Engine' },
      { time: '08:30 AM', date: '17 Aug 2026', status: 'Priority Assigned', note: 'Priority 92/100 calculated based on safety risk and affected properties.', actor: 'Priority Engine' },
      { time: '08:45 AM', date: '17 Aug 2026', status: 'Awaiting Assignment', note: 'Routed to Water Supply department dispatch queue.', actor: 'Dispatcher' },
    ],
    contributingSignals: [
      { user: 'Metro Station Master', text: 'Water gushing onto station access ramp. 6 inches standing water.', time: '12m ago', verified: true },
      { user: 'Acoustic Pipe Sensor #88', text: 'Severe hydrodynamic pressure drop from 4.2 bar to 0.6 bar.', time: '12m ago', verified: true },
      { user: 'Ravi Kumar (Resident)', text: 'Basement flooding in residential complex near transit hub.', time: '10m ago', verified: true },
    ],
  },
  {
    id: 'civ-2026-015',
    issueCode: 'CIV-2026-015',
    title: 'Traffic Signal Failure',
    category: 'Traffic Signal',
    ward: 'Ward 08',
    locality: 'Oak Junction',
    address: 'Ward 08, Oak Junction, Nagpur',
    reports: 18,
    confirmations: 6,
    affectedProperties: 8,
    confidence: 87,
    priority: 85,
    status: 'Assigned',
    department: 'Public Transport',
    slaTarget: '3h',
    slaRemaining: '2h 15m',
    isOverSla: false,
    reportedAgo: '45 mins ago',
    reportedTime: '07:41 AM',
    description:
      'Traffic controller circuit board shorted during surge; all four signal heads dark at major intersection.',
    aiRationale:
      'Computer vision traffic camera confirms all signal heads dark. 18 independent reports with geotagged photos. High pedestrian volume during morning rush.',
    priorityFactors: {
      safetyRisk: 88,
      severity: 82,
      duration: 55,
      vulnerability: 75,
      geographicImpact: 68,
      evidenceConfidence: 87,
    },
    timeline: [
      { time: '07:41 AM', date: '17 Aug 2026', status: 'Reported', note: 'Multiple citizen reports of dark signals at Oak Junction.', actor: 'Citizen Signal' },
      { time: '07:48 AM', date: '17 Aug 2026', status: 'AI Clustered', note: '18 reports correlated. 87% confidence.', actor: 'AI Engine' },
      { time: '08:10 AM', date: '17 Aug 2026', status: 'Assigned', note: 'Assigned to Public Transport department.', actor: 'Dispatcher' },
    ],
    contributingSignals: [
      { user: 'Commuter (Oak Junction)', text: 'All four signals dark. Traffic chaos at intersection.', time: '45m ago', verified: true },
      { user: 'Traffic Camera #12', text: 'Complete signal failure detected. Vehicle count increasing.', time: '44m ago', verified: true },
    ],
  },
  {
    id: 'civ-2026-016',
    issueCode: 'CIV-2026-016',
    title: 'Pothole near School',
    category: 'Road Maintenance',
    ward: 'Ward 22',
    locality: 'Elm St.',
    address: 'Ward 22, Elm Street, Nagpur',
    reports: 42,
    confirmations: 12,
    affectedProperties: 22,
    confidence: 94,
    priority: 78,
    status: 'In Progress',
    department: 'Roads & Transport',
    slaTarget: '4h',
    slaRemaining: '47h 10m',
    isOverSla: true,
    reportedAgo: '3 hrs ago',
    reportedTime: '05:14 AM',
    description:
      'Large pothole cluster on main arterial road near school zone. Multiple vehicle damage reports. Safety hazard for school children.',
    aiRationale:
      '42 independent reports with geotagged photos. 12 independent confirmations. Located in high-traffic school zone. Severity elevated due to child safety risk.',
    priorityFactors: {
      safetyRisk: 92,
      severity: 75,
      duration: 80,
      vulnerability: 95,
      geographicImpact: 65,
      evidenceConfidence: 94,
    },
    timeline: [
      { time: '05:14 AM', date: '17 Aug 2026', status: 'Reported', note: 'Initial pothole reports from morning commuters.', actor: 'Citizen Signal' },
      { time: '05:30 AM', date: '17 Aug 2026', status: 'AI Clustered', note: '42 reports correlated. School zone safety risk flagged.', actor: 'AI Engine' },
      { time: '06:15 AM', date: '17 Aug 2026', status: 'Assigned', note: 'Assigned to Roads & Transport.', actor: 'Dispatcher' },
      { time: '07:00 AM', date: '17 Aug 2026', status: 'In Progress', note: 'Field team dispatched. Barricades being placed.', actor: 'Team Alpha' },
    ],
    contributingSignals: [
      { user: 'School Parent Association', text: 'Pothole expanding. Multiple car tire damages reported near school gate.', time: '3h ago', verified: true },
      { user: 'Traffic Camera #7', text: 'Road surface degradation visible. Lane narrowing detected.', time: '3h ago', verified: true },
    ],
    latestFieldUpdate: {
      text: 'Barricades placed. Road assessment in progress. Contractor mobilization underway for cold-mix patching.',
      author: 'Team Alpha (Roads)',
      role: 'Field Team',
      time: '07:00 AM',
    },
  },
  {
    id: 'civ-2026-017',
    issueCode: 'CIV-2026-017',
    title: 'Exposed Electrical Wire Near Primary School',
    category: 'Electricity',
    ward: 'Ward 14',
    locality: 'Sector 14',
    address: 'Ward 14, Sector 14, near Primary School',
    reports: 12,
    confirmations: 8,
    affectedProperties: 10,
    confidence: 93,
    priority: 94,
    status: 'Unassigned',
    department: 'Electrical Operations',
    slaTarget: '1h',
    slaRemaining: '42m left',
    isOverSla: false,
    reportedAgo: '18 mins ago',
    reportedTime: '08:08 AM',
    description:
      'Exposed live electrical wire hanging from utility pole near primary school entrance. Extreme safety hazard during morning school drop-off.',
    aiRationale:
      '12 reports with 8 independent confirmations. Proximity to school creates critical safety risk. High confidence due to multiple verified photos.',
    priorityFactors: {
      safetyRisk: 98,
      severity: 95,
      duration: 40,
      vulnerability: 98,
      geographicImpact: 55,
      evidenceConfidence: 93,
    },
    timeline: [
      { time: '08:08 AM', date: '17 Aug 2026', status: 'Reported', note: 'Critical safety hazard flagged near school.', actor: 'Citizen Signal' },
      { time: '08:12 AM', date: '17 Aug 2026', status: 'AI Clustered', note: '12 reports. 93% confidence. Safety risk critical.', actor: 'AI Engine' },
      { time: '08:15 AM', date: '17 Aug 2026', status: 'Priority Assigned', note: 'Priority 94/100. Immediate action required.', actor: 'Priority Engine' },
    ],
    contributingSignals: [
      { user: 'School Security Guard', text: 'Live wire hanging from pole near school gate. Children walking past.', time: '18m ago', verified: true },
      { user: 'Parent (Drop-off)', text: 'Saw sparking from wire. Very dangerous situation.', time: '16m ago', verified: true },
    ],
  },
  {
    id: 'civ-2026-018',
    issueCode: 'CIV-2026-018',
    title: 'Sewer Line Overflow Contaminating...',
    category: 'Drainage',
    ward: 'Ward 22',
    locality: 'Sector 22',
    address: 'Ward 22, Sector 22, Nagpur',
    reports: 8,
    confirmations: 5,
    affectedProperties: 18,
    confidence: 89,
    priority: 88,
    status: 'Assigned',
    department: 'Drainage',
    slaTarget: '4h',
    slaRemaining: '2h 30m',
    isOverSla: false,
    reportedAgo: '1h 30m ago',
    reportedTime: '06:56 AM',
    description:
      'Sewer line overflow contaminating nearby residential area. Foul odor and standing water reported in multiple homes.',
    aiRationale:
      '8 reports with 5 confirmations. Overflow confirmed by water level sensors. Contamination risk to residential area.',
    priorityFactors: {
      safetyRisk: 82,
      severity: 85,
      duration: 70,
      vulnerability: 78,
      geographicImpact: 60,
      evidenceConfidence: 89,
    },
    timeline: [
      { time: '06:56 AM', date: '17 Aug 2026', status: 'Reported', note: 'Sewer overflow reports from residents.', actor: 'Citizen Signal' },
      { time: '07:10 AM', date: '17 Aug 2026', status: 'AI Clustered', note: '8 reports correlated. 89% confidence.', actor: 'AI Engine' },
      { time: '07:30 AM', date: '17 Aug 2026', status: 'Assigned', note: 'Assigned to Drainage department.', actor: 'Dispatcher' },
    ],
    contributingSignals: [
      { user: 'Resident (Sector 22)', text: 'Sewage water entering homes. Strong odor throughout street.', time: '1h 30m ago', verified: true },
    ],
  },
  {
    id: 'civ-2026-019',
    issueCode: 'CIV-2026-019',
    title: 'Street Light Cascade Failure',
    category: 'Street Lighting',
    ward: 'Ward 14',
    locality: 'North Corridor',
    address: 'Ward 14, North Corridor, Nagpur',
    reports: 35,
    confirmations: 10,
    affectedProperties: 28,
    confidence: 91,
    priority: 82,
    status: 'Department Resolved',
    department: 'Electrical Operations',
    slaTarget: '2h',
    slaRemaining: 'Completed',
    isOverSla: false,
    reportedAgo: '2 days ago',
    reportedTime: '15 Aug 2026',
    description:
      'Grid cascade failure affecting 28 properties along North Corridor. Feeder pillar FP-14 breaker lockout.',
    aiRationale:
      '35 citizen signals fused with grid sensor data. Feeder pillar breaker lockout confirmed. Repair completed.',
    priorityFactors: {
      safetyRisk: 85,
      severity: 80,
      duration: 50,
      vulnerability: 75,
      geographicImpact: 70,
      evidenceConfidence: 91,
    },
    timeline: [
      { time: '15:39', date: '15 Aug 2026', status: 'Reported', note: 'Street light failure reported.', actor: 'Citizen Signal' },
      { time: '15:45', date: '15 Aug 2026', status: 'Assigned', note: 'Assigned to Electrical Operations.', actor: 'Dispatcher' },
      { time: '16:30', date: '15 Aug 2026', status: 'Work Started', note: 'Field team on site. Breaker replacement underway.', actor: 'Team Delta' },
      { time: '18:00', date: '15 Aug 2026', status: 'Department Resolved', note: 'Feeder pillar repaired. All 28 properties restored.', actor: 'Team Delta' },
    ],
    contributingSignals: [
      { user: 'Multiple Residents', text: 'Entire corridor dark. Safety concern for evening commuters.', time: '2 days ago', verified: true },
    ],
    latestFieldUpdate: {
      text: 'Feeder pillar FP-14 breaker replaced. All 28 properties restored. Monitoring for 48 hours.',
      author: 'Team Delta (Electrical)',
      role: 'Field Team',
      time: '18:00',
    },
  },
  {
    id: 'civ-2026-020',
    issueCode: 'CIV-2026-020',
    title: 'Water Logging in Manewada',
    category: 'Drainage',
    ward: 'Ward 12',
    locality: 'Manewada',
    address: 'Ward 12, Manewada, Nagpur',
    reports: 5,
    confirmations: 3,
    affectedProperties: 8,
    confidence: 78,
    priority: 65,
    status: 'Reopened',
    department: 'Drainage',
    slaTarget: '6h',
    slaRemaining: '1h 20m',
    isOverSla: false,
    reportedAgo: '4h ago',
    reportedTime: '04:26 AM',
    description:
      'Water logging due to clogged storm drains. Previously resolved but issue recurred after rainfall.',
    aiRationale:
      '5 reports within 200m radius. Issue previously resolved 3 days ago. Recurrence suggests underlying drainage capacity issue.',
    priorityFactors: {
      safetyRisk: 65,
      severity: 60,
      duration: 75,
      vulnerability: 55,
      geographicImpact: 45,
      evidenceConfidence: 78,
    },
    timeline: [
      { time: '14:00', date: '14 Aug 2026', status: 'Reported', note: 'Initial water logging reported.', actor: 'Citizen Signal' },
      { time: '16:00', date: '14 Aug 2026', status: 'Resolved', note: 'Storm drain cleared.', actor: 'Team Echo' },
      { time: '04:26', date: '17 Aug 2026', status: 'Reopened', note: '3 citizens report issue remains unresolved after rainfall.', actor: 'Citizen Verification' },
    ],
    contributingSignals: [
      { user: 'Resident (Manewada)', text: 'Water logging returned after last night rain. Drain seems blocked again.', time: '4h ago', verified: true },
    ],
  },
];

// ─── Departments ──────────────────────────────────────────────

export interface DepartmentData {
  id: string;
  name: string;
  deptId: string;
  activeIssues: number;
  criticalIssues: number;
  slaRisk: number;
  avgResponseTime: string;
  avgResolutionTime: string;
  slaCompliance: number;
  resolutionRate: number;
  reopened: number;
  verificationRate: number;
  status: 'Stable' | 'Critical' | 'Optimal' | 'Warning';
  icon: string;
}

export const departments: DepartmentData[] = [
  {
    id: 'roads',
    name: 'Roads & Transport',
    deptId: 'RT-091',
    activeIssues: 412,
    criticalIssues: 12,
    slaRisk: 89,
    avgResponseTime: '3.5h',
    avgResolutionTime: '36h 12m',
    slaCompliance: 72,
    resolutionRate: 68,
    reopened: 5,
    verificationRate: 88,
    status: 'Stable',
    icon: '🛣️',
  },
  {
    id: 'water',
    name: 'Water Supply',
    deptId: 'WS-042',
    activeIssues: 320,
    criticalIssues: 5,
    slaRisk: 112,
    avgResponseTime: '1.2h',
    avgResolutionTime: '72h 45m',
    slaCompliance: 85,
    resolutionRate: 45,
    reopened: 8,
    verificationRate: 62,
    status: 'Critical',
    icon: '💧',
  },
  {
    id: 'sanitation',
    name: 'Sanitation & Waste',
    deptId: 'SW-011',
    activeIssues: 580,
    criticalIssues: 2,
    slaRisk: 24,
    avgResponseTime: '0.5h',
    avgResolutionTime: '12h 30m',
    slaCompliance: 95,
    resolutionRate: 92,
    reopened: 2,
    verificationRate: 95,
    status: 'Optimal',
    icon: '♻️',
  },
  {
    id: 'electrical',
    name: 'Electrical Operations',
    deptId: 'EO-033',
    activeIssues: 142,
    criticalIssues: 8,
    slaRisk: 45,
    avgResponseTime: '1.8h',
    avgResolutionTime: '24h 00m',
    slaCompliance: 88,
    resolutionRate: 81,
    reopened: 3,
    verificationRate: 81,
    status: 'Warning',
    icon: '⚡',
  },
  {
    id: 'drainage',
    name: 'Drainage',
    deptId: 'DR-028',
    activeIssues: 195,
    criticalIssues: 6,
    slaRisk: 38,
    avgResponseTime: '2.1h',
    avgResolutionTime: '18h 20m',
    slaCompliance: 82,
    resolutionRate: 76,
    reopened: 4,
    verificationRate: 78,
    status: 'Warning',
    icon: '🚿',
  },
];

// ─── Wards ────────────────────────────────────────────────────

export interface WardData {
  id: string;
  name: string;
  leadOfficer: string;
  leadInitials: string;
  activeIssues: number;
  criticalIssues: number;
  status: 'NOMINAL' | 'CRITICAL' | 'ELEVATED';
  fieldTeams: number;
  openTasks: number;
  overSla: number;
}

export const wards: WardData[] = [
  { id: 'W-01', name: 'Central', leadOfficer: 'Sarah Khan', leadInitials: 'SK', activeIssues: 45, criticalIssues: 3, status: 'NOMINAL', fieldTeams: 6, openTasks: 18, overSla: 2 },
  { id: 'W-04', name: 'North', leadOfficer: 'Raj Patel', leadInitials: 'RP', activeIssues: 82, criticalIssues: 11, status: 'CRITICAL', fieldTeams: 8, openTasks: 32, overSla: 7 },
  { id: 'W-08', name: 'Downtown', leadOfficer: 'Amit Deshmukh', leadInitials: 'AD', activeIssues: 56, criticalIssues: 4, status: 'NOMINAL', fieldTeams: 5, openTasks: 22, overSla: 3 },
  { id: 'W-12', name: 'East', leadOfficer: 'Anita Menon', leadInitials: 'AM', activeIssues: 12, criticalIssues: 1, status: 'NOMINAL', fieldTeams: 3, openTasks: 6, overSla: 0 },
  { id: 'W-14', name: 'Dharampeth', leadOfficer: 'Priya Sharma', leadInitials: 'PS', activeIssues: 42, criticalIssues: 7, status: 'ELEVATED', fieldTeams: 6, openTasks: 18, overSla: 3 },
  { id: 'W-22', name: 'South', leadOfficer: 'Vikram Joshi', leadInitials: 'VJ', activeIssues: 38, criticalIssues: 5, status: 'NOMINAL', fieldTeams: 4, openTasks: 14, overSla: 2 },
];

// ─── Field Teams ──────────────────────────────────────────────

export interface FieldTeam {
  id: string;
  name: string;
  department: string;
  ward: string;
  zone: string;
  status: 'Active' | 'Standby' | 'En Route' | 'On Site';
  capacity: string;
  members: { initials: string; color: string }[];
  focus: string;
  activeTasks: number;
  maxTasks: number;
}

export const fieldTeams: FieldTeam[] = [
  {
    id: 'team-alpha',
    name: 'Team Alpha (Roads)',
    department: 'Roads & Transport',
    ward: 'Ward 14',
    zone: 'Central Zone',
    status: 'Active',
    capacity: '6/8 Tasks',
    members: [
      { initials: 'JE', color: '#0F1E36' },
      { initials: 'AA', color: '#2563EB' },
    ],
    focus: 'Ward 14 • Central Zone',
    activeTasks: 6,
    maxTasks: 8,
  },
  {
    id: 'team-delta',
    name: 'Team Delta (Water)',
    department: 'Water Supply',
    ward: 'Ward 08',
    zone: 'North Zone',
    status: 'Active',
    capacity: '8/8 Tasks',
    members: [
      { initials: 'RK', color: '#0F1E36' },
      { initials: 'KT', color: '#DC2626' },
    ],
    focus: 'Ward 08 • North Zone',
    activeTasks: 8,
    maxTasks: 8,
  },
  {
    id: 'team-echo',
    name: 'Team Echo (Sanitation)',
    department: 'Sanitation & Waste',
    ward: 'Ward 22',
    zone: 'South Zone',
    status: 'Standby',
    capacity: 'Idle',
    members: [{ initials: 'PL', color: '#6B7280' }],
    focus: 'Ward 22 • South Zone',
    activeTasks: 0,
    maxTasks: 6,
  },
  {
    id: 'team-beta',
    name: 'Team Beta (Electrical)',
    department: 'Electrical Operations',
    ward: 'Ward 14',
    zone: 'Central Zone',
    status: 'Active',
    capacity: '4/6 Tasks',
    members: [
      { initials: 'MR', color: '#0F1E36' },
      { initials: 'SK', color: '#2563EB' },
    ],
    focus: 'Ward 14 • Central Zone',
    activeTasks: 4,
    maxTasks: 6,
  },
  {
    id: 'team-gamma',
    name: 'Team Gamma (Drainage)',
    department: 'Drainage',
    ward: 'Ward 12',
    zone: 'East Zone',
    status: 'En Route',
    capacity: '3/6 Tasks',
    members: [
      { initials: 'NK', color: '#0F1E36' },
      { initials: 'VR', color: '#10B981' },
    ],
    focus: 'Ward 12 • East Zone',
    activeTasks: 3,
    maxTasks: 6,
  },
];

// ─── Analytics Data ───────────────────────────────────────────

export interface AnalyticsData {
  pipeline: {
    rawReports: number;
    rawReportsChange: string;
    aiClustered: number;
    volumeReduction: string;
    verified: number;
    avgTime: string;
    resolved: number;
    resolutionRate: string;
    citizenConfirmed: number;
    satisfaction: string;
  };
  issueVolumeTrends: {
    month: string;
    water: number;
    roads: number;
    sanitation: number;
  }[];
  departmentSLACompliance: {
    name: string;
    compliance: number;
    avgResp: string;
    avgRes: string;
    status: 'good' | 'warning' | 'critical';
  }[];
  aiPatterns: {
    severity: 'Highly Critical' | 'Emerging Trend' | 'Moderate';
    title: string;
    description: string;
    action: string;
  }[];
}

export const analyticsData: AnalyticsData = {
  pipeline: {
    rawReports: 1402,
    rawReportsChange: '+12%',
    aiClustered: 854,
    volumeReduction: '-39% Volume Reduction',
    verified: 712,
    avgTime: '2.4h Avg',
    resolved: 540,
    resolutionRate: '75.8% Resolution Rate',
    citizenConfirmed: 518,
    satisfaction: '95.9% Satisfaction',
  },
  issueVolumeTrends: [
    { month: 'May 1', water: 45, roads: 60, sanitation: 30 },
    { month: 'May 8', water: 52, roads: 55, sanitation: 35 },
    { month: 'May 15', water: 48, roads: 70, sanitation: 28 },
    { month: 'May 22', water: 65, roads: 82, sanitation: 42 },
    { month: 'May 29', water: 58, roads: 75, sanitation: 38 },
  ],
  departmentSLACompliance: [
    { name: 'Water', compliance: 92, avgResp: '1.2h', avgRes: '24h', status: 'good' },
    { name: 'Roads', compliance: 72, avgResp: '3.5h', avgRes: '72h', status: 'warning' },
    { name: 'Sanitation', compliance: 95, avgResp: '0.5h', avgRes: '8h', status: 'good' },
    { name: 'Electrical', compliance: 62, avgResp: '5.2h', avgRes: '48h', status: 'critical' },
  ],
  aiPatterns: [
    {
      severity: 'Highly Critical',
      title: 'Recurring drainage failure in Ward 14',
      description:
        'Pattern recognized: 12 identical clusters reported within 500m radius post-rainfall. Indicates structural blockage.',
      action: 'DISPATCH INSPECTION TEAM',
    },
    {
      severity: 'Emerging Trend',
      title: 'Spike in pothole reports along Main Arterial',
      description:
        '35% increase in cluster velocity over last 48 hours following heavy traffic rerouting.',
      action: 'SCHEDULE URGENT PATCHING',
    },
  ],
};

// ─── Audit Log ────────────────────────────────────────────────

export interface AuditLogEntry {
  time: string;
  date: string;
  type: 'system' | 'officer' | 'alert' | 'admin';
  actor: string;
  action: string;
  target: string;
  detail: string;
}

export const auditLog: AuditLogEntry[] = [
  {
    time: '10:42 AM',
    date: 'Today',
    type: 'system',
    actor: 'System AI',
    action: 'reassigned',
    target: 'ISS-892',
    detail: 'to Unit Alpha. Reason: SLA breach risk detected.',
  },
  {
    time: '09:15 AM',
    date: 'Today',
    type: 'officer',
    actor: 'Raj Patel',
    action: 'updated status of',
    target: 'ISS-880',
    detail: 'to Resolving.',
  },
  {
    time: '',
    date: 'Yesterday',
    type: 'alert',
    actor: 'SLA Breach',
    action: 'on',
    target: 'ISS-875',
    detail: '(Ward 04). Escalated to Director.',
  },
  {
    time: '',
    date: 'Yesterday',
    type: 'admin',
    actor: 'Admin',
    action: 'modified alert',
    target: 'threshold',
    detail: 'for Ward 14 critical escalation from 2h to 1h.',
  },
];

// ─── AI Brief Data ────────────────────────────────────────────

export interface AIBriefData {
  greeting: string;
  capacityPercent: number;
  highlights: {
    text: string;
    isHighlight?: boolean;
  }[];
  fullReport?: string;
}

export const aiBriefData: AIBriefData = {
  greeting: 'Good morning.',
  capacityPercent: 92,
  highlights: [
    { text: 'Overall city operational capacity is nominal at 92%.' },
    { text: 'Ward 14', isHighlight: true },
    { text: ' is experiencing an anomalous spike in electrical hazard reports, highly correlated with last night\'s severe winds.' },
    { text: 'Sanitation backlogs in the northern district are clearing slower than anticipated due to vehicle maintenance downtime (3 trucks offline). Suggest re-routing Sector B fleet upon completion of their primary run.' },
  ],
};

// ─── Command Center Metrics ───────────────────────────────────

export interface CommandMetric {
  label: string;
  value: number;
  icon: string;
  color: 'red' | 'blue' | 'gray' | 'orange' | 'green';
  trend?: string;
}

export const commandMetrics: CommandMetric[] = [
  { label: 'CRITICAL ISSUES', value: 12, icon: '⚠️', color: 'red' },
  { label: 'HIGH PRIORITY', value: 38, icon: '❗', color: 'blue' },
  { label: 'UNASSIGNED', value: 17, icon: '📋', color: 'gray' },
  { label: 'IN PROGRESS', value: 64, icon: '🔧', color: 'gray' },
  { label: 'SLA AT RISK', value: 9, icon: '⏰', color: 'orange' },
  { label: 'PENDING VERIFY', value: 14, icon: '✅', color: 'green' },
];

// ─── Spatial Layers ───────────────────────────────────────────

export interface SpatialLayer {
  id: string;
  name: string;
  active: boolean;
  color: string;
}

export const spatialLayers: SpatialLayer[] = [
  { id: 'heatmap', name: 'Issue Heatmap', active: true, color: '#EF4444' },
  { id: 'infrastructure', name: 'Critical Infrastructure', active: false, color: '#3B82F6' },
  { id: 'sla-risk', name: 'SLA Risk Zones', active: true, color: '#EF4444' },
];

// ─── Resolution Cases ─────────────────────────────────────────

export interface ResolutionCase {
  id: string;
  issueCode: string;
  title: string;
  location: string;
  department: string;
  departmentIcon: string;
  departmentColor: string;
  status: 'In Progress' | 'Awaiting Verification' | 'Reopened';
  timeInState: string;
  progress: {
    reported: { done: boolean; current: boolean; time: string };
    assigned: { done: boolean; current: boolean; time: string };
    inProgress: { done: boolean; current: boolean; time: string };
    citizenVerified: { done: boolean; current: boolean; time: string };
  };
  latestUpdate?: {
    text: string;
    author: string;
    role: string;
    initials: string;
  };
}

export const resolutionCases: ResolutionCase[] = [
  {
    id: 'res-001',
    issueCode: 'CIV-2409-881',
    title: 'Major Water Line Rupture',
    location: 'Ward 14 • 4th Cross, Main Avenue',
    department: 'Dept. of Water Works',
    departmentIcon: '💧',
    departmentColor: '#2563EB',
    status: 'In Progress',
    timeInState: '4h 12m',
    progress: {
      reported: { done: true, current: false, time: '08:14 AM' },
      assigned: { done: true, current: false, time: '08:45 AM' },
      inProgress: { done: false, current: true, time: 'Ongoing' },
      citizenVerified: { done: false, current: false, time: '' },
    },
    latestUpdate: {
      text: '"Main valve shut off. Excavation complete. Proceeding with pipe replacement. Need 2 more hours."',
      author: 'Ramesh K.',
      role: 'Lead Engineer',
      initials: 'RK',
    },
  },
  {
    id: 'res-002',
    issueCode: 'CIV-2409-882',
    title: 'Fallen Tree Clearance',
    location: 'Ward 12 • Park Street',
    department: 'Parks & Recreation',
    departmentIcon: '🌳',
    departmentColor: '#10B981',
    status: 'Awaiting Verification',
    timeInState: '1d 2h',
    progress: {
      reported: { done: true, current: false, time: '10:30 AM' },
      assigned: { done: true, current: false, time: '11:00 AM' },
      inProgress: { done: true, current: false, time: 'Completed' },
      citizenVerified: { done: false, current: false, time: '' },
    },
    latestUpdate: {
      text: '"Awaiting contractor machinery deployment for stump removal."',
      author: 'Dept. Supervisor',
      role: 'Operations',
      initials: 'DS',
    },
  },
  {
    id: 'res-003',
    issueCode: 'CIV-2409-875',
    title: 'Pothole Cluster - Main Arterial',
    location: 'Ward 04 • Main Arterial Road',
    department: 'Roads & Transport',
    departmentIcon: '🛣️',
    departmentColor: '#0F1E36',
    status: 'Reopened',
    timeInState: '2d 6h',
    progress: {
      reported: { done: true, current: false, time: '06:15 AM' },
      assigned: { done: true, current: false, time: '06:45 AM' },
      inProgress: { done: true, current: false, time: 'Completed' },
      citizenVerified: { done: false, current: false, time: '' },
    },
    latestUpdate: {
      text: '"3 citizens report issue remains unresolved. Pothole filled but surface already cracking."',
      author: 'Citizen Verification',
      role: 'Community',
      initials: 'CV',
    },
  },
];

// ─── Priority Queue Items ─────────────────────────────────────

export interface PriorityQueueItem {
  id: string;
  title: string;
  ward: string;
  reports: number;
  radius: string;
  confidence: number;
  priority: number;
}

export const priorityQueue: PriorityQueueItem[] = [
  {
    id: 'pq-001',
    title: 'Exposed Electrical Wire Near Primary...',
    ward: 'Ward 14',
    reports: 12,
    radius: '15m radius',
    confidence: 93,
    priority: 94,
  },
  {
    id: 'pq-002',
    title: 'Sewer Line Overflow Contaminating...',
    ward: 'Ward 22',
    reports: 8,
    radius: '50m radius',
    confidence: 89,
    priority: 88,
  },
  {
    id: 'pq-003',
    title: 'Pothole Cluster on Main Arterial Road',
    ward: 'Ward 08',
    reports: 42,
    radius: '500m stretch',
    confidence: 85,
    priority: 72,
  },
];
