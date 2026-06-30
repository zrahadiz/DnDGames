import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { gameEvents } from "@/db/schema";

export const gameEventResponseSchema = createSelectSchema(gameEvents);

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

export type SubmitActionInput = z.infer<typeof submitActionSchema>;

export type GameEvent = z.infer<typeof gameEventResponseSchema>;

export type CreateGameEventInput = z.infer<typeof createGameEventSchema>;

export type UpdateGameEventInput = z.infer<typeof updateGameEventSchema>;
