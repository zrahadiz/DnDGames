import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  // Check guest FIRST (super fast)
  const guestSession = cookieStore.get("guest_session");

  if (guestSession) {
    return {
      type: "guest",
      user: guestSession.value,
    };
  }

  // Only check Better Auth if no guest
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
