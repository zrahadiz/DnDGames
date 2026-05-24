import type { Themes as Basetheme } from "@/server/validators/themes";

export type Theme = Basetheme;

export type ThemeOption = Pick<Theme, "id" | "name" | "icon">;
