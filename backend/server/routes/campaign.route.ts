import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createCampaign, getCampaignJobs, updateCampaign } from '../controllers/campaign.controller.js';

// /src/routes/campaign.route.ts

export const campaignRouter = Router();

campaignRouter.post('/', authenticate, createCampaign);
campaignRouter.put('/:id', authenticate, updateCampaign);
campaignRouter.get('/:id/jobs', authenticate, getCampaignJobs);

