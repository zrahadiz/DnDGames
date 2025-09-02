import "dotenv/config"; // must be the very first line
import { Server } from "socket.io";
import { db } from "@/db";
import { room_players } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const io = new Server(3001, {
  cors: { origin: "*" }, // later: set to your frontend URL
});

// Keep track of socket ↔ user mapping
const socketUserMap = new Map<string, { roomId: number; userId: number }>();

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);
  console.log("total connections:", io.engine.clientsCount);

  socket.on("test", async ({ roomId, userId }) => {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    if (!roomId || !userId) {
      console.error("join_room missing roomId or userId", { roomId, userId });
      return;
    }

    const roomKey = `room_${roomId}`;
    socket.join(roomKey);
    socketUserMap.set(socket.id, { roomId, userId });

    try {
      const player = await db.query.room_players.findFirst({
        where: eq(room_players.user_id, userId),
      });

      if (!player) {
        console.warn("Player not found in DB:", userId);
        return;
      }

      io.to(roomKey).emit("room_update", {
        type: "player_joined",
        player,
      });
    } catch (err) {
      console.error("Drizzle query failed for join_room:", err);
    }
  });
  // join room
  socket.on("join_room", async ({ roomId, userId }) => {
    if (!roomId || !userId) {
      console.error("join_room missing roomId or userId", { roomId, userId });
      return;
    }
    console.log(`User ${userId} joining room ${roomId}`);
    const roomKey = `room_${roomId}`;
    socket.join(roomKey);

    socketUserMap.set(socket.id, { roomId, userId });

    // Ideally fetch from DB
    const player = await db.query.room_players.findFirst({
      where: and(
        eq(room_players.user_id, userId),
        eq(room_players.room_id, roomId)
      ),
    });

    io.to(roomKey).emit("room_update", {
      type: "player_joined",
      player, // full player object
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

console.log("✅ Socket server running on :3001");
