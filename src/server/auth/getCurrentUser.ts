import { headers } from "next/headers";
import { getUserFromCookie } from "./getUserDataFromCookie";

export async function getCurrentUser() {
  const headerStore = await headers();

  const cookieHeader = headerStore.get("cookie") ?? "";

  return getUserFromCookie(cookieHeader);
}
