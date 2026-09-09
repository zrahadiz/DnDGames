import { db } from "@/db";
import { gameEvents, rooms } from "@/db/schema";
import { generateTurnNarration } from "@/server/ai/service/generateTurnNarration";
import { requiredUser } from "@/server/auth/requiredUser";
import { UnauthorizedError } from "@/server/errors/unauthorized";
import { applyCharacterEffects } from "@/server/game/applyCharacterEffects";
import { apiResponse } from "@/server/utils/apiResponse";
import { eq, ne, and } from "drizzle-orm";

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
        language: true,
      },
      with: {
        campaign: {
          columns: {
            title: true,
            description: true,
            backgroundLore: true,
            startingLocation: true,
            mainObjective: true,
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
        ne(gameEvents.eventType, "ai_narration"),
        ne(gameEvents.eventType, "game_end"),
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
              xp: player.character.xp,
              hp: player.character.hp,
              maxHp: player.character.maxHp,
              mana: player.character.mana,
              maxMana: player.character.maxMana,
            }
          : null,
        eventType: action.eventType,
        payload: action.payload,
      };
    });

    const aiResult = await generateTurnNarration({
      room,
      actions: actionsForAi,
    });

    console.log("AI result: ", aiResult);
    const isGameOver = aiResult.outcome !== "ongoing";

    const allowedCharacterIds = new Set(
      room.players
        .map((player) => player.character?.id)
        .filter((id): id is string => Boolean(id)),
    );

    const safeEffects = aiResult.characterEffects.filter((effect) =>
      allowedCharacterIds.has(effect.characterId),
    );

    const data = await db.transaction(async (tx) => {
      const updatedCharacters = await applyCharacterEffects(tx, safeEffects);
      if (isGameOver) {
        const [aiEvent] = await tx
          .insert(gameEvents)
          .values({
            roomId,
            turnNumber: room.currentTurn,
            eventType: "game_end",
            payload: {
              reason: aiResult.outcome,
              title: aiResult.ending!.title,
              summary: aiResult.ending!.summary,
              narrative: aiResult.narrative,
            },
          })
          .returning();

        await tx
          .update(rooms)
          .set({
            status: "finished",
          })
          .where(eq(rooms.id, roomId));

        return {
          aiEvent,
          outcome: aiResult.outcome,
          updatedCharacters,
          nextTurn: room.currentTurn,
        };
      }

      const [aiEvent] = await tx
        .insert(gameEvents)
        .values({
          roomId,
          turnNumber: room.currentTurn,
          eventType: "ai_narration",
          payload: {
            text: aiResult.narrative,
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
        outcome: aiResult.outcome,
        updatedCharacters,
        nextTurn: room.currentTurn + 1,
      };
    });

    return apiResponse(200, {
      success: true,
      message: "Turn resolved successfully",
      data: {
        aiEvent: data.aiEvent,
        nextTurn: data.nextTurn,
        outcome: data.outcome,
        updatedCharacters: data.updatedCharacters,
        turnProgress: {
          currentTurn: data.nextTurn,
          submittedCount: 0,
          totalPlayers: room.players.length,
          remainingCount: room.players.length,
          allPlayersSubmitted: false,
        },
      },
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
