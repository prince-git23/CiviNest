import mongoose, { Document, Schema } from 'mongoose';

export interface IDiscussionMessage {
  userId: mongoose.Types.ObjectId;
  userName: string;
  text: string;
  createdAt?: Date;
}

export interface IDiscussionLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
  ward?: string;
  locality?: string;
}

export interface IDiscussion extends Document {
  /** Creator of the discussion — always derived from the authenticated session on create. */
  authorId?: mongoose.Types.ObjectId;
  title: string;
  body: string;
  /** Optional linked civic issue (Report). A discussion may exist without one. */
  issueId?: mongoose.Types.ObjectId;
  issueTitle?: string;
  category: string;
  ward: string;
  locality: string;
  location?: IDiscussionLocation;
  status: 'OPEN' | 'ACTIVE' | 'CLOSED';
  messages: IDiscussionMessage[];
  confirmations: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const discussionSchema = new Schema<IDiscussion>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, default: '', trim: true, maxlength: 200 },
    body: { type: String, default: '', trim: true, maxlength: 2000 },
    // Civic Issue linking is optional: a discussion is a community conversation,
    // NOT a signal. When present, it references an existing Report (civic issue).
    issueId: { type: Schema.Types.ObjectId, ref: 'Report', index: true },
    issueTitle: { type: String, default: '' },
    category: { type: String, default: '', index: true },
    ward: { type: String, default: '' },
    locality: { type: String, default: '' },
    location: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
      address: { type: String, default: '' },
      ward: { type: String, default: '' },
      locality: { type: String, default: '' },
    },
    status: { type: String, enum: ['OPEN', 'ACTIVE', 'CLOSED'], default: 'OPEN' },
    messages: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        // Display name is resolved from the User record by the API layer;
        // stored only for non-API consumers / backwards compatibility.
        userName: { type: String, default: '' },
        text: { type: String, required: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    confirmations: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

discussionSchema.index({ status: 1 });
discussionSchema.index({ ward: 1 });
discussionSchema.index({ category: 1 });
discussionSchema.index({ authorId: 1 });
discussionSchema.index({ createdAt: -1 });

export const Discussion = mongoose.model<IDiscussion>('Discussion', discussionSchema);
