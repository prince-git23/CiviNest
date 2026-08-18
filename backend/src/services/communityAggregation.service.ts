import mongoose from 'mongoose';
import { CommunityAggregation, ICommunityAggregation } from '../models/CommunityAggregation.js';
import { Report } from '../models/Report.js';
import { CivicCluster } from '../models/CivicCluster.js';
import type { RepScope } from './communityHealth.service.js';

/**
 * Community Aggregation service
 *
 * A representative groups related resident issues and adds community context.
 * This service NEVER accepts authoritative values from the frontend —
 * priority, severity, status, scores, report counts and confirmations are all
 * derived server-side (or already stored) and cannot be modified here.
 */

export interface CreateAggregationInput {
  clusterId?: string;
  issueIds: string[];
  context: string;
  notes?: string;
}

export interface AggregationView {
  id: string;
  representativeId: string;
  community: string;
  ward: string;
  locality: string;
  city: string;
  clusterId?: string;
  clusterCode?: string;
  issueIds: string[];
  context: string;
  notes?: string;
  issueTitles: { id: string; reportNumber: string; title: string; status: string }[];
  createdAt: string;
  updatedAt: string;
}

/** Fields a representative is explicitly NOT allowed to set. */
const FORBIDDEN_FIELDS = [
  'priority', 'severity', 'status', 'score', 'reportCount', 'confirmationCount',
  'confidence', 'impact', 'health', 'resolved', 'department',
];

export function findForbiddenAggregationFields(body: Record<string, unknown>): string | null {
  const found = FORBIDDEN_FIELDS.filter((f) => body[f] !== undefined);
  return found.length ? found[0] : null;
}

export function validateAggregationInput(input: CreateAggregationInput): string | null {
  if (!input.issueIds || !Array.isArray(input.issueIds) || input.issueIds.length === 0) {
    return 'At least one issue must be selected for aggregation.';
  }
  if (input.issueIds.length > 50) {
    return 'Too many issues in a single aggregation (max 50).';
  }
  if (input.issueIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    return 'Invalid issue ID provided.';
  }
  if (input.clusterId && !mongoose.Types.ObjectId.isValid(input.clusterId)) {
    return 'Invalid cluster ID provided.';
  }
  if (input.context && input.context.trim().length > 2000) {
    return 'Community context must be 2000 characters or fewer.';
  }
  return null;
}

function toView(doc: ICommunityAggregation, clusterCode?: string, issueTitles: AggregationView['issueTitles'] = []): AggregationView {
  return {
    id: String(doc._id),
    representativeId: String(doc.representativeId),
    community: doc.community || '',
    ward: doc.ward || '',
    locality: doc.locality || '',
    city: doc.city || '',
    clusterId: doc.clusterId ? String(doc.clusterId) : undefined,
    clusterCode,
    issueIds: doc.issueIds.map((id) => String(id)),
    context: doc.context || '',
    notes: doc.notes,
    issueTitles,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

async function attachIssueTitles(view: AggregationView): Promise<AggregationView> {
  const reports = await Report.find({ _id: { $in: view.issueIds } })
    .select('reportNumber title status')
    .lean();
  view.issueTitles = reports.map((r) => ({
    id: String(r._id),
    reportNumber: r.reportNumber,
    title: r.title,
    status: r.status,
  }));
  return view;
}

/** Idempotent creation: exact duplicate (same rep + same issue set) returns the existing record. */
export async function createAggregation(
  representativeId: string,
  scope: RepScope,
  input: CreateAggregationInput
): Promise<{ aggregation: AggregationView; duplicate: boolean }> {
  const issueIds = [...new Set(input.issueIds.map((id) => new mongoose.Types.ObjectId(id)))];
  const clusterId = input.clusterId ? new mongoose.Types.ObjectId(input.clusterId) : undefined;

  // Verify the referenced issues exist within the representative's scope.
  const reports = await Report.find({ _id: { $in: issueIds } }).select('location.ward location.city').lean();
  if (reports.length !== issueIds.length) {
    throw new Error('One or more selected issues were not found.');
  }
  for (const r of reports) {
    const wardMatch = !scope.ward || !r.location?.ward || r.location.ward === scope.ward;
    const cityMatch = !scope.city || !r.location?.city || r.location.city === scope.city;
    if (!wardMatch || !cityMatch) {
      throw new Error('One or more selected issues are outside your authorized community.');
    }
  }

  // Duplicate check: same representative + same issue set (order-insensitive).
  const sortedIds = issueIds.map((id) => id.toString()).sort();
  const existing = await CommunityAggregation.findOne({
    representativeId,
    issueIds: { $all: sortedIds.map((id) => new mongoose.Types.ObjectId(id)), $size: sortedIds.length },
  });
  if (existing) {
    const cluster = clusterId ? await CivicCluster.findById(clusterId).select('clusterCode').lean() : null;
    const view = await attachIssueTitles(toView(existing, cluster?.clusterCode));
    return { aggregation: view, duplicate: true };
  }

  // Optional cluster link must exist.
  let clusterCode: string | undefined;
  if (clusterId) {
    const cluster = await CivicCluster.findById(clusterId).select('clusterCode').lean();
    if (!cluster) throw new Error('The referenced civic cluster was not found.');
    clusterCode = cluster.clusterCode;
  }

  const doc = await CommunityAggregation.create({
    representativeId: representativeId as any,
    community: scope.community,
    ward: scope.ward,
    locality: scope.locality,
    city: scope.city,
    clusterId,
    issueIds,
    context: (input.context || '').trim(),
    notes: input.notes?.trim() || undefined,
  });

  const view = await attachIssueTitles(toView(doc, clusterCode));
  return { aggregation: view, duplicate: false };
}

export async function listAggregations(
  representativeId: string,
  page = 1,
  limit = 20
): Promise<{ aggregations: AggregationView[]; total: number }> {
  const safePage = Math.max(1, Math.min(100, Number(page) || 1));
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 20));
  const [docs, total] = await Promise.all([
    CommunityAggregation.find({ representativeId })
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    CommunityAggregation.countDocuments({ representativeId }),
  ]);

  const aggregations: AggregationView[] = [];
  for (const doc of docs) {
    aggregations.push(await attachIssueTitles(toView(doc)));
  }
  return { aggregations, total };
}

export async function getAggregationById(
  representativeId: string,
  aggregationId: string
): Promise<AggregationView | null> {
  if (!mongoose.Types.ObjectId.isValid(aggregationId)) return null;
  const doc = await CommunityAggregation.findOne({ _id: aggregationId, representativeId });
  if (!doc) return null;
  const cluster = doc.clusterId ? await CivicCluster.findById(doc.clusterId).select('clusterCode').lean() : null;
  return attachIssueTitles(toView(doc, cluster?.clusterCode));
}
