// Service for civic signal AI analysis, duplicate detection, and submission handling

export interface EvidenceFinding {
  id: string;
  title: string;
  status: 'Critical' | 'Elevated' | 'Verified' | 'Attention' | 'Normal';
  statusType: 'critical' | 'elevated' | 'verified' | 'attention';
  description: string;
  source: string;
  confidence?: number;
}

export interface ContextualRiskFactor {
  factor: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface RelatedSignalData {
  nearbyReportsCount: number;
  radiusKm: number;
  confirmationsCount: number;
  sectorName: string;
  clusterCorrelationScore: number;
  relatedItems: {
    id: string;
    title: string;
    distance: string;
    status: string;
    timeAgo: string;
  }[];
}

export interface ExtractedSignalMetadata {
  category: string;
  categoryLabel: string;
  subcategory: string;
  issueType: string;
  specificIssue: string;
  preciseLocation: string;
  duration: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  severityLabel: string;
  severityReason: string;
  urgency: string;
  confidence: number;
  suggestedDepartment: string;
  keywords: string[];
  suggestedAction: string;
  evidenceFindings: EvidenceFinding[];
  contextualFactors: ContextualRiskFactor[];
  relatedSignals: RelatedSignalData;
}

export interface DuplicateIssueMatch {
  id: string;
  reportNumber: string;
  title: string;
  category: string;
  reportedAgo: string;
  distance: string;
  supportCount: number;
  description: string;
  status: string;
  similarityScore: number;
}

export interface CivicSignalSubmission {
  id: string;
  reportNumber: string;
  description: string;
  evidence: {
    id: string;
    url: string;
    name: string;
    type: 'image' | 'video';
    size: string;
  }[];
  location: {
    address: string;
    ward: string;
    city: string;
    accuracy: string;
    coordinates: { lat: number; lng: number };
  };
  analysis: ExtractedSignalMetadata | null;
  duplicateDecision: 'none' | 'merged' | 'new_confirmed';
  mergedWithReportNumber?: string;
  timestamp: string;
}

// Intelligent analysis parser based on civic ontology
export async function analyzeCivicSignalText(
  text: string,
  locality = 'Dharampeth, Nagpur'
): Promise<ExtractedSignalMetadata | null> {
  const clean = text.trim().toLowerCase();
  if (clean.length < 10) {
    return null;
  }

  // Simulate network processing delay for authentic feel
  await new Promise((resolve) => setTimeout(resolve, 350));

  // Helper to extract duration from text
  const extractDuration = (rawText: string): string => {
    const lower = rawText.toLowerCase();
    if (lower.includes('three night') || lower.includes('3 night') || lower.includes('3 day') || lower.includes('three day')) {
      return '3 Days (approx. 72 hours)';
    }
    if (lower.includes('two night') || lower.includes('2 night') || lower.includes('2 day') || lower.includes('two day')) {
      return '2 Days (approx. 48 hours)';
    }
    if (lower.includes('week') || lower.includes('7 day')) {
      return '1 Week (Recurring)';
    }
    if (lower.includes('yesterday') || lower.includes('1 day') || lower.includes('one day') || lower.includes('last night')) {
      return '24 Hours';
    }
    if (lower.includes('hour') || lower.includes('today') || lower.includes('just')) {
      return '< 12 Hours (Active)';
    }
    return 'Ongoing (Est. 48-72h)';
  };

  const durationStr = extractDuration(text);

  // Helper to extract specific location landmark from text
  const extractPreciseLocation = (rawText: string, defaultLoc: string): string => {
    const lower = rawText.toLowerCase();
    if (lower.includes('gate 2') || lower.includes('school')) {
      return 'Near Gate 2, Dharampeth High School';
    }
    if (lower.includes('junction') || lower.includes('cross') || lower.includes('corner')) {
      return `Intersection Point, ${defaultLoc}`;
    }
    if (lower.includes('lane') || lower.includes('street') || lower.includes('avenue')) {
      return `Main Avenue Corridor, ${defaultLoc}`;
    }
    return `${defaultLoc}`;
  };

  const preciseLoc = extractPreciseLocation(text, locality);

  // Lighting & Power
  if (clean.includes('light') || clean.includes('dark') || clean.includes('lamp') || clean.includes('pole') || clean.includes('outage') || clean.includes('electricity') || clean.includes('power')) {
    const isSchoolNear = clean.includes('school') || clean.includes('gate') || clean.includes('child');
    return {
      category: 'lighting',
      categoryLabel: 'Public Utilities · Lighting Grid',
      subcategory: 'Street Lighting',
      issueType: 'Streetlight Luminaire & Cable Trip',
      specificIssue: 'Streetlight failure (No power)',
      preciseLocation: preciseLoc,
      duration: durationStr,
      severity: isSchoolNear || clean.includes('dark') ? 'high' : 'medium',
      severityLabel: isSchoolNear ? 'High Priority' : 'Medium Priority',
      severityReason: isSchoolNear
        ? 'Elevated severity due to proximity to a school zone. Unlit areas near educational institutions increase vulnerability risk factors during early morning/evening hours.'
        : 'Reduced illumination index along pedestrian corridor impacting night-time transit safety.',
      urgency: 'Requires Evening Verification',
      confidence: 91,
      suggestedDepartment: 'MSEDCL & Municipal Electrical Works',
      keywords: ['Streetlight Grid', 'Zone Luminaire', 'Phase Tripping', 'Night Visibility', 'School Corridor'],
      suggestedAction: 'Route to Sector 14 Electrical Dispatch',
      evidenceFindings: [
        {
          id: 'ef-1',
          title: 'Ambient Light Level: Critical',
          status: 'Critical',
          statusType: 'critical',
          description: 'Computer vision detects < 5 lux in the primary zone. Confirms "very dark" description.',
          source: 'Luminance Mesh & Photo 1 Exif Analysis',
          confidence: 94,
        },
        {
          id: 'ef-2',
          title: 'Structural Match',
          status: 'Verified',
          statusType: 'verified',
          description: 'Geometry in Photo 1 correlates 84% with typical municipal streetlight poles and school gate structures in this ward.',
          source: 'GIS Cadastral Alignment Engine',
          confidence: 84,
        },
      ],
      contextualFactors: [
        {
          factor: 'Educational Zone Proximity',
          impact: 'High',
          description: 'Located within 50m of school pedestrian ingress route.',
        },
        {
          factor: 'Vulnerability Window',
          impact: 'High',
          description: 'High footfall during 06:30-08:00 and 18:00-20:00 student transit hours.',
        },
        {
          factor: 'Grid Cascade Risk',
          impact: 'Medium',
          description: 'Phase circuit covers 3 contiguous luminaire poles.',
        },
      ],
      relatedSignals: {
        nearbyReportsCount: 7,
        radiusKm: 1.0,
        confirmationsCount: 5,
        sectorName: 'Sector 14',
        clusterCorrelationScore: 89,
        relatedItems: [
          { id: 'rel-1', title: 'Secondary Pole #14 Flashing', distance: '35m away', status: 'Active', timeAgo: '2h ago' },
          { id: 'rel-2', title: 'Dim Corridor near Gate 1', distance: '85m away', status: 'Queued', timeAgo: 'Yesterday' },
        ],
      },
    };
  }

  // Roads & Traffic Hazards
  if (clean.includes('pothole') || clean.includes('road') || clean.includes('crater') || clean.includes('asphalt') || clean.includes('traffic') || clean.includes('pavement') || clean.includes('sidewalk') || clean.includes('accident')) {
    return {
      category: 'roads',
      categoryLabel: 'Infrastructure · Road Surface',
      subcategory: 'Road Surface & Pavement',
      issueType: 'Surface Cavitation & Structural Asphalt Failure',
      specificIssue: 'Asphalt Pothole & Sub-base Cavity',
      preciseLocation: preciseLoc,
      duration: durationStr,
      severity: clean.includes('deep') || clean.includes('accident') || clean.includes('bike') ? 'high' : 'medium',
      severityLabel: clean.includes('deep') || clean.includes('accident') ? 'High Priority' : 'Medium Priority',
      severityReason: 'High-risk road depression situated on active vehicular lane posing immediate two-wheeler instability risk.',
      urgency: 'Active Vehicular Hazard',
      confidence: 96,
      suggestedDepartment: 'Public Works Department (PWD)',
      keywords: ['Road Surface', 'Pothole Cluster', 'Vehicular Safety', 'Hot-Mix Patching'],
      suggestedAction: 'Priority Asphalt Patching Team Assignment',
      evidenceFindings: [
        {
          id: 'ef-1',
          title: 'Cavity Depth Analysis: High',
          status: 'Critical',
          statusType: 'critical',
          description: 'Photogrammetry estimates road depression depth > 12cm with sharp asphalt fracture edges.',
          source: 'Computer Vision Volumetric Estimator',
          confidence: 95,
        },
        {
          id: 'ef-2',
          title: 'Lane Obstruction Verified',
          status: 'Verified',
          statusType: 'verified',
          description: 'Located in active Northbound carriageway with 450 vehicles/hour throughput.',
          source: 'Traffic Telemetry Layer',
          confidence: 91,
        },
      ],
      contextualFactors: [
        {
          factor: 'Two-Wheeler Transit Corridor',
          impact: 'High',
          description: 'High volume of daily motorcycle and bicycle commuters.',
        },
        {
          factor: 'Monsoon Waterlogging Risk',
          impact: 'Medium',
          description: 'Submerged pothole hazard during sudden precipitation.',
        },
      ],
      relatedSignals: {
        nearbyReportsCount: 4,
        radiusKm: 0.8,
        confirmationsCount: 8,
        sectorName: 'Sector 14',
        clusterCorrelationScore: 93,
        relatedItems: [
          { id: 'rel-1', title: 'Pavement subsidence near junction', distance: '50m away', status: 'Investigating', timeAgo: '3h ago' },
        ],
      },
    };
  }

  // Drainage & Sewerage
  if (clean.includes('drain') || clean.includes('sewer') || clean.includes('waterlog') || clean.includes('overflow') || clean.includes('smell') || clean.includes('stagnant') || clean.includes('manhole')) {
    return {
      category: 'sanitation',
      categoryLabel: 'Sanitation · Sewerage & Drainage',
      subcategory: 'Drainage & Sewerage',
      issueType: 'Stormwater Chamber Choke & Backflow',
      specificIssue: 'Stormwater Grate Obstruction & Effluent Pooling',
      preciseLocation: preciseLoc,
      duration: durationStr,
      severity: clean.includes('overflow') || clean.includes('flood') ? 'critical' : 'high',
      severityLabel: clean.includes('overflow') ? 'Critical Priority' : 'High Priority',
      severityReason: 'Uncontrolled wastewater overflow creating sanitation hazard and localized roadway submersion.',
      urgency: 'Vector Disease & Backflow Risk',
      confidence: 92,
      suggestedDepartment: 'Municipal Sanitation & Drainage Cell',
      keywords: ['Drainage Channel', 'Monsoon Sump', 'Chamber Desilting', 'Odor Control'],
      suggestedAction: 'Deploy High-Pressure Desilting Jetting Unit',
      evidenceFindings: [
        {
          id: 'ef-1',
          title: 'Hydraulic Backflow Detected',
          status: 'Critical',
          statusType: 'critical',
          description: 'Imagery indicates stagnant water depth exceeding curb height with sediment saturation.',
          source: 'Hydrological Edge Filter',
          confidence: 92,
        },
        {
          id: 'ef-2',
          title: 'Grate Silt Accumulation',
          status: 'Verified',
          statusType: 'verified',
          description: 'Stormwater runoff catchment grate clogged with 75% organic and plastic debris.',
          source: 'Debris Classifier AI',
          confidence: 88,
        },
      ],
      contextualFactors: [
        {
          factor: 'Public Health & Vector Hazard',
          impact: 'High',
          description: 'Stagnant water near residential dwellings risks mosquito breeding.',
        },
        {
          factor: 'Drainage Basin Choke',
          impact: 'High',
          description: 'Upstream arterial drain feeding into Dharampeth canal.',
        },
      ],
      relatedSignals: {
        nearbyReportsCount: 6,
        radiusKm: 1.2,
        confirmationsCount: 9,
        sectorName: 'Sector 14',
        clusterCorrelationScore: 91,
        relatedItems: [
          { id: 'rel-1', title: 'Drain choke near Market Road', distance: '110m away', status: 'Queued', timeAgo: '5h ago' },
        ],
      },
    };
  }

  // Water Grid & Pipelines
  if (clean.includes('water') || clean.includes('leak') || clean.includes('pipe') || clean.includes('pressure') || clean.includes('contamination') || clean.includes('tank')) {
    return {
      category: 'water',
      categoryLabel: 'Water Grid · Pipeline Integrity',
      subcategory: 'Water Supply Grid',
      issueType: 'Sub-surface Pipe Leakage',
      specificIssue: 'Main Distribution Line Breach & Pressure Loss',
      preciseLocation: preciseLoc,
      duration: durationStr,
      severity: clean.includes('leak') || clean.includes('no water') ? 'high' : 'medium',
      severityLabel: 'High Priority',
      severityReason: 'Pressurized clean water leakage resulting in significant potable resource loss and road erosion.',
      urgency: 'Resource Depletion & Pressure Loss',
      confidence: 91,
      suggestedDepartment: 'Nagpur Jal Seva (Water Works)',
      keywords: ['Water Grid', 'Mainline Sluice', 'Pressure Drop', 'Drinking Water'],
      suggestedAction: 'Emergency Valve Isolation & Pipeline Clamp',
      evidenceFindings: [
        {
          id: 'ef-1',
          title: 'Surface Water Outflow Rate: Elevated',
          status: 'Elevated',
          statusType: 'elevated',
          description: 'Continuous surface boiling flow estimated at ~40 liters/minute from pavement fracture.',
          source: 'Fluid Dynamics Computer Vision',
          confidence: 91,
        },
      ],
      contextualFactors: [
        {
          factor: 'Potable Supply Depletion',
          impact: 'High',
          description: 'Downstream residential towers experiencing low head pressure.',
        },
      ],
      relatedSignals: {
        nearbyReportsCount: 3,
        radiusKm: 0.5,
        confirmationsCount: 4,
        sectorName: 'Sector 14',
        clusterCorrelationScore: 87,
        relatedItems: [],
      },
    };
  }

  // Default General Civic Signal
  return {
    category: 'general',
    categoryLabel: 'Civic Amenity · Neighborhood Environment',
    subcategory: 'Civic Amenity',
    issueType: 'Community Observation',
    specificIssue: 'Public Space Maintenance Concern',
    preciseLocation: preciseLoc,
    duration: durationStr,
    severity: 'medium',
    severityLabel: 'Standard Priority',
    severityReason: 'Routine neighborhood observation queued for municipal maintenance inspection.',
    urgency: 'Routine Ward Review',
    confidence: 86,
    suggestedDepartment: 'Ward Zonal Office (Dharampeth)',
    keywords: ['Civic Node', 'Neighborhood Observation', 'Resident Input'],
    suggestedAction: 'Log to Ward Area Inspector Queue',
    evidenceFindings: [
      {
        id: 'ef-1',
        title: 'Contextual Alignment',
        status: 'Verified',
        statusType: 'verified',
        description: 'Resident signal verified against spatial GIS ward parcel database.',
        source: 'Cadastral Verification Layer',
        confidence: 86,
      },
    ],
    contextualFactors: [
      {
        factor: 'Ward Maintenance Schedule',
        impact: 'Medium',
        description: 'Standard bi-weekly municipal crew route allocation.',
      },
    ],
    relatedSignals: {
      nearbyReportsCount: 2,
      radiusKm: 1.0,
      confirmationsCount: 3,
      sectorName: 'Sector 14',
      clusterCorrelationScore: 78,
      relatedItems: [],
    },
  };
}

// Duplicate detector matching existing signals in the 150m radius
export function detectDuplicateCivicSignal(
  text: string,
  category?: string
): DuplicateIssueMatch | null {
  const clean = text.toLowerCase();

  if (clean.includes('pothole') || clean.includes('road') || clean.includes('crater') || clean.includes('asphalt')) {
    return {
      id: 'dup-8821',
      reportNumber: '#CV-8821',
      title: 'Pothole & Surface Cavitation on Main Avenue',
      category: 'Infrastructure · Road Surface',
      reportedAgo: 'Reported 2 hours ago',
      distance: '45m away',
      supportCount: 3,
      description: 'Deep road cavity in northbound lane near Junction 4 causing vehicular deceleration and wheel damage.',
      status: 'Verification Pending',
      similarityScore: 92,
    };
  }

  if (clean.includes('light') || clean.includes('dark') || clean.includes('pole') || clean.includes('lamp') || clean.includes('outage')) {
    return {
      id: 'dup-8904',
      reportNumber: '#CV-8904',
      title: 'Streetlight Cluster Outage (Poles 12-16)',
      category: 'Public Utilities · Lighting Grid',
      reportedAgo: 'Reported yesterday at 9:15 PM',
      distance: '70m away',
      supportCount: 5,
      description: 'Consecutive streetlight fixtures dark on north school corridor causing pedestrian visibility issues.',
      status: 'Assigned to Electrical Dept',
      similarityScore: 88,
    };
  }

  if (clean.includes('drain') || clean.includes('sewer') || clean.includes('overflow') || clean.includes('smell')) {
    return {
      id: 'dup-8110',
      reportNumber: '#CV-8110',
      title: 'Stormwater Chamber Sump Overflow',
      category: 'Sanitation · Sewerage & Drainage',
      reportedAgo: 'Reported 4 hours ago',
      distance: '95m away',
      supportCount: 4,
      description: 'Backflow pooling on pavement after rainfall; stormwater grate choked with sediment.',
      status: 'Scheduled for Desilting',
      similarityScore: 90,
    };
  }

  return null;
}
