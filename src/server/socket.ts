import "dotenv/config"; // must be the very first line
import { Server } from "socket.io";
import { db } from "@/db";
import { messages, roomPlayers, rooms } from "@/db/schema";
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

  //refresh room
  socket.on("refresh_room", async ({ roomId, userId }) => {
    if (!roomId || !userId) {
      console.error("join_room missing roomId or userId", { roomId, userId });
      return;
    }
    console.log(`User ${userId} joining room ${roomId}`);
    const roomKey = `room_${roomId}`;
    socket.join(roomKey);

    if (!socketUserMap.get(socket.id)) {
      socketUserMap.set(socket.id, { roomId, userId });
    }

    // Ideally fetch from DB
    const player = await db.query.roomPlayers.findFirst({
      where: and(
        eq(roomPlayers.userId, userId),
        eq(roomPlayers.roomId, roomId),
      ),
    });

    io.to(roomKey).emit("room_update", {
      type: "player_refreshed",
      player, // full player object
    });
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

  socket.on("send_message", async ({ roomId, sender, content, turnIndex }) => {
    console.log(`send message from: ${sender} to ${roomId}, text = ${content}`);

    if (!sender || !roomId || !content) {
      console.error("send_message missing roomId, sender or content", {
        roomId,
        sender,
        content,
      });
      return;
    }

    const roomKey = `room_${roomId}`;

    const message = await db
      .insert(messages)
      .values({
        roomId,
        senderType: sender,
        content,
      })
      .returning();

    console.log(message);

    let indexTurn;
    if (sender != "ai") {
      indexTurn = turnIndex + 1;
      console.log(indexTurn);
    }

    io.to(roomKey).emit("room_update", {
      type: "send_message",
      message,
      turnIndex: indexTurn,
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
