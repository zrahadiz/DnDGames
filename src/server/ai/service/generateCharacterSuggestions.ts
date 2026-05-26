import { db } from "@/db";
import { eq } from "drizzle-orm";

import { campaignClasses, campaignRaces, campaigns } from "@/db/schema";

import { generateAiResponse } from "@/server/ai/config";

import { promptCharacterSuggestions } from "@/server/ai/prompts/characters";
import { aiSuggestionSchema } from "@/server/validators/ai";

import { Campaign } from "@/server/validators/campaigns";

export async function generateCampaignSuggestions(campaign: Campaign) {
  try {
    await db
      .update(campaigns)
      .set({
        aiCharGenerationStatus: "processing",
        aiCharGenerationError: null,
      })
      .where(eq(campaigns.id, campaign.id));

    const result = await db.transaction(async (tx) => {
      const prompts = await promptCharacterSuggestions({
        title: campaign.title,
        description: campaign.description,
        backgroundLore: campaign.backgroundLore,
        worldSetup: campaign.worldSetup,
      });

      const response = await generateAiResponse({
        prompt: prompts,
      });

      const aiSuggestions = aiSuggestionSchema.safeParse(response);

      if (!aiSuggestions.success) {
        throw new Error("Failed to parse AI suggestions");
      }

      // delete old suggestions
      await tx
        .delete(campaignRaces)
        .where(eq(campaignRaces.campaignId, campaign.id));

      await tx
        .delete(campaignClasses)
        .where(eq(campaignClasses.campaignId, campaign.id));

      // insert races
      const insertedRaces = await tx
        .insert(campaignRaces)
        .values(
          aiSuggestions.data.races.map((race) => ({
            campaignId: campaign.id,
            name: race.name,
            description: race.description,
          })),
        )
        .returning();

      // insert classes
      const insertedClasses = await tx
        .insert(campaignClasses)
        .values(
          aiSuggestions.data.classes.map((cls) => ({
            campaignId: campaign.id,
            name: cls.name,
            description: cls.description,
          })),
        )
        .returning();

      await tx
        .update(campaigns)
        .set({
          aiCharGenerationStatus: "completed",
          aiCharGenerationError: null,
        })
        .where(eq(campaigns.id, campaign.id));

      return {
        status: "completed" as const,
        races: insertedRaces,
        classes: insertedClasses,
      };
    });

    return result;
  } catch (error) {
    await db
      .update(campaigns)
      .set({
        aiCharGenerationStatus: "failed",
        aiCharGenerationError:
          error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(campaigns.id, campaign.id));

    throw error;
  }
}
