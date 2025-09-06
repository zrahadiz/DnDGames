// /pages/api/messages/create.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const room_id = Number(searchParams.get("room_id"));

  const allMesages = await db
    .select()
    .from(messages)
    .where(eq(messages.room_id, room_id))
    .orderBy(asc(messages.created_at));

  return NextResponse.json({
    data: allMesages,
    messages: "Success fetch Messages",
    status: 200,
  });
}
