import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

import { roomPlayers } from "@/db/schema";

export const createRoomPlayerSchema = createInsertSchema(roomPlayers).omit({
  id: true,
  userId: true,
  joinedAt: true,
  lastSeenAt: true,
});

export const updateRoomPlayerSchema = createUpdateSchema(roomPlayers).omit({
  id: true,
  userId: true,
  joinedAt: true,
  lastSeenAt: true,
});

export const joinRoomSchema = z.object({
  roomId: z.uuid(),

  code: z.string().optional(),

  character: z.object({
    name: z.string().min(1).max(50),

    race: z.string().min(1).max(50),

    characterClass: z.string().min(1).max(50),

    backstory: z.string().optional(),
  }),
});
