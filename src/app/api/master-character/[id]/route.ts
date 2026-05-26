import { db } from "@/db";
import { eq } from "drizzle-orm";

import { campaigns, campaignRaces, campaignClasses } from "@/db/schema";
import { apiResponse } from "@/server/utils/apiResponse";
import { requiredUser } from "@/server/auth/requiredUser";
import { UnauthorizedError } from "@/server/errors/unauthorized";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    await requiredUser();

    const { id } = await params;

    const [campaign, races, classes] = await Promise.all([
      db.query.campaigns.findFirst({
        where: eq(campaigns.id, id),
        columns: {
          aiCharGenerationStatus: true,
        },
      }),
      db.query.campaignRaces.findMany({
        where: eq(campaignRaces.campaignId, id),
      }),
      db.query.campaignClasses.findMany({
        where: eq(campaignClasses.campaignId, id),
      }),
    ]);

    if (!campaign) {
      return apiResponse(404, {
        success: false,
        message: "Campaign not found",
      });
    }

    const data = {
      status: campaign?.aiCharGenerationStatus,
      races: races,
      classes: classes,
    };

    return apiResponse(200, {
      success: true,
      message: "Campaign data fetched successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof UnauthorizedError) {
      return apiResponse(401, {
        success: false,
        message: error?.message || "Unauthorized",
        error,
      });
    }
    return apiResponse(500, {
      success: false,
      message: "Failed to fetch campaign data",
      error,
    });
  }
}
