import { parse } from "cookie";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { guestSessions } from "@/db/schema";
import { hashToken } from "@/lib/encryptData";

export async function getUserFromCookie(cookieHeader?: string) {
  if (!cookieHeader) return null;

  const parsedCookies = parse(cookieHeader);

  // Guest session
  const guestToken = parsedCookies["guest_session"];

  if (guestToken) {
    const hashed = hashToken(guestToken);

    const session = await db.query.guestSessions.findFirst({
      where: eq(guestSessions.token, hashed),

      with: {
        user: {
          columns: {
            id: true,
            email: true,
            image: true,
            name: true,
            lastSeenAt: true,
          },
        },
      },
    });

    if (!session) return null;

    return {
      type: "guest" as const,
      user: session.user,
    };
  }

  // Registered user
  const session = await auth.api.getSession({
    headers: new Headers({
      cookie: cookieHeader,
    }),
  });

  if (!session?.user) {
    return null;
  }

  return {
    type: "registered" as const,
    user: session.user,
  };
}
