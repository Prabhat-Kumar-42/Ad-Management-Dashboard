import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// /src/queues/queue.ts

const connection = new IORedis.default(); // Uses default localhost settings

export const campaignQueue = new Queue('campaigns', { connection });
