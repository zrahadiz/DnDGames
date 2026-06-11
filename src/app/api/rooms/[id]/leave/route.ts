// /pages/api/rooms/join.ts
import { db } from "@/db";
import { roomPlayers, rooms, user } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";

import { requiredUser } from "@/server/auth/requiredUser";
import { apiResponse } from "@/server/utils/apiResponse";
import { UnauthorizedError } from "@/server/errors/unauthorized";

type Params = Promise<{ id: string }>;

export async function DELETE(req: Request, { params }: { params: Params }) {
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

    // Check if user is in the room
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

    const result = await db.transaction(async (tx) => {
      let newHostId: string | null = null;
      let roomDeleted = false;

      //if host is leaving, assign new host or delete room if no players left
      if (player.role === "host") {
        // Remove host and assign new host
        console.log("Host is leaving the room:", roomId);
        const nextHost = await tx.query.roomPlayers.findFirst({
          where: and(
            eq(roomPlayers.roomId, roomId),
            ne(roomPlayers.userId, userId),
          ),
        });

        // if no next host, delete the room, otherwise assign new host
        if (!nextHost) {
          await tx.delete(rooms).where(eq(rooms.id, roomId));
          roomDeleted = true;
          return {
            roomDeleted: true,
            newHostId,
          };
        }

        await tx
          .update(roomPlayers)
          .set({
            role: "host",
            isReady: true,
          })
          .where(eq(roomPlayers.id, nextHost.id));

        await tx
          .update(rooms)
          .set({
            hostId: nextHost.userId,
          })
          .where(eq(rooms.id, roomId));

        newHostId = nextHost.userId;
      }
      // Remove leaving player from room
      await tx.delete(roomPlayers).where(eq(roomPlayers.id, player.id));
      return {
        roomDeleted,
        newHostId,
      };
    });

    if (result.roomDeleted) {
      return apiResponse(200, {
        success: true,
        message: "Room deleted because the last player left",
      });
    }

    return apiResponse(200, {
      success: true,
      message: "Left room successfully",
      data: {
        roomDeleted: result.roomDeleted,
        roomId,
        userId,
        newHostId: result.newHostId,
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
