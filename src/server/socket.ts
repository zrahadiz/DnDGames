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
        return;
      }

      const userId = currentUser.user.id;
      const roomKey = `room_${roomId}`;

      socket.join(roomKey);

      socketUserMap.set(socket.id, {
        roomId,
        userId,
      });

      await db
        .update(roomPlayers)
        .set({
          isConnected: true,
          lastSeenAt: new Date(),
        })
        .where(
          and(eq(roomPlayers.roomId, roomId), eq(roomPlayers.userId, userId)),
        );

      const room = await getRoomState(roomId);

      if (!room) return;

      io.to(roomKey).emit("room_update", {
        type: "room_state_updated",
        room,
      });
    } catch (error) {
      console.error(error);

      socket.emit("error_message", {
        message: "Failed to join room",
      });
    }
  });

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

  socket.on("disconnect", async () => {
    try {
      const info = socketUserMap.get(socket.id);

      if (!info) return;

      await db
        .update(roomPlayers)
        .set({
          isConnected: false,
          lastSeenAt: new Date(),
        })
        .where(
          and(
            eq(roomPlayers.roomId, info.roomId),
            eq(roomPlayers.userId, info.userId),
          ),
        );

      socketUserMap.delete(socket.id);

      const room = await getRoomState(info.roomId);

      console.log("User disconnected:", info.userId, "from room:", info.roomId);

      if (!room) return;

      io.to(`room_${info.roomId}`).emit("room_update", {
        type: "room_state_updated",
        room,
      });
    } catch (error) {
      console.error(error);
    }
  });
});

setIO(io);

console.log("✅ Socket server running on :3001");
