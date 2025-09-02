// /pages/api/rooms/create.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users } from "@/db/schema";

export async function POST(req: Request) {
  const { username } = await req.json();
  console.log(username);

  if (!username) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // Create the room
    const Users = await db.insert(users).values({ username }).returning();

    return NextResponse.json(
      { data: Users, messages: "Account has been created" },
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
