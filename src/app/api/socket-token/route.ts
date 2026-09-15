import { NextResponse } from "next/server";

import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { createSocketToken } from "@/lib/socket-auth";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = await createSocketToken(currentUser.user.id, currentUser.type);

  return NextResponse.json({ token });
}
