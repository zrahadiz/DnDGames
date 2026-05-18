import {
  createInsertSchema,
  createUpdateSchema,
  createSelectSchema,
} from "drizzle-zod";
import { z } from "zod";

import { themes } from "@/db/schema";

export const themeResponseSchema = createSelectSchema(themes);

export const createThemeSchema = createInsertSchema(themes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export const updateThemeSchema = createUpdateSchema(themes).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

export type Themes = z.infer<typeof themeResponseSchema>;
