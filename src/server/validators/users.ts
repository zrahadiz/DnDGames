import { user } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";

export const userResponseSchema = createSelectSchema(user);
export type Users = z.infer<typeof userResponseSchema>;
