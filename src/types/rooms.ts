import type { InferSelectModel } from "drizzle-orm";

import { rooms } from "@/db/schema";

import { Characters } from "./characters";
import { Campaign } from "./campaigns";
import { Theme } from "./theme";
import { Users } from "./users";
import { RoomPlayer } from "./roomPlayers";

export type Rooms = InferSelectModel<typeof rooms>;

export type RoomWithRelations = Rooms & {
  hasCode: boolean;
  campaign: Pick<Campaign, "id" | "title" | "description"> & {
    theme: Pick<Theme, "id" | "name" | "icon">;
  };
  host: Pick<Users, "id" | "name">;
};

export type RoomDetail = Rooms & {
  campaign: Pick<Campaign, "id" | "title" | "description"> & {
    theme: Pick<Theme, "id" | "name" | "icon">;
  };
  players: Array<
    RoomPlayer & {
      character: Characters | null;
    }
  >;
};

export type RoomCharacterContext = Pick<
  Characters,
  "name" | "race" | "characterClass" | "level" | "hp" | "mana" | "backstory"
>;

export type RoomContext = {
  id: string;
  name: string;
  status: "waiting" | "playing" | "finished";
  hostId: string;
  currentTurn: number;

  campaign: Pick<
    Campaign,
    | "title"
    | "description"
    | "backgroundLore"
    | "startingLocation"
    | "startingObjective"
    | "worldSetup"
  >;

  players: Array<
    Pick<RoomPlayer, "userId" | "role"> & {
      character: RoomCharacterContext | null;
    }
  >;
};
