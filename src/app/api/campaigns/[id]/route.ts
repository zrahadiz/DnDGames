import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { requiredUser } from "@/server/auth/requiredUser";
import { UnauthorizedError } from "@/server/errors/unauthorized";
import { apiResponse } from "@/server/utils/apiResponse";
import { updateCampaignSchema } from "@/server/validators/campaigns";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    await requiredUser();

    const { id } = await params;
    console.log("Fetching campaign with ID:", id);

    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
    });

    if (!campaign) {
      return apiResponse(404, {
        success: false,
        message: "Campaign not found",
      });
    }

    return apiResponse(200, {
      success: true,
      message: "Campaign fetched successfully",
      data: campaign,
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
      message: "Internal Server Error",
      error,
    });
  }
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  try {
    const currentUser = await requiredUser();
    const { id } = await params;
    const body = await req.json();
    console.log("body:", body);
    const result = updateCampaignSchema.safeParse(body);
    console.log("result:", result);

    if (!result.success) {
      return apiResponse(400, {
        success: false,
        message: "Invalid Input",
        error: result.error.flatten(),
      });
    }

    const existingCampaign = await db.query.campaigns.findFirst({
      where: and(
        eq(campaigns.id, id),
        eq(campaigns.createdBy, currentUser.user.id),
      ),
    });

    if (!existingCampaign) {
      return apiResponse(404, {
        success: false,
        message: "Campaign not found",
      });
    }

    const [updatedCampaign] = await db
      .update(campaigns)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();

    return apiResponse(200, {
      success: true,
      message: "Campaign updated successfully",
      data: updatedCampaign,
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
      message: "Internal Server Error",
      error,
    });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const currentUser = await requiredUser();

    const { id } = await params;

    const campaign = await db.query.campaigns.findFirst({
      where: and(
        eq(campaigns.id, id),
        eq(campaigns.createdBy, currentUser.user.id),
      ),
    });

    if (!campaign) {
      return apiResponse(404, {
        success: false,
        message: "Campaign not found",
      });
    }

    await db.delete(campaigns).where(eq(campaigns.id, id));

    return apiResponse(200, {
      success: false,
      message: "Campaign successfully deleted",
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
      message: "Internal Server Error",
      error,
    });
  }
}
