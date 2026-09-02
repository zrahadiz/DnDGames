// /pages/api/rooms/create.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { rooms, RoomStatus, roomPlayers, characters } from "@/db/schema";
import { eq, and, ilike, count } from "drizzle-orm";
import { apiResponse } from "@/server/utils/apiResponse";
import { createRoomWithCharacterSchema } from "@/server/validators/rooms";
import { requiredUser } from "@/server/auth/requiredUser";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const offset = (page - 1) * limit;

  const search = searchParams.get("search");
  const status = searchParams.get("status") as RoomStatus | null;
  const campaign_id = searchParams.get("campaignId");

  const conditions = [];

  if (search) {
    conditions.push(ilike(rooms.name, `%${search}%`));
  }

  if (status) {
    conditions.push(eq(rooms.status, status));
  }

  if (campaign_id) {
    conditions.push(eq(rooms.campaignId, campaign_id));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db.query.rooms.findMany({
    where: whereClause,
    limit,
    offset,
    with: {
      campaign: {
        columns: {
          id: true,
          title: true,
          description: true,
        },
        with: {
          theme: {
            columns: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      },
      players: {
        columns: {
          id: true,
          userId: true,
        },
      },
      host: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: (rooms, { desc }) => [desc(rooms.createdAt)],
  });

  const roomsHasCode = data.map(({ roomCode, ...room }) => ({
    ...room,
    hasCode: Boolean(roomCode),
  }));

  const totalResult = await db
    .select({
      count: count(),
    })
    .from(rooms)
    .where(whereClause);

  const total = totalResult[0].count;

  return apiResponse(200, {
    success: true,
    message: "Rooms fetched successfully",
    data: roomsHasCode,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = createRoomWithCharacterSchema.safeParse(body);

    if (!result.success) {
      return apiResponse(400, {
        success: false,
        message: "Invalid input",
        error: result.error.flatten(),
      });
    }

    const currentUser = await requiredUser();

    const data = await db.transaction(async (tx) => {
      const [newRoom] = await tx
        .insert(rooms)
        .values({
          ...result.data.room,
          hostId: currentUser.user.id,
        })
        .returning();

      const [player] = await tx
        .insert(roomPlayers)
        .values({
          roomId: newRoom.id,
          userId: currentUser.user.id,
          role: "host",
          isReady: true,
        })
        .returning();

      const [character] = await tx
        .insert(characters)
        .values({
          roomPlayerId: player.id,
          name: result.data.character.name,
          race: result.data.character.race,
          characterClass: result.data.character.characterClass,
        })
        .returning();

      const { roomCode, ...safeRoom } = newRoom;

      return {
        room: safeRoom,
        player,
        character,
      };
    });

    return apiResponse(201, {
      success: true,
      message: "Room created successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    return apiResponse(500, {
      success: false,
      message: "Failed to create room",
    });
  }
}
