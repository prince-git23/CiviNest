import { CivicInterestItem, OnboardingStepId, SocietyItem } from '../../types';

export interface StepConfig {
  id: OnboardingStepId;
  stepNumber: number;
  label: string;
  shortLabel: string;
  heading: string;
  subtitle: string;
  sceneCode: string;
  sceneTitle: string;
  sceneDescription: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: 'profile',
    stepNumber: 1,
    label: 'Profile',
    shortLabel: 'PROFILE',
    heading: 'Basic Information',
    subtitle: 'Used to verify your identity within civic networks.',
    sceneCode: 'NODE.ACTIVE // NGP-04',
    sceneTitle: 'Connecting Nodes',
    sceneDescription: "Establishing secure connection to Nagpur's central civic intelligence grid.",
    cameraPosition: [16, 17, 17],
    cameraTarget: [0, 1.4, 0],
  },
  {
    id: 'location',
    stepNumber: 2,
    label: 'Location',
    shortLabel: 'LOCATION',
    heading: 'Your Ward & Locality',
    subtitle: 'Help CiviNest tailor civic intelligence to your immediate area.',
    sceneCode: 'GIS.LOCK // WARD-12',
    sceneTitle: 'Spatial Mapping',
    sceneDescription: 'Targeting local infrastructure and ward telemetry coordinates.',
    cameraPosition: [-7.5, 7.2, 8.5],
    cameraTarget: [-4.2, 1.0, 3.8],
  },
  {
    id: 'community',
    stepNumber: 3,
    label: 'Community',
    shortLabel: 'COMMUNITY',
    heading: 'Join a Society',
    subtitle: 'Connect with your local housing society, RWA, or neighborhood council.',
    sceneCode: 'MESH.LINK // RWA-CLUSTER',
    sceneTitle: 'Community Graph',
    sceneDescription: 'Connecting your node to verified resident clusters and neighborhood councils.',
    cameraPosition: [-3.5, 9.8, 6.2],
    cameraTarget: [-1.2, 1.5, 0.8],
  },
  {
    id: 'interests',
    stepNumber: 4,
    label: 'Interests',
    shortLabel: 'INTERESTS',
    heading: 'Civic Interests',
    subtitle: 'Choose the civic issue streams and alert feeds you want to monitor and prioritize.',
    sceneCode: 'SIGNALS.CALIBRATE // 8 FEEDS',
    sceneTitle: 'Civic Signal Tuning',
    sceneDescription: 'Calibrating multi-stream AI filters for water, power, roads, and sanitation.',
    cameraPosition: [6.8, 8.5, 7.2],
    cameraTarget: [0, 2.0, 0],
  },
  {
    id: 'review',
    stepNumber: 5,
    label: 'Review',
    shortLabel: 'REVIEW',
    heading: 'Almost there',
    subtitle: 'Review your civic identity parameters before establishing your live connection.',
    sceneCode: 'NODE.READY // SYSTEM COHERENT',
    sceneTitle: 'Civic Profile Ready',
    sceneDescription: 'Your personalized civic intelligence pipeline is initialized and active.',
    cameraPosition: [12, 14, 14],
    cameraTarget: [0, 1.6, 0],
  },
];

export const CITIES_AND_WARDS: Record<
  string,
  {
    code: string;
    wards: { id: string; name: string; zone: string; pincode: string }[];
  }
> = {
  Nagpur: {
    code: 'NGP',
    wards: [
      { id: 'ward-12', name: 'Dharampeth (Ward 12)', zone: 'West Zone', pincode: '440010' },
      { id: 'ward-14', name: 'Sitabuldi (Ward 14)', zone: 'Central Zone', pincode: '440012' },
      { id: 'ward-08', name: 'Mahal (Ward 08)', zone: 'East Zone', pincode: '440032' },
      { id: 'ward-04', name: 'Sadar (Ward 04)', zone: 'North Zone', pincode: '440001' },
      { id: 'ward-15', name: 'Ramdaspeth (Ward 15)', zone: 'West Zone', pincode: '440010' },
      { id: 'ward-02', name: 'Civil Lines (Ward 02)', zone: 'Central Zone', pincode: '440001' },
    ],
  },
  Pune: {
    code: 'PUN',
    wards: [
      { id: 'ward-06', name: 'Kothrud (Ward 06)', zone: 'West Zone', pincode: '411038' },
      { id: 'ward-11', name: 'Aundh-Baner (Ward 11)', zone: 'North-West Zone', pincode: '411007' },
      { id: 'ward-09', name: 'Viman Nagar (Ward 09)', zone: 'East Zone', pincode: '411014' },
      { id: 'ward-03', name: 'Shivaji Nagar (Ward 03)', zone: 'Central Zone', pincode: '411005' },
    ],
  },
  Mumbai: {
    code: 'BOM',
    wards: [
      { id: 'ward-k-west', name: 'Andheri West (K-West)', zone: 'Western Suburbs', pincode: '400053' },
      { id: 'ward-h-west', name: 'Bandra West (H-West)', zone: 'Western Suburbs', pincode: '400050' },
      { id: 'ward-d', name: 'Malabar Hill (D Ward)', zone: 'South Mumbai', pincode: '400006' },
      { id: 'ward-f-north', name: 'Matunga (F-North)', zone: 'Central Mumbai', pincode: '400019' },
    ],
  },
  Bengaluru: {
    code: 'BLR',
    wards: [
      { id: 'ward-150', name: 'Bellandur (Ward 150)', zone: 'Mahadevapura', pincode: '560103' },
      { id: 'ward-174', name: 'HSR Layout (Ward 174)', zone: 'Bommanahalli', pincode: '560102' },
      { id: 'ward-112', name: 'Indiranagar (Ward 112)', zone: 'East Zone', pincode: '560038' },
      { id: 'ward-168', name: 'Koramangala (Ward 168)', zone: 'South Zone', pincode: '560034' },
    ],
  },
};

export const AVAILABLE_SOCIETIES: SocietyItem[] = [
  {
    id: 'soc-01',
    name: 'Shalimar Apartments RWA',
    type: 'Apartment Complex',
    ward: 'Dharampeth (Ward 12)',
    memberCount: 142,
    isVerified: true,
  },
  {
    id: 'soc-02',
    name: 'Gokulpeth Residents Forum',
    type: 'Residents Forum',
    ward: 'Dharampeth (Ward 12)',
    memberCount: 310,
    isVerified: true,
  },
  {
    id: 'soc-03',
    name: 'Dharampeth Greens Association',
    type: 'RWA',
    ward: 'Dharampeth (Ward 12)',
    memberCount: 88,
    isVerified: true,
  },
  {
    id: 'soc-04',
    name: 'Central Park Towers RWA',
    type: 'Apartment Complex',
    ward: 'Ramdaspeth (Ward 15)',
    memberCount: 224,
    isVerified: true,
  },
  {
    id: 'soc-05',
    name: 'Shivaji Nagar Welfare Guild',
    type: 'Neighborhood Guild',
    ward: 'Sitabuldi (Ward 14)',
    memberCount: 418,
    isVerified: true,
  },
  {
    id: 'soc-06',
    name: 'Civil Lines Heritage Enclave',
    type: 'RWA',
    ward: 'Civil Lines (Ward 02)',
    memberCount: 96,
    isVerified: true,
  },
];

export const CIVIC_INTERESTS: CivicInterestItem[] = [
  {
    id: 'water',
    label: 'Water Supply & Drainage',
    category: 'Utilities',
    color: '#2563EB',
    hexColor: 0x2563eb,
    description: 'Pressure drops, contaminated supply, storm drainage blockages',
  },
  {
    id: 'roads',
    label: 'Roads & Pavements',
    category: 'Mobility',
    color: '#D97706',
    hexColor: 0xd97706,
    description: 'Potholes, broken footpaths, road cave-ins & dividers',
  },
  {
    id: 'lighting',
    label: 'Street Lighting & Signals',
    category: 'Safety',
    color: '#CA8A04',
    hexColor: 0xca8a04,
    description: 'Dark corridors, non-functional street lamps, signal failures',
  },
  {
    id: 'waste',
    label: 'Waste Management',
    category: 'Sanitation',
    color: '#059669',
    hexColor: 0x059669,
    description: 'Overflowing bins, uncollected garbage, open dumping spots',
  },
  {
    id: 'parks',
    label: 'Public Parks & Trees',
    category: 'Environment',
    color: '#0D9488',
    hexColor: 0x0d9488,
    description: 'Fallen branches, park lighting, walking track maintenance',
  },
  {
    id: 'safety',
    label: 'Traffic & Neighborhood Safety',
    category: 'Security',
    color: '#DC2626',
    hexColor: 0xdc2626,
    description: 'Dangerous crossings, speeding zones, school perimeter safety',
  },
  {
    id: 'power',
    label: 'Power Grid & Transformers',
    category: 'Infrastructure',
    color: '#7C3AED',
    hexColor: 0x7c3aed,
    description: 'Voltage fluctuations, exposed wires, transformer sparks',
  },
  {
    id: 'amenities',
    label: 'Public Amenities & Health',
    category: 'Community',
    color: '#4B5563',
    hexColor: 0x4b5563,
    description: 'Public restrooms, stray animal alerts, community center repairs',
  },
];
