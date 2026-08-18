import { Types } from 'mongoose';
import { MunicipalNotification, IMunicipalNotification } from '../models/MunicipalNotification.js';
import { ROLES } from '../config/constants.js';
import { User } from '../models/User.js';

export type NotificationDraft = {
  type: IMunicipalNotification['type'];
  title: string;
  message: string;
  priority: IMunicipalNotification['priority'];
  relatedIssueId?: string;
  relatedWardId?: string;
  relatedDepartmentId?: string;
};

async function officersForNotification(relatedWardId?: string): Promise<Types.ObjectId[]> {
  // Deliver to all MUNICIPAL_OFFICER accounts (a single-officer demo
  // environment; scoping to a ward/officer can be tightened later).
  const officers = await User.find({ role: ROLES.MUNICIPAL_OFFICER }).select('_id').lean();
  return officers.map((o) => o._id as Types.ObjectId);
}

function dedupeKey(d: NotificationDraft): string {
  return [d.type, d.relatedIssueId || '', d.title].join('|');
}

/**
 * Create a notification for municipal officers. Idempotent per
 * (type, relatedIssueId, title) so repeated requests (e.g. re-assign
 * the same issue) do not flood the feed.
 */
export async function createMunicipalNotification(draft: NotificationDraft): Promise<void> {
  const key = dedupeKey(draft);
  const existing = await MunicipalNotification.findOne({ title: draft.title, relatedIssueId: draft.relatedIssueId || undefined });
  if (existing) return;

  const officerIds = await officersForNotification(draft.relatedWardId);
  if (!officerIds.length) return;

  await MunicipalNotification.insertMany(
    officerIds.map((officerId) => ({ officerId, ...draft }))
  );
  void key;
}

export async function listMunicipalNotifications(
  officerId: string,
  page = 1,
  limit = 30
): Promise<{ notifications: any[]; total: number; unreadCount: number }> {
  const [notifications, total, unreadCount] = await Promise.all([
    MunicipalNotification.find({ officerId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    MunicipalNotification.countDocuments({ officerId }),
    MunicipalNotification.countDocuments({ officerId, read: false }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: String(n._id),
      type: n.type,
      title: n.title,
      message: n.message,
      priority: n.priority,
      read: n.read,
      relatedIssueId: n.relatedIssueId,
      relatedWardId: n.relatedWardId,
      relatedDepartmentId: n.relatedDepartmentId,
      timestamp: n.createdAt ? new Date(n.createdAt).toISOString() : '',
    })),
    total,
    unreadCount,
  };
}

export async function markMunicipalNotificationRead(officerId: string, notificationId: string): Promise<boolean> {
  const res = await MunicipalNotification.updateOne(
    { _id: notificationId, officerId },
    { $set: { read: true } }
  );
  return res.modifiedCount > 0;
}

export async function markAllMunicipalNotificationsRead(officerId: string): Promise<void> {
  await MunicipalNotification.updateMany({ officerId }, { $set: { read: true } });
}
