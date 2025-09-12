import { Queue } from 'bullmq';
import { connection } from '../../shared/redis/redis.js';

// /server/queues/queue.ts

export const campaignQueue = new Queue('campaigns', { connection: connection });
