import { z } from 'zod';
import { PASSWORD_MIN_LENGTH, NAME_MIN_LENGTH, ROLES } from '../config/constants.js';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters.`)
    .max(100, 'Name is too long.'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(255, 'Email is too long.'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
    .max(128, 'Password is too long.'),
  phone: z.string().trim().max(20).optional(),
  role: z.enum([ROLES.CITIZEN, ROLES.MUNICIPAL_OFFICER, ROLES.COMMUNITY_REPRESENTATIVE]).optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Password is required.'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(NAME_MIN_LENGTH).max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  city: z.string().trim().max(100).optional(),
  ward: z.string().trim().max(100).optional(),
  locality: z.string().trim().max(100).optional(),
  pincode: z.string().trim().max(10).optional(),
  community: z.string().trim().max(200).optional(),
  isOnboarded: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
