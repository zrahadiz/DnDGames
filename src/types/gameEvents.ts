import type { InferSelectModel } from "drizzle-orm";
import { gameEvents } from "@/db/schema";
import { Characters } from "./characters";

export type GameEvent = InferSelectModel<typeof gameEvents>;

export type GameEventPayload =
  | {
      text: string;
    } // player_action
  | {
      target: string;
      how: string;
      diceRoll: number;
    } // combat
  | {
      reason: string;
      title: string;
      summary: string;
      narrative: string;
    }
  | Record<string, never>;

export type TurnActionContext = {
  character: {
    id: string;
    name: string;
    race: string | null;
    characterClass: string | null;
    level: number;
    xp: number;
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
  } | null;
  eventType: string;
  payload: GameEventPayload;
};

export type CreateCombatInput = {
  target: string;
  how: string;
};

export type TurnProgress = {
  currentTurn: number;
  submittedCount: number;
  totalPlayers: number;
  remainingCount: number;
  allPlayersSubmitted: boolean;
};

export type GameEventWithRelations = GameEvent & {
  characters: Pick<
    Characters,
    | "id"
    | "name"
    | "race"
    | "characterClass"
    | "level"
    | "xp"
    | "hp"
    | "maxHp"
    | "mana"
    | "maxMana"
  > | null;
};
