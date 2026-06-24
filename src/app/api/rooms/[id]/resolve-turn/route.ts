import { db } from "@/db";
import { gameEvents, messages, roomPlayers, rooms } from "@/db/schema";
import { generateTurnNarration } from "@/server/ai/service/generateTurnNarration";
import { requiredUser } from "@/server/auth/requiredUser";
import { UnauthorizedError } from "@/server/errors/unauthorized";
import { apiResponse } from "@/server/utils/apiResponse";
import { eq, and } from "drizzle-orm";
import { id } from "zod/v4/locales";

type Params = Promise<{ id: string }>;

export async function POST(req: Request, { params }: { params: Params }) {
  try {
    const currentUser = await requiredUser();
    const { id: roomId } = await params;

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

    if (room.status !== "playing") {
      return apiResponse(400, {
        success: false,
        message: "Room is not playing",
      });
    }

    const existingNarration = await db.query.gameEvents.findFirst({
      where: and(
        eq(gameEvents.roomId, roomId),
        eq(gameEvents.turnNumber, room.currentTurn),
        eq(gameEvents.eventType, "ai_narration"),
      ),
    });

    if (existingNarration) {
      return apiResponse(409, {
        success: false,
        message: "Turn already resolved",
      });
    }

    const submittedActions = await db.query.gameEvents.findMany({
      where: and(
        eq(gameEvents.roomId, roomId),
        eq(gameEvents.turnNumber, room.currentTurn),
        eq(gameEvents.eventType, "player_action"),
      ),
    });

    if (submittedActions.length < room.players.length) {
      return apiResponse(400, {
        success: false,
        message: "Not all players have submitted actions",
      });
    }

    const actionsForAi = submittedActions.map((action) => {
      const player = room.players.find((p) => p.id === action.roomPlayerId);

      return {
        character: player?.character
          ? {
              id: player.character.id,
              name: player.character.name,
              race: player.character.race,
              characterClass: player.character.characterClass,
              level: player.character.level,
              hp: player.character.hp,
              mana: player.character.mana,
            }
          : null,
        payload: action.payload,
      };
    });

    const narration = await generateTurnNarration({
      room,
      actions: actionsForAi,
    });

    const data = await db.transaction(async (tx) => {
      const [aiEvent] = await tx
        .insert(gameEvents)
        .values({
          roomId,
          turnNumber: room.currentTurn,
          eventType: "ai_narration",
          payload: {
            text: narration.narrative,
          },
        })
        .returning();

      await tx
        .update(rooms)
        .set({
          currentTurn: room.currentTurn + 1,
        })
        .where(eq(rooms.id, roomId));

      return {
        aiEvent,
        nextTurn: room.currentTurn + 1,
      };
    });

    return apiResponse(200, {
      success: true,
      message: "Turn resolved successfully",
      data,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof UnauthorizedError) {
      return apiResponse(401, {
        success: false,
        message: error.message || "Unauthorized",
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
