import type { Campaign as BaseCampaign } from "@/server/validators/campaigns";
import type { Users } from "@/server/validators/users";
import { Theme, ThemeOption } from "./theme";

export type WorldSetupField = {
  id: string;
  key: string;
  value: string;
};

export type CampaignWithRelation = BaseCampaign & {
  creator: Pick<Users, "id" | "name" | "image" | "email">;
  theme: Pick<Theme, "id" | "name" | "icon">;
};

export type CampaignForm = {
  title: string;
  description: string;
  backgroundLore: string;
  startingObjective: string;
  startingLocation: string;
  isOfficial: boolean;
  theme: ThemeOption | null;
  worldSetup: WorldSetupField[];
};
