import "dotenv/config"; // must be the very first line
import { Server } from "socket.io";
import { db } from "@/db";
import { messages, roomPlayers, rooms } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserFromCookie } from "./auth/getUserDataFromCookie";

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
  socket.on("join_room", async ({ roomId }: { roomId: string }) => {
    try {
      const currentUser = socket.data.user;
      if (!currentUser) return;
      const userId = currentUser.user.id;

      if (!roomId || !userId) {
        socket.emit("error_message", {
          message: "roomId and userId are required",
        });
        return;
      }

      const roomKey = `room_${roomId}`;

      socket.join(roomKey);

      socketUserMap.set(socket.id, {
        roomId,
        userId,
      });

      const player = await db.query.roomPlayers.findFirst({
        where: and(
          eq(roomPlayers.userId, userId),
          eq(roomPlayers.roomId, roomId),
        ),

        with: {
          character: true,
        },
      });

      if (!player) {
        socket.emit("error_message", {
          message: "Player not found",
        });

        return;
      }

      socket.to(roomKey).emit("room_update", {
        type: "player_joined",
        player,
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

  socket.on("toggle_ready", async ({ roomId, userId, isReady }) => {
    console.log("toggle_ready event", { roomId, userId, isReady });
    if (!roomId || !userId || isReady === undefined) {
      console.error("toggle_ready missing params", { roomId, userId, isReady });
      return;
    }
    const roomKey = `room_${roomId}`;
    // Update in DB
    await db
      .update(roomPlayers)
      .set({ isReady: isReady })
      .where(
        and(eq(roomPlayers.roomId, roomId), eq(roomPlayers.userId, userId)),
      );
    const updatedPlayer = await db.query.roomPlayers.findFirst({
      where: and(
        eq(roomPlayers.userId, userId),
        eq(roomPlayers.roomId, roomId),
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
      .set({ status: "playing" })
      .where(eq(rooms.id, roomId));
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
    console.log("User disconnected:", socket.id);
    socketUserMap.delete(socket.id);
    // const userMap = socketUserMap.get(socket.id);
    // console.log("Socket user map:", socketUserMap);
    // console.log("Disconnected user info:", userMap);
    // // If the user was tracked, handle their departure
    // if (userMap) {
    //   // Remove the player from the database
    //   await db
    //     .delete(roomPlayers)
    //     .where(
    //       and(
    //         eq(roomPlayers.room_id, userMap.roomId),
    //         eq(roomPlayers.user_id, userMap.userId)
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
