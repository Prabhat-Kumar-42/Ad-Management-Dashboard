import type { Response } from 'express';
import type { AuthRequest } from '../types/auth-request.type.js';
import { BadRequestError, UnauthorizedError } from '../utils/http-error.util.js';
import { createCampaignSchema, updateCampaignSchema } from '../validators/campaign.validator.js';
import { campaignsService } from '../services/campaign.service.js';
import z from 'zod';

// /src/controllers/campaign.controller.ts

export async function createCampaign(req: AuthRequest, res: Response) {
  if (!req.user) throw new UnauthorizedError();

  const parsed = createCampaignSchema.safeParse(req.body);
  if (!parsed.success) {
      throw new BadRequestError('Validation error', z.treeifyError(parsed.error));
  }

  try {
    const result = await campaignsService.createCampaign(req.user.id, parsed.data);
    res.status(201).json(result);
  } catch (error: any) {
    console.error(error);
    if (error.message.includes('unauthorized') || error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create campaign' });
  }
}

export async function updateCampaign(req: AuthRequest, res: Response) {
  if (!req.user) throw new UnauthorizedError();

  const campaignId = req.params.id;
  if (!campaignId) {
    throw new BadRequestError('Validation error', 'Campaign ID is required');
  }

  const parsed = updateCampaignSchema.safeParse(req.body);
  if (!parsed.success) {
      throw new BadRequestError('Validation error', z.treeifyError(parsed.error));
  }

  try {
    const result = await campaignsService.updateCampaign(req.user.id, campaignId, parsed.data);
    res.json(result);
  } catch (error: any) {
    console.error(error);
    if (error.message.includes('unauthorized') || error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update campaign' });
  }
}

export async function getCampaignJobs(req: AuthRequest, res: Response) {
  if (!req.user) throw new UnauthorizedError();

  const campaignId = req.params.id;
  if (!campaignId) {
    throw new BadRequestError('Validation error', 'Campaign ID is required');
  }

  try {
    const jobs = await campaignsService.getCampaignJobs(req.user.id, campaignId);
    res.json({ jobs });
  } catch (error: any) {
    console.error(error);
    if (error.message.includes('unauthorized') || error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch campaign jobs' });
  }
}
