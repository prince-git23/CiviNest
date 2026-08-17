import mongoose, { Document, Schema } from 'mongoose';
import { ROLES, ROLE_PERMISSIONS } from '../config/constants.js';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: string;
  city?: string;
  ward?: string;
  locality?: string;
  pincode?: string;
  community?: string;
  isOnboarded: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  toSafeObject(): Record<string, unknown>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CITIZEN,
      required: true,
    },
    city: { type: String, trim: true, maxlength: 100 },
    ward: { type: String, trim: true, maxlength: 100 },
    locality: { type: String, trim: true, maxlength: 100 },
    pincode: { type: String, trim: true, maxlength: 10 },
    community: { type: String, trim: true, maxlength: 200 },
    isOnboarded: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model<IUser>('User', userSchema);
