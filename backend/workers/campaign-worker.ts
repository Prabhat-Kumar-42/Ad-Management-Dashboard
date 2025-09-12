import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient, JobStatus, Platform } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { GoogleAdsApi } from 'google-ads-api';
import { FacebookAdsApi, AdAccount } from 'facebook-nodejs-business-sdk';

const prisma = new PrismaClient();
const connection = new IORedis.default();

// Initialize worker
const worker = new Worker('campaigns', async (job: Job) => {
  const { jobId, campaignId } = job.data;

  try {
    await prisma.campaignJob.update({
      where: { id: jobId },
      data: { status: JobStatus.IN_PROGRESS },
    });

    console.log(`Processing job ${jobId} for campaign ${campaignId}`);

    const campaignJob = await prisma.campaignJob.findUnique({
      where: { id: jobId },
      include: { campaign: { include: { account: true } } },
    });

    if (!campaignJob) {
      throw new Error('Campaign job not found');
    }

    const { campaign } = campaignJob;
    const account = campaign.account;

    if (!account) {
      throw new Error('Associated account not found');
    }

    if (campaign.platform === Platform.GOOGLE) {
      await processGoogleCampaign(account, campaignJob);
    } else if (campaign.platform === Platform.META) {
      await processMetaCampaign(account, campaignJob);
    } else {
      throw new Error('Unsupported platform');
    }

    await prisma.campaignJob.update({
      where: { id: jobId },
      data: { status: JobStatus.SUCCESS },
    });

    console.log(`Job ${jobId} completed successfully`);
  } catch (error: any) {
    console.error(`Job ${jobId} failed: ${error.message}`);

    await prisma.campaignJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        error: error.message,
      },
    });

    throw error; // Let BullMQ handle retries if configured during job addition
  }
}, {
  connection,
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has been processed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed after retries: ${err.message}`);
});

console.log('Campaign worker running');

// --- Google Ads Integration ---
async function processGoogleCampaign(account: any, job: any) {
  const connection = await prisma.platformConnection.findFirst({
    where: {
      id: account.connectionId,
      platform: Platform.GOOGLE,
    },
  });

  if (!connection) {
    throw new Error('Google connection not found');
  }

  const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI!,
  });

  client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken || null,
    expiry_date: connection.expiresAt ? connection.expiresAt.getTime() : null,
  });

  if (!connection.expiresAt || connection.expiresAt.getTime() < Date.now()) {
    try {
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);

      await prisma.platformConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: credentials.access_token!,
          expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          refreshToken: credentials.refresh_token || connection.refreshToken,
        },
      });

      console.log('Google token refreshed');
    } catch (error) {
      throw new Error('Failed to refresh Google access token');
    }
  }

  const adsClient = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_DEVELOPER_TOKEN!,
  });

  const customer = adsClient.Customer({
    customer_id: account.externalId,
    refresh_token: connection.refreshToken!,
  });

  try {
    // Validate access
    const result = await customer.query(`SELECT customer.id, customer.descriptive_name FROM customer`);
    console.log('Google Ads customer:', result);

    // 1. Create a campaign budget (must be done before campaign)
    const budgetResponse = await customer.campaignBudgets.create([
      {
        name: `Budget for ${job.payload.name} - ${Date.now()}`,
        amount_micros: 5000000, // $5.00
        delivery_method: 'STANDARD',
      },
    ]);

    const budgetResourceName = budgetResponse.results?.[0]?.resource_name;
    if (!budgetResourceName) {
      throw new Error('Failed to create campaign budget');
    }

    // 2. Create campaign using that budget
    const campaignResource: any = {
      name: job.payload.name,
      advertising_channel_type: 'SEARCH',
      status: 'PAUSED',
      campaign_budget: budgetResourceName,
      manual_cpc: {}, // Bidding strategy
    };

    const campaignResponse = await customer.campaigns.create([campaignResource]);
    const resourceName = campaignResponse.results?.[0]?.resource_name;

    if (!resourceName) {
      throw new Error('Failed to create campaign');
    }

    // Optionally extract campaign ID
    const campaignIdMatch = resourceName.match(/campaigns\/(\d+)$/);
    const campaignId = campaignIdMatch ? campaignIdMatch[1] : null;

    await prisma.campaign.update({
      where: { id: job.campaignId },
      data: { externalId: campaignId ?? resourceName },
    });

    console.log(`Campaign ${job.campaignId} updated with external ID ${campaignId ?? resourceName}`);
  } catch (error: any) {
    console.error('Google Ads campaign creation failed:', error.message);
    throw new Error('Google Ads API error while creating campaign');
  }
}


// --- Meta Ads Integration ---
async function processMetaCampaign(account: any, job: any) {
  const connection = await prisma.platformConnection.findFirst({
    where: {
      id: account.connectionId,
      platform: Platform.META,
    },
  });

  if (!connection) {
    throw new Error('Meta connection not found');
  }

  if (connection.expiresAt && connection.expiresAt.getTime() < Date.now()) {
    throw new Error('Meta access token has expired');
  }

  FacebookAdsApi.init(connection.accessToken);

  const adAccount = new AdAccount(account.externalId);

  const campaigns = await adAccount.getCampaigns(['id', 'name']);

try {
    // Fetch existing campaigns for logging or validation purposes
    const campaigns = await adAccount.getCampaigns(['id', 'name']);
    console.log('Existing Meta Ads campaigns:', campaigns);
  } catch (error: any) {
    console.error('Failed to fetch existing campaigns:', error.message);
    throw new Error('Meta Ads API error while fetching campaigns');
  }

  try {
    // Create new campaign
    const campaign = await adAccount.createCampaign([], {
      name: job.payload.name,
      objective: 'LINK_CLICKS',
      status: 'PAUSED',
    });

    console.log('Created Meta campaign:', campaign.id);

    // Store the external campaign ID in the database
    await prisma.campaign.update({
      where: { id: job.campaignId },
      data: { externalId: campaign.id },
    });

    console.log(`Campaign ${job.campaignId} updated with external ID ${campaign.id}`);
  } catch (error: any) {
    console.error('Failed to create campaign:', error.message);
    throw new Error('Meta Ads API error while creating campaign');
  }
}
