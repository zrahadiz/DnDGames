// /pages/api/rooms/[id]/start.ts
import { db } from "@/db";
import { roomPlayers, rooms } from "@/db/schema";
import { requiredUser } from "@/server/auth/requiredUser";
import { UnauthorizedError } from "@/server/errors/unauthorized";
import { apiResponse } from "@/server/utils/apiResponse";
import { eq } from "drizzle-orm";

type Params = Promise<{ id: string }>;

export async function PATCH(req: Request, { params }: { params: Params }) {
  try {
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

    if (room.status !== "waiting") {
      return apiResponse(400, {
        success: false,
        message: "Room is not in waiting state",
      });
    }

    if (room.hostId !== userId) {
      return apiResponse(403, {
        success: false,
        message: "Only the host can start the game",
      });
    }

    const players = await db.query.roomPlayers.findMany({
      where: eq(roomPlayers.roomId, roomId),
    });

    const allReady = players.every((p) => p.isReady);

    if (!allReady) {
      return apiResponse(400, {
        success: false,
        message: "All players must be ready",
      });
    }

    const [updatedRoom] = await db
      .update(rooms)
      .set({
        status: "playing",
      })
      .where(eq(rooms.id, roomId))
      .returning();

    return apiResponse(200, {
      success: true,
      message: "Room started successfully",
      data: updatedRoom,
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
