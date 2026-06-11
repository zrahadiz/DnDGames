// /pages/api/rooms/join.ts
import { db } from "@/db";
import { roomPlayers, characters, rooms, user } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { apiResponse } from "@/server/utils/apiResponse";
import { requiredUser } from "@/server/auth/requiredUser";
import { joinRoomSchema } from "@/server/validators/roomPlayers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("body:", body);

    const result = joinRoomSchema.safeParse(body);

    console.log("result:", result);

    if (!result.success) {
      return apiResponse(400, {
        success: false,
        message: "Invalid Input",
        error: result.error.flatten(),
      });
    }
    const currentUser = await requiredUser();

    const data = await db.transaction(async (tx) => {
      const room = await tx.query.rooms.findFirst({
        where: eq(rooms.id, result.data.roomId),
      });

      if (!room) throw new Error("ROOM_NOT_FOUND");

      const existingPlayer = await tx.query.roomPlayers.findFirst({
        where: and(
          eq(roomPlayers.roomId, result.data.roomId),
          eq(roomPlayers.userId, currentUser.user.id),
        ),
      });

      if (existingPlayer) throw new Error("ALREADY_JOINED");

      const [{ count }] = await tx
        .select({
          count: sql<number>`count(*)`,
        })
        .from(roomPlayers)
        .where(eq(roomPlayers.roomId, result.data.roomId));

      if (count >= room.maxPlayers) throw new Error("ROOM_FULL");

      const isHost = !room.hostId;
      console.log("isHost:", isHost);

      if (isHost) {
        await tx
          .update(rooms)
          .set({
            hostId: currentUser.user.id,
          })
          .where(eq(rooms.id, room.id));

        await tx
          .update(roomPlayers)
          .set({ role: "host" })
          .where(
            and(
              eq(roomPlayers.roomId, room.id),
              eq(roomPlayers.userId, currentUser.user.id),
            ),
          );
      }

      const [newPlayer] = await tx
        .insert(roomPlayers)
        .values({
          roomId: room.id,
          userId: currentUser.user.id,
          role: isHost ? "host" : "player",
        })
        .returning();

      const [character] = await tx
        .insert(characters)
        .values({
          roomPlayerId: newPlayer.id,
          name: result.data.character.name,
          race: result.data.character.race,
          characterClass: result.data.character.characterClass,
        })
        .returning();

      return {
        player: newPlayer,
        character,
      };
    });

    return apiResponse(201, {
      success: true,
      message: "Successfully joined room",
      data,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      switch (error.message) {
        case "ROOM_NOT_FOUND":
          return apiResponse(404, {
            success: false,
            message: "Room not found",
          });

        case "ALREADY_JOINED":
          return apiResponse(400, {
            success: false,
            message: "You already joined this room",
          });

        case "ROOM_FULL":
          return apiResponse(400, {
            success: false,
            message: "Room is full",
          });
      }
    }

    return apiResponse(500, {
      success: false,
      message: "Failed to join room",
    });
  }
}
