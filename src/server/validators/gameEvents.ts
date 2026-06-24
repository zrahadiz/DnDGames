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

export const submitActionSchema = z.object({
  action: z
    .string()
    .trim()
    .min(1, "Action cannot be empty")
    .max(1000, "Action is too long"),
});

export type SubmitActionInput = z.infer<typeof submitActionSchema>;

export type GameEvent = z.infer<typeof gameEventResponseSchema>;

export type CreateGameEventInput = z.infer<typeof createGameEventSchema>;

export type UpdateGameEventInput = z.infer<typeof updateGameEventSchema>;
