import mongoose, { Document, Schema } from 'mongoose';

export type MunicipalAuditAction =
  | 'ISSUE_ASSIGNED'
  | 'TEAM_ASSIGNED'
  | 'PRIORITY_OVERRIDDEN'
  | 'DEPARTMENT_CHANGED'
  | 'STATUS_CHANGED'
  | 'WORK_STARTED'
  | 'WORK_COMPLETED'
  | 'RESOLUTION_SUBMITTED'
  | 'ISSUE_REOPENED'
  | 'RESOLUTION_VERIFIED';

export interface IMunicipalAudit extends Document {
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  action: MunicipalAuditAction;
  entityId: string;
  entityLabel?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: Date;
}

const municipalAuditSchema = new Schema<IMunicipalAudit>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorName: { type: String, required: true },
    action: {
      type: String,
      enum: [
        'ISSUE_ASSIGNED',
        'TEAM_ASSIGNED',
        'PRIORITY_OVERRIDDEN',
        'DEPARTMENT_CHANGED',
        'STATUS_CHANGED',
        'WORK_STARTED',
        'WORK_COMPLETED',
        'RESOLUTION_SUBMITTED',
        'ISSUE_REOPENED',
        'RESOLUTION_VERIFIED',
      ],
      required: true,
    },
    entityId: { type: String, required: true },
    entityLabel: { type: String, default: '' },
    previousValue: { type: String, default: '' },
    newValue: { type: String, default: '' },
    reason: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

municipalAuditSchema.index({ actorId: 1, timestamp: -1 });
municipalAuditSchema.index({ entityId: 1, timestamp: -1 });

export const MunicipalAudit = mongoose.model<IMunicipalAudit>('MunicipalAudit', municipalAuditSchema);
