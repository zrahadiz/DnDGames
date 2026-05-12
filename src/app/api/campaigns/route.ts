import { NextRequest, NextResponse } from "next/server";
import { and, count, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { requiredUser } from "@/server/auth/requiredUser";

export async function GET(req: NextRequest) {
  try {
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

    if (theme) {
      conditions.push(eq(campaigns.theme, theme));
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

      return NextResponse.json({
        data,
      });
    }

    const data = await db.query.campaigns.findMany({
      where: whereClause,

      limit,
      offset,

      orderBy: (campaigns, { desc }) => [desc(campaigns.createdAt)],
    });

    const totalResult = await db
      .select({
        count: count(),
      })
      .from(campaigns)
      .where(whereClause);

    const total = totalResult[0].count;

    return NextResponse.json({
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

    return NextResponse.json(
      {
        error: "Failed to fetch campaigns",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: Request) {
  try {
    const {
      title,
      image,
      description,
      theme,
      backgroundLore,
      startingObjective,
      worldSetup,
    } = await req.json();

    if (!title || !theme) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        {
          status: 400,
        },
      );
    }

    const currentUser = await requiredUser();

    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        title,
        image,
        description,
        theme,
        backgroundLore,
        startingObjective,
        worldSetup,
        createdBy: currentUser.user.id,
      })
      .returning();

    return NextResponse.json(
      {
        data: newCampaign,
        message: "Campaign has been created",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create campaign",
      },
      {
        status: 500,
      },
    );
  }
}
