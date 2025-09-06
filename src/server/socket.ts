import "dotenv/config"; // must be the very first line
import { Server } from "socket.io";
import { db } from "@/db";
import { messages, room_players, rooms } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { use } from "react";
import { disconnect } from "process";

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
    console.log("Test event received:", { roomId, userId });
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
    const player = await db.query.room_players.findFirst({
      where: and(
        eq(room_players.user_id, userId),
        eq(room_players.room_id, roomId)
      ),
    });

    io.to(roomKey).emit("room_update", {
      type: "player_refreshed",
      player, // full player object
    });
  });

  socket.on("toggle_ready", async ({ roomId, userId, isReady }) => {
    console.log("toggle_ready event", { roomId, userId, isReady });
    if (!roomId || !userId || isReady === undefined) {
      console.error("toggle_ready missing params", { roomId, userId, isReady });
      return;
    }
    const roomKey = `room_${roomId}`;
    // Update in DB
    await db
      .update(room_players)
      .set({ is_ready: isReady })
      .where(
        and(eq(room_players.room_id, roomId), eq(room_players.user_id, userId))
      );
    const updatedPlayer = await db.query.room_players.findFirst({
      where: and(
        eq(room_players.user_id, userId),
        eq(room_players.room_id, roomId)
      ),
    });
    io.to(roomKey).emit("room_update", {
      type: "player_toggled_ready",
      player: updatedPlayer, // full player object
    });
  });

  // leave room
  socket.on("leave_room", async ({ roomId, userId }) => {
    console.log("leave_room event", { roomId, userId });
    if (!roomId || !userId) {
      console.error("leave_room missing roomId or userId", { roomId, userId });
      return;
    }
    console.log(`User ${userId} leaving room ${roomId}`);
    const roomKey = `room_${roomId}`;
    socket.leave(roomKey);
    socketUserMap.delete(socket.id);
    io.to(roomKey).emit("room_update", {
      type: "player_left",
      user_id: userId,
      disconnected: false,
    });
  });

  socket.on("start_game", async ({ roomId }) => {
    console.log("start_game event", { roomId });
    if (!roomId) {
      console.error("start_game missing roomId", { roomId });
      return;
    }
    const roomKey = `room_${roomId}`;
    // Update room status in DB
    await db
      .update(rooms)
      .set({ status: "in_game" })
      .where(eq(rooms.id, roomId));
    io.to(roomKey).emit("room_update", {
      type: "game_started",
    });
  });

  socket.on("send_message", async ({ roomId, sender, content }) => {
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
        room_id: roomId,
        sender,
        content,
      })
      .returning();

    console.log(message);
    io.to(roomKey).emit("room_update", {
      type: "send_message",
      message,
    });
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    socketUserMap.delete(socket.id);
    // const userMap = socketUserMap.get(socket.id);
    // console.log("Socket user map:", socketUserMap);
    // console.log("Disconnected user info:", userMap);
    // // If the user was tracked, handle their departure
    // if (userMap) {
    //   // Remove the player from the database
    //   await db
    //     .delete(room_players)
    //     .where(
    //       and(
    //         eq(room_players.room_id, userMap.roomId),
    //         eq(room_players.user_id, userMap.userId)
    //       )
    //     );
    //   const roomKey = `room_${userMap.roomId}`;
    //   console.log(
    //     `User ${userMap.userId} disconnected, removed from room ${userMap.roomId}`
    //   );
    //   // Emit an update to the room to remove the player from the UI
    //   io.to(roomKey).emit("room_update", {
    //     type: "player_left",
    //     user_id: userMap.roomId,
    //     disconnected: true,
    //   });

    // Clean up the map
    // socketUserMap.delete(socket.id);
    // }
  });
});

console.log("✅ Socket server running on :3001");
