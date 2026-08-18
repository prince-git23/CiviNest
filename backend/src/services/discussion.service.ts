import mongoose from 'mongoose';
import { Discussion, IDiscussion } from '../models/Discussion.js';
import { Report } from '../models/Report.js';
import { User } from '../models/User.js';

// ─────────────────────────────────────────────────────────────────────────────
// Community Discussion service
//
// A discussion is a community conversation — NOT a civic signal. Creating a
// discussion never runs AI classification, priority calculation, cluster
// detection, or issue creation. It may OPTIONALLY reference an existing civic
// issue (Report) via issueId.
// ─────────────────────────────────────────────────────────────────────────────

// Canonical discussion categories — the stable value stored in the DB, with a
// human-readable label. Legacy seeded categories (report categories) are
// normalized into this taxonomy when read / filtered.
export const DISCUSSION_CATEGORIES: Record<string, string> = {
  water_supply: 'Water Supply',
  roads: 'Roads & Transport',
  street_lighting: 'Street Lighting',
  sanitation: 'Sanitation',
  public_safety: 'Public Safety',
  environment: 'Environment',
  community: 'Community',
  other: 'Other',
};

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  water_supply: 'water_supply',
  water: 'water_supply',
  roads: 'roads',
  road: 'roads',
  street_lighting: 'street_lighting',
  lighting: 'street_lighting',
  drainage: 'sanitation',
  waste: 'sanitation',
  sanitation: 'sanitation',
  electricity: 'public_safety',
  parks: 'environment',
  environment: 'environment',
  public_safety: 'public_safety',
  safety: 'public_safety',
  community: 'community',
  other: 'other',
};

export function normalizeCategory(category?: string | null): string {
  if (!category) return 'other';
  const key = LEGACY_CATEGORY_MAP[category.toLowerCase()];
  return key || 'other';
}

export function categoryLabel(category?: string | null): string {
  return DISCUSSION_CATEGORIES[normalizeCategory(category)] || 'Other';
}

export interface DiscussionListParams {
  search?: string;
  status?: string;
  ward?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'supported';
}

export interface DiscussionLocationView {
  ward: string;
  locality: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface DiscussionAuthorView {
  id: string;
  displayName: string;
  avatar?: string;
}

export interface DiscussionMessageView {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt?: string;
}

export interface DiscussionView {
  id: string;
  title: string;
  body: string;
  preview: string;
  category: string;
  categoryLabel: string;
  status: 'OPEN' | 'ACTIVE' | 'CLOSED';
  author: DiscussionAuthorView;
  location: DiscussionLocationView;
  issueId?: string;
  issueTitle?: string;
  replyCount: number;
  confirmationCount: number;
  confirmedByMe: boolean;
  messages?: DiscussionMessageView[];
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionFacets {
  all: number;
  water_supply: number;
  roads: number;
  street_lighting: number;
  sanitation: number;
  public_safety: number;
  environment: number;
  community: number;
  other: number;
  wards: { name: string; count: number }[];
}

export interface DiscussionListResult {
  discussions: DiscussionView[];
  pagination: { page: number; limit: number; total: number; pages: number };
  facets: DiscussionFacets;
}

type UserNameMap = Map<string, { name: string }>;

// Test/verification identities that must never surface in the resident UI.
// The API resolves display names from the real User record; these are used as
// an extra guard when a stored name survives (e.g. legacy seed data).
const TEST_IDENTITIES = new Set([
  'signal test user',
  'test user',
  'test resident',
  'test community rep',
  'duplicate user',
  'proxy test',
]);

function isTestIdentity(name?: string | null): boolean {
  return Boolean(name && TEST_IDENTITIES.has(name.trim().toLowerCase()));
}

// ── Name resolution ──────────────────────────────────────────────────────────
// Author/message display names are resolved from the real User records so a
// stale or forged stored userName (e.g. legacy seed "Signal Test User") can
// never surface in the resident UI.

async function buildUserNameMap(userIds: (mongoose.Types.ObjectId | string | undefined)[]): Promise<UserNameMap> {
  const ids = [...new Set(userIds.filter(Boolean).map((id) => id!.toString()))];
  if (ids.length === 0) return new Map();
  const users = await User.find({ _id: { $in: ids } }).select('name').lean();
  const map: UserNameMap = new Map();
  for (const u of users) map.set(u._id.toString(), { name: u.name });
  return map;
}

// ── View building ────────────────────────────────────────────────────────────

function safeName(realName: string | undefined, storedName: string | undefined, fallback: string): string {
  if (realName && !isTestIdentity(realName)) return realName;
  if (storedName && !isTestIdentity(storedName)) return storedName;
  return fallback;
}

function messageView(m: any, names: UserNameMap): DiscussionMessageView {
  const realName = names.get(String(m.userId))?.name;
  return {
    id: String(m._id || m.id || `${m.userId}-${m.createdAt}`),
    userId: String(m.userId),
    userName: safeName(realName, m.userName, 'Resident'),
    text: m.text,
    createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : undefined,
  };
}

function toView(d: any, names: UserNameMap, myUserId: string): DiscussionView {
  const authorId = d.authorId || d.messages?.[0]?.userId;
  const authorName = names.get(authorId ? String(authorId) : '')?.name;
  const legacyName = d.messages?.[0]?.userName;
  const title = d.title || d.issueTitle || 'Community discussion';
  const body = d.body || d.messages?.[0]?.text || '';
  const preview = body.slice(0, 180);

  return {
    id: String(d._id),
    title,
    body,
    preview,
    category: normalizeCategory(d.category),
    categoryLabel: categoryLabel(d.category),
    status: d.status,
    author: {
      id: authorId ? String(authorId) : '',
      displayName: safeName(authorName, legacyName, 'Community Member'),
    },
    location: {
      ward: d.location?.ward || d.ward || '',
      locality: d.location?.locality || d.locality || '',
      latitude: d.location?.latitude,
      longitude: d.location?.longitude,
      address: d.location?.address,
    },
    issueId: d.issueId ? String(d.issueId) : undefined,
    issueTitle: d.issueTitle || undefined,
    replyCount: d.messages?.length || 0,
    confirmationCount: d.confirmations?.length || 0,
    confirmedByMe: (d.confirmations || []).some((c: any) => String(c) === String(myUserId)),
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
  };
}

// ── List with filters + pagination + facets ──────────────────────────────────

export async function listDiscussions(
  myUserId: string,
  params: DiscussionListParams = {}
): Promise<DiscussionListResult> {
  const page = Math.max(1, Math.min(100, Number(params.page) || 1));
  const limit = Math.max(1, Math.min(50, Number(params.limit) || 20));
  const sort = params.sort || 'latest';

  // Note: 'active' (most replies) is intentionally not offered as a sort key —
  // reply counts live inside the messages array, so ranking by them would need
  // an aggregation. 'latest' (updatedAt) already surfaces active threads.

  // ── Base filter: everything visible to residents (no private data) ──
  const filter: Record<string, unknown> = {};
  if (params.status) {
    const status = String(params.status).toUpperCase();
    if (['OPEN', 'ACTIVE', 'CLOSED'].includes(status)) filter.status = status;
  }
  if (params.ward) filter.ward = String(params.ward);

  // Category: canonical key → match every stored (legacy) value that maps to it.
  if (params.category) {
    const canonical = normalizeCategory(params.category);
    const storedValues = Object.keys(LEGACY_CATEGORY_MAP).filter(
      (k) => LEGACY_CATEGORY_MAP[k] === canonical
    );
    filter.category = { $in: storedValues };
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { body: { $regex: q, $options: 'i' } },
      { issueTitle: { $regex: q, $options: 'i' } },
    ];
  }

  // ── Facets: computed over the current status/ward/search scope (excluding
  //    the category pill itself) so counts stay meaningful while browsing. ──
  const facetFilter: Record<string, unknown> = { ...filter };
  delete facetFilter.category;

  const [raw, total, facetRows, wardRows] = await Promise.all([
    Discussion.find(filter)
      .sort(sort === 'supported' ? { confirmations: -1 } : { updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Discussion.countDocuments(filter),
    Discussion.aggregate([
      { $match: facetFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    Discussion.aggregate([
      { $match: facetFilter },
      { $group: { _id: '$ward', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
  ]);

  // Resolve all display names in one query.
  const userIds: (mongoose.Types.ObjectId | undefined)[] = [];
  for (const d of raw) {
    if (d.authorId) userIds.push(d.authorId);
    for (const m of d.messages || []) userIds.push(m.userId);
  }
  const names = await buildUserNameMap(userIds);

  const facets: DiscussionFacets = {
    all: total,
    water_supply: 0,
    roads: 0,
    street_lighting: 0,
    sanitation: 0,
    public_safety: 0,
    environment: 0,
    community: 0,
    other: 0,
    wards: wardRows.map((w) => ({ name: String(w._id || ''), count: w.count })),
  };
  for (const row of facetRows) {
    const canonical = normalizeCategory(String(row._id));
    // Accumulate: several stored legacy values map to one canonical key
    // (e.g. drainage + waste + sanitation → sanitation).
    if (canonical in facets) facets[canonical as keyof DiscussionFacets] += row.count;
  }

  return {
    discussions: raw.map((d) => toView(d, names, myUserId)),
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
    facets,
  };
}

// ── Single discussion with message thread ────────────────────────────────────

export async function getDiscussionView(
  discussionId: string,
  myUserId: string
): Promise<DiscussionView | null> {
  const d = await Discussion.findById(discussionId).lean();
  if (!d) return null;

  const userIds: (mongoose.Types.ObjectId | undefined)[] = [d.authorId];
  for (const m of d.messages || []) userIds.push(m.userId);
  const names = await buildUserNameMap(userIds);

  const view = toView(d, names, myUserId);
  view.messages = (d.messages || []).map((m) => messageView(m, names));
  return view;
}

// ── Create ───────────────────────────────────────────────────────────────────

export interface CreateDiscussionInput {
  title: string;
  body: string;
  category: string;
  ward?: string;
  locality?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    ward?: string;
    locality?: string;
  };
  issueId?: string;
}

export function validateDiscussionInput(input: CreateDiscussionInput): string | null {
  if (!input.title || input.title.trim().length < 3) {
    return 'Title must be at least 3 characters.';
  }
  if (input.title.trim().length > 200) {
    return 'Title must be 200 characters or fewer.';
  }
  if (!input.body || input.body.trim().length < 3) {
    return 'Discussion text must be at least 3 characters.';
  }
  if (input.body.trim().length > 2000) {
    return 'Discussion text must be 2000 characters or fewer.';
  }
  const canonical = normalizeCategory(input.category);
  if (!DISCUSSION_CATEGORIES[canonical] || canonical === 'other') {
    return 'Please choose a valid topic.';
  }
  const { location } = input;
  if (location && (location.latitude != null || location.longitude != null)) {
    const lat = Number(location.latitude);
    const lng = Number(location.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required.';
    }
  }
  return null;
}

export async function createDiscussion(
  userId: string,
  input: CreateDiscussionInput
): Promise<DiscussionView> {
  const user = await User.findById(userId);
  const canonical = normalizeCategory(input.category);

  // Optional issue link — must reference a real civic issue (Report).
  let issueTitle: string | undefined;
  if (input.issueId) {
    if (!mongoose.Types.ObjectId.isValid(input.issueId)) {
      throw new Error('Invalid issue reference.');
    }
    const issue = await Report.findById(input.issueId).select('title').lean();
    if (!issue) {
      throw new Error('The linked civic issue was not found.');
    }
    issueTitle = issue.title;
  }

  const ward = input.location?.ward || input.ward || user?.ward || '';
  const locality = input.location?.locality || input.locality || user?.locality || '';

  const doc = await Discussion.create({
    authorId: userId,
    title: input.title.trim(),
    body: input.body.trim(),
    category: canonical,
    issueId: input.issueId || undefined,
    issueTitle,
    ward,
    locality,
    location: input.location
      ? {
          latitude: input.location.latitude,
          longitude: input.location.longitude,
          address: input.location.address,
          ward: input.location.ward || ward,
          locality: input.location.locality || locality,
        }
      : undefined,
    status: 'OPEN',
    messages: [],
    confirmations: [],
  });

  return getDiscussionView(String(doc._id), userId) as Promise<DiscussionView>;
}

// ── Reply ────────────────────────────────────────────────────────────────────

export async function addDiscussionMessage(
  discussionId: string,
  userId: string,
  text: string
): Promise<{ view: DiscussionView; message: DiscussionMessageView } | null> {
  const discussion = await Discussion.findById(discussionId);
  if (!discussion) return null;

  const user = await User.findById(userId);
  const trimmed = text.trim();
  discussion.messages.push({
    userId: userId as any,
    userName: user?.name || 'Resident',
    text: trimmed,
  });
  discussion.status = 'ACTIVE';
  await discussion.save();

  const view = (await getDiscussionView(discussionId, userId)) as DiscussionView;
  const message = view.messages?.[view.messages.length - 1] as DiscussionMessageView;
  return { view, message };
}

// ── Confirm / support (deduplicated per resident) ────────────────────────────

export async function confirmDiscussion(
  discussionId: string,
  userId: string
): Promise<{ view: DiscussionView; confirmations: number; confirmed: boolean } | null> {
  const discussion = await Discussion.findById(discussionId);
  if (!discussion) return null;

  const userIdObj = userId as any;
  const already = discussion.confirmations.some((c: any) => String(c) === String(userId));
  if (!already) {
    discussion.confirmations.push(userIdObj);
    await discussion.save();
  }

  const view = (await getDiscussionView(discussionId, userId)) as DiscussionView;
  return { view, confirmations: view.confirmationCount, confirmed: !already };
}
