import "dotenv/config"; // must be the very first line
import { Server } from "socket.io";
import { db } from "@/db";
import { roomPlayers, rooms } from "@/db/schema";
import { GameEventWithRelations, TurnProgress } from "@/types/gameEvents";
import { eq, and, ne, asc } from "drizzle-orm";
import { getUserFromCookie } from "./auth/getUserDataFromCookie";
import { setIO } from "@/lib/socket-server";
import { getRoomState } from "./rooms/getRoomState";

const io = new Server(3001, {
  cors: { origin: "*", credentials: true }, // later: set to your frontend URL
});

// Keep track of socket ↔ user mapping
const socketUserMap = new Map<
  string,
  {
    roomId: string;
    userId: string;
  }
>();

// Helper Function to update the player's connection status in the database
const setPlayerConnection = async (
  roomId: string,
  userId: string,
  isConnected: boolean,
) => {
  await db
    .update(roomPlayers)
    .set({
      isConnected,
      lastSeenAt: new Date(),
    })
    .where(and(eq(roomPlayers.roomId, roomId), eq(roomPlayers.userId, userId)));
};

export async function transferHostIfNeeded(
  roomId: string,
  leavingUserId: string,
) {
  return db.transaction(async (tx) => {
    const room = await tx.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
      columns: {
        id: true,
        hostId: true,
      },
    });

    if (!room) {
      return null;
    }

    // Only transfer if the person leaving is actually the host.
    if (room.hostId !== leavingUserId) {
      return null;
    }

    // Find the oldest connected player.
    const newHost = await tx.query.roomPlayers.findFirst({
      where: and(
        eq(roomPlayers.roomId, roomId),
        eq(roomPlayers.isConnected, true),
        ne(roomPlayers.userId, leavingUserId),
      ),
      orderBy: [asc(roomPlayers.joinedAt)],
      columns: {
        id: true,
        userId: true,
      },
    });

    if (!newHost) {
      console.log("No connected player available for host transfer", {
        roomId,
      });

      return null;
    }

    // Update room host
    await tx
      .update(rooms)
      .set({
        hostId: newHost.userId,
      })
      .where(eq(rooms.id, roomId));

    // Old host -> player
    await tx
      .update(roomPlayers)
      .set({
        role: "player",
      })
      .where(
        and(
          eq(roomPlayers.roomId, roomId),
          eq(roomPlayers.userId, leavingUserId),
        ),
      );

    // New host -> host
    await tx
      .update(roomPlayers)
      .set({
        role: "host",
      })
      .where(eq(roomPlayers.id, newHost.id));

    console.log("Host transferred:", {
      roomId,
      oldHostId: leavingUserId,
      newHostId: newHost.userId,
    });

    return newHost.userId;
  });
}

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    const currentUser = await getUserFromCookie(cookieHeader);

    if (!currentUser) {
      return next(new Error("Unauthorized"));
    }
    socket.data.user = currentUser;

    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log("connected:", socket.data.user?.user.name);
  console.log("total connections:", io.engine.clientsCount);

  socket.on("test", async ({ roomId }) => {
    const currentUser = socket.data.user;
    if (!currentUser) return;
    const userId = currentUser.user.id;
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    console.log("Test event received:", { roomId, userId });
  });

  socket.on(
    "sync_room_state",
    async ({ roomId, kick = false }: { roomId: string; kick: boolean }) => {
      try {
        const room = await getRoomState(roomId);

        if (!room) {
          io.to(`room_${roomId}`).emit("room_update", {
            type: "room_deleted",
            roomId,
          });

          return;
        }

        io.to(`room_${roomId}`).emit("room_update", {
          type: "room_state_updated",
          room,
          kick,
        });
        // console.log("Emitted room_state_updated for room", roomId);
        // console.log("Current room state:", room);
      } catch (error) {
        console.error(error);
      }
    },
  );

  socket.on(
    "game_event_created",
    async ({
      roomId,
      event,
      turnProgress,
    }: {
      roomId: string;
      event: GameEventWithRelations;
      turnProgress: TurnProgress;
    }) => {
      console.log("game_event_created full", event);
      console.log("game_event_created received", {
        roomId,
        eventId: event.id,
      });

      io.to(`room_${roomId}`).emit("game_event_created", {
        event,
        turnProgress,
      });
    },
  );

  socket.on("join_room", async ({ roomId }: { roomId: string }) => {
    try {
      const currentUser = socket.data.user;

      if (!currentUser) {
        socket.emit("error_message", {
          message: "Unauthorized",
        });
        return;
      }

      const userId = currentUser.user.id;
      const roomKey = `room_${roomId}`;

      // Leave previous room if this socket was already associated with one
      const previousInfo = socketUserMap.get(socket.id);

      if (previousInfo && previousInfo.roomId !== roomId) {
        const previousRoomKey = `room_${previousInfo.roomId}`;

        socket.leave(previousRoomKey);

        await setPlayerConnection(
          previousInfo.roomId,
          previousInfo.userId,
          false,
        );
      }

      socket.join(roomKey);

      socketUserMap.set(socket.id, {
        roomId,
        userId,
      });

      await setPlayerConnection(roomId, userId, true);

      const room = await getRoomState(roomId);

      if (!room) {
        socket.leave(roomKey);
        socketUserMap.delete(socket.id);

        await setPlayerConnection(roomId, userId, false);

        return;
      }

      io.to(roomKey).emit("room_update", {
        type: "room_state_updated",
        room,
      });

      console.log("User joined room:", {
        userId,
        roomId,
        socketId: socket.id,
      });
    } catch (error) {
      console.error("Failed to join room:", error);

      socket.emit("error_message", {
        message: "Failed to join room",
      });
    }
  });

  socket.on(
    "leave_room",
    async (
      { roomId }: { roomId: string },
      callback?: (response: { success: boolean }) => void,
    ) => {
      try {
        const currentUser = socket.data.user;

        if (!currentUser) {
          callback?.({ success: false });
          return;
        }

        const userId = currentUser.user.id;
        const roomKey = `room_${roomId}`;

        const info = socketUserMap.get(socket.id);

        if (!info) {
          console.log("No socket info found");

          callback?.({ success: true });
          return;
        }

        if (info.roomId !== roomId || info.userId !== userId) {
          console.log("Socket room mismatch");

          callback?.({ success: false });
          return;
        }

        // Leave the Socket.IO room first
        socket.leave(roomKey);

        // Remove this socket from tracking
        socketUserMap.delete(socket.id);

        // Check if the user still has another socket connected
        // to the same room.
        const roomSockets = await io.in(roomKey).fetchSockets();

        const stillConnected = roomSockets.some(
          (roomSocket) => roomSocket.data.user?.user?.id === userId,
        );

        // Another tab/device is still connected to this room.
        if (stillConnected) {
          console.log("User still has another socket connected:", {
            userId,
            roomId,
          });

          callback?.({ success: true });
          return;
        }

        // No other socket exists.
        // Now mark the player as disconnected.
        await setPlayerConnection(roomId, userId, false);

        // Transfer host if necessary.
        const newHostId = await transferHostIfNeeded(roomId, userId);

        console.log("Player left room:", {
          userId,
          roomId,
          newHostId,
        });

        // Get the updated room state.
        const room = await getRoomState(roomId);

        if (room) {
          io.to(roomKey).emit("room_update", {
            type: "room_state_updated",
            room,
          });
        }

        callback?.({ success: true });
      } catch (error) {
        console.error("Failed to leave room:", error);

        callback?.({ success: false });
      }
    },
  );

  socket.on("start_game", async ({ roomId }) => {
    console.log("start_game event", { roomId });
    if (!roomId) {
      console.error("start_game missing roomId", { roomId });
      return;
    }
    const roomKey = `room_${roomId}`;
    io.to(roomKey).emit("room_update", {
      type: "game_started",
    });
  });

  socket.on(
    "generate_ai_response",
    ({ roomId, started }: { roomId: string; started: boolean }) => {
      io.to(`room_${roomId}`).emit("generate_ai_response", {
        started,
      });
    },
  );

  socket.on("disconnect", async () => {
    try {
      const info = socketUserMap.get(socket.id);

      if (!info) {
        console.log("No socket info found on disconnect");
        return;
      }

      const { roomId, userId } = info;
      const roomKey = `room_${roomId}`;

      // Remove this socket from our tracking first
      socketUserMap.delete(socket.id);

      // Check whether this user still has another socket
      // connected to the same room.
      const roomSockets = await io.in(roomKey).fetchSockets();

      const stillConnected = roomSockets.some(
        (roomSocket) => roomSocket.data.user?.user?.id === userId,
      );

      // User still has another connection to this room.
      // Don't mark them disconnected or transfer the host.
      if (stillConnected) {
        console.log("User still has another socket connected:", {
          userId,
          roomId,
        });

        return;
      }

      // No other socket exists for this user in this room.
      // Now we can safely mark them as disconnected.
      await setPlayerConnection(roomId, userId, false);

      // If this user was the host, transfer host to another connected player.
      const newHostId = await transferHostIfNeeded(roomId, userId);

      console.log("User disconnected:", {
        userId,
        roomId,
        newHostId,
      });

      // Get updated room state after connection + host changes
      const room = await getRoomState(roomId);

      if (!room) {
        return;
      }

      io.to(roomKey).emit("room_update", {
        type: "room_state_updated",
        room,
      });
    } catch (error) {
      console.error("Failed to handle disconnect:", error);
    }
  });
});

setIO(io);

console.log("✅ Socket server running on :3001");
