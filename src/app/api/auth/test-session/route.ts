// app/api/test-session/route.ts
import { db } from "@/db";
import { session } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  // manually query what better-auth should be finding
  const token = "36bb17d7-e823-4bf6-afcb-76bc4d55b692";
  const result = await db
    .select()
    .from(session)
    .where(eq(session.token, token));
  return Response.json(result);
}
