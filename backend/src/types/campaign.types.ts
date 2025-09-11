import type { createCampaignSchema, updateCampaignSchema } from "../validators/campaign.validator.js";
import z from "zod";

// /src/types/campaign.types.ts

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
