// /pages/api/rooms/create.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, room_players, users, messages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const {
    title,
    theme,
    password,
    max_players,
    user_id,
    character_name,
    character_class,
  } = await req.json();

  if (!title || !theme || !user_id) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Check if user exists
  const userId = await db.query.users.findFirst({
    where: eq(users.id, user_id),
  });

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    // Create the room
    const [newRoom] = await db
      .insert(rooms)
      .values({
        title,
        theme,
        password: password || "",
        max_players: max_players || 5,
        status: "waiting",
        host_id: user_id,
      })
      .returning();

    // Add the creator as first player
    const [player] = await db
      .insert(room_players)
      .values({
        room_id: newRoom.id,
        user_id,
        character_name,
        character_class,
      })
      .returning();

    const merged = {
      ...newRoom,
      player,
    };
    console.log(merged);

    return NextResponse.json(
      { data: merged, messages: "Room Has been created", status: 201 },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
