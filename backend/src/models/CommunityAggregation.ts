import mongoose, { Document, Schema } from 'mongoose';

/**
 * Community Aggregation — records WHO aggregated WHAT and WHY.
 *
 * A community representative groups related resident reports / issues and adds
 * community context. This is NOT a copy of the Report or CivicCluster model,
 * and it carries no authoritative metrics: representatives can never set
 * priority, severity, status, report counts, or confirmations here.
 */
export interface ICommunityAggregation extends Document {
  representativeId: mongoose.Types.ObjectId;
  community: string;
  ward: string;
  locality: string;
  city: string;
  clusterId?: mongoose.Types.ObjectId;
  issueIds: mongoose.Types.ObjectId[];
  context: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const communityAggregationSchema = new Schema<ICommunityAggregation>(
  {
    representativeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    community: { type: String, trim: true, default: '' },
    ward: { type: String, trim: true, default: '' },
    locality: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    clusterId: { type: Schema.Types.ObjectId, ref: 'CivicCluster', default: undefined },
    issueIds: [{ type: Schema.Types.ObjectId, ref: 'Report' }],
    context: { type: String, trim: true, maxlength: 2000, default: '' },
    notes: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

// Prevent duplicate aggregation of the same issue set by the same rep.
communityAggregationSchema.index({ representativeId: 1, clusterId: 1 });
communityAggregationSchema.index({ representativeId: 1, createdAt: -1 });

export const CommunityAggregation = mongoose.model<ICommunityAggregation>(
  'CommunityAggregation',
  communityAggregationSchema
);
