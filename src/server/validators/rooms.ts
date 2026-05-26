import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { rooms, characters } from "@/db/schema";

export const roomResponseSchema = createSelectSchema(rooms).omit({
  createdAt: true,
  updatedAt: true,
  hostId: true,
});

export const createRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  hostId: true,
});

export const createCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  roomPlayerId: true,
  createdAt: true,
  updatedAt: true,
});

export const createRoomWithCharacterSchema = z.object({
  room: createRoomSchema,
  character: createCharacterSchema,
});

export const updateroomSchema = createUpdateSchema(rooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  hostId: true,
});

export type Room = z.infer<typeof roomResponseSchema>;

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;

export type UpdateRoomInput = z.infer<typeof updateroomSchema>;
