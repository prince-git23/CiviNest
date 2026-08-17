/**
 * Support Ticket Service — Community Representative Portal
 *
 * Demo/mock support ticket flow. Tickets are persisted locally with generated
 * SUP-XXXX reference IDs. Swap the internals for a backend endpoint when available.
 */

export type SupportIssueType =
  | 'Login / Access'
  | 'Notifications'
  | 'Navigation / Routing'
  | 'Data / Display'
  | 'Reporting an Issue'
  | 'Other';

export interface SupportTicket {
  id: string;
  referenceId: string;
  issueType: SupportIssueType;
  description: string;
  screenshotName?: string;
  submittedAt: string;
}

const STORAGE_KEY = 'civinet_rep_support_tickets';

export const supportIssueTypes: SupportIssueType[] = [
  'Login / Access',
  'Notifications',
  'Navigation / Routing',
  'Data / Display',
  'Reporting an Issue',
  'Other',
];

export function loadTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SupportTicket[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTickets(tickets: SupportTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Storage unavailable — ticket lives only for this session.
  }
}

function generateReferenceId(existing: SupportTicket[]): string {
  const used = new Set(existing.map((t) => t.referenceId));
  for (let i = 1; i <= 9999; i++) {
    const id = `SUP-${String(i).padStart(4, '0')}`;
    if (!used.has(id)) return id;
  }
  return `SUP-${Date.now().toString().slice(-4)}`;
}

/**
 * Create a support ticket and persist it. Returns the stored ticket with its
 * generated reference ID.
 */
export function createSupportTicket(
  input: { issueType: SupportIssueType; description: string; screenshotName?: string }
): SupportTicket {
  const tickets = loadTickets();
  const ticket: SupportTicket = {
    id: `ticket-${Date.now()}`,
    referenceId: generateReferenceId(tickets),
    issueType: input.issueType,
    description: input.description.trim(),
    screenshotName: input.screenshotName,
    submittedAt: new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
  };
  saveTickets([ticket, ...tickets]);
  return ticket;
}

export const supportFaqs: { question: string; answer: string }[] = [
  {
    question: 'How do I report a technical problem with the portal?',
    answer:
      'Use the "Report a Technical Problem" option above. Select the issue type, describe what happened, and submit. You will receive a reference ID (SUP-XXXX) to track your request.',
  },
  {
    question: 'How are community issues aggregated?',
    answer:
      'CiviNest groups resident civic signals by location and category into clusters. Clusters with higher report counts and resident confirmations receive higher priority scores.',
  },
  {
    question: 'How do municipal responses reach the community?',
    answer:
      'When a municipal department responds to a community case, the response appears on the Community Dashboard and is pushed as a notification to the representative.',
  },
  {
    question: 'How is a resolution verified?',
    answer:
      'Once a department marks an issue resolved, residents confirm or reopen it. Verified resolutions count toward community health and municipal responsiveness scores.',
  },
];
