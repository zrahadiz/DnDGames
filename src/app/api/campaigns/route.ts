import { NextRequest } from "next/server";
import { and, count, ilike, eq } from "drizzle-orm";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { requiredUser } from "@/server/auth/requiredUser";
import { createCampaignSchema } from "@/server/validators/campaigns";
import { apiResponse } from "@/server/utils/apiResponse";

export async function GET(req: NextRequest) {
  try {
    console.time("db");

    const searchParams = req.nextUrl.searchParams;

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const offset = (page - 1) * limit;

    const search = searchParams.get("search");
    const theme = searchParams.get("theme");
    const minimal = searchParams.get("minimal") === "true";

    const conditions = [];

    if (search) {
      conditions.push(ilike(campaigns.title, `%${search}%`));
    }

    if (theme && theme !== "all") {
      conditions.push(eq(campaigns.themeId, theme));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    if (minimal) {
      const data = await db.query.campaigns.findMany({
        where: whereClause,

        columns: {
          id: true,
          title: true,
        },

        orderBy: (campaigns, { desc }) => [desc(campaigns.createdAt)],
      });
      console.timeEnd("db");

      return apiResponse(200, {
        success: true,
        message: "Campaign dropdown retrieve successfully",
        data,
      });
    }

    const data = await db.query.campaigns.findMany({
      where: whereClause,

      limit,
      offset,

      with: {
        theme: {
          columns: {
            id: true,
            name: true,
            icon: true,
          },
        },
        creator: {
          columns: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },

      orderBy: (campaigns, { desc }) => [desc(campaigns.createdAt)],
    });

    const totalResult = await db
      .select({
        count: count(),
      })
      .from(campaigns)
      .where(whereClause);

    const total = totalResult[0].count;

    return apiResponse(200, {
      success: true,
      message: "Campaigns fetched successfully",
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return apiResponse(500, {
      success: false,
      message: "Failed to fetch campaigns",
      error,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("body:", body);

    const result = createCampaignSchema.safeParse(body);

    console.log("result:", result);

    if (!result.success) {
      return apiResponse(400, {
        success: false,
        message: "Invalid Input",
        error: result.error.flatten(),
      });
    }

    const currentUser = await requiredUser();

    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        ...result.data,
        createdBy: currentUser.user.id,
      })
      .returning();

    return apiResponse(201, {
      success: true,
      message: "Campaign has been created",
      data: newCampaign,
    });
  } catch (error) {
    console.error(error);
    return apiResponse(500, {
      success: false,
      message: "Failed to create campaign",
      error,
    });
  }
}
