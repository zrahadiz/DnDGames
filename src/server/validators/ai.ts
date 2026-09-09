import { z } from "zod";

export const characterEffectSchema = z.discriminatedUnion("type", [
  z.object({
    characterId: z.uuid(),
    type: z.literal("damage"),
    amount: z.number().int().min(0).max(50),
  }),

  z.object({
    characterId: z.uuid(),
    type: z.literal("heal"),
    amount: z.number().int().min(0).max(50),
  }),

  z.object({
    characterId: z.uuid(),
    type: z.literal("mana_cost"),
    amount: z.number().int().min(0).max(50),
  }),

  z.object({
    characterId: z.uuid(),
    type: z.literal("mana_restore"),
    amount: z.number().int().min(0).max(50),
  }),

  z.object({
    characterId: z.uuid(),
    type: z.literal("xp"),
    amount: z.number().int().min(0).max(50),
  }),
]);

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

  characterEffects: z.array(characterEffectSchema).default([]),
});

export type AiTurnResult = z.infer<typeof aiTurnResultSchema>;
