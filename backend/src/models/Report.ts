import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  reportNumber: string;
  title: string;
  description: string;
  category: string;
  categoryLabel?: string;
  subcategory?: string;
  status: 'Under Review' | 'Assigned' | 'In Progress' | 'Verification' | 'Resolved' | 'Reopened';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    address: string;
    ward: string;
    city: string;
    latitude: number;
    longitude: number;
    accuracy?: string;
  };
  evidence: {
    id: string;
    url: string;
    name: string;
    type: 'image' | 'video';
    size: string;
  }[];
  analysis?: {
    category: string;
    categoryLabel: string;
    subcategory: string;
    severity: string;
    confidence: number;
    suggestedDepartment: string;
    keywords: string[];
  };
  timeline: {
    status: string;
    timestamp: string;
    note: string;
    actor?: string;
  }[];
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    categoryLabel: { type: String, trim: true },
    subcategory: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Under Review', 'Assigned', 'In Progress', 'Verification', 'Resolved', 'Reopened'],
      default: 'Under Review',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    location: {
      address: { type: String, required: true },
      ward: { type: String, default: '' },
      city: { type: String, default: '' },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: { type: String },
    },
    evidence: [
      {
        id: String,
        url: String,
        name: String,
        type: { type: String, enum: ['image', 'video'] },
        size: String,
      },
    ],
    analysis: {
      category: String,
      categoryLabel: String,
      subcategory: String,
      severity: String,
      confidence: Number,
      suggestedDepartment: String,
      keywords: [String],
    },
    timeline: [
      {
        status: String,
        timestamp: String,
        note: String,
        actor: String,
      },
    ],
    upvotes: { type: Number, default: 1 },
  },
  { timestamps: true }
);

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ category: 1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);
