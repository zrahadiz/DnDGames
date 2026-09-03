// /pages/api/rooms/[id]/actions.ts
import { db } from "@/db";
import { gameEvents, rooms, roomPlayers, characters } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { requiredUser } from "@/server/auth/requiredUser";
import { apiResponse } from "@/server/utils/apiResponse";
import { UnauthorizedError } from "@/server/errors/unauthorized";
import { submitActionSchema } from "@/server/validators/gameEvents";
import { GameEventPayload } from "@/types/gameEvents";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const currentUser = await requiredUser();
    const userId = currentUser.user.id;

    const { id: roomId } = await params;

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
      with: {
        players: true,
      },
    });

    if (!room) {
      return apiResponse(404, {
        success: false,
        message: "Room not found",
      });
    }

    const membership = await db.query.roomPlayers.findFirst({
      where: and(
        eq(roomPlayers.roomId, roomId),
        eq(roomPlayers.userId, userId),
      ),
    });

    if (!membership) {
      return apiResponse(403, {
        success: false,
        message: "You are not a member of this room",
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

    console.log("Submitted Actions:", submittedActions);

    const data = await db.query.gameEvents.findMany({
      where: eq(gameEvents.roomId, roomId),
      with: {
        characters: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (gameEvents, { asc }) => [asc(gameEvents.createdAt)],
    });

    const submittedPlayerIds = new Set(
      submittedActions.map((action) => action.roomPlayerId),
    );

    const remainingPlayers = room.players.filter(
      (player) => !submittedPlayerIds.has(player.id),
    );

    const allPlayersSubmitted = remainingPlayers.length === 0;

    return apiResponse(200, {
      success: true,
      message: "Game Events fetched successfully",
      data: {
        events: data,
        turnProgress: {
          currentTurn: room.currentTurn,
          submittedCount: submittedActions.length,
          totalPlayers: room.players.length,
          remainingCount: remainingPlayers.length,
          allPlayersSubmitted,
        },
      },
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

export async function POST(req: Request, { params }: { params: Params }) {
  try {
    const currentUser = await requiredUser();
    const { id: roomId } = await params;
    const body = await req.json();
    const parsed = submitActionSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse(400, {
        success: false,
        message: "Invalid input",
        error: parsed.error.flatten(),
      });
    }

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
      with: {
        players: true,
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
        message: "Game has not started",
      });
    }

    const membership = room.players.find(
      (player) => player.userId === currentUser.user.id,
    );

    if (!membership) {
      return apiResponse(403, {
        success: false,
        message: "You are not a member of this room",
      });
    }

    const character = await db.query.characters.findFirst({
      where: eq(characters.roomPlayerId, membership.id),
    });

    if (!character) {
      return apiResponse(403, {
        success: false,
        message: "Character not found",
      });
    }

    const existingAction = await db.query.gameEvents.findFirst({
      where: and(
        eq(gameEvents.roomId, roomId),
        eq(gameEvents.roomPlayerId, membership.id),
        eq(gameEvents.turnNumber, room.currentTurn),
        ne(gameEvents.eventType, "ai_narration"),
      ),
    });

    if (existingAction) {
      return apiResponse(409, {
        success: false,
        message: "You have already submitted an action this turn",
      });
    }

    let eventType: "player_action" | "combat";
    let payload: GameEventPayload;

    if (parsed.data.eventType === "player_action") {
      eventType = "player_action";

      payload = {
        text: parsed.data.action,
      };
    } else {
      eventType = "combat";

      payload = {
        target: parsed.data.target,
        how: parsed.data.how,
        diceRoll: parsed.data.diceRoll,
      };
    }

    const [actionEvent] = await db
      .insert(gameEvents)
      .values({
        roomId,
        roomPlayerId: membership.id,
        turnNumber: room.currentTurn,
        eventType,
        payload,
      })
      .returning();

    const submittedActions = await db.query.gameEvents.findMany({
      where: and(
        eq(gameEvents.roomId, roomId),
        eq(gameEvents.turnNumber, room.currentTurn),
        ne(gameEvents.eventType, "ai_narration"),
        ne(gameEvents.eventType, "game_end"),
      ),
    });

    const submittedPlayerIds = new Set(
      submittedActions.map((action) => action.roomPlayerId),
    );

    const remainingPlayers = room.players.filter(
      (player) => !submittedPlayerIds.has(player.id),
    );

    const allPlayersSubmitted = remainingPlayers.length === 0;

    return apiResponse(201, {
      success: true,
      message: "Action submitted successfully",
      data: {
        event: {
          ...actionEvent,
          characters: {
            id: character.id,
            name: character.name,
            race: character.race,
            characterClass: character.characterClass,
            level: character.level,
          },
        },

        turnProgress: {
          currentTurn: room.currentTurn,
          submittedCount: submittedActions.length,
          totalPlayers: room.players.length,
          remainingCount: remainingPlayers.length,
          allPlayersSubmitted,
        },
      },
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
