import { JobStatus, CampaignJobAction } from '@prisma/client';
import { campaignQueue } from '../queue/queue.js';
import type { CreateCampaignInput, UpdateCampaignInput } from '../types/campaign.types.js';
import { prisma } from '@shared/db/db.js';
import { NotFoundError, UnauthorizedError } from '../utils/http-error.util.js';

// /server/services/campaigns.service.ts

export const campaignsService = {
  async createCampaign(userId: string, data: CreateCampaignInput) {
    const { accountId, name, platform, initialConfig } = data;

    // Verify ownership of the account
    const account = await prisma.adAccount.findFirst({ where: { id: accountId, userId } });
    if (!account) throw new NotFoundError('Account not found');

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        platform,
        accountId,
      },
    });

    // Create campaign job
    const job = await prisma.campaignJob.create({
      data: {
        campaignId: campaign.id,
        action: CampaignJobAction.CREATE,
        status: JobStatus.DRAFT,
        payload: initialConfig,
      },
    });

    // Enqueue job
    await campaignQueue.add(
      CampaignJobAction.CREATE, 
      { 
        jobId: job.id, 
        campaignId: campaign.id 
      },
      {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    return { 
      campaign, 
      message: 'Campaign creation queued' 
    };
  },

  async updateCampaign(userId: string, campaignId: string, data: UpdateCampaignInput) {
    const { name, updatedConfig } = data;

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId },
      include: { account: true },
    });

    if (!campaign) throw new NotFoundError('Campaign not found');
    if(campaign.account.userId != userId) throw new UnauthorizedError();

    // Update campaign metadata
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { name },
    });

    // Create update job
    const job = await prisma.campaignJob.create({
      data: {
        campaignId,
        action: CampaignJobAction.UPDATE,
        status: JobStatus.DRAFT,
        payload: updatedConfig,
      },
    });

    // Enqueue job
    await campaignQueue.add(CampaignJobAction.UPDATE, 
      { 
        jobId: job.id, 
        campaignId 
      }, 
      {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
    
    return { 
      campaign: updatedCampaign,
      message: 'Campaign updation queued'
    };
  },

  async getCampaignJobs(userId: string, campaignId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId },
      include: { account: true },
    });

    if (!campaign) throw new NotFoundError('Campaign not found');
    if(campaign.account.userId != userId) throw new UnauthorizedError();

    const jobs = await prisma.campaignJob.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
    });

    return jobs;
  },
};
