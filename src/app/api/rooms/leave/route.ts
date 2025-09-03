// /pages/api/rooms/join.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { room_players, rooms, users } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { socket } from "@/lib/socket";

export async function DELETE(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const room_id = Number(searchParams.get("room_id"));
  const user_id = Number(searchParams.get("user_id"));

  if (!room_id || !user_id) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  try {
    // Check if room exists
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, room_id),
    });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, user_id),
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Check if user is in the room
    const existingPlayer = await db
      .select()
      .from(room_players)
      .where(
        and(
          eq(room_players.room_id, room_id),
          eq(room_players.user_id, user_id)
        )
      )
      .then((res) => res[0]);

    if (!existingPlayer) {
      return NextResponse.json(
        { error: "User not in the room" },
        { status: 400 }
      );
    }

    //If host is leaving
    console.log("Room host:", room.host_id);
    console.log("User leaving:", user_id);
    if (room.host_id === user_id) {
      // Remove host and assign new host
      console.log("Host is leaving the room:", room_id);

      //   await db
      //     .update(rooms)
      //     .set({ host_id: null })
      //     .where(eq(rooms.id, room_id));

      // Find another player to assign as host
      const otherPlayer = await db.query.room_players.findFirst({
        where: and(
          eq(room_players.room_id, room_id),
          ne(room_players.user_id, user_id)
        ),
      });

      if (otherPlayer) {
        await db
          .update(rooms)
          .set({ host_id: otherPlayer.user_id })
          .where(eq(rooms.id, room_id));
      } else {
        // If no other players, you might want to handle room deletion or status update
        await db
          .update(rooms)
          .set({ status: "closed" })
          .where(eq(rooms.id, room_id));
        // Optionally, remove all players from the room
        await db.delete(room_players).where(eq(room_players.room_id, room_id));
        return NextResponse.json(
          { message: "Host left, no other players, room closed" },
          { status: 200 }
        );
      }
    }
    // Remove player from room
    await db
      .delete(room_players)
      .where(
        and(
          eq(room_players.room_id, room_id),
          eq(room_players.user_id, user_id)
        )
      );

    const updatedRoom = await db.query.rooms.findFirst({
      where: eq(rooms.id, room_id),
    });

    return NextResponse.json(
      { room: updatedRoom, message: "Left room successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error leaving room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
