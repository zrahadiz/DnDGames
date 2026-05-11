import { db } from "@/db";
import { user, session } from "@/db/schema";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function generateGuestName() {
  return `Guest_${Math.random().toString(36).substring(2, 8)}`;
}

export async function POST() {
  const username = generateGuestName();

  // Create guest user
  const insertedUsers = await db
    .insert(user)
    .values({
      id: randomUUID(),
      name: username,
      type: "guest",
      email: `${username.toLowerCase()}@example.com`, // Dummy email for guest users
      emailVerified: false,
    })
    .returning();

  const createdUser = insertedUsers[0];

  // Create session token
  const token = randomUUID();

  // Session expiration (7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Save session in DB
  const insertedSessions = await db
    .insert(session)
    .values({
      id: randomUUID(),
      token,
      userId: createdUser.id,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  const createdSession = insertedSessions[0];

  // Set auth cookie
  const cookieStore = await cookies();

  cookieStore.set("better-auth.session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return NextResponse.json({
    success: true,
    user: createdUser,
    session: createdSession,
  });
}
