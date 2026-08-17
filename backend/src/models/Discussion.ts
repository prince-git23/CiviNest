import mongoose, { Document, Schema } from 'mongoose';

export interface IDiscussionMessage {
  userId: mongoose.Types.ObjectId;
  userName: string;
  text: string;
  createdAt?: Date;
}

export interface IDiscussion extends Document {
  issueId: mongoose.Types.ObjectId;
  issueTitle: string;
  category: string;
  ward: string;
  locality: string;
  status: 'OPEN' | 'ACTIVE' | 'CLOSED';
  messages: IDiscussionMessage[];
  confirmations: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const discussionSchema = new Schema<IDiscussion>(
  {
    issueId: { type: Schema.Types.ObjectId, ref: 'Report', required: true, index: true },
    issueTitle: { type: String, required: true },
    category: { type: String, default: '' },
    ward: { type: String, default: '' },
    locality: { type: String, default: '' },
    status: { type: String, enum: ['OPEN', 'ACTIVE', 'CLOSED'], default: 'OPEN' },
    messages: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String, required: true },
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

export const Discussion = mongoose.model<IDiscussion>('Discussion', discussionSchema);
