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
    }; // combat

export type TurnActionContext = {
  character: {
    name: string;
    race: string | null;
    characterClass: string | null;
    level: number;
    mana: number;
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
    "id" | "name" | "race" | "characterClass" | "level" | "hp" | "mana"
  > | null;
};
