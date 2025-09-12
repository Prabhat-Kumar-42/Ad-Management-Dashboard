import { Platform } from '@prisma/client';
import { processGoogleCampaign } from './google.processor.js';
import { processMetaCampaign } from './meta.processor.js';

// /workers/processors/processor-index.ts

export async function processCampaign(account: any, job: any) {
  switch (job.campaign.platform) {
    case Platform.GOOGLE:
      return processGoogleCampaign(account, job);
    case Platform.META:
      return processMetaCampaign(account, job);
    default:
      throw new Error('Unsupported platform');
  }
}
