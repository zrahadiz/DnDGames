import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/getUser";

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json(user);
}
