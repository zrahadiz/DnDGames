import type { InferSelectModel } from "drizzle-orm";
import type { themes } from "@/db/schema";

export type Theme = InferSelectModel<typeof themes>;

export type ThemeOption = Pick<Theme, "id" | "name" | "icon">;
