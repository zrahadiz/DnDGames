import type { InferSelectModel } from "drizzle-orm";

import { characters } from "@/db/schema";

export type Characters = InferSelectModel<typeof characters>;

export interface RaceSuggestion {
  name: string;
  description: string;
}

export interface ClassSuggestion {
  name: string;
  description: string;
}

export interface CharacterSuggestions {
  status: string;
  races: RaceSuggestion[];
  classes: ClassSuggestion[];
}
