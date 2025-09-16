import type { Response } from 'express';
import type { AuthRequest } from '../types/auth-request.type.js';
import { BadRequestError, UnauthorizedError } from '../utils/http-error.util.js';
import { metricsQuerySchema } from '../validators/metrics-query.validator.js';
import { metricsService } from '../services/metrics.service.js';
import z from 'zod';

// /server/controllers/metrics.controller.ts

// GET /api/metrics
export async function getMetrics(req: AuthRequest, res: Response) {
  if (!req.user) throw new UnauthorizedError();

  const parsed = metricsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
      throw new BadRequestError('Validation error', z.treeifyError(parsed.error));
  }

  try {
    const metrics = await metricsService.getMetrics(req.user.id, parsed.data);
    res.json({ metrics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}

// GET /api/metrics/breakdown
export async function getMetricsBreakdown(req: AuthRequest, res: Response) {
  if (!req.user) throw new UnauthorizedError();

  const parsed = metricsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
      throw new BadRequestError('Validation error', z.treeifyError(parsed.error));
  }

  try {
    const metrics = await metricsService.getMetricsBreakdown(req.user.id, parsed.data);
    res.json({ metrics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch metrics breakdown' });
  }
}
