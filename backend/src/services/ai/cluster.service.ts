import { CivicCluster, ICivicCluster } from '../../models/CivicCluster.js';
import { CivicSignal, ICivicSignal } from '../../models/CivicSignal.js';
import { Report } from '../../models/Report.js';
import { Discussion } from '../../models/Discussion.js';

export interface ClusterMatchResult {
  matched: boolean;
  clusterId?: string;
  clusterCode?: string;
  clusterStatus?: string;
  clusterConfidence?: number;
  reason?: string;
}

const GEO_RADIUS_KM = 2.5;
const TIME_WINDOW_DAYS = 7;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function findOrCreateCluster(
  signal: ICivicSignal,
  input: {
    category: string;
    severity: string;
    keywords: string[];
    location?: { latitude: number; longitude: number; ward?: string; locality?: string; city?: string };
    priorityScore: number;
    priorityLevel: string;
  }
): Promise<ClusterMatchResult> {
  // ── 1. Try to match an existing active cluster ──
  if (input.location) {
    const candidates = await CivicCluster.find({
      category: input.category,
      status: { $in: ['ACTIVE', 'INVESTIGATING', 'ASSIGNED'] },
    }).sort({ updatedAt: -1 });

    const now = Date.now();
    let bestMatch: ICivicCluster | null = null;
    let bestDistance = Infinity;

    for (const cluster of candidates) {
      const distance = haversineKm(
        input.location.latitude,
        input.location.longitude,
        cluster.center.latitude,
        cluster.center.longitude
      );

      // Within geographic radius
      if (distance > GEO_RADIUS_KM) continue;

      // Within time window (based on last signal)
      const lastSignal = new Date(cluster.lastSignalAt).getTime();
      if (now - lastSignal > TIME_WINDOW_DAYS * 86400000) continue;

      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = cluster;
      }
    }

    if (bestMatch) {
      // Attach signal to existing cluster
      bestMatch.signalIds.push(signal._id);
      bestMatch.reportCount = bestMatch.signalIds.length;
      bestMatch.lastSignalAt = new Date();
      bestMatch.severity = input.severity;
      bestMatch.priority = { score: input.priorityScore, level: input.priorityLevel };
      const kwSet = new Set([...bestMatch.keywords, ...input.keywords]);
      bestMatch.keywords = [...kwSet].slice(0, 10);
      await bestMatch.save();

      await CivicSignal.findByIdAndUpdate(signal._id, {
        clusterId: bestMatch._id,
        status: 'CLUSTERED',
      });

      const confidence = Math.min(
        Math.max(1 - bestDistance / GEO_RADIUS_KM, 0.5),
        0.95
      );

      return {
        matched: true,
        clusterId: bestMatch._id.toString(),
        clusterCode: bestMatch.clusterCode,
        clusterStatus: bestMatch.status,
        clusterConfidence: Math.round(confidence * 100) / 100,
        reason: `Merged into active ${input.category} cluster within ${bestDistance.toFixed(1)} km.`,
      };
    }
  }

  // ── 2. Create a new cluster ──
  const clusterCode = `CLU-${Math.floor(1000 + Math.random() * 9000)}`;
  const newCluster = await CivicCluster.create({
    clusterCode,
    title: `${input.category.replace(/_/g, ' ')} issue cluster`,
    category: input.category,
    severity: input.severity,
    priority: { score: input.priorityScore, level: input.priorityLevel },
    center: input.location
      ? { latitude: input.location.latitude, longitude: input.location.longitude }
      : { latitude: 21.1458, longitude: 79.0882 }, // Nagpur default when no location
    ward: input.location?.ward || '',
    locality: input.location?.locality || '',
    city: input.location?.city || 'Nagpur',
    signalIds: [signal._id],
    reportCount: 1,
    keywords: input.keywords,
    lastSignalAt: new Date(),
  });

  await CivicSignal.findByIdAndUpdate(signal._id, {
    clusterId: newCluster._id,
    status: 'CLUSTERED',
  });

  return {
    matched: false,
    clusterId: newCluster._id.toString(),
    clusterCode: newCluster.clusterCode,
    clusterStatus: newCluster.status,
    clusterConfidence: 1,
    reason: 'New civic issue cluster created from this signal.',
  };
}

export async function createIssueFromSignal(
  signal: ICivicSignal,
  input: {
    category: string;
    severity: string;
    priorityScore: number;
    priorityLevel: string;
    keywords: string[];
    location?: { latitude: number; longitude: number; address?: string; ward?: string; city?: string };
  }
): Promise<string> {
  const report = await Report.create({
    userId: signal.userId,
    reportNumber: `#CV-${Math.floor(1000 + Math.random() * 9000)}`,
    title: input.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: signal.redactedText || signal.rawText,
    category: input.category,
    priority: input.priorityLevel.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
    location: {
      address: input.location?.address || 'Location not provided',
      ward: input.location?.ward || '',
      city: input.location?.city || 'Nagpur',
      latitude: input.location?.latitude ?? 21.1458,
      longitude: input.location?.longitude ?? 79.0882,
    },
    analysis: {
      category: input.category,
      severity: input.severity,
      confidence: signal.aiConfidence ?? undefined,
      suggestedDepartment: '',
      keywords: input.keywords,
    },
    timeline: [
      {
        status: 'Report Lodged',
        timestamp: new Date().toLocaleString(),
        note: 'Citizen signal ingested and clustered into a civic issue.',
        actor: 'Resident',
      },
    ],
  });

  await CivicSignal.findByIdAndUpdate(signal._id, { issueId: report._id });

  // Link issue to cluster
  if (signal.clusterId) {
    await CivicCluster.findByIdAndUpdate(signal.clusterId, {
      $addToSet: { issueIds: report._id },
    });
  }

  // Open a community discussion linked to this issue so residents can
  // coordinate, confirm, and discuss it.
  await Discussion.create({
    issueId: report._id,
    issueTitle: report.title,
    category: input.category,
    ward: input.location?.ward || '',
    locality: input.location?.ward || '',
    status: 'OPEN',
    messages: [],
    confirmations: [],
  });

  return report._id.toString();
}
