import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, room_players, users, messages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { error } from "console";

export async function POST(req: Request) {
  const { room_id, sender, content } = await req.json();

  console.log(room_id, sender, content);

  if (!room_id || !sender || !content) {
    console.log("Missing required parameters");
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, room_id),
  });

  if (!room) {
    return NextResponse.json({ error: "Room is not exist" }, { status: 400 });
  }

  try {
    // const [messages] = await db
    //   .insert(messages)
    //   .values({ room_id, sender, content })
    //   .returning();

    const [message] = await db
      .insert(messages)
      .values({
        room_id,
        sender,
        content,
      })
      .returning();

    console.log(message);

    return NextResponse.json({
      data: message,
      message: "Message sucessfully insert to the database",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to insert message" },
      { status: 500 }
    );
  }
}
