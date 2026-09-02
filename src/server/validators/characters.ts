import { createInsertSchema } from "drizzle-zod";
import { characters } from "@/db/schema";

export const createCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  roomPlayerId: true,
  createdAt: true,
  updatedAt: true,
});
