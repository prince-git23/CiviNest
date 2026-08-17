import { CivicSignal, ICivicSignal } from '../models/CivicSignal.js';
import { User } from '../models/User.js';
import { redactPII } from './ai/pii.service.js';
import { getProvider, AIUnavailableError, AIClassificationResult } from './ai/ai.provider.js';
import { getDefaultProviderId } from './ai/classification.service.js';
import { calculatePriority } from './ai/priority.service.js';
import { findOrCreateCluster, createIssueFromSignal } from './ai/cluster.service.js';

export interface ProcessSignalInput {
  rawText: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    ward?: string;
    city?: string;
  };
}

export interface ProcessSignalResult {
  signal: ICivicSignal;
  cluster: {
    matched: boolean;
    clusterId?: string;
    clusterCode?: string;
    clusterStatus?: string;
    clusterConfidence?: number;
    reason?: string;
  };
  issueId?: string;
}

export async function processSignal(userId: string, input: ProcessSignalInput): Promise<ProcessSignalResult> {
  // 1. Validate input
  if (!input.rawText || input.rawText.trim().length < 5) {
    throw new Error('Signal text must be at least 5 characters.');
  }

  // 2. PII redaction
  const pii = redactPII(input.rawText);

  // 3. Create signal record (store redacted text only when PII was found)
  const signal = await CivicSignal.create({
    userId,
    signalNumber: `SIG-${Date.now().toString(36).toUpperCase()}`,
    rawText: pii.wasRedacted ? pii.redactedText : input.rawText,
    redactedText: pii.wasRedacted ? pii.redactedText : undefined,
    piiRedacted: pii.wasRedacted,
    piiDetected: pii.detected,
    status: 'PROCESSING',
    location: input.location || null,
  });

  // 4. AI classification
  let classification: AIClassificationResult;
  let aiAnalysisStatus: 'AVAILABLE' | 'UNAVAILABLE' = 'UNAVAILABLE';

  try {
    const provider = getProvider(process.env.AI_PROVIDER || getDefaultProviderId());
    if (!provider) {
      throw new AIUnavailableError(`AI provider not found: ${process.env.AI_PROVIDER}`);
    }
    classification = await provider.classify({
      text: signal.rawText,
      location: input.location,
    });
    aiAnalysisStatus = 'AVAILABLE';
  } catch (error) {
    // AI failure → mark unavailable, use conservative fallback
    const fallback: AIClassificationResult = {
      category: 'UNCLASSIFIED',
      categoryLabel: 'Unclassified',
      subcategory: '',
      severity: 'UNKNOWN',
      urgency: 'UNKNOWN',
      affectedService: 'unknown',
      publicSafety: false,
      keywords: [],
      reasoning: 'AI analysis unavailable — awaiting verification.',
      confidence: null,
      confidenceSource: null,
      model: 'unavailable',
    };
    classification = fallback;
  }

  // 5. Save classification
  signal.category = classification.category;
  signal.subcategory = classification.subcategory;
  signal.severity = classification.severity;
  signal.aiConfidence = classification.confidence;
  signal.confidenceSource = classification.confidenceSource;
  signal.aiAnalysisStatus = aiAnalysisStatus;
  signal.keywords = classification.keywords;
  signal.affectedService = classification.affectedService;
  signal.publicSafety = classification.publicSafety;
  signal.reasoning = classification.reasoning;
  signal.modelName = classification.model;
  signal.status = 'ANALYZED';
  await signal.save();

  // 6. Priority engine (deterministic)
  const priority = calculatePriority({
    severity: classification.severity,
    urgency: classification.urgency,
    aiConfidence: classification.confidence,
    publicSafety: classification.publicSafety,
    affectedService: classification.affectedService,
    clusterSize: 1,
    evidenceQuality: input.location ? 0.7 : 0.4,
  });
  signal.priority = priority;
  await signal.save();

  // 7. Cluster detection
  const clusterResult = await findOrCreateCluster(signal, {
    category: classification.category,
    severity: classification.severity,
    keywords: classification.keywords,
    location: input.location,
    priorityScore: priority.score,
    priorityLevel: priority.level,
  });

  // 8. Create/attach civic issue (create issue for UNCLASSIFIED too, flagged for verification)
  const issueId = await createIssueFromSignal(signal, {
    category: classification.category,
    severity: classification.severity,
    priorityScore: priority.score,
    priorityLevel: priority.level,
    keywords: classification.keywords,
    location: input.location,
  });

  signal.status = 'CLUSTERED';
  await signal.save();

  return {
    signal,
    cluster: clusterResult,
    issueId,
  };
}

export async function getSignalById(userId: string, signalId: string): Promise<ICivicSignal | null> {
  return CivicSignal.findOne({ _id: signalId, userId });
}
