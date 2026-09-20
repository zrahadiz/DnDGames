import { NextRequest } from "next/server";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiResponse } from "@/types/apiResponse";
import { generateCharacterSuggestions } from "@/server/ai/service/generateCharacterSuggestions";
import { requiredUser } from "@/server/auth/requiredUser";
import { rateLimits } from "@/lib/rate-limit";

type Params = Promise<{ id: string }>;

export async function POST(_req: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const currentUser = await requiredUser();

    const { success } = await rateLimits.aiGeneration.limit(
      currentUser.user.id,
    );

    if (!success) {
      return apiResponse(429, {
        success: false,
        message:
          "AI generation limit reached. Please wait before trying again.",
      });
    }

    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
    });

    if (!campaign) {
      return apiResponse(404, {
        success: false,
        message: "Campaign not found",
      });
    }

    const suggestions = await generateCharacterSuggestions(campaign);

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
