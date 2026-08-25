import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { campaigns } from "@/db/schema";

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
