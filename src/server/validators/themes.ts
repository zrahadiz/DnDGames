import { createInsertSchema } from "drizzle-zod";
import { createUpdateSchema } from "drizzle-zod";
import { themes } from "@/db/schema";

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
