/**
 * PII Detection & Redaction
 *
 * Detects and redacts common personally identifiable information before
 * storage/processing. The raw text is not persisted after redaction when
 * PII is found — only the redacted text is stored.
 */

export interface PIIResult {
  redactedText: string;
  detected: string[];
  wasRedacted: boolean;
}

// Patterns for common Indian + international PII
const PATTERNS: { type: string; regex: RegExp; replacement: string }[] = [
  // Phone numbers (Indian 10-digit, optional +91 prefix)
  {
    type: 'PHONE',
    regex: /(\+?91[\s-]?)?[6-9]\d{9}/g,
    replacement: '[PHONE]',
  },
  // Email addresses
  {
    type: 'EMAIL',
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: '[EMAIL]',
  },
  // Aadhaar (12-digit)
  {
    type: 'AADHAAR',
    regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    replacement: '[AADHAAR]',
  },
  // PAN (Indian)
  {
    type: 'PAN',
    regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    replacement: '[PAN]',
  },
  // Driving license-like (e.g., MH12 20140012345)
  {
    type: 'DRIVING_LICENSE',
    regex: /\b[A-Z]{2}\d{2}\s\d{11}\b/g,
    replacement: '[LICENSE]',
  },
];

const PERSONAL_NAME_MARKERS = [
  'my name is',
  'i am',
  'name:',
  'called',
];

export function redactPII(text: string): PIIResult {
  let redacted = text;
  const detected: string[] = [];

  for (const p of PATTERNS) {
    const matches = redacted.match(p.regex);
    if (matches) {
      detected.push(p.type);
      redacted = redacted.replace(p.regex, p.replacement);
    }
  }

  // Detect personal names with simple heuristic (name follows a marker)
  const lower = redacted.toLowerCase();
  for (const marker of PERSONAL_NAME_MARKERS) {
    const idx = lower.indexOf(marker);
    if (idx >= 0) {
      const after = redacted.slice(idx + marker.length).trim();
      const nameMatch = after.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2})/);
      if (nameMatch && !detected.includes('NAME')) {
        detected.push('NAME');
        redacted = redacted.replace(nameMatch[1], '[NAME]');
      }
      break;
    }
  }

  return {
    redactedText: redacted,
    detected,
    wasRedacted: detected.length > 0,
  };
}
