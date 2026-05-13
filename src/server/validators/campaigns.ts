import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { campaigns } from "@/db/schema";

export const campaignResponseSchema = createSelectSchema(campaigns);

export const createCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export const updateCampaignSchema = createUpdateSchema(campaigns).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

export type Campaign = z.infer<typeof campaignResponseSchema>;

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
