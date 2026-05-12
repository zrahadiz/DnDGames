import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { requiredUser } from "@/server/auth/requiredUser";
import { UnauthorizedError } from "@/server/errors/unauthorized";

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
      return NextResponse.json(
        {
          error: "Campaign not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        data: campaign,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 401,
        },
      );
    }
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  try {
    const currentUser = await requiredUser();
    const { id } = await params;
    const {
      title,
      image,
      description,
      theme,
      backgroundLore,
      startingObjective,
      worldSetup,
      isOfficial,
    } = await req.json();

    const existingCampaign = await db.query.campaigns.findFirst({
      where: and(
        eq(campaigns.id, id),
        eq(campaigns.createdBy, currentUser.user.id),
      ),
    });

    if (!existingCampaign) {
      return NextResponse.json(
        {
          error: "Campaign not found",
        },
        {
          status: 404,
        },
      );
    }

    const [updatedCampaign] = await db
      .update(campaigns)
      .set({
        title,
        image,
        description,
        theme,
        backgroundLore,
        startingObjective,
        worldSetup,
        isOfficial,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();

    return NextResponse.json(
      {
        data: updatedCampaign,
        message: "Campaign updated successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }
    return NextResponse.json(
      {
        error: "Failed to update campaign",
      },
      {
        status: 500,
      },
    );
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
      return NextResponse.json(
        {
          error: "Campaign not found",
        },
        {
          status: 404,
        },
      );
    }

    await db.delete(campaigns).where(eq(campaigns.id, id));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
