import { NextResponse } from "next/server";
import { getCurrentUser } from "@/helpers/getUser";

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json(user);
}
