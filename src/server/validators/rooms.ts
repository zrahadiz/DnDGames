import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { rooms } from "@/db/schema";

export const roomResponseSchema = createSelectSchema(rooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  hostId: true,
});

export const createroomSchema = createInsertSchema(rooms).omit({
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

export type Room = z.infer<typeof roomResponseSchema>;

export type CreateRoomInput = z.infer<typeof createroomSchema>;

export type UpdateRoomInput = z.infer<typeof updateroomSchema>;
