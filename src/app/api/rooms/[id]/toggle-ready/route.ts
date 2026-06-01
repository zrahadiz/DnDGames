import { db } from "@/db";
import { roomPlayers, rooms } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requiredUser } from "@/server/auth/requiredUser";
import { apiResponse } from "@/server/utils/apiResponse";
import { UnauthorizedError } from "@/server/errors/unauthorized";

type Params = Promise<{
  id: string;
}>;

export async function PATCH(req: Request, { params }: { params: Params }) {
  try {
    const currentUser = await requiredUser();
    const userId = currentUser.user.id;

    const { id: roomId } = await params;

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
        message: "Cannot change ready status after game has started",
      });
    }

    const player = await db.query.roomPlayers.findFirst({
      where: and(
        eq(roomPlayers.roomId, roomId),
        eq(roomPlayers.userId, userId),
      ),
    });

    if (!player) {
      return apiResponse(404, {
        success: false,
        message: "You are not in this room",
      });
    }

    const [updatedPlayer] = await db
      .update(roomPlayers)
      .set({
        isReady: !player.isReady,
      })
      .where(eq(roomPlayers.id, player.id))
      .returning();

    return apiResponse(200, {
      success: true,
      message: updatedPlayer.isReady
        ? "Player is ready"
        : "Player is no longer ready",
      data: updatedPlayer,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof UnauthorizedError) {
      return apiResponse(401, {
        success: false,
        message: error.message,
      });
    }

    return apiResponse(500, {
      success: false,
      message: "Internal Server Error",
    });
  }
}
