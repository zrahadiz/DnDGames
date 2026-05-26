import type { Room as BaseRoom } from "@/server/validators/rooms";
import type { Campaign } from "@/server/validators/campaigns";
import { Theme } from "./theme";
import { Users } from "./users";

export type RoomWithRelations = BaseRoom & {
  campaign: Pick<Campaign, "id" | "title" | "description"> & {
    theme: Pick<Theme, "id" | "name" | "icon">;
  };
  host: Pick<Users, "id" | "name">;
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
