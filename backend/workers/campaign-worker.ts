import { Worker, Job } from 'bullmq';
import { JobStatus } from '@prisma/client';
import { processCampaign } from './processors/processor-index.js';
import { prisma } from '../shared/db/db.js';
import { connection } from '@shared/redis/redis.js';

// /workers/campaign-worker.ts

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

    if (!campaignJob || !campaignJob.campaign?.account) {
      throw new Error('Invalid campaign job or account not found');
    }

    await processCampaign(campaignJob.campaign.account, campaignJob);

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

    throw error;
  }
}, { connection: connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has been processed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed after retries: ${err.message}`);
});

console.log('Campaign worker running');
