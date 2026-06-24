import type { Room as BaseRoom } from "@/server/validators/rooms";
import type { Campaign } from "@/server/validators/campaigns";
import { Theme } from "./theme";
import { Users } from "./users";
import { RoomPlayer } from "@/server/validators/roomPlayers";
import { Characters } from "@/server/validators/character";

export type RoomWithRelations = BaseRoom & {
  campaign: Pick<Campaign, "id" | "title" | "description"> & {
    theme: Pick<Theme, "id" | "name" | "icon">;
  };
  host: Pick<Users, "id" | "name">;
};

export type RoomDetail = BaseRoom & {
  campaign: Pick<Campaign, "id" | "title" | "description"> & {
    theme: Pick<Theme, "id" | "name" | "icon">;
  };
  players: (RoomPlayer & {
    character: Characters | null;
  })[];
};

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
      character: Pick<
        Characters,
        | "name"
        | "race"
        | "characterClass"
        | "level"
        | "hp"
        | "mana"
        | "backstory"
      > | null;
    }
  >;
};

// export type CampaignForm = {
//   title: string;
//   description: string;
//   backgroundLore: string;
//   startingObjective: string;
//   startingLocation: string;
//   isOfficial: boolean;
//   theme: ThemeOption | null;
//   worldSetup: WorldSetupField[];
// };
