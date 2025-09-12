import IORedis from 'ioredis';

// /shared/redis/redis.ts

export const connection = new IORedis.default();
