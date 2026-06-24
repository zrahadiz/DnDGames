import type { GameEvent as BaseGameEvent } from "@/server/validators/gameEvents";
import { Characters } from "@/server/validators/character";

export type GameEventPayload =
  | {
      text: string;
    } // player_action
  | {
      dice: "d20" | "d6" | "d8";
      result: number;
    } // dice_roll
  | {
      attacker: string;
      target: string;
      damage: number;
    }; // combat

export type TurnActionContext = {
  character: {
    id: string;
    name: string;
    race: string | null;
    characterClass: string | null;
    level: number;
    hp: number;
    mana: number;
  } | null;

  payload: GameEventPayload;
};

export type GameEventWithRelations = BaseGameEvent & {
  character: Pick<
    Characters,
    "id" | "name" | "race" | "characterClass" | "level" | "hp" | "mana"
  > | null;
};

export type TurnProgress = {
  currentTurn: number;
  submittedCount: number;
  totalPlayers: number;
  remainingCount: number;
  allPlayersSubmitted: boolean;
};
