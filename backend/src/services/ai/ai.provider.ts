/**
 * AI Provider Abstraction
 *
 * The signal pipeline depends only on this interface. Providers can be swapped
 * (rule-based, Gemini, OpenAI, etc.) without touching the resident portal.
 *
 * The current default is a deterministic rule-based classifier so the system
 * works without API keys. Confidence from this provider is `ESTIMATED` and is
 * computed from structured signals (keyword matches, category agreement,
 * ambiguity), never fabricated at random.
 */

export interface AIClassificationInput {
  text: string;
  categoryHint?: string;
  location?: { ward?: string; city?: string };
}

export interface AIClassificationResult {
  category: string;
  categoryLabel: string;
  subcategory: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
  affectedService: string;
  publicSafety: boolean;
  keywords: string[];
  reasoning: string;
  /** 0.0–1.0 calibrated or estimated confidence, or null when unavailable */
  confidence: number | null;
  /** Where the confidence value came from */
  confidenceSource: 'MODEL' | 'ESTIMATED' | null;
  /** Provider/model identifier for auditability */
  model: string;
}

export interface AIProvider {
  readonly id: string;
  classify(input: AIClassificationInput): Promise<AIClassificationResult>;
}

export class AIUnavailableError extends Error {
  constructor(message = 'AI analysis unavailable.') {
    super(message);
    this.name = 'AIUnavailableError';
  }
}

// ── Provider Registry ──

const providers = new Map<string, AIProvider>();

export function registerProvider(provider: AIProvider): void {
  providers.set(provider.id, provider);
}

export function getProvider(id: string): AIProvider | undefined {
  return providers.get(id);
}

export function listProviders(): string[] {
  return [...providers.keys()];
}
