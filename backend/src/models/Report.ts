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
  /** GeoJSON Point for 2dsphere geographic queries (longitude, latitude) */
  locationPoint?: {
    type: 'Point';
    coordinates: [number, number];
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
  /** Municipal operations state (optional — set only once the issue reaches the municipal workflow). */
  municipal?: {
    department?: string;
    departmentId?: string;
    team?: string;
    teamId?: string;
    assignedAt?: string;
    inProgressAt?: string;
    workCompletedAt?: string;
    resolutionSubmittedAt?: string;
    resolution?: {
      description: string;
      submittedBy: string;
      submittedById: string;
      evidence: { id: string; url: string; name: string; type: string; size: string }[];
      submittedAt: string;
    };
    priorityOverrides?: {
      previous: string;
      new: string;
      officer: string;
      officerId: string;
      reason: string;
      timestamp: string;
    }[];
    notes?: { text: string; author: string; authorId: string; timestamp: string }[];
  };
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
    // GeoJSON Point for 2dsphere queries. Optional so pre-existing records
    // (created before this field existed) remain savable; new reports set it
    // via locationPointFrom() in the report/signal services.
    locationPoint: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
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
    municipal: {
      department: { type: String, default: '' },
      departmentId: { type: String, default: '' },
      team: { type: String, default: '' },
      teamId: { type: String, default: '' },
      assignedAt: { type: String, default: '' },
      inProgressAt: { type: String, default: '' },
      workCompletedAt: { type: String, default: '' },
      resolutionSubmittedAt: { type: String, default: '' },
      resolution: {
        description: { type: String, default: '' },
        submittedBy: { type: String, default: '' },
        submittedById: { type: String, default: '' },
        evidence: [
          {
            id: { type: String, default: '' },
            url: { type: String, default: '' },
            name: { type: String, default: '' },
            type: { type: String, default: '' },
            size: { type: String, default: '' },
          },
        ],
        submittedAt: { type: String, default: '' },
      },
      priorityOverrides: [
        {
          previous: String,
          new: String,
          officer: String,
          officerId: String,
          reason: String,
          timestamp: String,
        },
      ],
      notes: [
        {
          text: String,
          author: String,
          authorId: String,
          timestamp: String,
        },
      ],
    },
    upvotes: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Keep the GeoJSON point consistent with location on every save so the
// 2dsphere index never sees a Point without coordinates (older records
// predate the field and are backfilled here).
reportSchema.pre('save', function (next) {
  const doc = this as any;
  if (
    doc.location &&
    Number.isFinite(doc.location.latitude) &&
    Number.isFinite(doc.location.longitude)
  ) {
    doc.locationPoint = locationPointFrom(doc.location);
  }
  next();
});

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ locationPoint: '2dsphere' });

export function locationPointFrom(location: { latitude: number; longitude: number }): {
  type: 'Point';
  coordinates: [number, number];
} {
  return {
    type: 'Point',
    coordinates: [location.longitude, location.latitude],
  };
}

export const Report = mongoose.model<IReport>('Report', reportSchema);
