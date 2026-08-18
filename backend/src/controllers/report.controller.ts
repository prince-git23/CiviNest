import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { Report, IReport, locationPointFrom } from '../models/Report.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { CreateReportInput, UpdateReportInput } from '../validators/report.validator.js';

function generateReportNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `#CV-${num}`;
}

export async function createReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    const input: CreateReportInput = req.body;

    const report = await Report.create({
      userId: req.user.userId,
      reportNumber: generateReportNumber(),
      title: input.title,
      description: input.description,
      category: input.category,
      categoryLabel: input.categoryLabel,
      subcategory: input.subcategory,
      priority: input.priority || 'medium',
      location: input.location,
      locationPoint: locationPointFrom({
        latitude: input.location.latitude!,
        longitude: input.location.longitude!,
      }),
      evidence: input.evidence || [],
      analysis: input.analysis,
      timeline: [
        {
          status: 'Report Lodged',
          timestamp: new Date().toISOString(),
          note: 'Civic signal submitted and queued for review.',
          actor: 'Resident',
        },
      ],
    });

    sendSuccess(res, { report }, 'Report submitted successfully.', 201);
  } catch (error: any) {
    sendError(res, 'Failed to create report.', 500);
  }
}

export async function getReports(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    const { page = '1', limit = '20', status, category } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = { userId: req.user.userId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Report.countDocuments(filter),
    ]);

    sendSuccess(res, {
      reports,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    sendError(res, 'Failed to fetch reports.', 500);
  }
}

export async function getReportById(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    }).lean();

    if (!report) {
      sendError(res, 'Report not found.', 404);
      return;
    }

    sendSuccess(res, { report });
  } catch (error: any) {
    sendError(res, 'Failed to fetch report.', 500);
  }
}

export async function updateReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    const input: UpdateReportInput = req.body;

    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: input },
      { new: true }
    );

    if (!report) {
      sendError(res, 'Report not found.', 404);
      return;
    }

    sendSuccess(res, { report }, 'Report updated successfully.');
  } catch (error: any) {
    sendError(res, 'Failed to update report.', 500);
  }
}
