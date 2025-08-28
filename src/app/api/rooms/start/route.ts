// /pages/api/rooms/[id]/start.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = Number(searchParams.get("id"));

  if (isNaN(roomId)) {
    return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
  }

  if (!roomId) {
    return NextResponse.json(
      { error: "Room id is needed to start the game" },
      { status: 400 }
    );
  }

  // Check if room exists
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (room.status !== "waiting") {
    return NextResponse.json(
      { error: "Room is not in waiting state" },
      { status: 400 }
    );
  }

  // Update the status
  await db.update(rooms).set({ status: "in_game" }).where(eq(rooms.id, roomId));

  return NextResponse.json({
    success: true,
    roomId,
    status: "in_game",
  });
}
