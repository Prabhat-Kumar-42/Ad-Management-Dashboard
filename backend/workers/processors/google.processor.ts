import { OAuth2Client } from 'google-auth-library';
import { GoogleAdsApi } from 'google-ads-api';
import { Platform } from '@prisma/client';
import { prisma } from '@shared/db/db.js';

// /workers/processors/google.processor.ts

export async function processGoogleCampaign(account: any, job: any) {
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
    expiry_date: connection.expiresAt?.getTime() ?? null,
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
    } catch {
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
    const result = await customer.query(`SELECT customer.id, customer.descriptive_name FROM customer`);
    console.log('Google Ads customer:', result);

    const budgetResponse = await customer.campaignBudgets.create([
      {
        name: `Budget for ${job.payload.name} - ${Date.now()}`,
        amount_micros: 5000000,
        delivery_method: 'STANDARD',
      },
    ]);

    const budgetResourceName = budgetResponse.results?.[0]?.resource_name;
    if (!budgetResourceName) throw new Error('Failed to create campaign budget');

    const campaignResponse = await customer.campaigns.create([
      {
        name: job.payload.name,
        advertising_channel_type: 'SEARCH',
        status: 'PAUSED',
        campaign_budget: budgetResourceName,
        manual_cpc: {},
      },
    ]);

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
