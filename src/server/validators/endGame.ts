import { z } from "zod";

export const endGameSchema = z.object({
  reason: z.enum(["victory", "defeat", "abandoned"]).default("abandoned"),
  title: z.string().min(1).max(100).default("Adventure Ended"),
  summary: z.string().min(1).max(500).default("The host ended the adventure."),
  narrative: z
    .string()
    .min(1)
    .max(1000)
    .default("The host has ended the adventure."),
});
