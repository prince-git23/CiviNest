import mongoose, { Document, Schema } from 'mongoose';

export type SignalStatus = 'PROCESSING' | 'ANALYZED' | 'CLUSTERED' | 'FAILED';

export interface IAnalysisInput {
  rawText: string;
  redactedText?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    ward?: string;
    city?: string;
  };
}

export interface IAnalysisResult {
  category: string;
  subcategory: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
  aiConfidence: number | null;
  confidenceSource: 'MODEL' | 'ESTIMATED' | null;
  keywords: string[];
  affectedService: string;
  publicSafety: boolean;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
  reasoning: string;
  model: string;
  analyzedAt: Date;
}

export interface IPriorityResult {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: {
    name: string;
    contribution: number;
  }[];
  calculatedAt: Date;
  engineVersion: string;
  safetyOverride?: boolean;
}

export interface ICivicSignal extends Document {
  userId: mongoose.Types.ObjectId;
  signalNumber: string;
  rawText: string;
  redactedText?: string;
  piiRedacted: boolean;
  piiDetected: string[];
  status: SignalStatus;
  category: string;
  subcategory: string;
  severity: string;
  aiConfidence: number | null;
  confidenceSource: 'MODEL' | 'ESTIMATED' | null;
  aiAnalysisStatus: 'AVAILABLE' | 'UNAVAILABLE';
  keywords: string[];
  affectedService: string;
  publicSafety: boolean;
  reasoning: string;
  modelName: string;
  priority: IPriorityResult | null;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    ward?: string;
    city?: string;
  } | null;
  clusterId?: mongoose.Types.ObjectId;
  issueId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const civicSignalSchema = new Schema<ICivicSignal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    signalNumber: { type: String, required: true, unique: true },
    rawText: { type: String, required: true, maxlength: 5000 },
    redactedText: { type: String },
    piiRedacted: { type: Boolean, default: false },
    piiDetected: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['PROCESSING', 'ANALYZED', 'CLUSTERED', 'FAILED'],
      default: 'PROCESSING',
      index: true,
    },
    category: { type: String, default: 'UNCLASSIFIED', index: true },
    subcategory: { type: String, default: '' },
    severity: { type: String, default: 'UNKNOWN' },
    aiConfidence: { type: Number, default: null },
    confidenceSource: { type: String, enum: ['MODEL', 'ESTIMATED', null], default: null },
    aiAnalysisStatus: { type: String, enum: ['AVAILABLE', 'UNAVAILABLE'], default: 'UNAVAILABLE' },
    keywords: { type: [String], default: [] },
    affectedService: { type: String, default: '' },
    publicSafety: { type: Boolean, default: false },
    reasoning: { type: String, default: '' },
    modelName: { type: String, default: '' },
    priority: {
      score: Number,
      level: String,
      factors: [{ name: String, contribution: Number }],
      calculatedAt: Date,
      engineVersion: String,
      safetyOverride: Boolean,
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
      ward: String,
      city: String,
    },
    clusterId: { type: Schema.Types.ObjectId, ref: 'CivicCluster' },
    issueId: { type: Schema.Types.ObjectId, ref: 'Report' },
  },
  { timestamps: true }
);

civicSignalSchema.index({ userId: 1, createdAt: -1 });
civicSignalSchema.index({ category: 1, createdAt: -1 });
civicSignalSchema.index({ clusterId: 1 });

export const CivicSignal = mongoose.model<ICivicSignal>('CivicSignal', civicSignalSchema);
