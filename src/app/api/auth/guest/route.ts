import { db } from "@/db";
import { user } from "@/db/schema";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function generateGuestName() {
  return `Guest_${Math.random().toString(36).substring(2, 8)}`;
}

export async function POST() {
  const username = generateGuestName();

  const insertedUsers = await db
    .insert(user)
    .values({
      id: randomUUID(),
      name: username,
      type: "guest",
      email: `${username.toLowerCase()}@guest.local`,
      emailVerified: false,
    })
    .returning();

  const createdUser = insertedUsers[0];

  const guestToken = randomUUID();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const cookieStore = await cookies();

  cookieStore.set("guest_session", guestToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return NextResponse.json({
    success: true,
    user: createdUser,
  });
}
