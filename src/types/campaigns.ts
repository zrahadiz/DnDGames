import type { Campaign as BaseCampaign } from "@/server/validators/campaigns";

type CampaignCreator = {
  id: string;
  name: string;
  image: string;
  email: string;
};

type CampaignTheme = {
  id: string;
  name: string;
  icon: string;
};

export type Campaign = BaseCampaign & {
  creator: CampaignCreator;
  theme: CampaignTheme;
  // playerCount?: number;
  // rating?: number;
};
