// /pages/api/rooms/[id]/start.ts
import { db } from "@/db";
import { gameEvents, messages, roomPlayers, rooms } from "@/db/schema";
import { generateOpeningNarrative } from "@/server/ai/service/generateOpeningNarrative";
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
      columns: {
        id: true,
        name: true,
        status: true,
        hostId: true,
        currentTurn: true,
      },

      with: {
        campaign: {
          columns: {
            title: true,
            description: true,
            backgroundLore: true,
            startingLocation: true,
            startingObjective: true,
            worldSetup: true,
          },
        },

        players: {
          with: {
            character: true,
          },
        },
      },
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
        message: "Room has already started",
      });
    }

    if (room.hostId !== userId) {
      return apiResponse(403, {
        success: false,
        message: "Only the host can start the game",
      });
    }

    const missingCharacter = room.players.some((player) => !player.character);

    if (missingCharacter) {
      return apiResponse(400, {
        success: false,
        message: "All players must create a character before starting",
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

    const aiResults = await generateOpeningNarrative(room);
    console.log("AI results for opening narrative:", aiResults);

    const data = await db.transaction(async (tx) => {
      const [updatedRoom] = await tx
        .update(rooms)
        .set({
          status: "playing",
          currentTurn: 1,
        })
        .where(eq(rooms.id, roomId))
        .returning();

      const [narration] = await tx
        .insert(gameEvents)
        .values({
          roomId,
          roomPlayerId: null,
          turnNumber: 0,
          eventType: "ai_narration",
          payload: {
            text: aiResults.narrative,
          },
        })
        .returning();

      return {
        room: updatedRoom,
        openingNarrative: narration,
      };
    });

    return apiResponse(200, {
      success: true,
      message: "Room started successfully",
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
      message: "Internal Server Error",
      error,
    });
  }
}
