// /pages/api/rooms/kick.ts
import { db } from "@/db";
import { roomPlayers, rooms, user } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";

import { requiredUser } from "@/server/auth/requiredUser";
import { apiResponse } from "@/server/utils/apiResponse";
import { UnauthorizedError } from "@/server/errors/unauthorized";

type Params = Promise<{ id: string }>;

export async function POST(req: Request, { params }: { params: Params }) {
  try {
    const { userTargetId } = await req.json();
    const currentUser = await requiredUser();
    const userId = currentUser.user.id;

    const { id: roomId } = await params;

    // Check if room exists
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
    });

    if (!room) {
      return apiResponse(404, {
        success: false,
        message: "Room not found",
      });
    }

    if (room.hostId !== userId) {
      return apiResponse(403, {
        success: false,
        message: "Only host can kick players",
      });
    }

    if (userTargetId === room.hostId) {
      return apiResponse(403, {
        success: false,
        message: "Host cannot kick themselves",
      });
    }

    // Check if user is in the room
    const targetPlayer = await db.query.roomPlayers.findFirst({
      where: and(
        eq(roomPlayers.roomId, roomId),
        eq(roomPlayers.userId, userTargetId),
      ),
    });

    if (!targetPlayer) {
      return apiResponse(404, {
        success: false,
        message: "Target player not in this room",
      });
    }

    // Kick the player
    await db
      .delete(roomPlayers)
      .where(
        and(
          eq(roomPlayers.roomId, roomId),
          eq(roomPlayers.userId, userTargetId),
        ),
      );

    return apiResponse(200, {
      success: true,
      message: "Player kicked successfully",
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
