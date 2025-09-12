import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { getMetrics, getMetricsBreakdown } from '../controllers/metrics.controller.js';

// /server/routes/metrics.route.ts

export const metricsRouter = Router();

metricsRouter.get('/', authenticate, getMetrics);
metricsRouter.get('/breakdown', authenticate, getMetricsBreakdown);
