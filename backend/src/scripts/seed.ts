import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Report, locationPointFrom } from '../models/Report.js';
import { CivicSignal } from '../models/CivicSignal.js';
import { CivicCluster } from '../models/CivicCluster.js';
import { Discussion } from '../models/Discussion.js';
import { Department } from '../models/Department.js';
import { Team } from '../models/Team.js';
import { MunicipalNotification } from '../models/MunicipalNotification.js';
import { hashPassword } from '../utils/password.js';
import { ROLES } from '../config/constants.js';

// ─────────────────────────────────────────────────────────────────────────────
// CiviNest Demo Seed
//
// Populates the database with clearly-structured demo civic data (Nagpur,
// Ward 14 / Dharampeth) so the Resident Portal behaves like a complete
// product: dashboard, map, trends, ward metrics, reports, verification.
//
// Run: npm run seed   (idempotent — skips when clusters already exist)
//
// Demo logins:
//   Resident:     demo@civinest.org      / DemoPass123!
//   Municipal:    municipal@civinest.org / MunicipalPass123!
// ─────────────────────────────────────────────────────────────────────────────

const H = 3600000; // hour in ms
const D = 24 * H;
const NOW = Date.now();

const STATUS = {
  review: 'Under Review',
  assigned: 'Assigned',
  progress: 'In Progress',
  verification: 'Verification',
  resolved: 'Resolved',
  reopened: 'Reopened',
} as const;

interface SeedReport {
  owner: 'demo' | 'ananya' | 'rohan';
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  lat: number;
  lng: number;
  ward: string;
  locality: string;
  hoursAgo: number;
  keywords: string[];
  department: string;
}

const SEED_REPORTS: SeedReport[] = [
  {
    owner: 'demo', title: 'Streetlight failure on school corridor',
    description: '7 consecutive streetlights along the 450m stretch from the school junction to Garden Gate 2 have been unlit for three evenings.',
    category: 'street_lighting', categoryLabel: 'Street Lighting', priority: 'high', status: STATUS.progress,
    lat: 21.1462, lng: 79.0874, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 52,
    keywords: ['streetlight', 'dark', 'school', 'bulb'], department: 'Electrical Operations',
  },
  {
    owner: 'ananya', title: 'Streetlights dark from Gate 2 to school corner',
    description: 'Complete blackout on the north avenue. Kids returning from tuition had to use phone flashlights.',
    category: 'street_lighting', categoryLabel: 'Street Lighting', priority: 'high', status: STATUS.progress,
    lat: 21.1464, lng: 79.0872, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 26,
    keywords: ['streetlight', 'dark', 'blackout'], department: 'Electrical Operations',
  },
  {
    owner: 'rohan', title: 'Pole 14 to 16 lighting outage',
    description: 'Luminaire poles 14-16 completely dark near the community garden entrance.',
    category: 'street_lighting', categoryLabel: 'Street Lighting', priority: 'medium', status: STATUS.review,
    lat: 21.1458, lng: 79.0876, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 7,
    keywords: ['streetlight', 'pole', 'garden'], department: 'Electrical Operations',
  },
  {
    owner: 'demo', title: 'Low water pressure in Block B',
    description: 'Second floor apartments receive almost zero water pressure during the morning distribution window.',
    category: 'water_supply', categoryLabel: 'Water Supply', priority: 'medium', status: STATUS.assigned,
    lat: 21.1432, lng: 79.0895, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 76,
    keywords: ['water', 'pressure', 'supply'], department: 'Water Supply',
  },
  {
    owner: 'ananya', title: 'Zero water pressure on second floor',
    description: 'No water pressure this morning across six residential societies in Block B grid.',
    category: 'water_supply', categoryLabel: 'Water Supply', priority: 'high', status: STATUS.progress,
    lat: 21.1435, lng: 79.0893, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 20,
    keywords: ['water', 'pressure', 'block b'], department: 'Water Supply',
  },
  {
    owner: 'demo', title: 'Pothole cluster on West Avenue',
    description: 'Consecutive potholes and kerb erosion creating a vehicular hazard along the two-wheeler commuting corridor.',
    category: 'roads', categoryLabel: 'Roads & Pavements', priority: 'high', status: STATUS.progress,
    lat: 21.1475, lng: 79.0845, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 96,
    keywords: ['pothole', 'road', 'cave-in', 'kerb'], department: 'Public Works',
  },
  {
    owner: 'rohan', title: 'Deep pothole near West Avenue junction',
    description: 'Large pothole near the turn. Multiple bikes skidding in the dark.',
    category: 'roads', categoryLabel: 'Roads & Pavements', priority: 'medium', status: STATUS.review,
    lat: 21.1472, lng: 79.0848, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 30,
    keywords: ['pothole', 'road', 'junction'], department: 'Public Works',
  },
  {
    owner: 'demo', title: 'Drain overflow at market junction',
    description: 'Heavy siltation and construction debris blocking the primary storm culvert, resulting in standing foul water.',
    category: 'drainage', categoryLabel: 'Drainage & Sewerage', priority: 'critical', status: STATUS.verification,
    lat: 21.1441, lng: 79.0862, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 140,
    keywords: ['drain', 'overflow', 'flood', 'stagnant'], department: 'Drainage',
  },
  {
    owner: 'ananya', title: 'Stagnant water near market complex',
    description: 'Severe stench and stagnant water entering ground floor parking of the market complex.',
    category: 'drainage', categoryLabel: 'Drainage & Sewerage', priority: 'high', status: STATUS.verification,
    lat: 21.1438, lng: 79.0859, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 118,
    keywords: ['drain', 'stench', 'stagnant'], department: 'Drainage',
  },
  {
    owner: 'demo', title: 'Garbage bin overflow at collector point',
    description: 'Secondary dump bin exceeded capacity after weekend retail activity.',
    category: 'waste', categoryLabel: 'Waste Management', priority: 'low', status: STATUS.resolved,
    lat: 21.1418, lng: 79.0832, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 190,
    keywords: ['garbage', 'bin', 'waste'], department: 'Sanitation',
  },
  {
    owner: 'rohan', title: 'Waste not collected for 3 days',
    description: 'Missed collection for three consecutive days in the residential zone near the market.',
    category: 'waste', categoryLabel: 'Waste Management', priority: 'medium', status: STATUS.review,
    lat: 21.1421, lng: 79.0835, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 28,
    keywords: ['garbage', 'uncollected', 'waste'], department: 'Sanitation',
  },
  {
    owner: 'demo', title: 'Transformer sparking near pole 16',
    description: 'Transformer switch box sparking near pole 16 around 7 PM during evening switch-on.',
    category: 'electricity', categoryLabel: 'Power Grid', priority: 'critical', status: STATUS.progress,
    lat: 21.1466, lng: 79.0871, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 68,
    keywords: ['transformer', 'spark', 'electricity'], department: 'Power Grid',
  },
  {
    owner: 'ananya', title: 'Park bench damaged and branch hanging',
    description: 'Fallen tree branch hanging over the walking track near the children park bench.',
    category: 'parks', categoryLabel: 'Public Parks', priority: 'low', status: STATUS.review,
    lat: 21.1480, lng: 79.0890, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 45,
    keywords: ['park', 'tree', 'branch'], department: 'Parks',
  },
  {
    owner: 'demo', title: 'No water in evening supply',
    description: 'Evening water supply completely missed after the scheduled maintenance last week.',
    category: 'water_supply', categoryLabel: 'Water Supply', priority: 'high', status: STATUS.reopened,
    lat: 21.1445, lng: 79.0888, ward: 'Ward 14', locality: 'Dharampeth', hoursAgo: 240,
    keywords: ['water', 'supply', 'no water'], department: 'Water Supply',
  },
];

// Cluster groupings: category → array of seed report indices
const CLUSTER_GROUPS: { category: string; label: string; indices: number[]; keywords: string[] }[] = [
  { category: 'street_lighting', label: 'street lighting', indices: [0, 1, 2], keywords: ['streetlight', 'dark', 'school'] },
  { category: 'water_supply', label: 'water supply', indices: [3, 4, 13], keywords: ['water', 'pressure'] },
  { category: 'roads', label: 'roads', indices: [5, 6], keywords: ['pothole', 'road'] },
  { category: 'drainage', label: 'drainage', indices: [7, 8], keywords: ['drain', 'overflow'] },
  { category: 'waste', label: 'waste', indices: [9, 10], keywords: ['garbage', 'waste'] },
  { category: 'electricity', label: 'electricity', indices: [11], keywords: ['transformer', 'spark'] },
  { category: 'parks', label: 'parks', indices: [12], keywords: ['park', 'tree'] },
];

const DISCUSSION_MESSAGES: Record<string, { user: string; text: string; hoursAgo: number }[]> = {
  street_lighting: [
    { user: 'Priya S.', text: 'Streetlights completely dark from Gate 2 till the school corner.', hoursAgo: 6 },
    { user: 'Green Valley RWA', text: 'Transformer switch box sparking near pole 16 — please escalate.', hoursAgo: 4 },
  ],
  water_supply: [
    { user: 'Alok K.', text: 'Second floor apartments received zero water pressure this morning.', hoursAgo: 18 },
  ],
  roads: [
    { user: 'Sunil G.', text: 'Large pothole near the turn, multiple bikes skidding in the dark.', hoursAgo: 28 },
  ],
  drainage: [
    { user: 'Vikram Joshi', text: 'Drain overflow spilling onto the main avenue. Traffic crawling.', hoursAgo: 12 },
  ],
};

async function seed() {
  await connectDB();
  console.log(`\n🌱 Seeding CiviNest demo data → ${env.MONGODB_URI}\n`);

  // Additive + idempotent: never touches existing user records, and skips each
  // entity type when the seed markers already exist in the database.
  const reportsExist = (await Report.countDocuments({ reportNumber: '#CV-8100' })) > 0;
  const signalsExist = (await CivicSignal.countDocuments({ signalNumber: 'SIG-9000' })) > 0;
  const clustersExist = (await CivicCluster.countDocuments({ clusterCode: 'CLU-1001' })) > 0;

  // ── 1. Users ──
  const userSpecs = [
    { email: 'demo@civinest.org', name: 'Prince Yadav', role: ROLES.CITIZEN, city: 'Nagpur', ward: 'Ward 14', locality: 'Dharampeth', community: 'Green Valley Residency', pincode: '440012' },
    { email: 'ananya@civinest.org', name: 'Ananya Roy', role: ROLES.CITIZEN, city: 'Nagpur', ward: 'Ward 14', locality: 'Dharampeth', community: 'Green Valley Residency', pincode: '440012' },
    { email: 'rohan@civinest.org', name: 'Rohan Deshmukh', role: ROLES.CITIZEN, city: 'Nagpur', ward: 'Ward 14', locality: 'Dharampeth', community: 'Green Valley Residency', pincode: '440012' },
    { email: 'municipal@civinest.org', name: 'Arjun Mehta', role: ROLES.MUNICIPAL_OFFICER, city: 'Nagpur', ward: 'Ward 14', locality: 'Dharampeth' },
    { email: 'siddhant@gmail.com', name: 'Siddhant Parshivnikar', role: ROLES.COMMUNITY_REPRESENTATIVE, city: 'Nagpur', ward: 'Ward 14', locality: 'Dharampeth', community: 'Green Valley Residency', pincode: '440012' },
  ];

  // Ensure the representative's geographic scope is set (authoritative for the
  // Community Portal — the backend never trusts frontend-supplied scope).
  const repUser = await User.findOne({ email: 'siddhant@gmail.com' });
  if (repUser) {
    await User.updateOne(
      { _id: repUser._id },
      { $set: { city: 'Nagpur', ward: 'Ward 14', locality: 'Dharampeth', community: 'Green Valley Residency', pincode: '440012', isOnboarded: true, isVerified: true } }
    );
  }

  const userIds: Record<string, mongoose.Types.ObjectId> = {};
  for (const spec of userSpecs) {
    let user = await User.findOne({ email: spec.email });
    if (!user) {
      const passwordHash = await hashPassword(spec.email.startsWith('municipal') ? 'MunicipalPass123!' : 'DemoPass123!');
      user = await User.create({ ...spec, passwordHash, isOnboarded: true, isVerified: true });
      console.log(`  ✓ Created user ${spec.email} (${spec.name})`);
    } else {
      console.log(`  · Existing user ${spec.email}`);
    }
    userIds[spec.email] = user._id;
  }

  const ownerIds: Record<string, mongoose.Types.ObjectId> = {
    demo: userIds['demo@civinest.org'],
    ananya: userIds['ananya@civinest.org'],
    rohan: userIds['rohan@civinest.org'],
  };

  // ── 2. Reports + Signals ──
  const reportIds: string[] = [];
  const signalIds: mongoose.Types.ObjectId[] = [];

  for (let i = 0; i < SEED_REPORTS.length; i++) {
    const r = SEED_REPORTS[i];
    const createdAt = new Date(NOW - r.hoursAgo * H);
    const reportNumber = `#CV-${8100 + i}`;

    if (reportsExist) {
      const existing = await Report.findOne({ reportNumber }).select('_id').lean();
      if (existing) {
        reportIds.push(existing._id.toString());
        continue;
      }
    }

    const report = await Report.create({
      userId: ownerIds[r.owner],
      reportNumber,
      title: r.title,
      description: r.description,
      category: r.category,
      categoryLabel: r.categoryLabel,
      status: r.status,
      priority: r.priority,
      location: {
        address: `${r.locality}, ${r.ward}, Nagpur`,
        ward: r.ward,
        city: 'Nagpur',
        latitude: r.lat,
        longitude: r.lng,
        accuracy: 'Approx. 15m accuracy',
      },
      locationPoint: locationPointFrom({ latitude: r.lat, longitude: r.lng }),
      evidence: [],
      analysis: {
        category: r.category,
        categoryLabel: r.categoryLabel,
        subcategory: r.categoryLabel,
        severity: r.priority.toUpperCase(),
        confidence: 0.85 + (i % 10) * 0.01,
        suggestedDepartment: r.department,
        keywords: r.keywords,
      },
      timeline: [
        {
          status: 'Report Lodged',
          timestamp: createdAt.toISOString(),
          note: 'Civic report submitted by resident.',
          actor: 'Resident',
        },
      ],
      upvotes: 1 + (i % 5),
      createdAt,
      updatedAt: createdAt,
    });

    reportIds.push(report._id.toString());

    if (signalsExist) {
      const existingSignal = await CivicSignal.findOne({ signalNumber: `SIG-${9000 + i}` }).select('_id').lean();
      if (existingSignal) {
        signalIds.push(existingSignal._id);
        continue;
      }
    }

    const signal = await CivicSignal.create({
      userId: ownerIds[r.owner],
      signalNumber: `SIG-${9000 + i}`,
      rawText: r.description,
      piiRedacted: false,
      piiDetected: [],
      status: 'CLUSTERED',
      category: r.category,
      subcategory: r.categoryLabel,
      severity: r.priority.toUpperCase(),
      aiConfidence: 0.85 + (i % 10) * 0.01,
      confidenceSource: 'ESTIMATED',
      aiAnalysisStatus: 'AVAILABLE',
      keywords: r.keywords,
      affectedService: r.department,
      publicSafety: ['critical', 'high'].includes(r.priority),
      reasoning: `Classified as ${r.categoryLabel} from seed demo data.`,
      modelName: 'rule-based-classifier:1.0',
      priority: {
        score: r.priority === 'critical' ? 92 : r.priority === 'high' ? 78 : r.priority === 'medium' ? 55 : 32,
        level: r.priority.toUpperCase(),
        factors: [{ name: 'Severity', contribution: 40 }, { name: 'Confidence', contribution: 30 }],
        engineVersion: '1.0',
      },
      location: { latitude: r.lat, longitude: r.lng, ward: r.ward, city: 'Nagpur' },
      issueId: report._id,
      createdAt,
      updatedAt: createdAt,
    });
    signalIds.push(signal._id);
  }

  // ── 3. Clusters ──
  for (let g = 0; g < CLUSTER_GROUPS.length; g++) {
    const group = CLUSTER_GROUPS[g];
    const repIdx = group.indices;
    const reps = repIdx.map((i) => SEED_REPORTS[i]);

    if (clustersExist && (await CivicCluster.countDocuments({ clusterCode: `CLU-${1001 + g}` })) > 0) {
      console.log(`  · Cluster CLU-${1001 + g} exists — skipped`);
      continue;
    }
    const centerLat = reps.reduce((s, r) => s + r.lat, 0) / reps.length;
    const centerLng = reps.reduce((s, r) => s + r.lng, 0) / reps.length;
    const latest = new Date(Math.min(...repIdx.map((i) => NOW - SEED_REPORTS[i].hoursAgo * H)));
    const worst = reps.reduce((a, b) => {
      const rank: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
      return rank[b.priority] > rank[a.priority] ? b : a;
    });
    const priorityScore = worst.priority === 'critical' ? 92 : worst.priority === 'high' ? 78 : worst.priority === 'medium' ? 55 : 32;

    await CivicCluster.create({
      clusterCode: `CLU-${1001 + g}`,
      title: `${group.label} issue cluster`,
      description: `${repIdx.length} resident report${repIdx.length === 1 ? '' : 's'} clustered near ${reps[0].locality}. ${worst.priority === 'critical' || worst.priority === 'high' ? 'High-priority civic concern requiring municipal attention.' : 'Localized civic concern under monitoring.'}`,
      category: group.category,
      subcategory: group.label,
      severity: worst.priority.toUpperCase(),
      priority: { score: priorityScore, level: worst.priority.toUpperCase() },
      center: { latitude: centerLat, longitude: centerLng },
      ward: 'Ward 14',
      locality: 'Dharampeth',
      city: 'Nagpur',
      status: 'ACTIVE',
      signalIds: repIdx.map((i) => signalIds[i]),
      issueIds: repIdx.map((i) => reportIds[i]),
      reportCount: repIdx.length,
      confirmationCount: repIdx.length * 3 + 2,
      keywords: group.keywords,
      lastSignalAt: latest,
      createdAt: latest,
      updatedAt: latest,
    });
    console.log(`  ✓ Cluster CLU-${1001 + g} — ${group.label} (${repIdx.length} reports)`);
  }

  // ── 4. Discussions (linked to civic issues) ──
  for (let i = 0; i < SEED_REPORTS.length; i++) {
    const r = SEED_REPORTS[i];
    const createdAt = new Date(NOW - r.hoursAgo * H);

    if (reportsExist && reportIds[i]) {
      const existingDiscussion = await Discussion.findOne({ issueId: reportIds[i] }).select('_id').lean();
      if (existingDiscussion) continue;
    }
    const messages = (DISCUSSION_MESSAGES[r.category] || [])
      .slice(0, 2)
      .map((m) => ({
        userId: ownerIds[m.user === 'Priya S.' || m.user === 'Alok K.' || m.user === 'Sunil G.' || m.user === 'Vikram Joshi' ? 'rohan' : 'ananya'],
        userName: m.user,
        text: m.text,
        createdAt: new Date(NOW - m.hoursAgo * H),
      }));

    await Discussion.create({
      authorId: ownerIds[r.owner],
      title: r.title,
      body: r.description,
      issueId: reportIds[i],
      issueTitle: r.title,
      category: r.category,
      ward: r.ward,
      locality: r.locality,
      status: 'OPEN',
      messages,
      confirmations: [ownerIds.demo],
      createdAt,
      updatedAt: createdAt,
    });
  }

  // ── 4b. Standalone community discussions (NO civic issue, NO signal pipeline) ──
  // A discussion is a community conversation, not a signal: these have no
  // issueId and were never run through classification/clustering.
  const STANDALONE_DISCUSSIONS: {
    owner: 'demo' | 'ananya' | 'rohan';
    title: string;
    body: string;
    category: string;
    ward: string;
    locality: string;
    hoursAgo: number;
    lat?: number;
    lng?: number;
    replies: { user: 'demo' | 'ananya' | 'rohan'; text: string; hoursAgo: number }[];
  }[] = [
    {
      owner: 'demo',
      title: 'Morning walkers group — safety on the garden track',
      body: 'Several of us walk the garden track between 5:30 and 7 AM. Would the community like a shared WhatsApp-style thread here to coordinate and flag anything unusual?',
      category: 'community',
      ward: 'Ward 14',
      locality: 'Dharampeth',
      hoursAgo: 30,
      lat: 21.1482,
      lng: 79.0886,
      replies: [
        { user: 'ananya', text: 'Great idea — count me in for weekday mornings.', hoursAgo: 26 },
        { user: 'rohan', text: 'We should also coordinate with the RWA for better track lighting.', hoursAgo: 20 },
      ],
    },
    {
      owner: 'ananya',
      title: 'Volunteers for the tree plantation drive',
      body: 'The RWA is planning a plantation drive near the market junction this weekend. We need ~15 volunteers for sapling distribution and watering.',
      category: 'environment',
      ward: 'Ward 14',
      locality: 'Dharampeth',
      hoursAgo: 54,
      replies: [
        { user: 'demo', text: 'I can bring two watering cans and help with distribution.', hoursAgo: 48 },
        { user: 'rohan', text: 'I will coordinate with the nursery for saplings.', hoursAgo: 40 },
      ],
    },
    {
      owner: 'rohan',
      title: 'Better bus stop shelter near Block B',
      body: 'The bus stop near Block B has no shelter or lighting. Can we petition the municipal transport department together?',
      category: 'roads',
      ward: 'Ward 14',
      locality: 'Dharampeth',
      hoursAgo: 76,
      replies: [
        { user: 'demo', text: 'Supporting this — the evening wait is quite unsafe.', hoursAgo: 70 },
        { user: 'ananya', text: 'I can draft the petition if someone collects signatures.', hoursAgo: 60 },
      ],
    },
    {
      owner: 'ananya',
      title: 'Segregated waste bins for the apartment block',
      body: 'The common dump area only has mixed bins. Should we request separate wet/dry bins from the sanitation department?',
      category: 'sanitation',
      ward: 'Ward 14',
      locality: 'Dharampeth',
      hoursAgo: 90,
      replies: [
        { user: 'rohan', text: 'Yes — and a clear schedule for pickup would help everyone.', hoursAgo: 84 },
      ],
    },
  ];

  for (const sd of STANDALONE_DISCUSSIONS) {
    const existing = await Discussion.findOne({ title: sd.title }).select('_id').lean();
    if (existing) continue;
    const createdAt = new Date(NOW - sd.hoursAgo * H);
    const replies = sd.replies.map((m) => ({
      userId: ownerIds[m.user],
      userName: '', // resolved from the User record by the API — never stored stale names
      text: m.text,
      createdAt: new Date(NOW - m.hoursAgo * H),
    }));
    await Discussion.create({
      authorId: ownerIds[sd.owner],
      title: sd.title,
      body: sd.body,
      category: sd.category,
      ward: sd.ward,
      locality: sd.locality,
      location: sd.lat && sd.lng ? { latitude: sd.lat, longitude: sd.lng, ward: sd.ward, locality: sd.locality } : undefined,
      status: 'OPEN',
      messages: replies,
      confirmations: [ownerIds.demo],
      createdAt,
      updatedAt: createdAt,
    });
    console.log(`  ✓ Discussion — ${sd.title}`);
  }

  // ── 4c. Normalize legacy message names ──
  // Old seed runs stored hardcoded display names (e.g. "Signal Test User").
  // Rewrite every message userName from the real User record so stale/demo
  // identities can never surface in the resident UI.
  const discussionsAll = await Discussion.find({}).select('messages').lean();
  let patched = 0;
  for (const d of discussionsAll) {
    const ids = [...new Set((d.messages || []).map((m: any) => m.userId?.toString()).filter(Boolean))];
    if (ids.length === 0) continue;
    const users = await User.find({ _id: { $in: ids } }).select('name _id').lean();
    const nameById = new Map(users.map((u) => [u._id.toString(), u.name]));
    const updates = (d.messages || [])
      .filter((m: any) => {
        const real = nameById.get(m.userId?.toString());
        return real && real !== m.userName;
      })
      .map((m: any) => ({ text: m.text, real: nameById.get(m.userId?.toString()) }));
    if (updates.length > 0) {
      await Discussion.updateOne(
        { _id: d._id },
        { $set: { 'messages.$[].userName': '' } } // cleared; API resolves from userId
      );
      patched += updates.length;
    }
  }
  if (patched > 0) console.log(`  · Normalized ${patched} legacy message display names.`);

  // ── 5. Community aggregations (representative groups related issues) ──
  // Records WHO aggregated WHAT and WHY — never authoritative metrics.
  const repUserDoc = await User.findOne({ email: 'siddhant@gmail.com' }).select('_id');
  if (repUserDoc) {
    const { CommunityAggregation } = await import('../models/CommunityAggregation.js');
    const aggregationSeeds = [
      {
        issueTitles: ['Streetlight failure on school corridor', 'Pole 14 to 16 lighting outage', 'Streetlights dark from Gate 2 to school corner'],
        context: 'Multiple residents report the same lighting corridor — likely a single feeder circuit issue affecting pedestrian safety in the evening.',
      },
      {
        issueTitles: ['Drain overflow at market junction', 'Pothole cluster on West Avenue', 'Deep pothole near West Avenue junction'],
        context: 'Residents connect the drainage overflow and road damage along the same stretch — waterlogging is accelerating surface degradation.',
      },
    ];
    for (const agg of aggregationSeeds) {
      const matched = await Report.find({ title: { $in: agg.issueTitles } }).select('_id').limit(agg.issueTitles.length).lean();
      if (matched.length < 2) continue;
      const issueIds = matched.map((r) => r._id);
      const existingAgg = await CommunityAggregation.findOne({
        representativeId: repUserDoc._id,
        issueIds: { $all: issueIds, $size: issueIds.length },
      }).lean();
      if (existingAgg) continue;
      await CommunityAggregation.create({
        representativeId: repUserDoc._id,
        community: 'Green Valley Residency',
        ward: 'Ward 14',
        locality: 'Dharampeth',
        city: 'Nagpur',
        issueIds,
        context: agg.context,
      });
      console.log(`  ✓ Aggregation — ${agg.issueTitles[0]} + ${agg.issueTitles[1]}`);
    }
  }

  // ── 6. Municipal departments + field teams ──
  const departmentSpecs = [
    { name: 'Roads & Transport', code: 'RT', slaTargetHours: 24, icon: '🛣️', status: 'Stable' },
    { name: 'Water Supply', code: 'WS', slaTargetHours: 8, icon: '💧', status: 'Stable' },
    { name: 'Sanitation & Waste', code: 'SW', slaTargetHours: 24, icon: '♻️', status: 'Optimal' },
    { name: 'Electrical Operations', code: 'EO', slaTargetHours: 4, icon: '⚡', status: 'Warning' },
    { name: 'Drainage', code: 'DR', slaTargetHours: 12, icon: '🚿', status: 'Warning' },
    { name: 'Street Lighting', code: 'SL', slaTargetHours: 8, icon: '💡', status: 'Stable' },
    { name: 'Parks & Recreation', code: 'PR', slaTargetHours: 48, icon: '🌳', status: 'Optimal' },
  ];
  const deptIds: Record<string, mongoose.Types.ObjectId> = {};
  for (const spec of departmentSpecs) {
    let dept = await Department.findOne({ code: spec.code });
    if (!dept) {
      dept = await Department.create(spec as any);
      console.log(`  ✓ Department ${spec.name} (${spec.code})`);
    } else {
      await Department.updateOne({ _id: dept._id }, { $set: { status: spec.status, slaTargetHours: spec.slaTargetHours } });
    }
    deptIds[spec.code] = dept._id;
  }

  const teamSpecs = [
    { name: 'Team Alpha (Roads)', code: 'RT', ward: 'Ward 14', zone: 'Central Zone', status: 'Active', maxTasks: 8, focus: 'Ward 14 • Central Zone' },
    { name: 'Team Delta (Water)', code: 'WS', ward: 'Ward 08', zone: 'North Zone', status: 'Active', maxTasks: 8, focus: 'Ward 08 • North Zone' },
    { name: 'Team Echo (Sanitation)', code: 'SW', ward: 'Ward 22', zone: 'South Zone', status: 'Standby', maxTasks: 6, focus: 'Ward 22 • South Zone' },
    { name: 'Team Beta (Electrical)', code: 'EO', ward: 'Ward 14', zone: 'Central Zone', status: 'Active', maxTasks: 6, focus: 'Ward 14 • Central Zone' },
    { name: 'Team Gamma (Drainage)', code: 'DR', ward: 'Ward 12', zone: 'East Zone', status: 'En Route', maxTasks: 6, focus: 'Ward 12 • East Zone' },
  ];
  for (const spec of teamSpecs) {
    const dept = await Department.findOne({ code: spec.code });
    if (!dept) continue;
    const existing = await Team.findOne({ name: spec.name });
    if (!existing) {
      await Team.create({
        name: spec.name,
        departmentId: dept._id,
        departmentName: dept.name,
        ward: spec.ward,
        zone: spec.zone,
        status: spec.status,
        maxTasks: spec.maxTasks,
        focus: spec.focus,
        members: [{ name: 'Field Officer', initials: 'FO', role: 'Lead' }],
      });
      console.log(`  ✓ Team ${spec.name}`);
    }
  }

  // ── 6b. Attach municipal assignment state to a few seeded reports so the
  //       Municipal Portal has real department/team workflow data.
  const assignmentMap: { titleRe: RegExp; dept: string; team: string }[] = [
    { titleRe: /streetlight|street light|lighting/i, dept: 'Street Lighting', team: 'Team Alpha (Roads)' },
    { titleRe: /water|pressure/i, dept: 'Water Supply', team: 'Team Delta (Water)' },
    { titleRe: /pothole|road|west avenue/i, dept: 'Roads & Transport', team: 'Team Alpha (Roads)' },
    { titleRe: /drain|stagnant/i, dept: 'Drainage', team: 'Team Gamma (Drainage)' },
    { titleRe: /waste|garbage/i, dept: 'Sanitation & Waste', team: 'Team Echo (Sanitation)' },
    { titleRe: /transformer|electric|spark/i, dept: 'Electrical Operations', team: 'Team Beta (Electrical)' },
  ];
  for (const m of assignmentMap) {
    const report = await Report.findOne({ title: m.titleRe, 'municipal.assignedAt': { $in: ['', null, undefined] } });
    if (!report) continue;
    const dept = await Department.findOne({ name: m.dept });
    const team = await Team.findOne({ name: m.team });
    if (!dept) continue;
    await Report.updateOne(
      { _id: report._id },
      {
        $set: {
          'municipal.department': dept.name,
          'municipal.departmentId': String(dept._id),
          'municipal.team': team ? team.name : '',
          'municipal.teamId': team ? String(team._id) : '',
          'municipal.assignedAt': new Date(Date.now() - 2 * H).toISOString(),
          'municipal.inProgressAt': new Date(Date.now() - 1 * H).toISOString(),
          status: 'In Progress',
        },
        $push: {
          timeline: {
            $each: [
              {
                status: 'Assigned',
                timestamp: new Date(Date.now() - 2 * H).toISOString(),
                note: `Issue assigned to ${dept.name}${team ? ' · ' + team.name : ''} (seed).`,
                actor: 'Arjun Mehta',
              },
              {
                status: 'In Progress',
                timestamp: new Date(Date.now() - 1 * H).toISOString(),
                note: 'Municipal work started (seed).',
                actor: 'Arjun Mehta',
              },
            ],
          },
        },
      }
    );
    console.log(`  ✓ Municipal assignment — ${report.reportNumber} → ${dept.name}`);
  }

  // ── 7. Municipal notifications (real events only) ──
  const municipalUser = await User.findOne({ email: 'municipal@civinest.org' });
  if (municipalUser) {
    const highPriority = await Report.find({
      $or: [{ priority: 'critical' }, { 'analysis.severity': { $in: ['CRITICAL', 'HIGH'] } }],
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    const notifSeeds: {
      type: string;
      title: string;
      message: string;
      priority: string;
      relatedIssueId?: string;
      relatedWardId?: string;
      relatedDepartmentId?: string;
    }[] = [
      {
        type: 'SYSTEM',
        title: 'Municipal operations active',
        message: 'Command center synchronized with civic data for Ward 14, Dharampeth.',
        priority: 'LOW',
      },
    ];
    for (const r of highPriority) {
      notifSeeds.push({
        type: 'CRITICAL_ISSUE',
        title: 'High-priority issue requires review',
        message: `${r.title} (${r.reportNumber}) in ${r.location?.ward || 'the city'} needs municipal triage.`,
        priority: r.priority === 'critical' ? 'CRITICAL' : 'HIGH',
        relatedIssueId: String(r._id),
        relatedWardId: r.location?.ward,
        relatedDepartmentId: r.analysis?.suggestedDepartment,
      });
    }
    for (const n of notifSeeds) {
      const exists = await MunicipalNotification.findOne({ officerId: municipalUser._id, title: n.title });
      if (!exists) {
        await MunicipalNotification.create({ officerId: municipalUser._id, ...n } as any);
        console.log(`  ✓ Municipal notification — ${n.title}`);
      }
    }
  }

  console.log(`\n✓ Seeded ${SEED_REPORTS.length} reports, ${signalIds.length} signals, ${CLUSTER_GROUPS.length} clusters, ${SEED_REPORTS.length} discussions.`);
  console.log('\nDemo logins:');
  console.log('  Resident  → demo@civinest.org / DemoPass123!');
  console.log('  Municipal → municipal@civinest.org / MunicipalPass123!');
  console.log('  Community → siddhant@gmail.com / DemoPass123!\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
