import { Router } from 'express';
import { createReport, getReports, getReportById, updateReport } from '../controllers/report.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createReportSchema, updateReportSchema } from '../validators/report.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// All report routes require CITIZEN role
router.use(authenticate, requireRole(ROLES.CITIZEN));

router.post('/', validate(createReportSchema), createReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.patch('/:id', validate(updateReportSchema), updateReport);

export default router;
