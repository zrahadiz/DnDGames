// /pages/api/rooms/create.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const room_id = searchParams.get("room_id");

  const allRooms = await db
    .select()
    .from(rooms)
    .where(
      and(
        room_id ? eq(rooms.id, Number(room_id)) : undefined,
        eq(rooms.status, "waiting")
      )
    );

  return NextResponse.json({ rooms: allRooms });
}
