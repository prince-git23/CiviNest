import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  status: 'Stable' | 'Critical' | 'Optimal' | 'Warning';
  slaTargetHours: number;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Stable', 'Critical', 'Optimal', 'Warning'],
      default: 'Stable',
    },
    slaTargetHours: { type: Number, default: 24 },
    icon: { type: String, default: '🏛️' },
  },
  { timestamps: true }
);

departmentSchema.index({ status: 1 });
departmentSchema.index({ slaTargetHours: 1 });

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
