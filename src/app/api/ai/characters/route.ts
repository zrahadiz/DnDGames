import { NextRequest } from "next/server";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiResponse } from "@/server/utils/apiResponse";
import { promptCharacterSuggestions } from "@/server/ai/prompts/characters";
import { generateAiResponse } from "@/server/ai/config";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return apiResponse(400, {
        success: false,
        message: "campaignId query parameter is required",
      });
    }

    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),

      with: {
        theme: true,
      },
    });

    if (!campaign) {
      return apiResponse(404, {
        success: false,
        message: "Campaign not found",
      });
    }

    const prompts = await promptCharacterSuggestions({
      title: campaign.title,
      description: campaign.description,
      backgroundLore: campaign.backgroundLore,
      worldSetup: campaign.worldSetup,
    });

    const response = await generateAiResponse({
      prompt: prompts,
    });

    console.log("AI Response:", response);

    return apiResponse(200, {
      success: true,
      message: "Character suggestions generated",
      data: response,
    });
  } catch (error) {
    console.error(error);

    return apiResponse(500, {
      success: false,
      message: "Failed to generate suggestions",
    });
  }
}
