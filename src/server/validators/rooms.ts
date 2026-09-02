import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

import { rooms } from "@/db/schema";
import { createCharacterSchema } from "@/server/validators/characters";

export const createRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  hostId: true,
});

export const updateroomSchema = createUpdateSchema(rooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  hostId: true,
});

export const createRoomWithCharacterSchema = z.object({
  room: createRoomSchema,
  character: createCharacterSchema,
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
