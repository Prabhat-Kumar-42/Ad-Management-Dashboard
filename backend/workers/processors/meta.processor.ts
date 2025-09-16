import { FacebookAdsApi, AdAccount } from 'facebook-nodejs-business-sdk';
import { Platform } from '@prisma/client';
import { prisma } from '@shared/db/db.js';

// /workers/processors/meta.processor.ts

export async function processMetaCampaign(account: any, job: any) {
  const connection = await prisma.platformConnection.findFirst({
    where: {
      id: account.connectionId,
      platform: Platform.META,
    },
  });

  if (!connection) throw new Error('Meta connection not found');
  if (connection.expiresAt && connection.expiresAt.getTime() < Date.now()) {
    throw new Error('Meta access token has expired');
  }

  FacebookAdsApi.init(connection.accessToken);
  const adAccount = new AdAccount(account.externalId);

  try {
    // Fetch existing campaigns for logging or validation purposes
    const campaigns = await adAccount.getCampaigns(['id', 'name']);
    console.log('Existing Meta Ads campaigns:', campaigns);
  } catch (error: any) {
    console.error('Failed to fetch existing campaigns:', error.message);
    throw new Error('Meta Ads API error while fetching campaigns');
  }

  try {
    const campaign = await adAccount.createCampaign([], {
      name: job.payload.name,
      objective: 'LINK_CLICKS',
      status: 'PAUSED',
    });

    console.log('Created Meta campaign:', campaign.id);

    // Fetch existing campaigns for logging or validation purposes
    await prisma.campaign.update({
      where: { id: job.campaignId },
      data: { externalId: campaign.id },
    });
  } catch (error: any) {
    console.error('Failed to create campaign:', error.message);
    throw new Error('Meta Ads API error while creating campaign');
  }
}
