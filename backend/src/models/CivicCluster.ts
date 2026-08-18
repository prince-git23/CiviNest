import mongoose, { Document, Schema } from 'mongoose';

export interface ICivicCluster extends Document {
  clusterCode: string;
  title: string;
  description?: string;
  category: string;
  subcategory: string;
  severity: string;
  priority: {
    score: number;
    level: string;
  };
  center: {
    latitude: number;
    longitude: number;
  };
  ward: string;
  locality: string;
  city: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'ASSIGNED' | 'RESOLVED' | 'REOPENED';
  signalIds: mongoose.Types.ObjectId[];
  issueIds: mongoose.Types.ObjectId[];
  reportCount: number;
  confirmationCount: number;
  keywords: string[];
  lastSignalAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const civicClusterSchema = new Schema<ICivicCluster>(
  {
    clusterCode: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    subcategory: { type: String, default: '' },
    severity: { type: String, default: 'UNKNOWN' },
    priority: {
      score: { type: Number, default: 0 },
      level: { type: String, default: 'LOW' },
    },
    center: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    ward: { type: String, default: '' },
    locality: { type: String, default: '' },
    city: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACTIVE', 'INVESTIGATING', 'ASSIGNED', 'RESOLVED', 'REOPENED'],
      default: 'ACTIVE',
    },
    signalIds: [{ type: Schema.Types.ObjectId, ref: 'CivicSignal' }],
    issueIds: [{ type: Schema.Types.ObjectId, ref: 'Report' }],
    reportCount: { type: Number, default: 1 },
    confirmationCount: { type: Number, default: 0 },
    keywords: { type: [String], default: [] },
    lastSignalAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

civicClusterSchema.index({ status: 1 });
civicClusterSchema.index({ category: 1 });
civicClusterSchema.index({ 'center.latitude': 1, 'center.longitude': 1 });

export const CivicCluster = mongoose.model<ICivicCluster>('CivicCluster', civicClusterSchema);
