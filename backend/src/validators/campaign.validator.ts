import { Platform } from '@prisma/client';
import { z } from 'zod';

// /src/validators/campaign.validator.ts

export const createCampaignSchema = z.object({
  name: z.string().min(1),
  platform: z.enum(Platform),
  accountId: z.uuid(),
  initialConfig: z.any(), // You can refine this schema if you know the exact shape
                          // currently any, as different platforms have different schemas
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1),
  updatedConfig: z.any(), // same as initial config
});

