import IORedis from 'ioredis';

// /shared/redis/redis.ts

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const connection = new IORedis.default(REDIS_URL, { maxRetriesPerRequest: null });

