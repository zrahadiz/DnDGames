import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { guestSessions } from "@/db/schema";
import { hashToken } from "@/lib/encryptData";
import { apiResponse } from "@/types/apiResponse";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const guestToken = cookieStore.get("guest_session")?.value;

    if (guestToken) {
      const hashedToken = hashToken(guestToken);

      await db
        .delete(guestSessions)
        .where(eq(guestSessions.token, hashedToken));
    }

    cookieStore.delete("guest_session");

    return apiResponse(200, {
      success: true,
      message: "Guest logged out successfully",
    });
  } catch (error) {
    console.error("Guest logout failed:", error);

    return apiResponse(500, {
      success: false,
      message: "Failed to logout",
    });
  }
}
