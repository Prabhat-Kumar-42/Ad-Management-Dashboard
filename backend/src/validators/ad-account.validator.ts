import { z } from 'zod';

// /src/validators/ad-account.validator.ts

export const adAccountParamsSchema = z.object({
  id: z.string().min(1, 'Account ID is required'),
});
