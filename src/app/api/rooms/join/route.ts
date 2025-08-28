// /pages/api/rooms/join.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { room_players, rooms, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { room_id, user_id, character_name, character_class } =
    await req.json();

  if (!room_id || !user_id || !character_name || !character_class) {
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

    // Check if room is full
    const playerCount = await db
      .select()
      .from(room_players)
      .where(eq(room_players.room_id, room_id))
      .then((res) => res.length);

    if (playerCount >= room.max_players) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

    // Check if user is already in the room
    const existingPlayer = await db
      .select()
      .from(room_players)
      .where(
        and(
          eq(room_players.room_id, room_id),
          eq(room_players.user_id, user_id)
        )
      )
      .limit(1)
      .then((res) => res[0]);

    if (existingPlayer) {
      return NextResponse.json(
        { error: "User already in the room" },
        { status: 400 }
      );
    }

    // Add player to the room
    const [newPlayer] = await db
      .insert(room_players)
      .values({
        room_id,
        user_id,
        character_name,
        character_class,
      })
      .returning();

    return NextResponse.json({ player: newPlayer }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
