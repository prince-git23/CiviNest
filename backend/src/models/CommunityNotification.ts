import mongoose, { Document, Schema } from 'mongoose';

export type CommunityNotificationType = 'municipal' | 'community' | 'cluster' | 'resolution' | 'system';

export interface ICommunityNotification extends Document {
  representativeId: mongoose.Types.ObjectId;
  /** Stable identity for the event so re-syncs never duplicate it. */
  key: string;
  type: CommunityNotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedIssueId?: string;
  relatedSection?: string;
  createdAt: Date;
}

const communityNotificationSchema = new Schema<ICommunityNotification>(
  {
    representativeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    key: { type: String, required: true },
    type: { type: String, enum: ['municipal', 'community', 'cluster', 'resolution', 'system'], default: 'system' },
    title: { type: String, required: true },
    message: { type: String, required: true, maxlength: 500 },
    read: { type: Boolean, default: false },
    relatedIssueId: { type: String },
    relatedSection: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One event per representative.
communityNotificationSchema.index({ representativeId: 1, key: 1 }, { unique: true });

export const CommunityNotification = mongoose.model<ICommunityNotification>(
  'CommunityNotification',
  communityNotificationSchema
);
