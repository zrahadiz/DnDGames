import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { characters } from "@/db/schema";

export const characterResponseSchema = createSelectSchema(characters);

export type Characters = z.infer<typeof characterResponseSchema>;
