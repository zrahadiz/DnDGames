import { z } from "zod";

export const aiSuggestionSchema = z.object({
  races: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),

  classes: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),
});

export const aiTurnResultSchema = z.object({
  narrative: z.string().min(1),

  outcome: z.enum(["ongoing", "victory", "defeat"]),

  ending: z
    .object({
      title: z.string().min(1),
      summary: z.string().min(1),
    })
    .nullable(),
});

export type AiTurnResult = z.infer<typeof aiTurnResultSchema>;
