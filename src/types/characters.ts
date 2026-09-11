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

export type CharacterEffect =
  | {
      characterId: string;
      type: "damage";
      amount: number;
    }
  | {
      characterId: string;
      type: "heal";
      amount: number;
    }
  | {
      characterId: string;
      type: "mana_cost";
      amount: number;
    }
  | {
      characterId: string;
      type: "mana_restore";
      amount: number;
    }
  | {
      characterId: string;
      type: "xp";
      amount: number;
    };
