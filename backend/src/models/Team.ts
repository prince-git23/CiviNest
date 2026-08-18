import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  departmentId: mongoose.Types.ObjectId;
  departmentName: string;
  ward: string;
  zone?: string;
  status: 'Active' | 'Standby' | 'En Route' | 'On Site';
  focus?: string;
  maxTasks: number;
  members: { name: string; initials: string; role?: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    departmentName: { type: String, required: true, trim: true },
    ward: { type: String, default: '' },
    zone: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Active', 'Standby', 'En Route', 'On Site'],
      default: 'Standby',
    },
    focus: { type: String, default: '' },
    maxTasks: { type: Number, default: 6 },
    members: [
      {
        name: { type: String, default: '' },
        initials: { type: String, default: '' },
        role: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

teamSchema.index({ departmentId: 1 });
teamSchema.index({ ward: 1 });
teamSchema.index({ status: 1 });

export const Team = mongoose.model<ITeam>('Team', teamSchema);
