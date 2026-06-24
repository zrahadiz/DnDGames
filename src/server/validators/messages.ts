import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { messages } from "@/db/schema";

export const messagesResponseSchema = createSelectSchema(messages);

export const createMessageSchema = createInsertSchema(messages)
  .omit({
    id: true,
    roomId: true,
    senderId: true,
    createdAt: true,
  })
  .extend({
    content: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(5000, "Message too long"),
  });

export const updateMessageSchema = createUpdateSchema(messages)
  .omit({
    id: true,
    roomId: true,
    senderId: true,
    createdAt: true,
  })
  .extend({
    content: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(5000, "Message too long"),
  });

export type Message = z.infer<typeof messagesResponseSchema>;

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
