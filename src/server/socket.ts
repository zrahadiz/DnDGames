import "dotenv/config"; // must be the very first line
import { Server } from "socket.io";
import { db } from "@/db";
import { messages, roomPlayers, rooms } from "@/db/schema";
import { GameEventWithRelations, TurnProgress } from "@/types/gameEvents";
import { eq, and } from "drizzle-orm";
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
    }: {
      roomId: string;
      event: GameEventWithRelations;
    }) => {
      console.log("game_event_created received", {
        roomId,
        eventId: event.id,
      });

      io.to(`room_${roomId}`).emit("game_event_created", {
        event,
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

        console.log("leave_room:", {
          socketId: socket.id,
          userId,
          roomId,
          info,
        });

        if (!info) {
          console.log("No socket info found");

          callback?.({ success: true });
          return;
        }

        // Make sure this socket actually belongs to this room
        if (info.roomId !== roomId || info.userId !== userId) {
          console.log("Socket room mismatch");

          callback?.({ success: true });
          return;
        }

        // Leave Socket.IO room
        socket.leave(roomKey);

        // Update DB
        await setPlayerConnection(roomId, userId, false);

        // Remove socket-room association
        socketUserMap.delete(socket.id);

        console.log("Player marked disconnected");

        // Get updated room state
        const room = await getRoomState(roomId);

        if (room) {
          io.to(roomKey).emit("room_update", {
            type: "room_state_updated",
            room,
          });
        }

        console.log("User left room:", {
          userId,
          roomId,
          socketId: socket.id,
        });

        callback?.({
          success: true,
        });
      } catch (error) {
        console.error("Failed to leave room:", error);
        callback?.({
          success: false,
        });
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

      if (!info) return;

      const { roomId, userId } = info;
      const roomKey = `room_${roomId}`;

      socketUserMap.delete(socket.id);

      // Check whether this user still has another socket
      // connected to the same room.
      const roomSockets = await io.in(roomKey).fetchSockets();

      const stillConnected = roomSockets.some(
        (roomSocket) => roomSocket.data.user?.user?.id === userId,
      );

      if (stillConnected) {
        return;
      }

      await setPlayerConnection(roomId, userId, false);

      const room = await getRoomState(roomId);

      console.log("User disconnected:", userId, "from room:", roomId);

      if (!room) return;

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
