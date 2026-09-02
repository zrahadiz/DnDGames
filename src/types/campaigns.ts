import type { InferSelectModel } from "drizzle-orm";

import type { campaigns } from "@/db/schema";
import { Theme, ThemeOption } from "./theme";
import { Users } from "./users";

export type Campaign = InferSelectModel<typeof campaigns>;

export type CampaignWithRelations = Campaign & {
  creator: Pick<Users, "id" | "name" | "image" | "email">;
  theme: Pick<Theme, "id" | "name" | "icon">;
};

export type WorldSetupField = {
  id: string;
  key: string;
  value: string;
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
