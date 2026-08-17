import { z } from 'zod';

export const createReportSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters.').max(2000),
  category: z.string().trim().min(1, 'Category is required.'),
  categoryLabel: z.string().trim().optional(),
  subcategory: z.string().trim().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  location: z.object({
    address: z.string().trim().min(1, 'Address is required.'),
    ward: z.string().trim().optional().default(''),
    city: z.string().trim().optional().default(''),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.string().optional(),
  }),
  evidence: z.array(z.object({
    id: z.string(),
    url: z.string(),
    name: z.string(),
    type: z.enum(['image', 'video']),
    size: z.string(),
  })).optional().default([]),
  analysis: z.object({
    category: z.string().optional(),
    categoryLabel: z.string().optional(),
    subcategory: z.string().optional(),
    severity: z.string().optional(),
    confidence: z.number().optional(),
    suggestedDepartment: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

export const updateReportSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  status: z.enum(['Under Review', 'Assigned', 'In Progress', 'Verification', 'Resolved', 'Reopened']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
