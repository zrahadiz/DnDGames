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
