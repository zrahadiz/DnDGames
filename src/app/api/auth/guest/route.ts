import { db } from "@/db";
import { guestSessions, user } from "@/db/schema";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateToken, hashToken } from "@/helpers/encryptData";

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
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1);

  await db
    .insert(guestSessions)
    .values({
      id: randomUUID(),
      token: tokenHash,
      userId: createdUser.id,
      expiresAt: expiresAt,
      createdAt: new Date(),
    })
    .returning();

  const cookieStore = await cookies();

  cookieStore.set("guest_session", rawToken, {
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
