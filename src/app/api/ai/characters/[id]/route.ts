import { NextRequest } from "next/server";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiResponse } from "@/server/utils/apiResponse";
import { generateCampaignSuggestions } from "@/server/ai/service/generateCharacterSuggestions";
import { requiredUser } from "@/server/auth/requiredUser";

type Params = Promise<{ id: string }>;

export async function POST(_req: Request, { params }: { params: Params }) {
  try {
    await requiredUser();

    const { id } = await params;

    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
    });

    if (!campaign) {
      return apiResponse(404, {
        success: false,
        message: "Campaign not found",
      });
    }

    const suggestions = await generateCampaignSuggestions(campaign);

    return apiResponse(200, {
      success: true,
      message: "Suggestions generated successfully",
      data: suggestions,
    });
  } catch (error) {
    console.error(error);

    return apiResponse(500, {
      success: false,
      message: "Failed to generate suggestions",
    });
  }
}
