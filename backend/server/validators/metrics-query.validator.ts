import { z } from 'zod';

// /server/validators/metrics-query.validator.ts

export const metricsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  platform: z.string().optional(),
  accountId: z.string().optional(),
  campaignId: z.string().optional(),
  adGroupId: z.string().optional(),
  adId: z.string().optional(),
});

