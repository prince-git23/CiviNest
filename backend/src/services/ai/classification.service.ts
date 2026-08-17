import {
  AIProvider,
  AIClassificationInput,
  AIClassificationResult,
  registerProvider,
} from './ai.provider.js';

// ── Category ontology ──

interface CategoryRule {
  category: string;
  label: string;
  service: string;
  publicSafety: boolean;
  keywords: string[];
  severityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>;
  safetyKeywords: string[];
  defaultSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'water_supply',
    label: 'Water Supply',
    service: 'water',
    publicSafety: false,
    keywords: ['water', 'leak', 'pipe', 'pressure', 'no water', 'supply', 'tank', 'contamination'],
    severityMap: {
      leak: 'MEDIUM',
      contamination: 'CRITICAL',
      'no water': 'HIGH',
      pressure: 'MEDIUM',
    },
    safetyKeywords: ['contamination', 'poison', 'chemical'],
    defaultSeverity: 'MEDIUM',
  },
  {
    category: 'roads',
    label: 'Roads & Pavements',
    service: 'roads',
    publicSafety: true,
    keywords: ['pothole', 'road', 'crater', 'asphalt', 'pavement', 'sidewalk', 'cave-in', 'divider'],
    severityMap: {
      pothole: 'MEDIUM',
      'cave-in': 'CRITICAL',
      crater: 'HIGH',
      accident: 'CRITICAL',
    },
    safetyKeywords: ['accident', 'blocked', 'collapse', 'cave-in'],
    defaultSeverity: 'MEDIUM',
  },
  {
    category: 'street_lighting',
    label: 'Street Lighting',
    service: 'electricity',
    publicSafety: true,
    keywords: ['light', 'lamp', 'pole', 'dark', 'streetlight', 'glow', 'illumination', 'bulb'],
    severityMap: {
      dark: 'HIGH',
      school: 'HIGH',
      child: 'MEDIUM',
    },
    safetyKeywords: ['school', 'child', 'accident', 'dark'],
    defaultSeverity: 'MEDIUM',
  },
  {
    category: 'drainage',
    label: 'Drainage & Sewerage',
    service: 'sanitation',
    publicSafety: false,
    keywords: ['drain', 'sewer', 'waterlog', 'overflow', 'smell', 'stagnant', 'manhole', 'flood'],
    severityMap: {
      overflow: 'CRITICAL',
      flood: 'CRITICAL',
      manhole: 'HIGH',
      smell: 'MEDIUM',
    },
    safetyKeywords: ['flood', 'overflow', 'child', 'accident'],
    defaultSeverity: 'HIGH',
  },
  {
    category: 'waste',
    label: 'Waste Management',
    service: 'sanitation',
    publicSafety: false,
    keywords: ['garbage', 'waste', 'bin', 'trash', 'rubbish', 'dumping', 'uncollected'],
    severityMap: {
      dumping: 'MEDIUM',
      uncollected: 'MEDIUM',
    },
    safetyKeywords: ['disease', 'vector', 'child'],
    defaultSeverity: 'LOW',
  },
  {
    category: 'electricity',
    label: 'Power Grid',
    service: 'electricity',
    publicSafety: true,
    keywords: ['power', 'electricity', 'transformer', 'voltage', 'wire', 'outage', 'spark', 'current'],
    severityMap: {
      transformer: 'CRITICAL',
      spark: 'CRITICAL',
      outage: 'HIGH',
      wire: 'HIGH',
      voltage: 'MEDIUM',
    },
    safetyKeywords: ['spark', 'fire', 'shock', 'explosion', 'transformer'],
    defaultSeverity: 'MEDIUM',
  },
  {
    category: 'public_safety',
    label: 'Public Safety',
    service: 'safety',
    publicSafety: true,
    keywords: ['fire', 'gas', 'leak', 'hazard', 'danger', 'emergency', 'smoke', 'blocked road', 'manhole open'],
    severityMap: {
      fire: 'CRITICAL',
      gas: 'CRITICAL',
      emergency: 'CRITICAL',
      hazard: 'HIGH',
      smoke: 'CRITICAL',
    },
    safetyKeywords: ['fire', 'gas', 'emergency', 'explosion', 'hazard'],
    defaultSeverity: 'HIGH',
  },
  {
    category: 'parks',
    label: 'Public Parks & Trees',
    service: 'environment',
    publicSafety: false,
    keywords: ['park', 'tree', 'branch', 'garden', 'bench', 'walking track'],
    severityMap: {
      branch: 'MEDIUM',
      tree: 'MEDIUM',
    },
    safetyKeywords: ['fallen', 'falling', 'child'],
    defaultSeverity: 'LOW',
  },
];

// ── Estimated confidence computation ──
// Transparent estimation based on structured signals, never random.

function estimateConfidence(
  matchedKeywords: number,
  totalRuleKeywords: number,
  textLength: number,
  ambiguityScore: number
): { confidence: number; source: 'ESTIMATED' } {
  const keywordCoverage = Math.min(matchedKeywords / Math.max(totalRuleKeywords, 1), 1);
  const lengthSignal = Math.min(textLength / 80, 1);
  const certainty = 1 - ambiguityScore;

  // Weighted combination of structured signals
  let confidence = 0.55 * keywordCoverage + 0.3 * certainty + 0.15 * lengthSignal;
  confidence = Math.min(Math.max(confidence, 0.3), 0.97);

  return { confidence: Math.round(confidence * 100) / 100, source: 'ESTIMATED' };
}

// ── Deterministic severity overrides ──

function computeSeverity(
  rule: CategoryRule,
  text: string
): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN' {
  const lower = text.toLowerCase();

  // Safety-critical keywords always escalate (deterministic safeguard)
  for (const kw of rule.safetyKeywords) {
    if (lower.includes(kw)) return 'CRITICAL';
  }

  // Check explicit severity keywords (most specific match wins)
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null = null;
  for (const [kw, sev] of Object.entries(rule.severityMap)) {
    if (lower.includes(kw)) {
      const rank = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
      if (!severity || rank[sev] > rank[severity]) severity = sev;
    }
  }

  return severity || rule.defaultSeverity;
}

function computeAmbiguity(text: string, rule: CategoryRule): number {
  // If text mentions many unrelated categories, raise ambiguity
  let otherCategoryMentions = 0;
  for (const other of CATEGORY_RULES) {
    if (other.category === rule.category) continue;
    for (const kw of other.keywords) {
      if (text.toLowerCase().includes(kw)) {
        otherCategoryMentions++;
        break;
      }
    }
  }
  return Math.min(otherCategoryMentions / 2, 1);
}

class RuleBasedProvider implements AIProvider {
  readonly id = 'rule-based-classifier';
  readonly version = '1.0';

  async classify(input: AIClassificationInput): Promise<AIClassificationResult> {
    const text = input.text.trim();
    const lower = text.toLowerCase();

    // Find best matching category
    let bestRule: CategoryRule | null = null;
    let bestMatches = 0;

    for (const rule of CATEGORY_RULES) {
      let matches = 0;
      for (const kw of rule.keywords) {
        if (lower.includes(kw)) matches++;
      }
      if (matches > bestMatches) {
        bestMatches = matches;
        bestRule = rule;
      }
    }

    if (!bestRule || bestMatches === 0) {
      // Unknown category — return UNCLASSIFIED with null confidence
      return {
        category: 'UNCLASSIFIED',
        categoryLabel: 'Unclassified',
        subcategory: '',
        severity: 'UNKNOWN',
        urgency: 'UNKNOWN',
        affectedService: 'unknown',
        publicSafety: false,
        keywords: [],
        reasoning: 'No matching civic category found for this signal.',
        confidence: null,
        confidenceSource: null,
        model: `${this.id}:${this.version}`,
      };
    }

    const severity: AIClassificationResult['severity'] = computeSeverity(bestRule, text);
    const ambiguity = computeAmbiguity(text, bestRule);
    const { confidence, source } = estimateConfidence(
      bestMatches,
      bestRule.keywords.length,
      text.length,
      ambiguity
    );

    const publicSafety = bestRule.publicSafety || bestRule.safetyKeywords.some((kw) => lower.includes(kw));

    // Subcategory from severity keyword match
    let subcategory = '';
    for (const [kw] of Object.entries(bestRule.severityMap)) {
      if (lower.includes(kw)) {
        subcategory = kw
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        break;
      }
    }
    if (!subcategory) subcategory = bestRule.label;

    // Keywords actually present
    const keywords = bestRule.keywords.filter((kw) => lower.includes(kw)).slice(0, 6);

    return {
      category: bestRule.category,
      categoryLabel: bestRule.label,
      subcategory,
      severity,
      urgency: severity,
      affectedService: bestRule.service,
      publicSafety,
      keywords,
      reasoning: `Classified as ${bestRule.label} based on ${bestMatches} matching keyword${bestMatches > 1 ? 's' : ''}.`,
      confidence,
      confidenceSource: source,
      model: `${this.id}:${this.version}`,
    };
  }
}

registerProvider(new RuleBasedProvider());

export function getDefaultProviderId(): string {
  return 'rule-based-classifier';
}
