import { db } from "@/db";
import { guestSessions, user } from "@/db/schema";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateToken, hashToken } from "@/lib/encryptData";
import { apiResponse } from "@/types/apiResponse";
import { rateLimits } from "@/lib/rate-limit";

function generateGuestName() {
  return `Guest_${Math.random().toString(36).substring(2, 8)}`;
}

function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0]?.trim();

    if (ip) {
      return ip;
    }
  }

  return request.headers.get("x-real-ip")?.trim() || null;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    if (!ip) {
      console.warn("Unable to determine client IP for guest creation");

      return apiResponse(400, {
        success: false,
        message: "Unable to process guest creation request.",
      });
    }

    // Rate limit before doing any database operations
    const { success } = await rateLimits.guestCreation.limit(ip);

    if (!success) {
      return apiResponse(429, {
        success: false,
        message:
          "Too many guest accounts created. Please wait before trying again.",
      });
    }

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

    if (!createdUser) {
      throw new Error("Failed to create guest user");
    }

    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await db.insert(guestSessions).values({
      id: randomUUID(),
      token: tokenHash,
      userId: createdUser.id,
      expiresAt,
      createdAt: new Date(),
    });

    const cookieStore = await cookies();

    cookieStore.set("guest_session", rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return apiResponse(201, {
      success: true,
      message: "Guest session created successfully.",
      data: {
        user: createdUser,
      },
    });
  } catch (error) {
    console.error("Guest creation failed:", error);

    return apiResponse(500, {
      success: false,
      message: "Failed to create guest session.",
    });
  }
}
