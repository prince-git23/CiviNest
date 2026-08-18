import mongoose, { Document, Schema } from 'mongoose';

export type MunicipalNotificationType =
  | 'CRITICAL_ISSUE'
  | 'ISSUE_ASSIGNED'
  | 'ISSUE_UPDATED'
  | 'SLA_WARNING'
  | 'SLA_BREACH'
  | 'RESIDENT_CONFIRMATION'
  | 'COMMUNITY_ESCALATION'
  | 'RESOLUTION_SUBMITTED'
  | 'ISSUE_REOPENED'
  | 'SYSTEM';

export type MunicipalNotificationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface IMunicipalNotification extends Document {
  officerId: mongoose.Types.ObjectId;
  type: MunicipalNotificationType;
  title: string;
  message: string;
  priority: MunicipalNotificationPriority;
  read: boolean;
  relatedIssueId?: string;
  relatedWardId?: string;
  relatedDepartmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const municipalNotificationSchema = new Schema<IMunicipalNotification>(
  {
    officerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'CRITICAL_ISSUE',
        'ISSUE_ASSIGNED',
        'ISSUE_UPDATED',
        'SLA_WARNING',
        'SLA_BREACH',
        'RESIDENT_CONFIRMATION',
        'COMMUNITY_ESCALATION',
        'RESOLUTION_SUBMITTED',
        'ISSUE_REOPENED',
        'SYSTEM',
      ],
      default: 'SYSTEM',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
    read: { type: Boolean, default: false },
    relatedIssueId: { type: String, default: undefined },
    relatedWardId: { type: String, default: undefined },
    relatedDepartmentId: { type: String, default: undefined },
  },
  { timestamps: true }
);

municipalNotificationSchema.index({ officerId: 1, read: 1, createdAt: -1 });

export const MunicipalNotification = mongoose.model<IMunicipalNotification>(
  'MunicipalNotification',
  municipalNotificationSchema
);
