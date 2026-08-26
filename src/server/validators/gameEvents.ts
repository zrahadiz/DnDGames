import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { gameEvents } from "@/db/schema";

import { z } from "zod";

export const createGameEventSchema = createInsertSchema(gameEvents).omit({
  id: true,
  roomId: true,
  roomPlayerId: true,
  turnNumber: true,
  createdAt: true,
});

export const updateGameEventSchema = createUpdateSchema(gameEvents).omit({
  id: true,
  roomId: true,
  roomPlayerId: true,
  turnNumber: true,
  createdAt: true,
});

export const submitActionSchema = z.discriminatedUnion("eventType", [
  z.object({
    eventType: z.literal("player_action"),
    action: z.string().min(1),
  }),

  z.object({
    eventType: z.literal("combat"),
    target: z.string(),
    how: z.string(),
    diceRoll: z.int(),
  }),
]);
