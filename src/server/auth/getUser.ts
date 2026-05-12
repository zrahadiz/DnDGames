import { db } from "@/db";
import { auth } from "@/lib/auth";
import { guestSessions } from "@/db/schema";
import { cookies, headers } from "next/headers";
import { eq } from "drizzle-orm";
import { hashToken } from "@/helpers/encryptData";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const guestCookie = cookieStore.get("guest_session");

  if (guestCookie) {
    const hashed = hashToken(guestCookie.value);
    const session = await db.query.guestSessions.findFirst({
      where: eq(guestSessions.token, hashed),
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            lastSeenAt: true,
            image: true,
            name: true,
          },
        },
      },
    });
    if (!session) {
      return null;
    }
    return {
      type: "guest",
      user: session.user,
    };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return {
      type: "registered",
      user: session.user,
    };
  }

  return null;
}
